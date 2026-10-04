import { MongoClient, ObjectId } from "mongodb";

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

// 6 Diverse & realistic churches across Vietnam
const churchesData = [
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
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Nơi Lời Chúa Đem Lại Sự Sống Đời Đời & Hy Vọng Mới",
      about: "Hội Thánh được thành lập với tâm tình rao truyền Tin Lành cứu rỗi của Chúa Cứu Thế Giê-xu đến mọi người.",
      leadPastor: "Mục sư Nguyễn Văn Bình",
    },
    currentService: {
      title: "Đắc Thắng Mọi Lo Lắng Giữa Đời Sống",
      speaker: "Mục sư Quản nhiệm Nguyễn Văn Bình",
      speakerTitle: "Mục sư Quản nhiệm",
      scriptureReference: "Phi-líp 4:6-7",
      welcomeMessage: "Chào mừng quý tôi con Chúa cùng tham dự giờ thờ phượng trực tuyến!",
      isLive: true,
      viewersCount: 382,
    },
    liveSchedule: "Chúa Nhật: Lễ 1 (07:30) • Lễ 2 (09:15) • Lễ 3 (18:30)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Ân Điển Đà Nẵng",
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
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Bởi Ân Điển Được Cứu Nhờ Đức Tin",
      about: "Cộng đồng Cơ Đốc chan hòa tình yêu thương ven bờ sông Hàn thơ mộng.",
      leadPastor: "Mục sư Trần Minh Tâm",
    },
    currentService: {
      title: "Chúa Giê-xu: Nguồn Bình An Vượt Trút Mọi Giông Bão",
      speaker: "Mục sư Trần Minh Tâm",
      speakerTitle: "Mục sư Quản nhiệm",
      scriptureReference: "Giăng 14:27",
      welcomeMessage: "Nguyện ân điển và sự bình an từ Đức Chúa Trời ở cùng quý vị!",
      isLive: true,
      viewersCount: 165,
    },
    liveSchedule: "Chúa Nhật: Lễ Sáng (08:30 - 10:45) • Cầu Nguyện Thứ Năm (19:30)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Hà Nội (Phố Huế)",
    slug: "hanoi",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    address: "Số 2 Ngõ Tràng Tiền, Quận Hoàn Kiếm, TP. Hà Nội",
    streamKey: "hanoi-sunday",
    themeConfig: {
      accentColor: "#b91c1c",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)",
      accountNumber: "12010000456789",
      accountHolder: "HOI THANH TIN LANH HA NOI",
      branch: "Chi nhánh Hà Nội",
    },
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Giữ Vững Đức Tin Truyền Thống Hơn 100 Năm Giữa Lòng Thủ Đô",
      about: "Một trong những ngôi thánh đường Tin Lành cổ kính và lâu đời nhất miền Bắc Việt Nam.",
      leadPastor: "Mục sư Hoàng Văn Đức",
    },
    currentService: {
      title: "Lễ Kỷ Niệm & Bồi Linh Mùa Thu: Đức Tin Vững Bền",
      speaker: "Mục sư Hoàng Văn Đức",
      speakerTitle: "Mục sư Quản nhiệm",
      scriptureReference: "Hê-bơ-rơ 11:1-6",
      welcomeMessage: "Kính mời quý tôi con Chúa cùng dự lễ!",
      isLive: false,
      viewersCount: 0,
    },
    liveSchedule: "Chúa Nhật: Lễ 1 (07:00) • Lễ 2 (09:00) • Ban Thanh Niên (14:30)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Emmanuel Bến Tre",
    slug: "emmanuel",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    address: "Số 88 Đường Đồng Văn Cống, Phường 7, TP. Bến Tre",
    streamKey: "emmanuel-bentre",
    themeConfig: {
      accentColor: "#15803d",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Nông nghiệp & PTNT (Agribank)",
      accountNumber: "7100205123456",
      accountHolder: "HOI THANH TIN LANH EMMANUEL",
      branch: "Chi nhánh Bến Tre",
    },
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Đức Chúa Trời Ở Cùng Chúng Ta — Xứ Dừa Yêu Thương",
      about: "Cộng đồng Hội Thánh miền Tây sông nước nhiệt thành phục vụ và lan tỏa Tin Lành.",
      leadPastor: "Mục sư Lê Hoàng An",
    },
    currentService: {
      title: "Tình Yêu Thương Không Hề Hư Mất",
      speaker: "Mục sư Lê Hoàng An",
      speakerTitle: "Mục sư Quản nhiệm",
      scriptureReference: "1 Cô-rinh-tô 13:4-8",
      welcomeMessage: "Chào đón anh chị em miền Tây hiệp một thờ phượng!",
      isLive: false,
      viewersCount: 0,
    },
    liveSchedule: "Chúa Nhật: Lễ Sáng (08:00 - 10:15) • Lễ Chiều (18:00)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Timôthê (Cộng Đồng Trẻ)",
    slug: "timothe",
    denomination: "Hội Thánh Liên Hữu Cơ Đốc",
    address: "Tầng 3, Tòa nhà Khát Vọng, Quận Cầu Giấy, Hà Nội",
    streamKey: "timothe-youth",
    themeConfig: {
      accentColor: "#6366f1",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Kỹ Thương (Techcombank)",
      accountNumber: "190366889988",
      accountHolder: "HOI THANH TRE TIMOTHE",
      branch: "Chi nhánh Cầu Giấy",
    },
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Chớ Để Người Ta Khinh Con Vì Trẻ Tuổi — 1 Ti-mô-thê 4:12",
      about: "Không gian thờ phượng hiện đại, năng động dành cho sinh viên và giới trẻ khởi nghiệp.",
      leadPastor: "Mục sư Trẻ Đỗ Minh Khang",
    },
    currentService: {
      title: "Sống Đam Mê & Mục Đích Cho Đấng Christ",
      speaker: "Mục sư Đỗ Minh Khang",
      speakerTitle: "Trưởng ban Mục vụ Giới Trẻ",
      scriptureReference: "1 Ti-mô-thê 4:12",
      welcomeMessage: "Chào mừng các bạn trẻ cùng tham gia cộng đồng Timôthê!",
      isLive: false,
      viewersCount: 0,
    },
    liveSchedule: "Chúa Nhật: 10:00 - 12:00 • Đêm Ca Khen Thứ Bảy (19:30)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Lam Sơn (Thanh Hóa)",
    slug: "tinlanhlamson",
    denomination: "Hội Thánh Trưởng Lão",
    address: "Số 12 Đường Hạc Thành, Phường Tân Sơn, TP. Thanh Hóa",
    streamKey: "lamson-live",
    themeConfig: {
      accentColor: "#0284c7",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Công Thương (VietinBank)",
      accountNumber: "102008899221",
      accountHolder: "HOI THANH TIN LANH LAM SON",
      branch: "Chi nhánh Thanh Hóa",
    },
    profileConfig: {
      coverImageUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: "",
      slogan: "Ngọn Đuốc Phúc Âm Bừng Sáng Trên Đất Lam Sơn",
      about: "Hội Thánh gắn kết với công tác từ thiện vùng cao biên giới và nuôi dạy trẻ em mồ côi.",
      leadPastor: "Mục sư Phạm Quốc Hưng",
    },
    currentService: {
      title: "Lòng Bác Ái & Bàn Chân Người Đem Tin Lành",
      speaker: "Mục sư Phạm Quốc Hưng",
      speakerTitle: "Mục sư Quản nhiệm",
      scriptureReference: "Rô-ma 10:14-15",
      welcomeMessage: "Chào đón quý con cái Chúa muôn phương!",
      isLive: false,
      viewersCount: 0,
    },
    liveSchedule: "Chúa Nhật: Lễ 1 (07:30) • Lễ 2 (09:30)",
    isActive: true,
  },
];

