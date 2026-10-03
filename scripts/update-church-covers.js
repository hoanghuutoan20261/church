const mongoose = require("mongoose");

const uri =
  process.env.MONGODB_URI ||
  "mongodb://csroivaonuoc_db_user:QQ0orBOmrpzGSUH2@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority";

const churchCustomProfiles = {
  emmanuel: {
    cover:
      "https://images.unsplash.com/photo-1548625361-195972886a86?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=400&q=80",
    slogan: "Hiệp Một — Yêu Thương — Phụng Sự",
    pastor: "Mục sư Lê Hoàng An",
  },
  loibansusong: {
    cover:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=400&q=80",
    slogan: "Lời Chúa Là Ngọn Đèn Cho Chân Tôi",
    pastor: "Mục sư Nguyễn Văn Bình",
  },
  andien: {
    cover:
      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80",
    slogan: "Bởi Ân Điển Nhờ Đức Tin",
    pastor: "Mục sư Trần Minh Tâm",
  },
  hanoi: {
    cover:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80",
    slogan: "Sự Sáng Soi Trong Nơi Tối Tăm",
    pastor: "Mục sư Hoàng Văn Đức",
  },
  tinlanhlamson: {
    cover:
      "https://images.unsplash.com/photo-1543854589-ab9945cb5705?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=400&q=80",
    slogan: "Vững Lòng Bền Chí Đi Cùng Chúa",
    pastor: "Mục sư Phạm Quốc Hưng",
  },
  timothe: {
    cover:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=400&q=80",
    slogan: "Gương Mẫu Cho Tín Đồ Trong Lời Nói & Yêu Thương",
    pastor: "Mục sư Trẻ Đỗ Minh Khang",
  },
};

async function run() {
  await mongoose.connect(uri);
  const col = mongoose.connection.collection("churches");

  for (const [slug, data] of Object.entries(churchCustomProfiles)) {
    await col.updateOne(
      { slug },
      {
        $set: {
          "profileConfig.coverImageUrl": data.cover,
          "profileConfig.avatarUrl": data.avatar,
          "profileConfig.slogan": data.slogan,
          "profileConfig.leadPastor": data.pastor,
        },
      }
    );
    console.log("Updated profile for", slug);
  }

  console.log("All church profiles updated successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
