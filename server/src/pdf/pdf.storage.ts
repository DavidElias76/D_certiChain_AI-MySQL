import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const baseDir = (): string =>
  path.resolve(process.env.STORAGE_DIR ?? "./storage", "certificates");

const fileFor = (certificateId: number): string => {
  if (!Number.isInteger(certificateId) || certificateId <= 0) {
    throw new Error("Invalid certificate id");
  }
  return path.join(baseDir(), `${certificateId}.pdf`);
};

export const sha256Hex = (buf: Buffer): string =>
  createHash("sha256").update(buf).digest("hex");

export const pdfApiPath = (certificateId: number): string =>
  `/certificate/${certificateId}/pdf`;

export const savePdf = async (certificateId: number, buf: Buffer) => {
  await fs.mkdir(baseDir(), { recursive: true });
  await fs.writeFile(fileFor(certificateId), buf);
  return { url: pdfApiPath(certificateId), hash: sha256Hex(buf) };
};

export const readPdf = async (certificateId: number): Promise<Buffer | null> => {
  try {
    return await fs.readFile(fileFor(certificateId));
  } catch (err: any) {
    if (err?.code === "ENOENT") return null;
    throw err;
  }
};
