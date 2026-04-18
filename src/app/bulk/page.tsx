"use client";

const QUEUE = [
  { id: "001240", payee: "Riverside Rentals", amount: "2,400.00", bank: "HDFC", checked: false },
  { id: "001241", payee: "Azure Systems", amount: "1,150.00", bank: "ICICI", checked: true },
  { id: "001242", payee: "Spectrum Labs", amount: "6,700.00", bank: "SBI", checked: false },
  { id: "001243", payee: "Nova Energy", amount: "3,200.00", bank: "Axis", checked: true },
  { id: "001244", payee: "Cloud Matrix", amount: "12,000.00", bank: "HDFC", checked: false },
];

export default function BulkPrintPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="display-large mb-2">Bulk Print Queue</h1>
          <p className="body-medium">Manage multiple pending ledgers and execute high-precision batch printing.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="label-small text-on-surface-variant">Batch Size</span>
            <span className="text-xl font-bold">12 Cheques</span>
          </div>
          <button className="btn-primary px-8">Execute Batch Print</button>
        </div>
      </header>

      <div className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-sm card-hover overflow-hidden">
        <div className="bg-surface-low p-6 border-b border-outline-variant flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <button className="text-sm font-bold text-primary">Select All</button>
            <span className="text-sm text-on-surface-variant">|</span>
            <button className="text-sm font-bold text-on-surface-variant opacity-50">Clear Selection</button>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary py-2 text-xs">Edit Selected</button>
            <button className="btn-secondary py-2 text-xs text-red-600">Remove Selected</button>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/50">
          {QUEUE.map((item) => (
            <div key={item.id} className="flex items-center gap-6 p-6 hover:bg-surface-low transition-all">
              <input type="checkbox" checked={item.checked} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" readOnly />
              <div className="flex-1">
                <p className="font-bold text-lg">{item.payee}</p>
                <div className="flex gap-3 items-center mt-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.bank} Template</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="text-xs font-medium text-on-surface-variant">ID: {item.id}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${item.amount}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">Ready</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
