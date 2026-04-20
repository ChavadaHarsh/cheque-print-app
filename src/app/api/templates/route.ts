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

    const template = await TemplateModel.create(payload);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save template." }, { status: 500 });
  }
}
