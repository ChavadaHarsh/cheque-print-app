"use client";

const TEMPLATES = [
  { name: "Obsidian Classic", type: "Standard", bank: "Generic", color: "bg-primary" },
  { name: "Global Wealth", type: "Premium", bank: "HDFC Bank", color: "bg-[#1e293b]" },
  { name: "Enterprise Ledger", type: "Business", bank: "ICICI Bank", color: "bg-[#0f172a]" },
  { name: "Precision Swift", type: "Personal", bank: "SBI Bank", color: "bg-primary-container" },
  { name: "Safe Vault", type: "Security", bank: "Axis Bank", color: "bg-slate-900" },
  { name: "Minimalist Ink", type: "Standard", bank: "Standard Chartered", color: "bg-white" },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="display-large mb-2">Cheque Templates</h1>
        <p className="body-medium">Select a layout tailored for your bank or create a custom precision template.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <button className="group border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-surface-low transition-all">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <p className="font-bold text-on-surface">Create New Template</p>
        </button>

        {TEMPLATES.map((tpl, i) => (
          <div key={i} className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-sm card-hover overflow-hidden flex flex-col group">
            <div className={`aspect-[2/1] ${tpl.color} relative overflow-hidden flex items-center justify-center`}>
              {/* Decorative mini cheque preview */}
              <div className="w-3/4 h-1/2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl p-3 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-4 h-4 rounded-full bg-white/20" />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(x => <div key={x} className="w-2 h-3 bg-white/20 rounded-sm" />)}
                  </div>
                </div>
                <div className="h-0.5 w-1/2 bg-white/20" />
                <div className="flex justify-between items-end">
                   <div className="h-0.5 w-1/4 bg-white/20" />
                   <div className="w-6 h-4 bg-white/20 rounded-sm" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <button className="btn-primary w-full text-xs py-2">Select Template</button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{tpl.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container rounded uppercase tracking-wider">{tpl.type}</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">{tpl.bank}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
