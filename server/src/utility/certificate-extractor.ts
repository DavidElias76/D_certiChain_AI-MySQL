import { PDFParse } from "pdf-parse";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { decode as decodeJpegImage } from "jpeg-js";

export type FileKind = "pdf" | "png" | "jpeg";

export interface ExtractedDocument {
  /** Distinct certificate numbers found in the file (usually 0 or 1). */
  numbers: string[];
  /** Where the numbers came from. */
  source: "pdf_text" | "qr_code";
  /** PDF text (capped), used to check the document against the official record. */
  text: string | null;
  /** False when the file could not be parsed at all. */
  readable: boolean;
}

// SHORTCODE-YYYY-8HEX, as produced by generateCertificateNumber.
const NUMBER_IN_TEXT = /\b[A-Z0-9]{2,10}-\d{4}-[A-F0-9]{8}\b/g;
const NUMBER_EXACT = /^[A-Z0-9]{2,10}-\d{4}-[A-F0-9]{8}$/;

const MAX_PDF_PAGES = 3;
const MAX_PDF_TEXT = 200_000;
const PDF_TIMEOUT_MS = 10_000;
const MAX_IMAGE_PIXELS = 25_000_000;   // refuse anything larger (memory)
const MAX_DECODE_PIXELS = 4_000_000;   // shrink to this before QR detection (jsQR is synchronous)

/** Identify the file by its first bytes, never by its name or the declared content type. */
export const detectFileKind = (buf: Buffer): FileKind | null => {
  if (buf.length >= 5 && buf.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  return null;
};

const unique = (values: string[]): string[] => [...new Set(values)];

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });

const fromPdf = async (buf: Buffer): Promise<ExtractedDocument> => {
  // Copy: pdf.js may take ownership of the bytes it is given.
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await withTimeout(parser.getText({ first: MAX_PDF_PAGES }), PDF_TIMEOUT_MS);
    const text = (result.text ?? "").slice(0, MAX_PDF_TEXT);
    return { numbers: unique(text.match(NUMBER_IN_TEXT) ?? []), source: "pdf_text", text, readable: true };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
};

interface Rgba { data: Uint8ClampedArray; width: number; height: number }

const readPng = (buf: Buffer): Rgba => {
  // IHDR: width and height are at bytes 16..24, so we can refuse huge images before decoding.
  if (buf.length < 24) throw new Error("Truncated PNG");
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (!width || !height || width * height > MAX_IMAGE_PIXELS) throw new Error("Image too large");
  const png = PNG.sync.read(buf);
  return { data: new Uint8ClampedArray(png.data), width: png.width, height: png.height };
};

const readJpeg = (buf: Buffer): Rgba => {
  const img = decodeJpegImage(buf, {
    useTArray: true,
    formatAsRGBA: true,
    maxResolutionInMP: MAX_IMAGE_PIXELS / 1_000_000,
    maxMemoryUsageInMB: 256,
  });
  return { data: new Uint8ClampedArray(img.data), width: img.width, height: img.height };
};

/** Average whole blocks of pixels so big photos are quick to scan. */
const shrink = (img: Rgba, maxPixels: number): Rgba => {
  const pixels = img.width * img.height;
  if (pixels <= maxPixels) return img;
  const f = Math.ceil(Math.sqrt(pixels / maxPixels));
  const w = Math.floor(img.width / f);
  const h = Math.floor(img.height / f);
  const out = new Uint8ClampedArray(w * h * 4);
  const area = f * f;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < f; dy++) {
        let i = ((y * f + dy) * img.width + x * f) * 4;
        for (let dx = 0; dx < f; dx++, i += 4) {
          r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; a += img.data[i + 3];
        }
      }
      const o = (y * w + x) * 4;
      out[o] = r / area; out[o + 1] = g / area; out[o + 2] = b / area; out[o + 3] = a / area;
    }
  }
  return { data: out, width: w, height: h };
};

/** The QR holds a verify URL (…?certId=NUMBER) or the bare number. We only read it, never open it. */
const numberFromQrPayload = (payload: string): string | null => {
  let candidate = payload.trim();
  try {
    const fromUrl = new URL(candidate).searchParams.get("certId");
    if (fromUrl) candidate = fromUrl.trim();
  } catch {
    // not a URL: maybe the bare number
  }
  return NUMBER_EXACT.test(candidate) ? candidate : null;
};

const fromImage = (buf: Buffer, kind: "png" | "jpeg"): ExtractedDocument => {
  const img = shrink(kind === "png" ? readPng(buf) : readJpeg(buf), MAX_DECODE_PIXELS);
  const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
  const number = code ? numberFromQrPayload(code.data) : null;
  return { numbers: number ? [number] : [], source: "qr_code", text: null, readable: true };
};

/** Never throws: an unreadable or hostile file just comes back as `readable: false`. */
export const extractCertificateNumbers = async (buf: Buffer, kind: FileKind): Promise<ExtractedDocument> => {
  try {
    return kind === "pdf" ? await fromPdf(buf) : fromImage(buf, kind);
  } catch (err) {
    console.warn("Could not read uploaded file:", (err as Error).message);
    return { numbers: [], source: kind === "pdf" ? "pdf_text" : "qr_code", text: null, readable: false };
  }
};

const normalise = (s: string): string => s.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Does the document text contain the official name, course and degree?
 * Catches a copy whose text was edited while the certificate number was left alone.
 */
export const textMatchesRecord = (
  text: string,
  record: { student_name: string; course: string; degree: string }
): boolean => {
  const haystack = normalise(text);
  return [record.student_name, record.course, record.degree].every((v) => haystack.includes(normalise(v)));
};