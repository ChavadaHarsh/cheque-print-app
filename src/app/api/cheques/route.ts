import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Cheque from "@/models/Cheque";
import Template from "@/models/Template";

type CreateChequeBody = {
  templateId?: string;
  payeeName?: string;
  amount?: number;
  amountInWords?: string;
  date?: string;
  bankName?: string;
  fieldsData?: {
    payee?: string;
    amountNumber?: string;
    amountWords?: string;
    date?: string;
    signature?: string;
  };
  status?: "draft" | "printed";
};

function getValidationErrors(body: CreateChequeBody): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!body.templateId) {
    fieldErrors.templateId = "templateId is required.";
  } else if (!mongoose.Types.ObjectId.isValid(body.templateId)) {
    fieldErrors.templateId = "templateId is invalid.";
  }

  if (!body.payeeName || !body.payeeName.trim()) {
    fieldErrors.payeeName = "payeeName is required.";
  }

  if (typeof body.amount !== "number" || Number.isNaN(body.amount)) {
    fieldErrors.amount = "amount is required and must be a number.";
  }

  if (!body.fieldsData || typeof body.fieldsData !== "object") {
    fieldErrors.fieldsData = "fieldsData is required.";
  }

  if (body.status && !["draft", "printed"].includes(body.status)) {
    fieldErrors.status = 'status must be either "draft" or "printed".';
  }

  return fieldErrors;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateChequeBody;
    const fieldErrors = getValidationErrors(body);

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

    const template = await Template.findById(body.templateId).lean();
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found.",
        },
        { status: 404 },
      );
    }

    const cheque = await Cheque.create({
      templateId: body.templateId,
      payeeName: body.payeeName?.trim(),
      amount: body.amount,
      amountInWords: body.amountInWords?.trim(),
      date: body.date ? new Date(body.date) : undefined,
      bankName: body.bankName?.trim(),
      fieldsData: {
        payee: body.fieldsData?.payee?.trim(),
        amountNumber: body.fieldsData?.amountNumber?.trim(),
        amountWords: body.fieldsData?.amountWords?.trim(),
        date: body.fieldsData?.date?.trim(),
        signature: body.fieldsData?.signature?.trim(),
      },
      status: body.status ?? "draft",
    });

    return NextResponse.json(
      {
        success: true,
        data: cheque,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create cheque.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const page = Math.max(Number(request.nextUrl.searchParams.get("page") ?? "1"), 1);
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "10"), 1), 100);
    const bankName = request.nextUrl.searchParams.get("bankName");
    const status = request.nextUrl.searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (bankName) {
      query.bankName = bankName.trim();
    }

    if (status && ["draft", "printed"].includes(status)) {
      query.status = status;
    }

    const [cheques, total] = await Promise.all([
      Cheque.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Cheque.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: cheques,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cheques.",
      },
      { status: 500 },
    );
  }
}
