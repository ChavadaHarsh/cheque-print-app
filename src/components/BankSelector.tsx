"use client";

import { FormEvent, useState } from "react";

import type { Bank } from "@/lib/types";

type Props = {
  banks: Bank[];
  value: string;
  onChange: (bankId: string) => void;
  onBankAdded: (bank: Bank) => void;
};

export function BankSelector({ banks, value, onChange, onBankAdded }: Props) {
  const [newBankName, setNewBankName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddBank = async (event: FormEvent) => {
    event.preventDefault();
    if (!newBankName.trim()) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBankName.trim() }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Failed to create bank.");
        return;
      }

      onBankAdded(payload.bank as Bank);
      onChange(payload.bank._id);
      setNewBankName("");
    } catch {
      setError("Failed to create bank.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Select Bank</label>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
          Add Bank
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
