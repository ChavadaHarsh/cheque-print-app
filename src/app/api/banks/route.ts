import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/db";
import { bankCreateSchema } from "@/lib/validators";
import { BankModel } from "@/models/Bank";

export async function GET() {
  await connectToDatabase();
  const banks = await BankModel.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({ banks });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const payload = bankCreateSchema.parse(body);

    const existing = await BankModel.findOne({
      name: { $regex: `^${payload.name}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ error: "Bank name already exists." }, { status: 409 });
    }

    const bank = await BankModel.create(payload);
    return NextResponse.json({ bank }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create bank." }, { status: 500 });
  }
}
