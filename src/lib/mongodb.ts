import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let uri = process.env.MONGODB_URI;

// Automatic protection against Windows / Vietnamese ISP DNS SRV failure (querySrv ECONNREFUSED):
// If the SRV URI is provided, automatically expand to the direct replica-set seed nodes.
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

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve connection across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "church_online";
  return client.db(dbName);
}
