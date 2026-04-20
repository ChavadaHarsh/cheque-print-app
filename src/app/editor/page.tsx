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
      setFields(template.fields);
    };

    loadTemplate();
  }, [templateId]);

  const canSave = useMemo(() => {
    return Boolean(bankId && bankName && imageUrl && fields.length > 0);
  }, [bankId, bankName, imageUrl, fields.length]);

  const handleSaveTemplate = async () => {
    if (!canSave) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankId,
          bankName,
          imageUrl,
          widthMM: 202,
          heightMM: 92,
          baseWidth: DEFAULT_BASE_WIDTH,
          baseHeight: DEFAULT_BASE_HEIGHT,
          fields,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Failed to save template.");
        return;
      }

      router.push(`/create?templateId=${payload.template._id}`);
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
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </header>

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

