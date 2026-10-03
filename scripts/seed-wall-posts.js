const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://csroivaonuoc_db_user:QQ0orBOmrpzGSUH2@ac-4a6altx-shard-00-00.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-01.fo5lsmv.mongodb.net:27017,ac-4a6altx-shard-00-02.fo5lsmv.mongodb.net:27017/church_online?ssl=true&replicaSet=atlas-102s2g-shard-0&authSource=admin&retryWrites=true&w=majority";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const churchesCol = mongoose.connection.collection("churches");
  const postsCol = mongoose.connection.collection("posts");

  const churches = await churchesCol.find({}).toArray();
  console.log(`Found ${churches.length} churches.`);

  for (const church of churches) {
    // 1. Ensure church has reverent profileConfig
    const defaultCover =
      church.profileConfig?.coverImageUrl ||
      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1600&q=80";
    const defaultAvatar =
      church.profileConfig?.avatarUrl ||
      "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80";
    const defaultSlogan =
      church.profileConfig?.slogan || "Hiệp Một — Yêu Thương — Phụng Sự";
    const defaultAbout =
      church.profileConfig?.about ||
      `Chào mừng quý con cái Chúa và thân hữu đến với trang thông tin của ${church.name}. Nơi gắn kết cộng đồng đức tin, cùng nhau suy ngẫm Lời Chúa và tham gia các buổi thờ phượng trực tuyến.`;
    const defaultPastor =
      church.profileConfig?.leadPastor || "Mục sư Quản Nhiệm";

    await churchesCol.updateOne(
      { _id: church._id },
      {
        $set: {
          "profileConfig.coverImageUrl": defaultCover,
          "profileConfig.avatarUrl": defaultAvatar,
          "profileConfig.slogan": defaultSlogan,
          "profileConfig.about": defaultAbout,
          "profileConfig.leadPastor": defaultPastor,
          "profileConfig.contactPhone":
            church.profileConfig?.contactPhone || "0908 123 456",
          "profileConfig.contactEmail":
            church.profileConfig?.contactEmail || `vanphong@${church.slug}.vn`,
        },
      }
    );

    // 2. Check existing posts
    const existingPostsCount = await postsCol.countDocuments({
      churchSlug: church.slug,
    });

    if (existingPostsCount < 3) {
      console.log(`Seeding posts for ${church.name} (${church.slug})...`);

      const samplePosts = [
        {
          churchId: church._id,
          churchSlug: church.slug,
          author: {
            name: church.name,
            role: "Mục sư & Ban Trị Sự",
            avatarUrl: defaultAvatar,
          },
          category: "announcement",
          title: "THÔNG BÁO MỤC VỤ: Lễ Thờ Phượng Chúa Nhật & Thánh Lễ Tiệc Thánh",
          content:
            "Kính gửi toàn thể quý con cái Chúa trong Hội Thánh và quý thân hữu xa gần. Vào Chúa Nhật tuần này, Hội Thánh sẽ long trọng cử hành Lễ Thờ Phượng và Tiệc Thánh. Kính mời quý tôi con Chúa chuẩn bị lòng thanh sạch, hiệp ý cầu nguyện và cùng tham dự trực tiếp tại phòng thờ phượng hoặc trực tuyến trên cổng này.",
          scriptureVerse: "1 Cô-rinh-tô 11:24-26",
          imageUrl:
            "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
          isPinned: true,
          likesCount: 18,
          comments: [
            {
              authorName: "Chấp sự Lê Văn Hùng",
              authorRole: "Thành viên Ban Trị Sự",
              content: "Amen! Nguyện Chúa ban ơn dồi dào trên buổi lễ Chúa Nhật.",
              createdAt: new Date(Date.now() - 3600000 * 5),
            },
            {
              authorName: "Cô Thu Hà",
              authorRole: "Tín hữu",
              content: "Cảm tạ Chúa, gia đình con sẽ hiệp ý tham dự đầy đủ.",
              createdAt: new Date(Date.now() - 3600000 * 2),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 8),
          updatedAt: new Date(Date.now() - 3600000 * 8),
        },
        {
          churchId: church._id,
          churchSlug: church.slug,
          author: {
            name: defaultPastor,
            role: "Mục sư Quản Nhiệm",
            avatarUrl: defaultAvatar,
          },
          category: "scripture",
          title: "Lời Chúa Nuôi Dưỡng Đức Tin: Hãy Vững Lòng Bền Chí",
          content:
            "Dù trên bước đường theo Chúa có những lúc mây mù giăng lối, hãy nhớ rằng Đức Giê-hô-va là Đấng đi trước dẫn dắt bạn. Ngài không lìa bạn, cũng không bỏ bạn bao giờ. Hãy trao phó mọi lo lắng cho Chúa trong lời cầu nguyện mỗi sớm mai.",
          scriptureVerse: "Giô-suê 1:9 — Này, ta há không có dặn ngươi sao? Hãy vững lòng bền chí, chớ run sợ, chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ở cùng ngươi trong mọi nơi ngươi đi.",
          imageUrl:
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
          isPinned: false,
          likesCount: 26,
          comments: [
            {
              authorName: "Bạn Thanh Tâm",
              authorRole: "Ban Thanh Niên",
              content: "Tạ ơn Chúa vì câu Lời Chúa thật đúng lúc và nâng đỡ con rất nhiều.",
              createdAt: new Date(Date.now() - 3600000 * 12),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 24),
          updatedAt: new Date(Date.now() - 3600000 * 24),
        },
        {
          churchId: church._id,
          churchSlug: church.slug,
          author: {
            name: "Ban Thanh Niên & Ca Đoàn",
            role: "Mục Vụ Âm Nhạc",
            avatarUrl: defaultAvatar,
          },
          category: "fellowship",
          title: "Đêm Thờ Phượng & Cầu Nguyện Ngợi Khen: Chạm Đến Ngai Ân Điển",
          content:
            "Một buổi tối phước hạnh ngập tràn khi các bạn trẻ cùng quy tụ dưới mái nhà Chúa để tôn vinh danh Ngài qua từng giai điệu thánh ca. Cảm tạ Chúa vì ngọn lửa yêu mến Ngài luôn rực cháy trong lòng thế hệ trẻ của Hội Thánh!",
          scriptureVerse: "Thi Thiên 100:2 — Hãy hầu việc Đức Giê-hô-va cách vui mừng; Hãy hát xướng mà đến trước mặt Ngài.",
          imageUrl:
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
          isPinned: false,
          likesCount: 31,
          comments: [
            {
              authorName: "Trưởng ban Thanh Niên",
              authorRole: "Ban Thanh Niên",
              content: "Cảm ơn quý Mục sư và Hội Thánh đã luôn nâng đỡ và cầu thay cho chúng con.",
              createdAt: new Date(Date.now() - 3600000 * 18),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 48),
          updatedAt: new Date(Date.now() - 3600000 * 48),
        },
        {
          churchId: church._id,
          churchSlug: church.slug,
          author: {
            name: "Ban Bác Ái & Xã Hội",
            role: "Phụng Sự Cộng Đồng",
            avatarUrl: defaultAvatar,
          },
          category: "devotion",
          title: "Hành Trình Yêu Thương: Thăm Viếng & Tặng Quà Cho Các Gia Đình Khó Khăn",
          content:
            "Tạ ơn Chúa vì cánh tay nối dài của tình yêu thương đã chạm đến những mảnh đời cơ nhỡ trong tuần qua. 'Phước cho người nào đoái đến kẻ nghèo nàn: Trong ngày tai họa Đức Giê-hô-va sẽ giải cứu người.'",
          scriptureVerse: "Thi Thiên 41:1",
          imageUrl:
            "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
          isPinned: false,
          likesCount: 22,
          comments: [],
          createdAt: new Date(Date.now() - 3600000 * 72),
          updatedAt: new Date(Date.now() - 3600000 * 72),
        },
      ];

      await postsCol.insertMany(samplePosts);
      console.log(`Inserted ${samplePosts.length} posts for ${church.slug}`);
    } else {
      console.log(`${church.slug} already has ${existingPostsCount} posts.`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
