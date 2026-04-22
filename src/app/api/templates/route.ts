import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/db";
import { templateCreateSchema } from "@/lib/validators";
import { TemplateModel } from "@/models/Template";

export async function GET(request: Request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const bankId = searchParams.get("bankId");

  const query = bankId ? { bankId } : {};

  const templates = await TemplateModel.find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const payload = templateCreateSchema.parse(body);

    const getFieldPosition = (key: "date" | "amountNumber" | "payee") => {
      const field = payload.fields.find((item) => item.key === key);
      return field ? { x: field.x, y: field.y } : { x: 0, y: 0 };
    };

    const template = await TemplateModel.create(payload);
    const hydratedTemplate = await TemplateModel.findByIdAndUpdate(
      template._id,
      {
        $set: {
          dateFieldPosition: payload.dateFieldPosition || getFieldPosition("date"),
          amountPosition: payload.amountPosition || getFieldPosition("amountNumber"),
          payeePosition: payload.payeePosition || getFieldPosition("payee"),
          signaturePosition: payload.signaturePosition || { x: 0, y: 0 },
          font: payload.font || { family: "Arial", size: 24 },
          margins: payload.margins || { top: 0, right: 0, bottom: 0, left: 0 },
          alignment: payload.alignment || "left",
        },
      },
      { new: true }
    ).lean();
    return NextResponse.json({ template: hydratedTemplate || template }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save template." }, { status: 500 });
  }
}
