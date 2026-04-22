import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache || { conn: null, promise: null };

global.mongooseCache = cached;

function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim() || "";
  if (!uri) {
    throw new Error(
      "Missing MongoDB URI. Set MONGODB_URI in .env.local (or DATABASE_URL), then restart the dev server."
    );
  }
  return uri;
}

export async function connectToDatabase() {
  const MONGODB_URI = getMongoUri();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
