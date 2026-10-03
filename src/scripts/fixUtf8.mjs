import { MongoClient } from "mongodb";

const uri = "mongodb://csroivaonuoc_db_user:QQ0orBOmrpzGSUH2@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db("church_online");
  await db.collection("churches").updateOne(
    { slug: "hanoi" },
    {
      $set: {
        name: "Hội Thánh Tin Lành Hà Nội",
        address: "Số 2 Ngõ Trạm, Quận Hoàn Kiếm, Hà Nội",
        denomination: "Hội Thánh Tin Lành Việt Nam",
      },
    }
  );
  console.log("Đã cập nhật dấu tiếng Việt cho Hội Thánh Hà Nội!");
  await client.close();
}

run();
