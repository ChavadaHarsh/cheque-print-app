"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BankSelector } from "@/components/BankSelector";
import { ImageUploader } from "@/components/ImageUploader";
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

export default function HomePage() {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [bankId, setBankId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingTemplateId, setDeletingTemplateId] = useState("");

  const selectedBankName = useMemo(() => {
    return banks.find((bank) => bank._id === bankId)?.name || "";
  }, [bankId, banks]);

  useEffect(() => {
    const load = async () => {
      try {
        const [banksRes, templatesRes] = await Promise.all([
          fetch("/api/banks", { cache: "no-store" }),
          fetch("/api/templates", { cache: "no-store" }),
        ]);

        const [banksJson, templatesJson] = await Promise.all([
          parseJsonSafe<{ banks?: Bank[] }>(banksRes),
          parseJsonSafe<{ templates?: Template[] }>(templatesRes),
        ]);

        setBanks(banksRes.ok ? banksJson?.banks || [] : []);
        setTemplates(templatesRes.ok ? templatesJson?.templates || [] : []);
      } catch {
        setBanks([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUploaded = (payload: { imageUrl: string; bankId: string; bankName: string }) => {
    const params = new URLSearchParams({
      imageUrl: payload.imageUrl,
      bankId: payload.bankId,
      bankName: payload.bankName,
    });
    router.push(`/editor?${params.toString()}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setDeletingTemplateId(templateId);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      if (!response.ok) return;
      setTemplates((prev) => prev.filter((template) => template._id !== templateId));
    } finally {
      setDeletingTemplateId("");
    }
  };

  const visibleTemplates = bankId ? templates.filter((template) => template.bankId === bankId) : templates;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cheque Print App</h1>
        <p className="text-slate-600">
          Manage banks, create cheque templates, assign default users, and print clean cheque content.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create New Template</h2>
        <BankSelector
          banks={banks}
          value={bankId}
          onChange={setBankId}
          onBankAdded={(bank) => setBanks((prev) => [...prev, bank].sort((a, b) => a.name.localeCompare(b.name)))}
          onBankUpdated={(updated) =>
            setBanks((prev) => prev.map((bank) => (bank._id === updated._id ? { ...bank, ...updated } : bank)))
          }
        />
        <ImageUploader bankId={bankId} bankName={selectedBankName} onUploaded={handleUploaded} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Saved Templates</h2>
          <Link href="/create" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Go to create cheque
          </Link>
        </div>

        {loading ? <p className="text-slate-600">Loading templates...</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTemplates.map((template) => (
            <article key={template._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm">
              <button onClick={() => router.push(`/create?templateId=${template._id}`)} className="w-full text-left">
                <div className="relative aspect-[2.2/1] w-full">
                  <Image src={template.imageUrl} alt={template.bankName} fill className="object-cover" />
                </div>
                <div className="space-y-1 p-3">
                  <p className="font-semibold text-slate-900">{template.templateName || template.bankName}</p>
                  <p className="text-sm text-slate-600">Bank: {template.bankName}</p>
                  <p className="text-xs text-slate-500">{template.fields.length} fields</p>
                </div>
              </button>
              <div className="flex gap-2 border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => router.push(`/editor?templateId=${template._id}`)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(template._id)}
                  disabled={deletingTemplateId === template._id}
                  className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingTemplateId === template._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
