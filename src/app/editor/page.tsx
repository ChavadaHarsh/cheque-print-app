"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { TemplateEditorCanvas } from "@/components/TemplateEditorCanvas";
import type { Template, TemplateField } from "@/lib/types";

const DEFAULT_BASE_WIDTH = 1000;
const DEFAULT_BASE_HEIGHT = 450;

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const templateId = searchParams?.get("templateId") || "";
  const imageUrlFromQuery = searchParams?.get("imageUrl") || "";
  const bankIdFromQuery = searchParams?.get("bankId") || "";
  const bankNameFromQuery = searchParams?.get("bankName") || "";

  const [imageUrl, setImageUrl] = useState(imageUrlFromQuery);
  const [bankId, setBankId] = useState(bankIdFromQuery);
  const [bankName, setBankName] = useState(bankNameFromQuery);
  const [templateName, setTemplateName] = useState(bankNameFromQuery ? `${bankNameFromQuery} Template` : "");
  const [issuerName, setIssuerName] = useState("");
  const [issuerPosition, setIssuerPosition] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      const response = await fetch(`/api/templates/${templateId}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Unable to load template.");
        return;
      }
      const template = payload.template as Template;
      setImageUrl(template.imageUrl);
      setBankId(template.bankId);
      setBankName(template.bankName);
      setTemplateName(template.templateName || `${template.bankName} Template`);
      setIssuerName(template.issuerName || "");
      setIssuerPosition(template.issuerPosition || "");
      setFields(template.fields);
    };

    loadTemplate();
  }, [templateId]);

  const canSave = useMemo(() => {
    return Boolean(bankId && bankName && imageUrl && templateName.trim() && fields.length > 0);
  }, [bankId, bankName, imageUrl, templateName, fields.length]);

  const findPosition = (key: "payee" | "amountNumber" | "date") => {
    const item = fields.find((field) => field.key === key);
    return item ? { x: item.x, y: item.y } : { x: 0, y: 0 };
  };

  const handleSaveTemplate = async () => {
    if (!canSave) return;

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        templateName: templateName.trim(),
        bankId,
        bankName,
        issuerName: issuerName.trim(),
        issuerPosition: issuerPosition.trim(),
        imageUrl,
        widthMM: 202,
        heightMM: 92,
        baseWidth: DEFAULT_BASE_WIDTH,
        baseHeight: DEFAULT_BASE_HEIGHT,
        dateFieldPosition: findPosition("date"),
        amountPosition: findPosition("amountNumber"),
        payeePosition: findPosition("payee"),
        signaturePosition: { x: DEFAULT_BASE_WIDTH * 0.72, y: DEFAULT_BASE_HEIGHT * 0.75 },
        alignment: "left" as const,
        font: { family: "Arial", size: 24 },
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        fields,
      };

      const response = await fetch(templateId ? `/api/templates/${templateId}` : "/api/templates", {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to save template.");
        return;
      }

      router.push(`/create?templateId=${result.template._id}`);
    } catch {
      setError("Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageUrl) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-8">
        <p className="text-slate-700">No image selected. Upload a cheque image first.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-700">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Template Editor</h1>
          <p className="text-slate-600">Bank: {bankName}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            Back
          </Link>
          <button
            type="button"
            disabled={!canSave || isSaving}
            onClick={handleSaveTemplate}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : templateId ? "Update Template" : "Save Template"}
          </button>
        </div>
      </header>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Template Name</span>
          <input
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Issuer Name (default)</span>
          <input
            value={issuerName}
            onChange={(event) => setIssuerName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Issuer Position (default)</span>
          <input
            value={issuerPosition}
            onChange={(event) => setIssuerPosition(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>
      </section>

      <TemplateEditorCanvas
        imageUrl={imageUrl}
        baseWidth={DEFAULT_BASE_WIDTH}
        baseHeight={DEFAULT_BASE_HEIGHT}
        initialFields={fields}
        onFieldsChange={setFields}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-700">Loading...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
