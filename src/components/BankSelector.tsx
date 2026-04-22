"use client";

import { FormEvent, useMemo, useState } from "react";

import type { Bank } from "@/lib/types";

type Props = {
  banks: Bank[];
  value: string;
  onChange: (bankId: string) => void;
  onBankAdded: (bank: Bank) => void;
  onBankUpdated: (bank: Bank) => void;
};

type DraftByBank = Record<string, { name: string; position: string }>;

export function BankSelector({ banks, value, onChange, onBankAdded, onBankUpdated }: Props) {
  const [newBankName, setNewBankName] = useState("");
  const [draftByBank, setDraftByBank] = useState<DraftByBank>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDefaultUser, setIsSavingDefaultUser] = useState(false);
  const [error, setError] = useState("");

  const selectedBank = useMemo(() => banks.find((bank) => bank._id === value) || null, [banks, value]);

  const selectedDraft = value ? draftByBank[value] : undefined;
  const defaultUserName = selectedDraft?.name ?? selectedBank?.defaultUserName ?? "";
  const defaultUserPosition = selectedDraft?.position ?? selectedBank?.defaultUserPosition ?? "";

  const parseJsonSafe = async <T,>(response: Response): Promise<T | null> => {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  };

  const handleBankChange = (bankId: string) => {
    onChange(bankId);
    setError("");
  };

  const handleAddBank = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = newBankName.trim();
    if (!trimmedName) {
      setError("Please enter a bank name.");
      return;
    }

    setIsSaving(true);
    setError("");

    const existingBank = banks.find((bank) => bank.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingBank) {
      onChange(existingBank._id);
      setNewBankName("");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const payload = await parseJsonSafe<{ bank?: Bank; error?: string }>(response);

      if (!response.ok) {
        setError(payload?.error || "Unable to add bank. Please try again.");
        return;
      }

      if (!payload?.bank?._id) {
        setError("Unable to add bank. Please try again.");
        return;
      }

      onBankAdded(payload.bank);
      onChange(payload.bank._id);
      setNewBankName("");
    } catch {
      setError("Unable to add bank. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDefaultUser = async () => {
    if (!selectedBank) {
      setError("Please select a bank first.");
      return;
    }

    setIsSavingDefaultUser(true);
    setError("");

    try {
      const response = await fetch(`/api/banks/${selectedBank._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultUserName: defaultUserName.trim(),
          defaultUserPosition: defaultUserPosition.trim(),
        }),
      });
      const payload = await parseJsonSafe<{ bank?: Bank; error?: string }>(response);

      if (!response.ok || !payload?.bank) {
        setError(payload?.error || "Unable to save default user details.");
        return;
      }

      onBankUpdated(payload.bank);
      setDraftByBank((prev) => {
        const next = { ...prev };
        delete next[selectedBank._id];
        return next;
      });
    } catch {
      setError("Unable to save default user details.");
    } finally {
      setIsSavingDefaultUser(false);
    }
  };

  const setDraftField = (field: "name" | "position", nextValue: string) => {
    if (!value) return;
    setDraftByBank((prev) => ({
      ...prev,
      [value]: {
        name: field === "name" ? nextValue : prev[value]?.name ?? selectedBank?.defaultUserName ?? "",
        position:
          field === "position" ? nextValue : prev[value]?.position ?? selectedBank?.defaultUserPosition ?? "",
      },
    }));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Select Bank</label>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring"
        value={value}
        onChange={(event) => handleBankChange(event.target.value)}
      >
        <option value="">Choose bank</option>
        {banks.map((bank) => (
          <option key={bank._id} value={bank._id}>
            {bank.name}
          </option>
        ))}
      </select>

      <form className="flex gap-2" onSubmit={handleAddBank}>
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={newBankName}
          onChange={(event) => setNewBankName(event.target.value)}
          placeholder="Add new bank name"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? "Adding..." : "Add Bank"}
        </button>
      </form>

      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Default User Name</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            value={defaultUserName}
            onChange={(event) => setDraftField("name", event.target.value)}
            placeholder="e.g. Harsh Chavda"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Default User Position</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            value={defaultUserPosition}
            onChange={(event) => setDraftField("position", event.target.value)}
            placeholder="e.g. Operations Manager"
          />
        </label>
        <button
          type="button"
          onClick={handleSaveDefaultUser}
          disabled={isSavingDefaultUser || !value}
          className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isSavingDefaultUser ? "Saving user details..." : "Save Default User For Bank"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
