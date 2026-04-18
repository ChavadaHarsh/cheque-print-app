"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiShield,
} from "react-icons/fi";

type ChequeStatus = "Printed" | "Draft" | "Void";

type ChequeHistoryItem = {
  id: string;
  payee: string;
  amountCents: number;
  issuedDate: string;
  status: ChequeStatus;
  hash: string;
  bank: string;
  createdAt: string;
};

const statusStyles: Record<ChequeStatus, string> = {
  Printed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-blue-50 text-blue-700 ring-blue-200",
  Void: "bg-rose-50 text-rose-700 ring-rose-200",
};

const statusIcons: Record<ChequeStatus, ReactNode> = {
  Printed: <FiCheckCircle />,
  Draft: <FiClock />,
  Void: <FiAlertCircle />,
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ChequeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/history", { cache: "no-store" });
      const payload = (await response.json()) as { data?: ChequeHistoryItem[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "History request failed.");
      }

      setHistory(payload.data ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return history;
    }

    return history.filter((item) =>
      [item.id, item.payee, item.bank, item.status, item.hash]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [history, query]);

  const totalIssued = history.reduce((sum, item) => sum + item.amountCents, 0);
  const printedCount = history.filter((item) => item.status === "Printed").length;

  const exportCsv = () => {
    const header = ["Cheque ID", "Payee", "Amount", "Date", "Status", "Bank", "Hash"];
    const rows = filteredHistory.map((item) => [
      item.id,
      item.payee,
      formatCurrency(item.amountCents),
      item.issuedDate,
      item.status,
      item.bank,
      item.hash,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cheque-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 py-4 sm:py-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <FiShield className="h-4 w-4" />
            Secured SQLite ledger
          </div>
          <h1 className="display-large mb-3">Transaction History</h1>
          <p className="body-medium max-w-2xl">
            Audit logs, verification hashes, cheque status, and export-ready records from the local SQLite database.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="btn-secondary min-h-11" onClick={fetchHistory} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="btn-primary min-h-11" onClick={exportCsv} disabled={!filteredHistory.length}>
            <FiDownload />
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Total Value" value={formatCurrency(totalIssued)} icon={<FiFileText />} />
        <MetricCard label="Printed Cheques" value={String(printedCount).padStart(2, "0")} icon={<FiCheckCircle />} />
        <MetricCard label="Verified Hashes" value={`${history.length}/${history.length}`} icon={<FiShield />} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest shadow-sm">
        <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-low p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Ledger Records</h2>
            <p className="body-medium">Showing {filteredHistory.length} of {history.length} stored transactions.</p>
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="input-field h-11 pl-11"
              placeholder="Search payee, bank, ID, status..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <FiAlertCircle className="h-10 w-10 text-error" />
            <p className="font-semibold text-on-surface">{error}</p>
            <button className="btn-secondary" onClick={fetchHistory}>Try Again</button>
          </div>
        ) : isLoading ? (
          <LoadingState />
        ) : filteredHistory.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <TableHead>Cheque ID</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="group transition-colors hover:bg-surface-low">
                      <td className="px-6 py-5 font-mono text-sm font-bold text-primary">{item.id}</td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-on-surface">{item.payee}</p>
                        <p className="text-xs text-on-surface-variant">{item.bank}</p>
                      </td>
                      <td className="px-6 py-5 font-bold text-on-surface">{formatCurrency(item.amountCents)}</td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(item.issuedDate)}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary/50" />
                          <span className="font-mono text-xs text-on-surface-variant">{item.hash}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
                          <IconButton label="Download cheque">
                            <FiDownload />
                          </IconButton>
                          <IconButton label="View cheque">
                            <FiEye />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredHistory.map((item) => (
                <article key={item.id} className="rounded-xl border border-outline-variant bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-primary">#{item.id}</p>
                      <h3 className="mt-1 text-lg font-bold text-on-surface">{item.payee}</h3>
                      <p className="text-xs text-on-surface-variant">{item.bank}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="label-small text-on-surface-variant">Amount</p>
                      <p className="mt-1 font-bold text-on-surface">{formatCurrency(item.amountCents)}</p>
                    </div>
                    <div>
                      <p className="label-small text-on-surface-variant">Date</p>
                      <p className="mt-1 font-semibold text-on-surface">{formatDate(item.issuedDate)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-surface-low px-3 py-2">
                    <span className="truncate font-mono text-xs text-on-surface-variant">{item.hash}</span>
                    <FiShield className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="font-semibold text-on-surface">No matching transactions found.</p>
            <p className="body-medium mt-1">Try another cheque ID, payee, bank, or status.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="card-hover rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
        {icon}
      </div>
      <p className="label-small text-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-bold text-on-surface">{value}</p>
    </div>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return <th className="px-6 py-4 label-small text-on-surface-variant">{children}</th>;
}

function StatusBadge({ status }: { status: ChequeStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[status]}`}>
      {statusIcons[status]}
      {status}
    </span>
  );
}

function IconButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-white hover:text-primary hover:shadow-sm"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-xl bg-surface-low" />
      ))}
    </div>
  );
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
