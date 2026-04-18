"use client";

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="display-large mb-2">Precision Ledger</h1>
          <p className="body-medium">Overview of your financial issuance and ledger health.</p>
        </div>
        <Link href="/create" className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Cheque
        </Link>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Issued" value="$42,500" trend="+12.5%" color="bg-primary" />
        <StatCard label="Pending Print" value="08" trend="-2" color="bg-primary-container" />
        <StatCard label="Verified Hashes" value="124" trend="100%" color="bg-[#1e293b]" />
        <StatCard label="Templates Used" value="04" trend="Active" color="bg-surface-container-highest" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <section className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Issues</h3>
              <Link href="/history" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-outline-variant/30">
              <ActivityRow id="001240" payee="Riverside Rentals" amount="$2,400.00" date="2 hours ago" />
              <ActivityRow id="001239" payee="Tech Solutions" amount="$850.50" date="5 hours ago" />
              <ActivityRow id="001238" payee="Global Logistics" amount="$12,000.00" date="Yesterday" />
              <ActivityRow id="001237" payee="Acme Corp" amount="$5,500.00" date="2 days ago" />
            </div>
          </section>
        </div>

        {/* Quick Actions / Status */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="font-bold text-lg mb-6">Printer Status</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </div>
              <div>
                <p className="font-bold text-on-surface">HP LaserJet 400</p>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Online & Calibrated</p>
              </div>
            </div>
            <button className="w-full btn-secondary py-3 text-sm">Run Alignment Test</button>
          </section>

          <section className="bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">Explore our documentation for precision alignment guides and bank specific setup.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-surface-low transition-all">Documentation</button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color }: { label: string; value: string; trend: string; color: string }) {
  return (
    <div className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant shadow-sm card-hover">
      <div className={`w-2 h-2 rounded-full ${color} mb-4`} />
      <span className="label-small text-on-surface-variant">{label}</span>
      <div className="flex justify-between items-end mt-2">
        <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
        <span className="text-[10px] font-bold text-primary uppercase bg-primary-container/10 px-2 py-0.5 rounded">{trend}</span>
      </div>
    </div>
  );
}

function ActivityRow({ id, payee, amount, date }: { id: string; payee: string; amount: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-surface-low transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center font-mono text-xs font-bold text-on-surface-variant">{id.slice(-2)}</div>
        <div>
          <p className="font-bold text-on-surface">{payee}</p>
          <p className="text-xs text-on-surface-variant font-medium">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-on-surface">{amount}</p>
        <p className="text-[10px] font-mono text-on-surface-variant opacity-50 tracking-wider">ID: {id}</p>
      </div>
    </div>
  );
}
