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
});

export const templateCreateSchema = z.object({
  bankId: z.string().min(1),
  bankName: z.string().min(1),
  imageUrl: z.string().min(1),
  widthMM: z.number().min(1).default(202),
  heightMM: z.number().min(1).default(92),
  baseWidth: z.number().min(100).default(1000),
  baseHeight: z.number().min(100).default(450),
  fields: z.array(fieldSchema).min(1),
});

export const chequeCreateSchema = z.object({
  templateId: z.string().min(1),
  bankName: z.string().min(1),
  payee: z.string().trim().min(1),
  amount: z.number().positive(),
  amountWords: z.string().trim().min(1),
  date: z.string().min(1),
});
