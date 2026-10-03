export interface ServiceStage {
  id: string;
  name: string;
  time: string;
  status: "completed" | "current" | "upcoming";
}

export interface ChatMessage {
  id: string;
  sender: string;
  role?: "pastor" | "moderator" | "elder" | "member";
  location?: string;
  text: string;
  timestamp: string;
  isAmenOnly?: boolean;
}

export interface ScriptureVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface SermonSection {
  id: string;
  title: string;
  verseRef: string;
  summary: string;
  points: string[];
}

export interface WorshipServiceInfo {
  churchName: string;
  churchBranch: string;
  serviceTitle: string;
  dateTime: string;
  theme: string;
  speaker: string;
  speakerTitle: string;
  scriptureReference: string;
  currentStage: string;
  streamUrl: string;
  fallbackPosterUrl: string;
  viewersCount: number;
  stages: ServiceStage[];
  scriptures: {
    reference: string;
    translationName: string;
    verses: ScriptureVerse[];
  };
  sermonOutline: SermonSection[];
  givingInfo: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    qrUrl: string;
    transferSyntax: string;
    note: string;
  };
  currentHymn: {
    number: number;
    title: string;
    author: string;
    stanzas: string[];
  };
}

export const worshipData: WorshipServiceInfo = {
  churchName: "Hội Thánh Tin Lành Lời Ban Sự Sống",
  churchBranch: "Phòng Nhóm Trực Tuyến - Thánh Đường Trung Tâm",
  serviceTitle: "Lễ Thờ Phượng Chúa Nhật",
  dateTime: "Chúa Nhật, 09:00 - 11:15",
  theme: "Bước Đi Trong Ân Điển Vô Điều Kiện",
  speaker: "Mục sư TS. Nguyễn Hữu Ân",
  speakerTitle: "Quản nhiệm Hội Thánh",
  scriptureReference: "Ê-phê-sô 2:8-10",
  currentStage: "Giảng Luận Lời Chúa",
  // Standard test HLS stream that is stable and publicly available
  streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  fallbackPosterUrl:
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1920&q=80",
  viewersCount: 1428,
  stages: [
    { id: "1", name: "Khai Lễ & Tôn Vinh", time: "09:00", status: "completed" },
    { id: "2", name: "Ngợi Khen & Ca Nguyện", time: "09:15", status: "completed" },
    { id: "3", name: "Cầu Nguyện Khai Lễ", time: "09:45", status: "completed" },
    { id: "4", name: "Giảng Luận Lời Chúa", time: "09:55", status: "current" },
    { id: "5", name: "Cầu Nguyện Đáp Ứng & Dâng Hiến", time: "10:45", status: "upcoming" },
    { id: "6", name: "Thông Báo & Chúc Phước", time: "11:05", status: "upcoming" },
  ],
  scriptures: {
    reference: "Ê-phê-sô 2:8-10 (Bản Truyền Thống 1925)",
    translationName: "Bản Truyền Thống 1925",
    verses: [
      {
        chapter: 2,
        verse: 8,
        text: "Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời.",
      },
      {
        chapter: 2,
        verse: 9,
        text: "Ấy chẳng phải bởi việc làm đâu, hầu cho không ai khoe mình.",
      },
      {
        chapter: 2,
        verse: 10,
        text: "Vì chúng ta là việc Ngài làm ra, đã được dựng nên trong Đức Chúa Jêsus Christ để làm việc lành mà Đức Chúa Trời đã sắm sẵn trước cho chúng ta làm theo.",
      },
    ],
  },
  sermonOutline: [
    {
      id: "pt-1",
      title: "1. Bản Chất Của Sự Cứu Rỗi: Ân Điển Trưng Dẫn",
      verseRef: "Ê-phê-sô 2:8",
      summary:
        "Sự cứu rỗi không bắt đầu từ nỗ lực đạo đức của con người, nhưng là món quà tuyệt đối từ tấm lòng nhân từ của Thiên Chúa.",
      points: [
        "Ân điển (Charis): Ơn phước không xứng đáng nhận lãnh.",
        "Đức tin là chiếc cầu rỗng đón nhận hồng ân, không phải là công đức tích lũy.",
      ],
    },
    {
      id: "pt-2",
      title: "2. Loại Trừ Mọi Sự Tự Phụ Của Xác Thịt",
      verseRef: "Ê-phê-sô 2:9",
      summary:
        "Khi hiểu thấu thập tự giá, không một cơ đốc nhân nào có thể tự hào về tài năng hay công đức cá nhân trước mặt Chúa.",
      points: [
        "Mọi việc lành trước khi tin Chúa không đủ để chuộc lấy linh hồn.",
        "Thập tự giá san bằng mọi kiêu ngạo tâm linh.",
      ],
    },
    {
      id: "pt-3",
      title: "3. Tác Phẩm Mới (Poiēma) Vì Mục Đích Đời Đời",
      verseRef: "Ê-phê-sô 2:10",
      summary:
        "Chúng ta được tái sinh không phải chỉ để được lên Thiên Đàng, mà là để trở thành kiệt tác sống bày tỏ tình yêu Ngài.",
      points: [
        "Poiēma: Kiệt tác thi ca của Đấng Tạo Hóa.",
        "Việc lành là kết quả tự nhiên của sự sống mới, không phải điều kiện để được cứu.",
      ],
    },
  ],
  givingInfo: {
    bankName: "Ngân hàng TMCP Quân Đội (MB Bank)",
    accountName: "HOI THANH TIN LANH LOI BAN SU SONG",
    accountNumber: "0386888999",
    branch: "Hội sở / Chi nhánh TP. Hồ Chí Minh",
    qrUrl:
      "https://api.vietqr.io/image/970422-0386888999-b1X589K.jpg?accountName=HOI%20THANH%20TIN%20LANH&amount=0&addInfo=DANG%20HIEN%20CHUA%20NHAT",
    transferSyntax: "DH [HoTen] [SoDienThoai]",
    note: "Mọi sự dâng hiến đều nhằm phát triển Hội Thánh, công tác truyền giáo, chăm sóc trẻ em và giúp đỡ các hoàn cảnh khó khăn.",
  },
  currentHymn: {
    number: 284,
    title: "Ân Điển Lạ Lùng (Amazing Grace)",
    author: "John Newton (Lời Việt: Ban Thánh Nhạc)",
    stanzas: [
      "1. Ân điển lạ lùng bao xiết tôn vinh! Đã cứu kẻ khốn khổ như tôi. Xưa tôi lạc mất, nay tìm lại được; Mù lòa nay sáng mắt rồi.",
      "2. Ân điển dạy lòng tôi biết kính sợ, Xua tan bao nỗi âu lo sầu. Ôi, ân điển quý giá dường bao Trong giờ đầu tôi tin cậy!",
      "3. Trải bao nguy hiểm, bẫy lưới cam go, Tôi đã đi qua bằng an rồi; Ân điển đưa tôi đến chốn này, Dẫn dắt tôi về quê hương tươi vui.",
      "4. Dẫu muôn ngàn năm ngời sáng vinh quang, Như mặt trời rạng soi thiên đàng, Chúng ta vẫn hát chúc tôn hoài, Lời ca khen chẳng hề dứt.",
    ],
  },
};

