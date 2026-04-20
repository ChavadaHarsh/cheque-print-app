import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
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
