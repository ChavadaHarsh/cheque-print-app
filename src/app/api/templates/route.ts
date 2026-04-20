import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Template from "@/models/Template";

type Position = { x?: number; y?: number };

type CreateTemplateBody = {
  bankName?: string;
  variant?: string;
  page?: { width?: number; height?: number };
  fields?: {
    payee?: Position;
    amountNumber?: Position;
    amountWords?: Position;
    date?: Position;
    signature?: Position;
  };
};

function isInvalidPosition(position?: Position) {
  return !position || typeof position.x !== "number" || typeof position.y !== "number";
}

function validateTemplateBody(body: CreateTemplateBody) {
  const fieldErrors: Record<string, string> = {};

  if (!body.bankName?.trim()) {
    fieldErrors.bankName = "bankName is required.";
  }

  if (!body.page || typeof body.page.width !== "number" || typeof body.page.height !== "number") {
    fieldErrors.page = "page.width and page.height are required numbers.";
  }

  if (!body.fields) {
    fieldErrors.fields = "fields object is required.";
    return fieldErrors;
  }

  if (isInvalidPosition(body.fields.payee)) {
    fieldErrors["fields.payee"] = "fields.payee.x and fields.payee.y are required numbers.";
  }

  if (isInvalidPosition(body.fields.amountNumber)) {
    fieldErrors["fields.amountNumber"] =
      "fields.amountNumber.x and fields.amountNumber.y are required numbers.";
  }

  if (isInvalidPosition(body.fields.amountWords)) {
    fieldErrors["fields.amountWords"] =
      "fields.amountWords.x and fields.amountWords.y are required numbers.";
  }

  if (isInvalidPosition(body.fields.date)) {
    fieldErrors["fields.date"] = "fields.date.x and fields.date.y are required numbers.";
  }

  if (isInvalidPosition(body.fields.signature)) {
    fieldErrors["fields.signature"] =
      "fields.signature.x and fields.signature.y are required numbers.";
  }

  return fieldErrors;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const bank = request.nextUrl.searchParams.get("bank");
    const query = bank ? { bankName: bank.trim() } : {};

    const templates = await Template.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        data: templates,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch templates.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTemplateBody;
    const fieldErrors = validateTemplateBody(body);

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const template = await Template.create({
      bankName: body.bankName?.trim(),
      variant: body.variant?.trim(),
      page: {
        width: body.page?.width,
        height: body.page?.height,
      },
      fields: {
        payee: body.fields?.payee,
        amountNumber: body.fields?.amountNumber,
        amountWords: body.fields?.amountWords,
        date: body.fields?.date,
        signature: body.fields?.signature,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create template.",
      },
      { status: 500 },
    );
  }
}

