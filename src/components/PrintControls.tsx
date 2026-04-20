"use client";

type Props = {
  offsetX: number;
  offsetY: number;
  onOffsetXChange: (value: number) => void;
  onOffsetYChange: (value: number) => void;
  onPrint: () => void;
};

export function PrintControls({ offsetX, offsetY, onOffsetXChange, onOffsetYChange, onPrint }: Props) {
  return (
    <div className="no-print grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Offset X (mm)</span>
        <input
          type="number"
          step="0.1"
          value={offsetX}
          onChange={(e) => onOffsetXChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Offset Y (mm)</span>
        <input
          type="number"
          step="0.1"
          value={offsetY}
          onChange={(e) => onOffsetYChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
        />
      </label>

      <button
        type="button"
        onClick={onPrint}
        className="sm:col-span-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
      >
        Print
      </button>
    </div>
  );
}
