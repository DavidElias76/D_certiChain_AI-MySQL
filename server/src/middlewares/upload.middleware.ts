import type { RequestHandler } from "express";
import multer from "multer";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Memory storage: the file is never written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 2, parts: 4 },
});

/** One file in the "file" field. Upload problems become clean JSON errors. */
export const singleFileUpload: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "The file is too large. The maximum size is 10 MB." });
        return;
      }
      res.status(400).json({ error: "Upload one file in the 'file' field." });
      return;
    }
    res.status(400).json({ error: "The upload could not be read." });
  });
};