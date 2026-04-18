import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { FiClock, FiCreditCard, FiGrid, FiLayers, FiPrinter, FiSettings } from "react-icons/fi";

export const metadata: Metadata = {
  title: "ChequePrint Pro | Precision Ledger",
  description: "High-precision bank cheque designing and printing application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <aside className="sidebar">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                C
              </div>
              <div>
                <h2 className="text-lg font-bold leading-none tracking-tight">ChequePrint</h2>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.1em]">Precision Ledger</span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <NavItem href="/" icon="dashboard" label="Dashboard" />
              <NavItem href="/create" icon="payments" label="Create Cheque" />
              <NavItem href="/bulk" icon="print" label="Bulk Print" />
              <NavItem href="/templates" icon="template" label="Templates" />
              <NavItem href="/history" icon="history" label="History" />
            </nav>

            <div className="mt-auto pt-8 border-t border-outline-variant">
              <NavItem href="/settings" icon="settings" label="Settings" />
            </div>
          </aside>

          <main className="main-content flex-1 bg-surface min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: keyof typeof navIcons; label: string }) {
  const Icon = navIcons[icon];

  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface group"
    >
      <div className="text-xl transition-transform group-hover:scale-110">
        <Icon />
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}

const navIcons = {
  dashboard: FiGrid,
  payments: FiCreditCard,
  print: FiPrinter,
  template: FiLayers,
  history: FiClock,
  settings: FiSettings,
};
