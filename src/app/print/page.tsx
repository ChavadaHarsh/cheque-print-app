"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ChequePreview } from "@/components/ChequePreview";
import { PrintControls } from "@/components/PrintControls";
import type { Cheque, Template } from "@/lib/types";

const parseJsonSafe = async <T,>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

function PrintPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId") || "";
  const chequeId = searchParams?.get("chequeId") || "";

  const [template, setTemplate] = useState<Template | null>(null);
  const [cheque, setCheque] = useState<Cheque | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!templateId || !chequeId) return;

      const [templateRes, chequeRes] = await Promise.all([
        fetch(`/api/templates/${templateId}`, { cache: "no-store" }),
        fetch(`/api/cheques?id=${chequeId}`, { cache: "no-store" }),
      ]);

      const [templateJson, chequeJson] = await Promise.all([
        parseJsonSafe<{ template?: Template }>(templateRes),
        parseJsonSafe<{ cheque?: Cheque }>(chequeRes),
      ]);

      if (templateRes.ok && templateJson?.template) setTemplate(templateJson.template);
      if (chequeRes.ok && chequeJson?.cheque) setCheque(chequeJson.cheque);
    };
    load();
  }, [chequeId, templateId]);

  if (!template || !cheque) {
    return <div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading print preview...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="no-print flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Print Cheque</h1>
        <Link href={`/create?templateId=${template._id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
          Back to create
        </Link>
      </header>

      <PrintControls
        offsetX={offsetX}
        offsetY={offsetY}
        onOffsetXChange={setOffsetX}
        onOffsetYChange={setOffsetY}
        onPrint={() => window.print()}
        onCancel={() => router.back()}
      />

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        <ChequePreview
          template={template}
          printable
          showBackground={false}
          offsetXMM={offsetX}
          offsetYMM={offsetY}
          values={{
            payee: cheque.payee,
            amountNumber: Number(cheque.amount).toLocaleString("en-IN"),
            amountWords: cheque.amountWords,
            date: cheque.date,
            issuerName: cheque.issuerName || template.issuerName || "",
            issuerPosition: cheque.issuerPosition || template.issuerPosition || "",
          }}
        />
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading...</div>}>
      <PrintPageContent />
    </Suspense>
  );
}