export const initialMessages: ChatMessage[] = [
  {
    id: "m-pinned",
    sender: "Ban Mục Vụ Thờ Phượng",
    role: "pastor",
    text: "Kính chào quý con cái Chúa và quý thân hữu tham dự chương trình thờ phượng trực tuyến sáng nay. Nguyện xin sự bình an, ân điển và lẽ thật của Chúa Thánh Linh tuôn đổ trên mỗi gia đình.",
    timestamp: "08:58",
  },
  {
    id: "m-1",
    sender: "Bác Đào Văn Thuận",
    role: "elder",
    location: "Hà Nội",
    text: "Chào Mục sư và Hội Thánh. Gia đình tôi tại Hà Nội cùng hiệp một thờ phượng Chúa sáng nay. Nguyện xin Chúa ban phước buổi nhóm.",
    timestamp: "09:02",
  },
  {
    id: "m-2",
    sender: "Nguyễn Thị Mai Lan",
    role: "member",
    location: "Đà Nẵng",
    text: "Tạ ơn Chúa vì bài thánh ca tôn vinh Chúa sáng nay quá cảm động!",
    timestamp: "09:18",
  },
  {
    id: "m-3",
    sender: "Trần Hữu Phước",
    role: "moderator",
    location: "Cần Thơ",
    text: "Quý thân hữu cần hỗ trợ kinh thánh hoặc cầu thay xin nhấn nút 'Cần Cầu Nguyện' ở góc dưới màn hình.",
    timestamp: "09:35",
  },
  {
    id: "m-4",
    sender: "Lê Hoàng Yến",
    role: "member",
    location: "TP. Hồ Chí Minh",
    text: "Amen! Con cảm tạ Chúa vì Lời Chúa trong Ê-phê-sô đã nhắc nhở con sáng nay.",
    timestamp: "10:04",
    isAmenOnly: false,
  },
  {
    id: "m-5",
    sender: "Phạm Minh Tâm",
    role: "member",
    location: "Vũng Tàu",
    text: "Amen! Nguyện Chúa thăm viếng đời sống mỗi chúng con.",
    timestamp: "10:12",
    isAmenOnly: true,
  },
];
