import mongoose, { Schema, type Model, type Types } from "mongoose";

type Position = {
  x: number;
  y: number;
};

type PageSize = {
  width: number;
  height: number;
};

export interface ITemplate {
  _id: Types.ObjectId;
  bankName: string;
  variant?: string;
  page: PageSize;
  fields: {
    payee: Position;
    amountNumber: Position;
    amountWords: Position;
    date: Position;
    signature: Position;
  };
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema<Position>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

const pageSchema = new Schema<PageSize>(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const templateSchema = new Schema<ITemplate>(
  {
    bankName: {
      type: String,
      required: [true, "bankName is required."],
      trim: true,
    },
    variant: {
      type: String,
      trim: true,
    },
    page: {
      type: pageSchema,
      required: true,
    },
    fields: {
      payee: { type: positionSchema, required: true },
      amountNumber: { type: positionSchema, required: true },
      amountWords: { type: positionSchema, required: true },
      date: { type: positionSchema, required: true },
      signature: { type: positionSchema, required: true },
    },
  },
  { timestamps: true },
);

const Template: Model<ITemplate> =
  (mongoose.models.Template as Model<ITemplate>) ||
  mongoose.model<ITemplate>("Template", templateSchema);

export default Template;

