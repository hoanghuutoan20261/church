import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri =
  process.env.MONGODB_URI ||
  "mongodb://csroivaonuoc_db_user:QQ0orBOmrpzGSUH2@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const passwordHash = await bcrypt.hash("SuperAdmin@2026", 10);

  const result = await db.collection("users").updateOne(
    { email: "superadmin@church.vn" },
    {
      $set: {
        fullName: "Tổng Quản Trị Hệ Thống (Superadmin)",
        email: "superadmin@church.vn",
        passwordHash,
        role: "superadmin",
        churchSlug: "system",
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("Superadmin user ready:", result);
  await client.close();
}

main().catch(console.error);
