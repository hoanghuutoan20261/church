import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// 1. Tự động đọc file .env hoặc .env.local nếu có
for (const envFileName of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), envFileName);
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        const key = k.trim();
        const val = v.join("=").replace(/^["']|["']$/g, "").trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
    break;
  }
}

// 2. Cấu hình MongoDB Connection
let uri =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/church_online";

const dbName = process.env.MONGODB_DB || "church_online";

// Hỗ trợ tham số dòng lệnh: node src/scripts/seed-superadmin.mjs [email] [password]
const email = (process.argv[2] || process.env.SUPERADMIN_EMAIL || "superadmin@church.vn").toLowerCase().trim();
const password = process.argv[3] || process.env.SUPERADMIN_PASSWORD || "SuperAdmin@2026";
const fullName = process.env.SUPERADMIN_NAME || "Tổng Quản Trị Hệ Thống (Superadmin)";

async function main() {
  console.log("==================================================");
  console.log(" KHỞI TẠO TÀI KHOẢN TỔNG QUẢN TRỊ (SUPERADMIN)");
  console.log("==================================================");
  console.log(`📡 Đang kết nối tới: ${uri.replace(/\/\/[^@]+@/, "//***:***@")}`);
  console.log(`📁 Database: ${dbName}`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.collection("users").updateOne(
    { email },
    {
      $set: {
        fullName,
        email,
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

  console.log("\n✅ KHỞI TẠO THÀNH CÔNG TÀI KHOẢN SUPERADMIN!");
  console.log(`👉 Email:    ${email}`);
  console.log(`👉 Mật khẩu: ${password}`);
  console.log(`👉 Vai trò:  superadmin`);
  console.log(`👉 Thao tác: ${result.upsertedCount > 0 ? "Tạo mới tài khoản" : "Cập nhật tài khoản hiện có"}`);
  console.log("\nBạn có thể truy cập /superadmin trên trình duyệt và đăng nhập ngay.");
  console.log("==================================================\n");

  await client.close();
}

main().catch((err) => {
  console.error("❌ Lỗi khi khởi tạo tài khoản Superadmin:", err);
  process.exit(1);
});
