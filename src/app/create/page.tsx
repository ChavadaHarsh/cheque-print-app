"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { ChequePreview } from "@/components/ChequePreview";
import { FieldInputs } from "@/components/FieldInputs";
import { amountToIndianWords } from "@/lib/amount-to-words";
import type { Bank, Template } from "@/lib/types";

const parseJsonSafe = async <T,>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

function CreateChequePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdFromQuery = searchParams?.get("templateId") || "";

  const [banks, setBanks] = useState<Bank[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateIdFromQuery);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    payee: "",
    amount: "",
    date: "",
    amountWords: "",
    issuerName: "",
    issuerPosition: "",
  });

  const template = useMemo(
    () => templates.find((item) => item._id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [banksRes, templatesRes] = await Promise.all([
          fetch("/api/banks", { cache: "no-store" }),
          fetch("/api/templates", { cache: "no-store" }),
        ]);

        const [banksJson, templatesJson] = await Promise.all([
          parseJsonSafe<{ banks?: Bank[] }>(banksRes),
          parseJsonSafe<{ templates?: Template[] }>(templatesRes),
        ]);

        const loadedBanks = banksRes.ok ? banksJson?.banks || [] : [];
        const loadedTemplates = templatesRes.ok ? templatesJson?.templates || [] : [];

        setBanks(loadedBanks);
        setTemplates(loadedTemplates);

        if (templateIdFromQuery) {
          const selected = loadedTemplates.find((item) => item._id === templateIdFromQuery) || null;
          setSelectedTemplateId(templateIdFromQuery);
          setSelectedBankId(selected?.bankId || "");
          if (selected) {
            const selectedBank = loadedBanks.find((bank) => bank._id === selected.bankId);
            setValues((prev) => ({
              ...prev,
              issuerName: selected.issuerName || selectedBank?.defaultUserName || "",
              issuerPosition: selected.issuerPosition || selectedBank?.defaultUserPosition || "",
            }));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateIdFromQuery]);

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
      issuerName: values.issuerName,
      issuerPosition: values.issuerPosition,
    };
  }, [values]);

  const visibleTemplates = selectedBankId
    ? templates.filter((item) => item.bankId === selectedBankId)
    : templates;

  const handleSelectBank = (bankId: string) => {
    setSelectedBankId(bankId);
    setSelectedTemplateId("");

    const selectedBank = banks.find((bank) => bank._id === bankId);
    setValues((prev) => ({
      ...prev,
      issuerName: selectedBank?.defaultUserName || "",
      issuerPosition: selectedBank?.defaultUserPosition || "",
    }));
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((item) => item._id === templateId);
    if (!selected) return;

    setSelectedBankId(selected.bankId);
    const selectedBank = banks.find((bank) => bank._id === selected.bankId);
    setValues((prev) => ({
      ...prev,
      issuerName: selected.issuerName || selectedBank?.defaultUserName || prev.issuerName,
      issuerPosition: selected.issuerPosition || selectedBank?.defaultUserPosition || prev.issuerPosition,
    }));
  };

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
          bankId: template.bankId,
          bankName: template.bankName,
          issuerName: values.issuerName || template.issuerName || "",
          issuerPosition: values.issuerPosition || template.issuerPosition || "",
          payee: values.payee,
          amount: Number(values.amount),
          amountWords: values.amountWords,
          date: values.date,
        }),
      });

      const payload = await parseJsonSafe<{ cheque?: { _id: string }; error?: string }>(response);
      if (!response.ok || !payload?.cheque?._id) {
        setError(payload?.error || "Failed to save cheque.");
        return;
      }

      router.push(`/print?chequeId=${payload.cheque._id}&templateId=${template._id}`);
    } catch {
      setError("Failed to save cheque.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading template setup...</div>;
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
            disabled={isSaving || !template || !values.payee || !values.amount || !values.date}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save & Print"}
          </button>
        </div>
      </header>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Select Bank</span>
          <select
            value={selectedBankId}
            onChange={(event) => handleSelectBank(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          >
            <option value="">Choose bank</option>
            {banks.map((bank) => (
              <option key={bank._id} value={bank._id}>
                {bank.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Select Template</span>
          <select
            value={selectedTemplateId}
            onChange={(event) => handleSelectTemplate(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          >
            <option value="">Choose template</option>
            {visibleTemplates.map((item) => (
              <option key={item._id} value={item._id}>
                {item.templateName || item.bankName}
              </option>
            ))}
          </select>
        </label>
      </section>

      {template ? (
        <div className="space-y-4">
          <ChequePreview template={template} values={previewValues} />
          <FieldInputs values={values} onChange={handleValuesChange} />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-600">
          Select a bank and template to start printing.
        </p>
      )}

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
