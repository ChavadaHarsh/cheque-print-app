import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/db";
import { chequeCreateSchema } from "@/lib/validators";
import { ChequeModel } from "@/models/Cheque";

export async function GET(request: Request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const cheque = await ChequeModel.findById(id).lean();
    if (!cheque) {
      return NextResponse.json({ error: "Cheque not found." }, { status: 404 });
    }
    return NextResponse.json({ cheque });
  }

  const cheques = await ChequeModel.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ cheques });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const payload = chequeCreateSchema.parse(body);

    const cheque = await ChequeModel.create(payload);
    return NextResponse.json({ cheque }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save cheque." }, { status: 500 });
  }
}
