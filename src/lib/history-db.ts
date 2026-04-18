import crypto from "crypto";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type ChequeStatus = "Printed" | "Draft" | "Void";

export type ChequeHistoryItem = {
  id: string;
  payee: string;
  amountCents: number;
  issuedDate: string;
  status: ChequeStatus;
  hash: string;
  bank: string;
  createdAt: string;
};

type ChequeHistoryRow = {
  id: string;
  payee: string;
  amount_cents: number;
  issued_date: string;
  status: ChequeStatus;
  hash: string;
  bank: string;
  created_at: string;
};

type CreateChequeHistoryInput = {
  id?: string;
  payee: string;
  amountCents: number;
  issuedDate: string;
  status?: ChequeStatus;
  bank?: string;
};

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "cheque-print.db");

let connection: Database.Database | null = null;

function getDb() {
  if (!connection) {
    fs.mkdirSync(dbDirectory, { recursive: true });
    connection = new Database(dbPath);
    connection.pragma("journal_mode = WAL");
    connection.exec(`
      CREATE TABLE IF NOT EXISTS cheque_history (
        id TEXT PRIMARY KEY,
        payee TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        issued_date TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Printed', 'Draft', 'Void')),
        hash TEXT NOT NULL UNIQUE,
        bank TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    seedHistory(connection);
  }

  return connection;
}

function seedHistory(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as total FROM cheque_history").get() as { total: number };

  if (count.total > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO cheque_history (id, payee, amount_cents, issued_date, status, hash, bank, created_at)
    VALUES (@id, @payee, @amountCents, @issuedDate, @status, @hash, @bank, @createdAt)
  `);

  const seedItems: ChequeHistoryItem[] = [
    createSeedItem("001234", "John Doe", 120000, "2026-04-15", "Printed", "HDFC Bank"),
    createSeedItem("001235", "Acme Corp", 550000, "2026-04-14", "Printed", "ICICI Bank"),
    createSeedItem("001236", "Jane Smith", 45000, "2026-04-13", "Draft", "SBI"),
    createSeedItem("001237", "Global Logistics", 1280000, "2026-04-12", "Printed", "Axis Bank"),
    createSeedItem("001238", "Local Services", 89000, "2026-04-10", "Void", "HDFC Bank"),
  ];

  const transaction = db.transaction((items: ChequeHistoryItem[]) => {
    for (const item of items) {
      insert.run({
        id: item.id,
        payee: item.payee,
        amountCents: item.amountCents,
        issuedDate: item.issuedDate,
        status: item.status,
        hash: item.hash,
        bank: item.bank,
        createdAt: item.createdAt,
      });
    }
  });

  transaction(seedItems);
}

function createSeedItem(
  id: string,
  payee: string,
  amountCents: number,
  issuedDate: string,
  status: ChequeStatus,
  bank: string,
): ChequeHistoryItem {
  return {
    id,
    payee,
    amountCents,
    issuedDate,
    status,
    bank,
    hash: createHistoryHash({ id, payee, amountCents, issuedDate, status, bank }),
    createdAt: `${issuedDate}T10:30:00.000Z`,
  };
}

function createHistoryHash(payload: Record<string, unknown>) {
  const digest = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").toUpperCase();
  return `0x${digest.slice(0, 10)}...${digest.slice(-6)}`;
}

function mapRow(row: ChequeHistoryRow): ChequeHistoryItem {
  return {
    id: row.id,
    payee: row.payee,
    amountCents: row.amount_cents,
    issuedDate: row.issued_date,
    status: row.status,
    hash: row.hash,
    bank: row.bank,
    createdAt: row.created_at,
  };
}

export function listChequeHistory() {
  const rows = getDb()
    .prepare("SELECT * FROM cheque_history ORDER BY issued_date DESC, created_at DESC")
    .all() as ChequeHistoryRow[];

  return rows.map(mapRow);
}

export function createChequeHistory(input: CreateChequeHistoryInput) {
  const id = input.id ?? nextChequeId();
  const status = input.status ?? "Draft";
  const bank = input.bank ?? "Default Bank";
  const createdAt = new Date().toISOString();
  const hash = createHistoryHash({
    id,
    payee: input.payee,
    amountCents: input.amountCents,
    issuedDate: input.issuedDate,
    status,
    bank,
    createdAt,
  });

  getDb()
    .prepare(`
      INSERT INTO cheque_history (id, payee, amount_cents, issued_date, status, hash, bank, created_at)
      VALUES (@id, @payee, @amountCents, @issuedDate, @status, @hash, @bank, @createdAt)
    `)
    .run({
      id,
      payee: input.payee,
      amountCents: input.amountCents,
      issuedDate: input.issuedDate,
      status,
      hash,
      bank,
      createdAt,
    });

  return {
    id,
    payee: input.payee,
    amountCents: input.amountCents,
    issuedDate: input.issuedDate,
    status,
    hash,
    bank,
    createdAt,
  };
}

function nextChequeId() {
  const row = getDb()
    .prepare("SELECT id FROM cheque_history ORDER BY CAST(id AS INTEGER) DESC LIMIT 1")
    .get() as { id: string } | undefined;
  const next = row ? Number(row.id) + 1 : 1;

  return String(next).padStart(6, "0");
}
