import { model, models, Schema, type InferSchemaType } from "mongoose";

const chequeSchema = new Schema(
  {
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true, index: true },
    bankName: { type: String, required: true },
    payee: { type: String, required: true },
    amount: { type: Number, required: true },
    amountWords: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export type ChequeDocument = InferSchemaType<typeof chequeSchema> & { _id: string };

export const ChequeModel = models.Cheque || model("Cheque", chequeSchema);
