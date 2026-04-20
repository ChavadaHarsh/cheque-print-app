import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed."));
      return;
    }
    cb(null, true);
  },
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  middleware: (req: NextApiRequest, res: NextApiResponse, callback: (result?: unknown) => void) => void
) {
  return new Promise<void>((resolve, reject) => {
    middleware(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve();
    });
  });
}

type MulterNextMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (result?: unknown) => void
) => void;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    await runMiddleware(req, res, upload.single("file") as unknown as MulterNextMiddleware);

    const uploadedFile = (req as NextApiRequest & { file?: Express.Multer.File }).file;
    if (!uploadedFile) {
      res.status(400).json({ error: "No image file uploaded." });
      return;
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `cheque-${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    const outputBuffer = await sharp(uploadedFile.buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    await writeFile(filePath, outputBuffer);

    res.status(200).json({
      imageUrl: `/uploads/${fileName}`,
      width: 1000,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Image upload failed.",
    });
  }
}
