import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/db";
import { templateUpdateSchema } from "@/lib/validators";
import { TemplateModel } from "@/models/Template";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Params) {
  await connectToDatabase();
  const { id } = await context.params;

  const template = await TemplateModel.findById(id).lean();
  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json({ template });
}

export async function PATCH(request: Request, context: Params) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const payload = templateUpdateSchema.parse(body);

    const template = await TemplateModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to update template." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Params) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const template = await TemplateModel.findByIdAndDelete(id).lean();

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete template." }, { status: 500 });
  }
}
