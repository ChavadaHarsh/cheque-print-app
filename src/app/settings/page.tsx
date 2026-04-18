"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [alignmentX, setAlignmentX] = useState(0);
  const [alignmentY, setAlignmentY] = useState(0);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="display-large mb-2">Settings</h1>
        <p className="body-medium">Calibrate printer alignment and manage global application preferences.</p>
      </header>

      <div className="flex flex-col gap-10">
        <section className="bg-surface-lowest p-8 rounded-2xl border border-outline-variant shadow-sm card-hover">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="12" x2="12" y1="18" y2="18"/></svg>
            Printer Alignment Calibration
          </h2>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            Adjust the X and Y offsets to account for physical printer margins. These settings apply globally to all templates to ensure text maps perfectly to cheque lines.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-on-surface">Horizontal Offset (X)</label>
                  <span className="font-mono text-primary font-bold">{alignmentX}mm</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  step="0.1" 
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  value={alignmentX}
                  onChange={(e) => setAlignmentX(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant opacity-50 px-1">
                  <span>-20MM</span>
                  <span>CENTER</span>
                  <span>+20MM</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-on-surface">Vertical Offset (Y)</label>
                  <span className="font-mono text-primary font-bold">{alignmentY}mm</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  step="0.1" 
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  value={alignmentY}
                  onChange={(e) => setAlignmentY(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant opacity-50 px-1">
                  <span>-20MM</span>
                  <span>CENTER</span>
                  <span>+20MM</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-low rounded-xl border border-outline-variant p-6 flex items-center justify-center">
              <div className="w-32 h-20 border-2 border-primary/20 rounded relative">
                <div 
                  className="absolute w-12 h-0.5 bg-primary/40 rounded"
                  style={{ 
                    left: `calc(50% + ${alignmentX}px)`, 
                    top: `calc(50% + ${alignmentY}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                   className="absolute w-1 h-4 bg-primary/40 rounded"
                   style={{ 
                    left: `calc(50% + ${alignmentX}px)`, 
                    top: `calc(50% + ${alignmentY}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <span className="absolute bottom-2 left-2 text-[8px] font-bold text-primary/30 uppercase tracking-[0.2em]">CALIBRATION PREVIEW</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-xl font-bold mb-8">General Preferences</h2>
          <div className="flex flex-col gap-6">
            <Toggle label="Enable Cryptographic Hashing" desc="Add unique tracking hash to every cheque footer" active={true} />
            <Toggle label="Auto-suggest Words" desc="Convert numerals to amount strings as you type" active={true} />
            <Toggle label="Cloud Sync" desc="Backup history and templates to secure vault" active={false} />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button className="btn-primary px-12 py-4">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, active }: { label: string; desc: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0 pb-4 last:pb-0">
      <div>
        <p className="font-bold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant font-medium mt-1">{desc}</p>
      </div>
      <button className={`w-11 h-6 rounded-full relative transition-all ${active ? 'bg-primary' : 'bg-surface-container-highest'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}
