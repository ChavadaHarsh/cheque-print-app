import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Cheque from "@/models/Cheque";
import Template from "@/models/Template";

type UpdateChequeBody = {
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isInvalidStatus(status?: string) {
  return Boolean(status && !["draft", "printed"].includes(status));
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid cheque ID." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const cheque = await Cheque.findById(id).populate("templateId").lean();

    if (!cheque) {
      return NextResponse.json(
        { success: false, message: "Cheque not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: cheque }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cheque.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid cheque ID." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateChequeBody;

    if (isInvalidStatus(body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'status must be either "draft" or "printed".',
        },
        { status: 400 },
      );
    }

    if ("payeeName" in body && (!body.payeeName || !body.payeeName.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
        },
        { status: 400 },
      );
    }

    if ("amount" in body && (typeof body.amount !== "number" || Number.isNaN(body.amount))) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    if (body.templateId) {
      if (!isValidObjectId(body.templateId)) {
        return NextResponse.json(
          { success: false, message: "Invalid template ID." },
          { status: 400 },
        );
      }

      const template = await Template.findById(body.templateId).lean();
      if (!template) {
        return NextResponse.json(
          { success: false, message: "Template not found." },
          { status: 404 },
        );
      }
    }

    const updatedCheque = await Cheque.findByIdAndUpdate(
      id,
      {
        ...(body.templateId !== undefined ? { templateId: body.templateId } : {}),
        ...(body.payeeName !== undefined ? { payeeName: body.payeeName.trim() } : {}),
        ...(body.amount !== undefined ? { amount: body.amount } : {}),
        ...(body.amountInWords !== undefined ? { amountInWords: body.amountInWords.trim() } : {}),
        ...(body.date !== undefined ? { date: body.date ? new Date(body.date) : null } : {}),
        ...(body.bankName !== undefined ? { bankName: body.bankName.trim() } : {}),
        ...(body.fieldsData !== undefined
          ? {
              fieldsData: {
                payee: body.fieldsData.payee?.trim(),
                amountNumber: body.fieldsData.amountNumber?.trim(),
                amountWords: body.fieldsData.amountWords?.trim(),
                date: body.fieldsData.date?.trim(),
                signature: body.fieldsData.signature?.trim(),
              },
            }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!updatedCheque) {
      return NextResponse.json(
        { success: false, message: "Cheque not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedCheque,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cheque.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid cheque ID." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const deletedCheque = await Cheque.findByIdAndDelete(id);

    if (!deletedCheque) {
      return NextResponse.json(
        { success: false, message: "Cheque not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cheque deleted successfully.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete cheque.",
      },
      { status: 500 },
    );
  }
}
