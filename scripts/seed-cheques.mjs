import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalIndex = line.indexOf("=");
    if (equalIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadEnvironment() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, ".env.local"));
  loadEnvFile(path.join(cwd, ".env"));
  loadEnvFile(path.join(cwd, ".env.example"));
}

loadEnvironment();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI not found. Add it to .env.local, .env, or .env.example");
}

const chequeSchema = new mongoose.Schema(
  {
    payeeName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    amountInWords: { type: String, trim: true },
    date: { type: Date },
    bankName: { type: String, trim: true },
    status: { type: String, enum: ["pending", "printed"], default: "pending" },
  },
  { timestamps: true },
);

const Cheque = mongoose.models.Cheque || mongoose.model("Cheque", chequeSchema);

const seedData = [
  {
    payeeName: "Riverside Rentals",
    amount: 2400,
    amountInWords: "Two Thousand Four Hundred Only",
    date: new Date("2026-04-14"),
    bankName: "HDFC Bank",
    status: "printed",
  },
  {
    payeeName: "Tech Solutions Pvt Ltd",
    amount: 11850,
    amountInWords: "Eleven Thousand Eight Hundred Fifty Only",
    date: new Date("2026-04-15"),
    bankName: "ICICI Bank",
    status: "pending",
  },
  {
    payeeName: "Global Logistics",
    amount: 6200,
    amountInWords: "Six Thousand Two Hundred Only",
    date: new Date("2026-04-16"),
    bankName: "Axis Bank",
    status: "printed",
  },
  {
    payeeName: "Acme Corp",
    amount: 5500,
    amountInWords: "Five Thousand Five Hundred Only",
    date: new Date("2026-04-17"),
    bankName: "SBI",
    status: "pending",
  },
  {
    payeeName: "Nova Energy",
    amount: 3200,
    amountInWords: "Three Thousand Two Hundred Only",
    date: new Date("2026-04-18"),
    bankName: "Bank of Baroda",
    status: "pending",
  },
];

async function runSeeder() {
  try {
    await mongoose.connect(mongoUri);

    const deleteResult = await Cheque.deleteMany({});
    const inserted = await Cheque.insertMany(seedData);

    console.log("Cheque seeding completed.");
    console.log(`Deleted: ${deleteResult.deletedCount ?? 0}`);
    console.log(`Inserted: ${inserted.length}`);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void runSeeder();

