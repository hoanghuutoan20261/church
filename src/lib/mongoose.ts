import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let uri = process.env.MONGODB_URI;

// Automatic protection against Windows / Vietnamese ISP DNS SRV failure (querySrv ECONNREFUSED):
if (
  uri.startsWith("mongodb+srv://") &&
  uri.includes("cluster0.fo5lsmv.mongodb.net")
) {
  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@/);
  if (match && match[1]) {
    const credentials = match[1];
    uri = `mongodb://${credentials}@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || "church_online",
    };

    cached!.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
