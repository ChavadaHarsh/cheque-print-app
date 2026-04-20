import { model, models, Schema, type InferSchemaType } from "mongoose";

const templateFieldSchema = new Schema(
  {
    key: {
      type: String,
      enum: ["payee", "amountNumber", "amountWords", "date"],
      required: true,
    },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    fontSize: { type: Number, default: 24 },
    width: { type: Number, default: 260 },
    color: { type: String, default: "#111111" },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    bankId: { type: Schema.Types.ObjectId, ref: "Bank", required: true, index: true },
    bankName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    widthMM: { type: Number, default: 202 },
    heightMM: { type: Number, default: 92 },
    baseWidth: { type: Number, default: 1000 },
    baseHeight: { type: Number, default: 450 },
    fields: { type: [templateFieldSchema], default: [] },
  },
  { timestamps: true }
);

export type TemplateDocument = InferSchemaType<typeof templateSchema> & { _id: string };

export const TemplateModel = models.Template || model("Template", templateSchema);
