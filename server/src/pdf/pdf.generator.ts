import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export interface CertificatePdfData {
  certificate_number: string;
  student_name: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: Date | string;
  gpa?: string | null;
  classification?: string | null;
  issued_at?: Date | string;
}

const formatDate = (value: Date | string): string => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

// build the pdf using the client url link
export const buildVerifyUrl = (certificateNumber: string): string => {
  const base = (process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/+$/, "");
    return `${base}/verify?certId=${encodeURIComponent(certificateNumber)}`;
};

// generate the pdf using the client data 
export const generateCertificatePdf = async (data: CertificatePdfData): Promise<Buffer> => {
  const qr = await QRCode.toBuffer(buildVerifyUrl(data.certificate_number), {
    margin: 1,
    width: 300,
    errorCorrectionLevel: "M",
  });

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
    info: {
      Title: `Certificate ${data.certificate_number}`,
      Author: data.institution_name,
      Subject: "Academic certificate",
      CreationDate: data.issued_at ? new Date(data.issued_at) : new Date(),
    },
  });

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const W = doc.page.width;  // 841.89
  const H = doc.page.height; // 595.28
  const INK = "#1f2937";
  const MUTED = "#6b7280";
  const ACCENT = "#1e3a8a";

  // Border
  doc.lineWidth(3).strokeColor(ACCENT).rect(24, 24, W - 48, H - 48).stroke();
  doc.lineWidth(0.75).strokeColor(ACCENT).rect(32, 32, W - 64, H - 64).stroke();

  const center = (text: string, y: number, size: number, font: string, color: string) => {
    doc.font(font).fontSize(size).fillColor(color);
    doc.text(text, 60, y, { width: W - 120, align: "center" });
  };

  center(data.institution_name.toUpperCase(), 70, 20, "Helvetica-Bold", ACCENT);
  center("CERTIFICATE OF COMPLETION", 108, 30, "Times-Bold", INK);
  center("This is to certify that", 168, 13, "Helvetica", MUTED);
  center(data.student_name, 192, 32, "Times-BoldItalic", INK);
  center("has been awarded", 245, 13, "Helvetica", MUTED);
  center(data.degree, 267, 22, "Helvetica-Bold", INK);
  center(`in ${data.course}`, 300, 16, "Helvetica", INK);

  const extras: string[] = [];
  if (data.classification) extras.push(data.classification);
  if (data.gpa) extras.push(`GPA ${data.gpa}`);
  if (extras.length) center(extras.join("  |  "), 330, 13, "Helvetica", MUTED);

  center(`Graduation date: ${formatDate(data.graduation_date)}`, 362, 13, "Helvetica", INK);

  // Footer: number on the left, QR on the right
  doc.font("Helvetica").fontSize(10).fillColor(MUTED);
  doc.text("Certificate No.", 60, 470, { width: 400, align: "left" });
  doc.font("Helvetica-Bold").fontSize(14).fillColor(INK);
  doc.text(data.certificate_number, 60, 486, { width: 400, align: "left" });
  doc.font("Helvetica").fontSize(9).fillColor(MUTED);
  doc.text(
    "Verify this certificate by scanning the QR code or entering the number on the verification page.",
    60,
    512,
    { width: 400, align: "left" }
  );

  doc.image(qr, W - 60 - 90, 450, { width: 90, height: 90 });

  doc.end();
  return finished;
};