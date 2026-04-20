"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Position = { x: number; y: number };

type TemplateFields = {
  payee: Position;
  amountNumber: Position;
  amountWords: Position;
  date: Position;
  signature: Position;
};

type Template = {
  _id: string;
  bankName: string;
  variant?: string;
  page: { width: number; height: number };
  fields: TemplateFields;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; message: string };

type ChequeFormState = {
  payeeName: string;
  amount: string;
  amountInWords: string;
  date: string;
  bankName: string;
  signature: string;
  status: "draft" | "printed";
};

const fieldKeys: Array<keyof TemplateFields> = [
  "payee",
  "amountNumber",
  "amountWords",
  "date",
  "signature",
];

const fieldLabelMap: Record<keyof TemplateFields, string> = {
  payee: "Payee",
  amountNumber: "Amount Number",
  amountWords: "Amount Words",
  date: "Date",
  signature: "Signature",
};

const initialChequeForm: ChequeFormState = {
  payeeName: "",
  amount: "",
  amountInWords: "",
  date: "",
  bankName: "",
  signature: "",
  status: "draft",
};

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [bankFilter, setBankFilter] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [editableFields, setEditableFields] = useState<TemplateFields | null>(null);

  const [chequeForm, setChequeForm] = useState<ChequeFormState>(initialChequeForm);
  const [savingPositions, setSavingPositions] = useState(false);
  const [submittingCheque, setSubmittingCheque] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template._id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const banks = useMemo(() => {
    const unique = Array.from(new Set(templates.map((t) => t.bankName))).sort((a, b) =>
      a.localeCompare(b),
    );
    return unique;
  }, [templates]);

  const applyTemplateSelection = useCallback((template: Template | null) => {
    if (!template) {
      setSelectedTemplateId("");
      setEditableFields(null);
      return;
    }

    setSelectedTemplateId(template._id);
    setEditableFields({
      payee: { ...template.fields.payee },
      amountNumber: { ...template.fields.amountNumber },
      amountWords: { ...template.fields.amountWords },
      date: { ...template.fields.date },
      signature: { ...template.fields.signature },
    });

    setChequeForm((prev) => ({
      ...prev,
      bankName: template.bankName,
    }));
  }, []);

  const fetchTemplates = useCallback(async (bank?: string) => {
    try {
      setLoadingTemplates(true);
      setError(null);
      const params = new URLSearchParams();
      if (bank?.trim()) {
        params.set("bank", bank.trim());
      }

      const response = await fetch(`/api/templates${params.toString() ? `?${params}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiSuccess<Template[]> | ApiError;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Failed to fetch templates." : payload.message);
      }

      setTemplates(payload.data);

      if (payload.data.length === 0) {
        applyTemplateSelection(null);
        return;
      }

      const currentTemplate =
        payload.data.find((template) => template._id === selectedTemplateId) ?? payload.data[0];

      if (currentTemplate) {
        applyTemplateSelection(currentTemplate);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch templates.");
    } finally {
      setLoadingTemplates(false);
    }
  }, [applyTemplateSelection, selectedTemplateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTemplates(bankFilter);
  }, [bankFilter, fetchTemplates]);

  function updateFieldPosition(field: keyof TemplateFields, axis: "x" | "y", value: string) {
    if (!editableFields) {
      return;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return;
    }

    setEditableFields((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        [field]: {
          ...prev[field],
          [axis]: numeric,
        },
      };
    });
  }

  function getPositionStyle(position: Position | undefined) {
    if (!position || !selectedTemplate) {
      return {};
    }

    const leftPercent = (position.x / selectedTemplate.page.width) * 100;
    const topPercent = (position.y / selectedTemplate.page.height) * 100;

    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      transform: "translate(0, -50%)",
    };
  }

  async function saveTemplatePositions() {
    if (!selectedTemplate || !editableFields) {
      return;
    }

    try {
      setSavingPositions(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/templates/${selectedTemplate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: editableFields }),
      });

      const payload = (await response.json()) as ApiSuccess<Template> | ApiError;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Failed to update template." : payload.message);
      }

      setSuccess("Template field positions updated.");
      await fetchTemplates(bankFilter);
      setSelectedTemplateId(payload.data._id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update template.");
    } finally {
      setSavingPositions(false);
    }
  }

  async function createCheque() {
    if (!selectedTemplate || !editableFields) {
      setError("Please select a template first.");
      return;
    }

    try {
      setSubmittingCheque(true);
      setError(null);
      setSuccess(null);

      const amount = Number(chequeForm.amount);
      const body = {
        templateId: selectedTemplate._id,
        payeeName: chequeForm.payeeName,
        amount,
        amountInWords: chequeForm.amountInWords || undefined,
        date: chequeForm.date || undefined,
        bankName: chequeForm.bankName || selectedTemplate.bankName,
        fieldsData: {
          payee: chequeForm.payeeName,
          amountNumber: chequeForm.amount,
          amountWords: chequeForm.amountInWords,
          date: chequeForm.date,
          signature: chequeForm.signature,
        },
        status: chequeForm.status,
      };

      const response = await fetch("/api/cheques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Failed to create cheque." : payload.message);
      }

      setSuccess("Cheque created successfully.");
      setChequeForm((prev) => ({
        ...initialChequeForm,
        bankName: prev.bankName,
      }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create cheque.");
    } finally {
      setSubmittingCheque(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bank Cheque Template Manager
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Fetch all bank templates, select one, preview absolute field positions, and update
            coordinates from controls below.
          </p>
          {error ? (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {success}
            </p>
          ) : null}
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr,2fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Templates</h2>
              <button
                type="button"
                onClick={() => void fetchTemplates(bankFilter)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filter by bank
            </label>
            <select
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={bankFilter}
              onChange={(event) => setBankFilter(event.target.value)}
            >
              <option value="">All Banks</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>

            {loadingTemplates ? (
              <p className="text-sm text-slate-500">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                No templates found for this bank.
              </p>
            ) : (
              <ul className="space-y-2">
                {templates.map((template) => (
                  <li key={template._id}>
                    <button
                      type="button"
                      onClick={() => applyTemplateSelection(template)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                        selectedTemplateId === template._id
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{template.bankName}</p>
                      <p className="text-xs text-slate-500">
                        {template.variant || "Default"} • {template.page.width}x{template.page.height}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Cheque Preview (Absolute Field Positions)</h2>
            {!selectedTemplate || !editableFields ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Select a template to preview field positions.
              </p>
            ) : (
              <>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-300 bg-[linear-gradient(120deg,#f8fbff_0%,#eef4ff_50%,#f2fff8_100%)] p-4">
                  <div className="mx-auto aspect-[2.2/1] w-full max-w-4xl rounded-xl border border-slate-300 bg-white/70 shadow-inner">
                    <div className="relative h-full w-full overflow-hidden rounded-xl">
                      <div className="absolute left-4 top-4 text-xs font-bold uppercase tracking-wide text-slate-600">
                        {selectedTemplate.bankName} {selectedTemplate.variant ? `• ${selectedTemplate.variant}` : ""}
                      </div>

                      <FieldText
                        label="Payee"
                        value={chequeForm.payeeName || "Payee Name"}
                        style={getPositionStyle(editableFields.payee)}
                      />
                      <FieldText
                        label="Amount Number"
                        value={chequeForm.amount || "0.00"}
                        style={getPositionStyle(editableFields.amountNumber)}
                      />
                      <FieldText
                        label="Amount Words"
                        value={chequeForm.amountInWords || "Amount in words"}
                        style={getPositionStyle(editableFields.amountWords)}
                      />
                      <FieldText
                        label="Date"
                        value={chequeForm.date || "YYYY-MM-DD"}
                        style={getPositionStyle(editableFields.date)}
                      />
                      <FieldText
                        label="Signature"
                        value={chequeForm.signature || "Authorized Signature"}
                        style={getPositionStyle(editableFields.signature)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Cheque Dynamic Data
                    </h3>
                    <div className="grid gap-3">
                      <Input
                        label="Payee Name *"
                        value={chequeForm.payeeName}
                        onChange={(value) => setChequeForm((prev) => ({ ...prev, payeeName: value }))}
                      />
                      <Input
                        label="Amount *"
                        type="number"
                        value={chequeForm.amount}
                        onChange={(value) => setChequeForm((prev) => ({ ...prev, amount: value }))}
                      />
                      <Input
                        label="Amount In Words"
                        value={chequeForm.amountInWords}
                        onChange={(value) => setChequeForm((prev) => ({ ...prev, amountInWords: value }))}
                      />
                      <Input
                        label="Date"
                        type="date"
                        value={chequeForm.date}
                        onChange={(value) => setChequeForm((prev) => ({ ...prev, date: value }))}
                      />
                      <Input
                        label="Signature"
                        value={chequeForm.signature}
                        onChange={(value) => setChequeForm((prev) => ({ ...prev, signature: value }))}
                      />
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                        <select
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                          value={chequeForm.status}
                          onChange={(event) =>
                            setChequeForm((prev) => ({
                              ...prev,
                              status: event.target.value as "draft" | "printed",
                            }))
                          }
                        >
                          <option value="draft">draft</option>
                          <option value="printed">printed</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => void createCheque()}
                        disabled={submittingCheque}
                        className="mt-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
                      >
                        {submittingCheque ? "Creating Cheque..." : "Create Cheque"}
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Position Controls (X / Y)
                    </h3>
                    <div className="grid gap-3">
                      {fieldKeys.map((key) => (
                        <div key={key} className="rounded-lg border border-slate-200 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {fieldLabelMap[key]}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={editableFields[key].x}
                              onChange={(event) => updateFieldPosition(key, "x", event.target.value)}
                              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none ring-blue-200 focus:ring-2"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={editableFields[key].y}
                              onChange={(event) => updateFieldPosition(key, "y", event.target.value)}
                              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none ring-blue-200 focus:ring-2"
                              placeholder="Y"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => void saveTemplatePositions()}
                        disabled={savingPositions}
                        className="mt-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                      >
                        {savingPositions ? "Saving Positions..." : "Save Position Changes"}
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}

function FieldText({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style: CSSProperties;
}) {
  return (
    <div
      style={style}
      className="absolute max-w-[46%] rounded border border-slate-300 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm"
      title={label}
    >
      <span className="mr-1 text-[10px] uppercase tracking-wide text-slate-500">{label}:</span>
      {value}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
      />
    </div>
  );
}
