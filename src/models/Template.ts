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

const positionSchema = new Schema(
  {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const fontSchema = new Schema(
  {
    family: { type: String, default: "Arial" },
    size: { type: Number, default: 24 },
  },
  { _id: false }
);

const marginsSchema = new Schema(
  {
    top: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
    bottom: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    templateName: { type: String, required: true, trim: true },
    bankId: { type: Schema.Types.ObjectId, ref: "Bank", required: true, index: true },
    bankName: { type: String, required: true },
    issuerName: { type: String, default: "" },
    issuerPosition: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    widthMM: { type: Number, default: 202 },
    heightMM: { type: Number, default: 92 },
    baseWidth: { type: Number, default: 1000 },
    baseHeight: { type: Number, default: 450 },
    dateFieldPosition: { type: positionSchema, default: () => ({ x: 0, y: 0 }) },
    amountPosition: { type: positionSchema, default: () => ({ x: 0, y: 0 }) },
    payeePosition: { type: positionSchema, default: () => ({ x: 0, y: 0 }) },
    signaturePosition: { type: positionSchema, default: () => ({ x: 0, y: 0 }) },
    alignment: { type: String, enum: ["left", "center", "right"], default: "left" },
    font: { type: fontSchema, default: () => ({ family: "Arial", size: 24 }) },
    margins: { type: marginsSchema, default: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) },
    fields: { type: [templateFieldSchema], default: [] },
  },
  { timestamps: true }
);

export type TemplateDocument = InferSchemaType<typeof templateSchema> & { _id: string };

export const TemplateModel = models.Template || model("Template", templateSchema);
