import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Template from "@/models/Template";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Position = { x?: number; y?: number };

type UpdateTemplateBody = {
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

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isInvalidPosition(position?: Position) {
  return !position || typeof position.x !== "number" || typeof position.y !== "number";
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid template ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const template = await Template.findById(id).lean();

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch template.",
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
        {
          success: false,
          message: "Invalid template ID.",
        },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateTemplateBody;

    if ("bankName" in body && !body.bankName?.trim()) {
      return NextResponse.json(
        { success: false, message: "bankName cannot be empty." },
        { status: 400 },
      );
    }

    if ("page" in body) {
      if (
        !body.page ||
        typeof body.page.width !== "number" ||
        typeof body.page.height !== "number"
      ) {
        return NextResponse.json(
          { success: false, message: "page.width and page.height are required numbers." },
          { status: 400 },
        );
      }
    }

    if ("fields" in body && body.fields) {
      const invalid =
        isInvalidPosition(body.fields.payee) ||
        isInvalidPosition(body.fields.amountNumber) ||
        isInvalidPosition(body.fields.amountWords) ||
        isInvalidPosition(body.fields.date) ||
        isInvalidPosition(body.fields.signature);

      if (invalid) {
        return NextResponse.json(
          { success: false, message: "All fields positions must include numeric x and y." },
          { status: 400 },
        );
      }
    }

    await connectToDatabase();

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        ...(body.bankName !== undefined ? { bankName: body.bankName.trim() } : {}),
        ...(body.variant !== undefined ? { variant: body.variant.trim() } : {}),
        ...(body.page !== undefined ? { page: body.page } : {}),
        ...(body.fields !== undefined ? { fields: body.fields } : {}),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedTemplate) {
      return NextResponse.json(
        { success: false, message: "Template not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: updatedTemplate },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update template.",
      },
      { status: 500 },
    );
  }
}
