"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ChequePreview } from "@/components/ChequePreview";
import { PrintControls } from "@/components/PrintControls";
import type { Cheque, Template } from "@/lib/types";

function PrintPageContent() {
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

      const templateJson = await templateRes.json();
      const chequeJson = await chequeRes.json();

      if (templateRes.ok) setTemplate(templateJson.template as Template);
      if (chequeRes.ok) setCheque(chequeJson.cheque as Cheque);
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
      />

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        <ChequePreview
          template={template}
          printable
          offsetXMM={offsetX}
          offsetYMM={offsetY}
          values={{
            payee: cheque.payee,
            amountNumber: Number(cheque.amount).toLocaleString("en-IN"),
            amountWords: cheque.amountWords,
            date: cheque.date,
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

