export type FieldKey = "payee" | "amountNumber" | "amountWords" | "date";

export type TemplateField = {
  key: FieldKey;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  color: string;
};

export type Bank = {
  _id: string;
  name: string;
};

export type Template = {
  _id: string;
  bankId: string;
  bankName: string;
  imageUrl: string;
  widthMM: number;
  heightMM: number;
  baseWidth: number;
  baseHeight: number;
  fields: TemplateField[];
  createdAt?: string;
  updatedAt?: string;
};

export type Cheque = {
  _id: string;
  templateId: string;
  bankName: string;
  payee: string;
  amount: number;
  amountWords: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};
