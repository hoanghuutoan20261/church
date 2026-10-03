import { MongoClient } from "mongodb";

let uri =
  process.env.MONGODB_URI ||
  "mongodb://csroivaonuoc_db_user:QQ0orBOmrpzGSUH2@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority";

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

const client = new MongoClient(uri);

const demoChurches = [
  {
    name: "Hội Thánh Tin Lành Lời Ban Sự Sống",
    slug: "loibansusong",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    address: "Số 123 Đường Nguyễn Tri Phương, Quận 10, TP. Hồ Chí Minh",
    streamKey: "lbs-sunday",
    themeConfig: {
      accentColor: "#c5a059",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng TMCP Quân Đội (MB Bank)",
      accountNumber: "0386888999",
      accountHolder: "HOI THANH TIN LANH LOI BAN SU SONG",
      branch: "Chi nhánh TP. Hồ Chí Minh",
    },
    liveSchedule: "Chúa Nhật: Lễ 1 (07:30) • Lễ 2 (09:15) • Lễ 3 (18:30)",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Hội Thánh Tin Lành Ân Điển",
    slug: "andien",
    denomination: "Hội Thánh Báp-tít Việt Nam",
    address: "Số 45 Đường Trần Phú, Quận Hải Châu, TP. Đà Nẵng",
    streamKey: "andien-sunday",
    themeConfig: {
      accentColor: "#d97706",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Ngoại Thương Việt Nam (Vietcombank)",
      accountNumber: "0071001234567",
      accountHolder: "HOI THANH TIN LANH AN DIEN",
      branch: "Chi nhánh Đà Nẵng",
    },
    liveSchedule: "Chúa Nhật, 08:30 - 10:45",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  try {
    await client.connect();
    console.log("Đã kết nối MongoDB thành công!");
    const db = client.db("church_online");

    // 1. Seed Churches
    const churchCol = db.collection("churches");
    for (const ch of demoChurches) {
      await churchCol.updateOne(
        { slug: ch.slug },
        { $set: ch },
        { upsert: true }
      );
    }
    console.log("Khởi tạo thành công 2 Hội Thánh mẫu vào MongoDB (loibansusong & andien)!");

    // 2. Create Indexes
    await churchCol.createIndex({ slug: 1 }, { unique: true });
    await churchCol.createIndex({ streamKey: 1 }, { unique: true });
    await churchCol.createIndex({ isActive: 1 });
    await db.collection("chat_messages").createIndex({ churchSlug: 1, createdAt: 1 });
    await db.collection("prayer_requests").createIndex({ churchSlug: 1, createdAt: -1 });
    await db.collection("salvation_decisions").createIndex({ churchSlug: 1, createdAt: -1 });

    console.log("Đã thiết lập đầy đủ Multi-Tenant Indexes trên MongoDB!");
  } catch (err) {
    console.error("Lỗi seed dữ liệu:", err);
  } finally {
    await client.close();
  }
}

seed();