// 10 Rich, realistic, highly diverse posts for Facebook newsfeed
const postsData = [
  {
    churchSlug: "loibansusong",
    category: "sermon",
    title: "🔴 TRUYỀN HÌNH TRỰC TIẾP: Lễ Thờ Phượng Chúa Nhật — 'Đắc Thắng Mọi Lo Lắng Giữa Đời Sống'",
    content: "Lễ Thờ Phượng Chúa Nhật hôm nay đang diễn ra trong sự ngập tràn ân sủng và hiện diện của Chúa Thánh Linh. Kính mời toàn thể quý con cái Chúa dù đang ở tư gia hay đang trên đường công tác cùng hiệp một lòng dâng lời ngợi khen và lắng nghe Sứ điệp Lời Chúa.",
    scriptureVerse: "“Chớ lo phiền chi hết, song trong mọi sự hãy dùng lời cầu nguyện, nài xin, và sự tạ ơn mà trình các điều cầu xin của mình cho Đức Chúa Trời.” — Phi-líp 4:6",
    videoUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "",
    isPinned: true,
    likesCount: 238,
    comments: [
      {
        authorName: "Cô Nguyễn Thị Mai (TP. HCM)",
        authorRole: "Thành viên ban Trung Niên",
        content: "Amen, tạ ơn Chúa! Âm thanh bài thánh ca dâng lên thật trang nghiêm và xúc động. Nguyện Chúa ban thêm sức mới trên Mục sư quản nhiệm và ban hát lễ!",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        authorName: "Chấp sự Lê Hoàng Tuấn (Bình Dương)",
        authorRole: "Chấp sự Hội Thánh",
        content: "Cả gia đình tôi 5 thành viên đang quây quần trước màn hình cùng hiệp ý thờ phượng Chúa. Cảm tạ Chúa vì đường truyền trực tuyến rất mượt mà!",
        createdAt: new Date(Date.now() - 8 * 60 * 1000),
      },
      {
        authorName: "Anh David Trần (Melbourne, Úc)",
        authorRole: "Tôi con Chúa hải ngoại",
        content: "Từ phương xa vẫn được cùng thờ phượng bằng tiếng mẹ đẻ với quê hương, thật là phước hạnh lớn lao. Ha-lê-lu-gia!",
        createdAt: new Date(Date.now() - 3 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    churchSlug: "timothe",
    category: "fellowship",
    title: "Bừng Cháy Lửa Thiêng: Đêm Ca Khen & Cầu Nguyện 'Tuổi Trẻ Vì Đấng Christ' Cuối Tuần Qua",
    content: "Hơn 200 bạn trẻ từ các trường đại học khắp Hà Nội đã cùng nhau lấp đầy khán phòng trong một buổi tối tràn ngập nước mắt tạ ơn và tiếng ngợi khen! Nhiều bạn trẻ đã quỳ gối ăn năn, buông bỏ những nghiện ngập, lo toan đời này để dâng cuộc đời mình vào tay Chúa Giê-xu.",
    scriptureVerse: "“Hỡi kẻ trẻ tuổi, hãy vui mừng trong buổi đang thì, hãy để lòng kiêu ngạo trong những ngày tuổi thanh xuân, nhưng phải biết rằng vì mọi điều đó, Đức Chúa Trời sẽ đòi ngươi đến chốn đoán xét.” — Truyền-đạo 11:9",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 185,
    comments: [
      {
        authorName: "Bạn Minh Thư (ĐH Ngoại Thương)",
        authorRole: "Sinh viên",
        content: "Em cảm nhận được sự chữa lành sâu sắc cho những vết thương trong lòng sau đêm bồi linh này. Cảm ơn các anh chị ban âm nhạc đã phục vụ hết lòng!",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        authorName: "Mục sư Trẻ Đỗ Minh Khang",
        authorRole: "Chủ tọa mục vụ",
        content: "Cảm tạ Chúa vì Ngài đang dấy lên một thế hệ trẻ kính sợ Ngài. Hãy giữ ngọn lửa này luôn rực cháy các bạn nhé!",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000),
  },
  {
    churchSlug: "andien",
    category: "scripture",
    title: "Lời Chúa Nuôi Dưỡng Tâm Linh: Bình An Trong Cơn Sóng Gió Cuộc Đời",
    content: "Giữa những ồn ào và áp lực cơm áo gạo tiền của cuộc sống hiện đại, Lời Chúa nhắc nhở chúng ta về một nơi an nghỉ vững chắc tuyệt đối. Đừng để lòng bối rối, hãy ngước nhìn lên Đấng đã chiến thắng thế gian!",
    scriptureVerse: "“Ta để sự bình an lại cho các ngươi; Ta ban sự bình an của Ta cho các ngươi; Ta cho các ngươi chẳng phải như thế gian cho. Lòng các ngươi chớ bối rối và đừng sợ hãi.” — Giăng 14:27",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 312,
    comments: [
      {
        authorName: "Bác Sĩ Nguyễn Văn Hoàng",
        authorRole: "Thành viên ban Chấp sự",
        content: "Câu gốc này nâng đỡ tinh thần tôi rất nhiều trong những ca trực cấp cứu căng thẳng. Tạ ơn Chúa!",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    churchSlug: "tinlanhlamson",
    category: "fellowship",
    title: "Chuyến Xe Bác Ái: Thăm Viếng & Trao 250 Suất Quà Cho Đồng Bào Vùng Cao Mường Lát",
    content: "Đoàn y tế và công tác xã hội của Hội Thánh đã vượt hơn 200km đường đèo dốc sạt lở để mang tình yêu thương của Chúa đến với bà con bản xa. Tặng quà, khám bệnh, phát thuốc miễn phí và trao tặng 150 cuốn Kinh Thánh Tân Ước cho các hộ gia đình.",
    scriptureVerse: "“Vua sẽ trả lời rằng: Quả thật, Ta nói cùng các ngươi, hễ điều chi các ngươi đã làm cho một người trong những người rất hèn mọn này của anh em Ta, ấy là đã làm cho chính mình Ta vậy.” — Ma-thi-ơ 25:40",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 420,
    comments: [
      {
        authorName: "Chị Vừ Thị Mỷ (Mường Lát)",
        authorRole: "Thân hữu đón nhận Chúa",
        content: "Bà con trong bản cảm ơn đoàn nhiều lắm. Lần đầu tiên bản chúng tôi được các bác sĩ đến tận nơi khám bệnh và kể cho nghe về Chúa Giê-xu yêu thương!",
        createdAt: new Date(Date.now() - 6 * 3600 * 1000),
      },
      {
        authorName: "Bà Cụ Hứa (Thanh Hóa)",
        authorRole: "Tín hữu cao niên",
        content: "Cảm tạ Chúa vì tình yêu thương của Ngài luôn sống động qua những hành động cụ thể!",
        createdAt: new Date(Date.now() - 5 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000),
  },
  {
    churchSlug: "hanoi",
    category: "fellowship",
    title: "Lời Chứng Tạ Ơn Xúc Động: Sự Chữa Lành Diệu Kỳ Sau Ca Mổ Hiểm Nghèo",
    content: "Gia đình Cụ bà Lê Thị Hạnh (79 tuổi) xin gửi lời cảm tạ sâu sắc đến toàn thể Hội Thánh đã dâng lời cầu thay không thôi suốt tuần qua. Khối u não phức tạp từng bị chẩn đoán tỷ lệ rủi ro cao đã được các bác sĩ bóc tách thành công trọn vẹn, và cụ đã tỉnh táo nói chuyện bình thường!",
    scriptureVerse: "“Ngài tha thứ các tội ác ngươi, chữa lành mọi tật bệnh ngươi; Ngài chuộc mạng ngươi khỏi chốn hư nát, làm cho ngươi được đội mão triều nhân từ và thương xót.” — Thi-thiên 103:3-4",
    imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 512,
    comments: [
      {
        authorName: "Trưởng ban Cầu thay Hội Thánh Hà Nội",
        authorRole: "Trưởng ban Cầu nguyện",
        content: "Ha-lê-lu-gia! Đức Giê-hô-va Ráp-pha — Đấng chữa lành chúng ta là Đấng hằng sống và lắng nghe lời khẩn cầu của dân Ngài!",
        createdAt: new Date(Date.now() - 10 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    churchSlug: "emmanuel",
    category: "announcement",
    title: "THÔNG BÁO QUAN TRỌNG: Lễ Báp-têm Cho 16 Tân Tín Hữu Chúa Nhật Tới",
    content: "Hội Thánh vui mừng thông báo khóa học Giáo lý Báp-têm đợt 2 đã hoàn tất tốt đẹp. Lễ Báp-têm dìm mình dưới dòng nước biểu trưng cho sự đồng chết và đồng sống lại với Đấng Christ sẽ được cử hành trang trọng vào lúc 15:00 Chúa Nhật tuần này tại nhà thờ. Kính mời toàn thể quý con cái Chúa đến dự và cầu nguyện chúc phước cho các linh hồn mới.",
    scriptureVerse: "“Vậy, chúng ta đã bị chôn với Ngài bởi phép báp-tem trong sự chết Ngài, hầu cho Đấng Christ nhờ vinh hiển của Cha được từ kẻ chết sống lại thể nào, thì chúng ta cũng phải bước đi trong sự sống mới thể ấy.” — Rô-ma 6:4",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 275,
    comments: [
      {
        authorName: "Bạn Trương Quốc Bảo (Tân Tín Hữu)",
        authorRole: "Thành viên sắp nhận Báp-têm",
        content: "Tôi rất hồi hộp và hạnh phúc khi chuẩn bị được công khai bày tỏ đức tin của mình nơi Cứu Chúa Giê-xu!",
        createdAt: new Date(Date.now() - 14 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 18 * 3600 * 1000),
  },
  {
    churchSlug: "loibansusong",
    category: "announcement",
    title: "Tổng Kết Khóa Học 'Làm Cha Mẹ Kính Sợ Chúa' Của Ban Hôn Nhân & Gia Đình",
    content: "Nuôi dạy con cái giữa xã hội biến động hôm nay là một thách thức lớn. Khóa học 6 tuần qua đã trang bị cho các bậc phụ huynh nguyên tắc Kinh Thánh về việc giữ gìn lửa ấm gia đình, dạy dỗ con cái trong sự tôn kính Chúa và gìn giữ nền tảng hôn nhân thánh khiết.",
    scriptureVerse: "“Hãy dạy cho trẻ thơ con đường nó phải theo; để khi nó trở về già, cũng không hề lìa khỏi đó.” — Châm-ngôn 22:6",
    imageUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 168,
    comments: [],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    churchSlug: "andien",
    category: "fellowship",
    title: "KHẨN XIN HIỆP LÒNG CẦU NGUYỆN: Cứu Giúp Gia Đình Anh Chị Tín Hữu Bị Hỏa Hoạn",
    content: "Đêm qua một vụ chập điện đáng tiếc đã thiêu rụi căn nhà của gia đình anh Thắng tại quận Liên Chiểu. Rất may cả 4 thành viên gia đình đều bình an thoát nạn. Ban Trợ Giúp Xã Hội kêu gọi toàn thể quý tôi con Chúa cùng hiệp ý dâng lời cầu nguyện an ủi và chung tay chia sẻ phần vật chất để gia đình sớm ổn định chỗ ở.",
    scriptureVerse: "“Anh em hãy mang lấy gánh nặng cho nhau, như vậy anh em sẽ làm trọn luật pháp của Đấng Christ.” — Ga-la-ti 6:2",
    imageUrl: "",
    videoUrl: "",
    isPinned: true,
    likesCount: 460,
    comments: [
      {
        authorName: "Chấp sự Lê Đình Hưng",
        authorRole: "Trưởng ban Xã hội",
        content: "Ban Trợ giúp đã đến tận nơi hỗ trợ bước đầu 20 triệu đồng tiền mặt và đồ dùng thiết yếu. Nguyện xin Chúa an ủi anh chị!",
        createdAt: new Date(Date.now() - 26 * 3600 * 1000),
      },
      {
        authorName: "Một Tín Hữu Ẩn Danh",
        authorRole: "Thành viên Hội Thánh",
        content: "Tôi vừa chuyển khoản ủng hộ qua mã VietQR của Hội Thánh kèm lời nhắn giúp đỡ gia đình anh Thắng. Xin Chúa tiếp trợ dồi dào!",
        createdAt: new Date(Date.now() - 25 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000),
  },
  {
    churchSlug: "tinlanhlamson",
    category: "scripture",
    title: "Suy Ngẫm Đầu Tuần: Hãy Hết Lòng Tin Cậy Đức Giê-hô-va",
    content: "Khi bước vào tuần làm việc mới với nhiều lo toan, dự định và quyết định lớn, hãy dâng mọi sự trong lời cầu nguyện. Đừng cậy sự thông sáng hạn hẹp của mình, nhưng hãy nhận biết Chúa trong mọi nẻo đường!",
    scriptureVerse: "“Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con. Phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.” — Châm-ngôn 3:5-6",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 289,
    comments: [],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000),
  },
  {
    churchSlug: "timothe",
    category: "announcement",
    title: "Khởi Động Lớp Học Thánh Ca & Nhạc Cụ Cơ Đốc (Guitar, Piano & Trống)",
    content: "Nhằm gây dựng ban nhạc phụng sự Chúa trong các buổi thờ phượng, Hội Thánh mở lớp đào tạo nhạc cụ và thanh nhạc miễn phí vào tối thứ Ba & thứ Năm hằng tuần. Các bạn trẻ có nguyện vọng dự phần mục vụ ca khen Chúa xin liên hệ đăng ký với ban kỹ thuật.",
    scriptureVerse: "“Hãy hát cho Ngài một bài ca mới; hãy trỗi tiếng đàn cho hay và dâng tiếng hò reo vui mừng!” — Thi-thiên 33:3",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "",
    isPinned: false,
    likesCount: 142,
    comments: [
      {
        authorName: "Bạn Lê Quang Khải",
        authorRole: "Ban Thanh Niên",
        content: "Em đã đăng ký học guitar đệm hát thánh ca, mong chờ ngày được đàn dâng lên Chúa quá!",
        createdAt: new Date(Date.now() - 40 * 3600 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
  },
];

async function reseed() {
  try {
    await client.connect();
    console.log("Đang kết nối MongoDB để re-seed dữ liệu phong phú...");
    const db = client.db("church_online");

    // 1. Re-seed Churches with proper profile and live status
    const churchCol = db.collection("churches");
    console.log("Cập nhật danh sách 6 Hội Thánh mẫu...");
    for (const ch of churchesData) {
      await churchCol.updateOne(
        { slug: ch.slug },
        {
          $set: {
            ...ch,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
    console.log("-> Đã cập nhật 6 Hội Thánh thành công!");

    // Get church map for churchId
    const allChurches = await churchCol.find({}).toArray();
    const churchMap = new Map();
    allChurches.forEach((c) => churchMap.set(c.slug, c));

    // 2. Re-seed Posts with rich, diverse, non-repetitive real content
    const postCol = db.collection("posts");
    console.log("Xóa các bài viết cũ trùng lặp...");
    await postCol.deleteMany({});

    console.log("Chèn 10 bài viết mẫu phong phú mới...");
    const formattedPosts = postsData.map((p) => {
      const church = churchMap.get(p.churchSlug);
      return {
        ...p,
        churchId: church?._id || new ObjectId(),
        author: {
          name: church?.name || "Hội Thánh Tin Lành",
          role: church?.profileConfig?.leadPastor || "Mục sư Quản Nhiệm",
          avatarUrl: church?.profileConfig?.avatarUrl || "",
        },
        updatedAt: p.createdAt,
      };
    });

    const result = await postCol.insertMany(formattedPosts);
    console.log(`-> Đã chèn thành công ${result.insertedCount} bài viết phong phú mới vào cơ sở dữ liệu!`);

    // 3. Re-seed Prayer Requests for Community Prayer Wall
    const prayerCol = db.collection("prayer_requests");
    const prayerCount = await prayerCol.countDocuments();
    if (prayerCount < 5) {
      console.log("Bổ sung nan đề cầu nguyện mẫu...");
      const samplePrayers = [
        {
          churchSlug: "loibansusong",
          name: "Bà Cụ Maria (78 tuổi) • TP. HCM",
          isAnonymous: false,
          category: "Sức khỏe & Chữa lành",
          confidentialLevel: "prayer_team",
          prayerContent: "Xin quý Hội Thánh cùng hiệp ý cầu nguyện cho ca mổ mắt thứ Ba tới của tôi diễn ra bình an trong tay Chúa.",
          status: "praying",
          createdAt: new Date(),
        },
        {
          churchSlug: "andien",
          name: "Anh Tuấn & Gia Đình • Đà Nẵng",
          isAnonymous: false,
          category: "Thân hữu tin Chúa",
          confidentialLevel: "prayer_team",
          prayerContent: "Cầu thay cho ba mẹ tôi sớm mở lòng đón nhận Phúc Âm trong đợt truyền giảng Chúa Nhật tuần này.",
          status: "new",
          createdAt: new Date(),
        },
        {
          churchSlug: "hanoi",
          name: "Chị Thảo (Hà Nội)",
          isAnonymous: true,
          category: "Gia đình & Con cái",
          confidentialLevel: "pastor_only",
          prayerContent: "Xin Chúa thêm sức và gìn giữ đức tin cho các cháu nhỏ trước những áp lực học đường đầu năm học.",
          status: "completed",
          createdAt: new Date(),
        },
      ];
      await prayerCol.insertMany(samplePrayers);
      console.log("-> Đã bổ sung nan đề cầu nguyện mẫu!");
    }

    console.log("Re-seed dữ liệu hoàn tất thành công 100%!");
  } catch (err) {
    console.error("Lỗi re-seed:", err);
  } finally {
    await client.close();
  }
}

reseed();
