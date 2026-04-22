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
  defaultUserName?: string;
  defaultUserPosition?: string;
};

export type PositionField = {
  x: number;
  y: number;
};

export type TemplateAlignment = "left" | "center" | "right";

export type TemplateFont = {
  family: string;
  size: number;
};

export type TemplateMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Template = {
  _id: string;
  templateName: string;
  bankId: string;
  bankName: string;
  issuerName?: string;
  issuerPosition?: string;
  imageUrl: string;
  widthMM: number;
  heightMM: number;
  baseWidth: number;
  baseHeight: number;
  dateFieldPosition?: PositionField;
  amountPosition?: PositionField;
  payeePosition?: PositionField;
  signaturePosition?: PositionField;
  alignment?: TemplateAlignment;
  font?: TemplateFont;
  margins?: TemplateMargins;
  fields: TemplateField[];
  createdAt?: string;
  updatedAt?: string;
};

export type Cheque = {
  _id: string;
  templateId: string;
  bankId: string;
  bankName: string;
  issuerName?: string;
  issuerPosition?: string;
  payee: string;
  amount: number;
  amountWords: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};
