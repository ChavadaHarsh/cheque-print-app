"use client";

type Values = {
  payee: string;
  amount: string;
  date: string;
  amountWords: string;
  issuerName: string;
  issuerPosition: string;
};

type Props = {
  values: Values;
  onChange: (next: Values) => void;
};

export function FieldInputs({ values, onChange }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Payee</span>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={values.payee}
          onChange={(e) => onChange({ ...values, payee: e.target.value })}
          placeholder="Enter payee name"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Amount</span>
        <input
          type="number"
          min="0"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={values.amount}
          onChange={(e) => onChange({ ...values, amount: e.target.value })}
          placeholder="Enter amount"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Date</span>
        <input
          type="date"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={values.date}
          onChange={(e) => onChange({ ...values, date: e.target.value })}
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Current User Name</span>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={values.issuerName}
          onChange={(e) => onChange({ ...values, issuerName: e.target.value })}
          placeholder="Issuer name"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Current User Position</span>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          value={values.issuerPosition}
          onChange={(e) => onChange({ ...values, issuerPosition: e.target.value })}
          placeholder="Issuer position"
        />
      </label>

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium text-slate-700">Amount in Words</span>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          rows={2}
          value={values.amountWords}
          onChange={(e) => onChange({ ...values, amountWords: e.target.value })}
        />
      </label>
    </div>
  );
}
