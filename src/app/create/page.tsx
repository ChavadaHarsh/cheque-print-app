"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateCheque() {
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSecured, setShowSecured] = useState(true);

  const amountToWords = (num: string) => {
    if (!num) return "Zero Dollars Only";
    return "Sample amount in words based on precision logic...";
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <LinkBack />
          <h1 className="display-large">Create Cheque</h1>
        </div>
        <p className="body-medium">Configure ledger details and verify alignment before committing to high-precision print.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-1 flex flex-col gap-8">
          <section className="bg-surface-lowest p-6 rounded-xl border border-outline-variant shadow-sm card-hover">
            <h3 className="label-small text-primary mb-6">Cheque Details</h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Payee Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Who are you paying?" 
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Amount (Numeral)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">$</span>
                  <input 
                    type="number" 
                    className="input-field pl-8" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Issuance Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h3 className="label-small text-primary mb-6">Security Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Secured Ledger</p>
                <p className="text-xs text-on-surface-variant">Add cryptographic tracking hash</p>
              </div>
              <button 
                onClick={() => setShowSecured(!showSecured)}
                className={`w-12 h-6 rounded-full transition-all relative ${showSecured ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showSecured ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </section>

          <button className="btn-primary w-full py-4 text-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Print Cheque
          </button>
        </div>

        <div className="xl:col-span-2">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="label-small text-on-surface-variant">Precision Preview</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-on-surface-variant uppercase">Ready to Print</span>
              </div>
            </div>

            <div className="aspect-[2.2/1] bg-surface-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden relative group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
              
              <div className="p-10 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center font-bold text-xs uppercase">OB</div>
                    <span className="text-sm font-bold tracking-tight uppercase">Obsidian Global Bank</span>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-1 mb-1">
                      {date.split('-').reverse().join('').split('').map((char, i) => (
                        <div key={i} className="w-7 h-9 border border-outline-variant flex items-center justify-center font-mono text-lg bg-surface-low">
                          {char}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Date (DDMMYYYY)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-end gap-4 border-b border-on-surface/10 pb-2">
                    <span className="text-sm font-bold uppercase whitespace-nowrap mb-1">Pay to the order of</span>
                    <span className="text-2xl font-medium flex-1 text-primary">{payee || "..........................................................."}</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex items-end gap-4 border-b border-on-surface/10 pb-2">
                      <span className="text-sm font-bold uppercase whitespace-nowrap mb-1">Amount in words</span>
                      <span className="text-sm font-medium italic text-on-surface-variant">{payee ? (amount ? amountToWords(amount) : "....................................................................................") : "...................................................................................."}</span>
                    </div>
                    <div className="w-1/3 bg-surface-container px-4 py-3 rounded-lg border-2 border-primary/10 flex items-center gap-2">
                      <span className="font-bold text-xl">$</span>
                      <span className="text-2xl font-bold flex-1 text-right">{amount || "0.00"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <div className="font-mono text-xs tracking-[0.3em] font-bold text-on-surface-variant">
                      ⑈ 001234 ⑈ 123456789 ⑈ 01
                    </div>
                    {showSecured && (
                      <div className="text-[8px] font-mono text-on-surface-variant opacity-50 max-w-[200px] truncate">
                        HASH: 0x7702629820912873107_A9F2E4...
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-12 border-b-2 border-primary/20 flex items-center justify-center">
                      <span className="font-serif italic text-primary/40 text-xl">Authorized Signatory</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold mt-2">Signature</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all cursor-crosshair flex items-center justify-center backdrop-blur-[2px]">
                <div className="glass px-6 py-3 rounded-full flex gap-4 shadow-xl">
                  <button className="text-xs font-bold text-primary hover:scale-110 transition-all">EDIT FIELDS</button>
                  <div className="w-px h-4 bg-outline-variant" />
                  <button className="text-xs font-bold text-primary hover:scale-110 transition-all">ALIGN X/Y</button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <div className="flex-1 bg-surface-low p-4 rounded-xl border border-outline-variant flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase">Alignment</p>
                  <p className="text-sm font-semibold">Perfect Center (Vertical/Horizontal)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkBack() {
  return (
    <Link href="/" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </Link>
  );
}
