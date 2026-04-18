import { NextRequest, NextResponse } from "next/server";
import { createChequeHistory, listChequeHistory, type ChequeStatus } from "@/lib/history-db";

export const runtime = "nodejs";

const statuses: ChequeStatus[] = ["Printed", "Draft", "Void"];

export function GET() {
  return NextResponse.json({
    data: listChequeHistory(),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    id?: string;
    payee?: string;
    amountCents?: number;
    issuedDate?: string;
    status?: ChequeStatus;
    bank?: string;
  };

  if (!body.payee || typeof body.amountCents !== "number" || !body.issuedDate) {
    return NextResponse.json(
      { error: "payee, amountCents, and issuedDate are required." },
      { status: 400 },
    );
  }

  if (body.status && !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid cheque status." }, { status: 400 });
  }

  const item = createChequeHistory({
    id: body.id,
    payee: body.payee,
    amountCents: body.amountCents,
    issuedDate: body.issuedDate,
    status: body.status,
    bank: body.bank,
  });

  return NextResponse.json({ data: item }, { status: 201 });
}
