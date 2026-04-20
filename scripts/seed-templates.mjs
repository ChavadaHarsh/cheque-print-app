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

const positionSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

const templateSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    variant: { type: String, trim: true },
    page: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    fields: {
      payee: { type: positionSchema, required: true },
      amountNumber: { type: positionSchema, required: true },
      amountWords: { type: positionSchema, required: true },
      date: { type: positionSchema, required: true },
      signature: { type: positionSchema, required: true },
    },
  },
  { timestamps: true },
);

const Template = mongoose.models.Template || mongoose.model("Template", templateSchema);

const seedData = [
  {
    bankName: "SBI",
    variant: "Standard",
    page: { width: 210, height: 99 },
    fields: {
      payee: { x: 16, y: 36 },
      amountNumber: { x: 160, y: 36 },
      amountWords: { x: 16, y: 49 },
      date: { x: 162, y: 18 },
      signature: { x: 145, y: 78 },
    },
  },
  {
    bankName: "HDFC Bank",
    variant: "Corporate",
    page: { width: 210, height: 99 },
    fields: {
      payee: { x: 18, y: 35 },
      amountNumber: { x: 158, y: 34 },
      amountWords: { x: 18, y: 48 },
      date: { x: 164, y: 16 },
      signature: { x: 148, y: 79 },
    },
  },
  {
    bankName: "ICICI Bank",
    variant: "Classic",
    page: { width: 210, height: 99 },
    fields: {
      payee: { x: 17, y: 37 },
      amountNumber: { x: 157, y: 35 },
      amountWords: { x: 17, y: 50 },
      date: { x: 163, y: 17 },
      signature: { x: 146, y: 80 },
    },
  },
  {
    bankName: "Axis Bank",
    variant: "Business",
    page: { width: 210, height: 99 },
    fields: {
      payee: { x: 15, y: 36 },
      amountNumber: { x: 159, y: 35 },
      amountWords: { x: 15, y: 49 },
      date: { x: 161, y: 18 },
      signature: { x: 144, y: 79 },
    },
  },
  {
    bankName: "Bank of Baroda",
    variant: "Retail",
    page: { width: 210, height: 99 },
    fields: {
      payee: { x: 16, y: 35 },
      amountNumber: { x: 156, y: 34 },
      amountWords: { x: 16, y: 48 },
      date: { x: 160, y: 16 },
      signature: { x: 143, y: 78 },
    },
  },
];

async function runSeeder() {
  try {
    await mongoose.connect(mongoUri);

    const deleteResult = await Template.deleteMany({});
    const inserted = await Template.insertMany(seedData);

    console.log("Template seeding completed.");
    console.log(`Deleted: ${deleteResult.deletedCount ?? 0}`);
    console.log(`Inserted: ${inserted.length}`);
  } catch (error) {
    console.error("Template seeder failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void runSeeder();

