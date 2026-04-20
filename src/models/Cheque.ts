import mongoose, { Schema, type Model, type Types } from "mongoose";

export type ChequeStatus = "draft" | "printed";

export interface ICheque {
  _id: Types.ObjectId;
  payeeName: string;
  amount: number;
  amountInWords?: string;
  date?: Date;
  bankName?: string;
  templateId: Types.ObjectId;
  fieldsData: {
    payee?: string;
    amountNumber?: string;
    amountWords?: string;
    date?: string;
    signature?: string;
  };
  status: ChequeStatus;
  createdAt: Date;
  updatedAt: Date;
}

type FieldsData = ICheque["fieldsData"];

const fieldsDataSchema = new Schema<FieldsData>(
  {
    payee: { type: String, trim: true },
    amountNumber: { type: String, trim: true },
    amountWords: { type: String, trim: true },
    date: { type: String, trim: true },
    signature: { type: String, trim: true },
  },
  { _id: false },
);

const chequeSchema = new Schema<ICheque>(
  {
    payeeName: {
      type: String,
      required: [true, "payeeName is required."],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required."],
      min: [0, "amount must be greater than or equal to 0."],
    },
    amountInWords: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    bankName: {
      type: String,
      trim: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: [true, "templateId is required."],
    },
    fieldsData: {
      type: fieldsDataSchema,
      required: true,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "printed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

const Cheque: Model<ICheque> =
  (mongoose.models.Cheque as Model<ICheque>) || mongoose.model<ICheque>("Cheque", chequeSchema);

export default Cheque;
