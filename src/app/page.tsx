"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BankSelector } from "@/components/BankSelector";
import { ImageUploader } from "@/components/ImageUploader";
import type { Bank, Template } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [bankId, setBankId] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedBankName = useMemo(() => {
    return banks.find((bank) => bank._id === bankId)?.name || "";
  }, [bankId, banks]);

  useEffect(() => {
    const load = async () => {
      const [banksRes, templatesRes] = await Promise.all([
        fetch("/api/banks", { cache: "no-store" }),
        fetch("/api/templates", { cache: "no-store" }),
      ]);

      const banksJson = await banksRes.json();
      const templatesJson = await templatesRes.json();

      setBanks((banksJson.banks || []) as Bank[]);
      setTemplates((templatesJson.templates || []) as Template[]);
      setLoading(false);
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cheque Print App</h1>
        <p className="text-slate-600">
          Upload cheque images, place fields with drag-and-drop, preview in real-time, and print with alignment control.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create New Template</h2>
        <BankSelector
          banks={banks}
          value={bankId}
          onChange={setBankId}
          onBankAdded={(bank) => setBanks((prev) => [...prev, bank].sort((a, b) => a.name.localeCompare(b.name)))}
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
          {templates.map((template) => (
            <button
              key={template._id}
              onClick={() => router.push(`/create?templateId=${template._id}`)}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              <div className="relative aspect-[2.2/1] w-full">
                <Image src={template.imageUrl} alt={template.bankName} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-slate-900">{template.bankName}</p>
                <p className="text-sm text-slate-600">{template.fields.length} fields</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
