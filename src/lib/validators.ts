import { z } from "zod";

export const fieldSchema = z.object({
  key: z.enum(["payee", "amountNumber", "amountWords", "date"]),
  label: z.string().min(1),
  x: z.number().min(0),
  y: z.number().min(0),
  fontSize: z.number().min(8).max(72).default(24),
  width: z.number().min(40).max(1000).default(260),
  color: z.string().min(1).default("#111111"),
});

export const bankCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  defaultUserName: z.string().trim().max(120).optional(),
  defaultUserPosition: z.string().trim().max(120).optional(),
});

export const bankUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  defaultUserName: z.string().trim().max(120).optional(),
  defaultUserPosition: z.string().trim().max(120).optional(),
});

const positionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
});

const fontSchema = z.object({
  family: z.string().trim().min(1).default("Arial"),
  size: z.number().min(8).max(72).default(24),
});

const marginsSchema = z.object({
  top: z.number().min(0).default(0),
  right: z.number().min(0).default(0),
  bottom: z.number().min(0).default(0),
  left: z.number().min(0).default(0),
});

export const templateCreateSchema = z.object({
  templateName: z.string().trim().min(1).max(160),
  bankId: z.string().min(1),
  bankName: z.string().min(1),
  issuerName: z.string().trim().max(120).optional().default(""),
  issuerPosition: z.string().trim().max(120).optional().default(""),
  imageUrl: z.string().min(1),
  widthMM: z.number().min(1).default(202),
  heightMM: z.number().min(1).default(92),
  baseWidth: z.number().min(100).default(1000),
  baseHeight: z.number().min(100).default(450),
  dateFieldPosition: positionSchema.optional(),
  amountPosition: positionSchema.optional(),
  payeePosition: positionSchema.optional(),
  signaturePosition: positionSchema.optional(),
  alignment: z.enum(["left", "center", "right"]).optional().default("left"),
  font: fontSchema.optional(),
  margins: marginsSchema.optional(),
  fields: z.array(fieldSchema).min(1),
});

export const templateUpdateSchema = templateCreateSchema.partial();

export const chequeCreateSchema = z.object({
  templateId: z.string().min(1),
  bankId: z.string().min(1),
  bankName: z.string().min(1),
  issuerName: z.string().trim().max(120).optional().default(""),
  issuerPosition: z.string().trim().max(120).optional().default(""),
  payee: z.string().trim().min(1),
  amount: z.number().positive(),
  amountWords: z.string().trim().min(1),
  date: z.string().min(1),
});
