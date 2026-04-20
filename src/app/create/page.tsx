"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { ChequePreview } from "@/components/ChequePreview";
import { FieldInputs } from "@/components/FieldInputs";
import { amountToIndianWords } from "@/lib/amount-to-words";
import type { Template } from "@/lib/types";

function CreateChequePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId") || "";

  const [template, setTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    payee: "",
    amount: "",
    date: "",
    amountWords: "",
  });

  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      const response = await fetch(`/api/templates/${templateId}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Template not found.");
        return;
      }
      setTemplate(payload.template as Template);
    };

    loadTemplate();
  }, [templateId]);

  const handleValuesChange = (next: typeof values) => {
    const amount = Number(next.amount || 0);
    const computedWords = amount > 0 ? amountToIndianWords(amount) : "";
    setValues({
      ...next,
      amountWords: computedWords || next.amountWords,
    });
  };

  const previewValues = useMemo(() => {
    return {
      payee: values.payee,
      amountNumber: values.amount ? Number(values.amount).toLocaleString("en-IN") : "",
      amountWords: values.amountWords,
      date: values.date,
    };
  }, [values]);

  const saveCheque = async () => {
    if (!template) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/cheques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template._id,
          bankName: template.bankName,
          payee: values.payee,
          amount: Number(values.amount),
          amountWords: values.amountWords,
          date: values.date,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Failed to save cheque.");
        return;
      }

      router.push(`/print?chequeId=${payload.cheque._id}&templateId=${template._id}`);
    } catch {
      setError("Failed to save cheque.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!templateId) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 p-4 sm:p-8">
        <p className="text-slate-700">Select a template first.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-700">
          Go to home
        </Link>
      </div>
    );
  }

  if (!template) {
    return <div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading template...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Create Cheque</h1>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            Home
          </Link>
          <button
            onClick={saveCheque}
            disabled={isSaving || !values.payee || !values.amount || !values.date}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save & Print"}
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <ChequePreview template={template} values={previewValues} />
        <FieldInputs values={values} onChange={handleValuesChange} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function CreateChequePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading...</div>}>
      <CreateChequePageContent />
    </Suspense>
  );
}

