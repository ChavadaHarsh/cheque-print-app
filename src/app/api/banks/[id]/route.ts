import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/db";
import { bankUpdateSchema } from "@/lib/validators";
import { BankModel } from "@/models/Bank";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const payload = bankUpdateSchema.parse(body);

    if (payload.name) {
      const existing = await BankModel.findOne({
        _id: { $ne: id },
        name: { $regex: `^${payload.name}$`, $options: "i" },
      });
      if (existing) {
        return NextResponse.json({ error: "Bank name already exists." }, { status: 409 });
      }
    }

    const bank = await BankModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        defaultUserName: payload.defaultUserName ?? "",
        defaultUserPosition: payload.defaultUserPosition ?? "",
      },
      { new: true, runValidators: true }
    ).lean();

    if (!bank) {
      return NextResponse.json({ error: "Bank not found." }, { status: 404 });
    }

    return NextResponse.json({ bank });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to update bank." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Params) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const bank = await BankModel.findByIdAndDelete(id).lean();
    if (!bank) {
      return NextResponse.json({ error: "Bank not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete bank." }, { status: 500 });
  }
}
