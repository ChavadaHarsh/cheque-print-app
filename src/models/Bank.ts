import { model, models, Schema, type InferSchemaType } from "mongoose";

const bankSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export type BankDocument = InferSchemaType<typeof bankSchema> & { _id: string };

export const BankModel = models.Bank || model("Bank", bankSchema);
