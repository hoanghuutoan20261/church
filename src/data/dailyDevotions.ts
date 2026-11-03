// Daily Devotional Data & Generator for Vietnamese Christian Sanctuary
// Automatically generates a fresh, date-aligned devotional every morning

export interface DailyDevotionTemplate {
  topic: string;
  scriptureReference: string;
  scriptureVerse: string;
  reflection: string;
  prayer: string;
  imageUrl: string;
}

export const DAILY_DEVOTION_TEMPLATES: DailyDevotionTemplate[] = [
  {
    topic: "Sự Bình An Vượt Quá Mọi Hiểu Biết",
    scriptureReference: "Giăng 14:27",
    scriptureVerse: "“Ta để sự bình an lại cho các ngươi; Ta ban sự bình an của Ta cho các ngươi. Ta cho các ngươi sự bình an chẳng phải như thế gian cho. Lòng các ngươi chớ hề bối rối và đừng sợ hãi.”",
    reflection: "Giữa những lo toan, biến động và áp lực của cuộc sống hôm nay, Chúa Giê-xu không hứa rằng chúng ta sẽ không gặp sóng gió, nhưng Ngài ban cho chúng ta sự bình an thật trong lòng — sự bình an neo chặt nơi tình yêu bất biến của Cha Thiên Thượng. Khi bạn bước vào ngày mới, hãy trao phó mọi gánh nặng cho Ngài.",
    prayer: "Lạy Chúa kính yêu, con cảm tạ Ngài vì sự bình an Ngài ban chẳng điều gì ở đời này lấy mất được. Xin gìn giữ tâm trí con luôn hướng về Ngài giữa mọi hoàn cảnh hôm nay. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Đấng Chăn Giữ Đầy Dẫy Ân Điển",
    scriptureReference: "Thi-thiên 23:1-3",
    scriptureVerse: "“Đức Giê-hô-va là Đấng chăn giữ tôi: tôi chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh. Ngài bổ lại linh hồn tôi, dẫn tôi vào các lối công bình, vì cớ danh Ngài.”",
    reflection: "Một chú chiên được no ấm và bình an không phải vì nó có sức mạnh, mà vì người chăn luôn dõi theo nó từng bước. Hãy nhớ rằng Đấng Tạo Hóa hằng yêu thương và chu cấp cho bạn từng hơi thở. Ngài biết rõ mọi nhu cầu của bạn trước khi bạn cầu xin.",
    prayer: "Chúa ôi, con vui mừng trao trọn cuộc đời trong tay Người Chăn Nhân Từ. Xin dẫn lối từng bước chân con trong công việc, gia đình và các mối thông công hôm nay. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Sự Thương Xót Của Ngài Mới Luôn Mỗi Buổi Sớm",
    scriptureReference: "Ca-thương 3:22-23",
    scriptureVerse: "“Ấy là nhờ sự nhân từ Đức Giê-hô-va mà chúng ta chưa tuyệt; vì sự thương xót của Ngài chẳng dứt. Mỗi buổi sớm mai lại mới luôn, sự thành tín Ngài là lớn lắm.”",
    reflection: "Mỗi ánh bình minh mở ra là một trang ân điển hoàn toàn mới từ Đức Chúa Trời. Dù hôm qua bạn có vấp ngã hay mỏi mệt đến đâu, lòng nhân từ của Chúa sáng nay vẫn tươi mới và dư dật để ban sức mới cho bạn bắt đầu lại.",
    prayer: "Cảm tạ Cha vì mỗi sớm mai thức dậy là một ngày mới tràn ngập ơn thương xót. Nguyện sự thành tín của Chúa bao phủ đời sống con trong suốt ngày này. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Mọi Sự Hiệp Lại Làm Ích",
    scriptureReference: "Rô-ma 8:28",
    scriptureVerse: "“Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.”",
    reflection: "Có những điều xảy ra trong đời sống dường như khó hiểu và đầy thử thách. Nhưng trong bàn tay toàn năng của Chúa, không một giọt nước mắt nào là vô nghĩa. Ngài đang dệt nên một bức tranh kỳ diệu cho đời sống bạn.",
    prayer: "Lạy Cha, con xin đầu phục và tin cậy tuyệt đối nơi ý muốn tốt lành của Ngài. Xin ban cho con con mắt đức tin để thấy Ngài đang tể trị trong mọi nghịch cảnh. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Chớ Lo Phiền Chi Hết",
    scriptureReference: "Phi-líp 4:6-7",
    scriptureVerse: "“Chớ lo phiền chi hết, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài xin, và sự tạ ơn mà trình các sự cầu xin của mình cho Đức Chúa Trời. Sự bình an của Đức Chúa Trời vượt quá mọi sự hiểu biết, sẽ giữ gìn lòng và ý tưởng anh em trong Đức Chúa Jêsus Christ.”",
    reflection: "Lo lắng không giúp giải quyết ngày mai mà chỉ tước đi sức lực của ngày hôm nay. Bí quyết để có một tâm hồn tự do và thanh thản là biến mọi âu lo thành lời cầu nguyện với lòng biết ơn chân thành.",
    prayer: "Lạy Chúa Giê-xu, con xin đặt xuống nơi chân thập tự giá mọi lo âu về tương lai. Xin sự bình an mầu nhiệm của Ngài canh giữ tấm lòng và trí tưởng của con. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Hãy Hết Lòng Tin Cậy Đức Giê-hô-va",
    scriptureReference: "Châm-ngôn 3:5-6",
    scriptureVerse: "“Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con; phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.”",
    reflection: "Trí khôn con người dù uyên thâm đến đâu cũng hữu hạn trước sự vô biên của Đấng Tạo Hóa. Khi bạn dám phó thác và tìm cầu thánh ý Chúa trong từng quyết định nhỏ nhất, Ngài sẽ mở ra con đường bình an và vinh hiển.",
    prayer: "Chúa ơi, con dâng mọi kế hoạch, quyết định và công việc ngày hôm nay lên cho Ngài. Xin dẫn dắt và chỉ lối cho từng bước chân con. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topic: "Sức Mới Trong Đấng Christ",
    scriptureReference: "Ê-sai 40:29-31",
    scriptureVerse: "“Ngài ban sức mạnh cho kẻ nhọc nhằn, thêm lực lượng cho kẻ chẳng có sức. Nhưng ai trông đợi Đức Giê-hô-va thì chắc được sức mới, cất cánh bay cao như chim ưng; chạy mà không mệt nhọc, đi mà không mòn mỏi.”",
    reflection: "Khi bạn cảm thấy cạn kiệt năng lượng giữa những áp lực dồn dập, hãy dừng lại và tìm kiếm nơi kín đáo với Chúa. Sức mạnh thiên thượng sẽ tuôn đổ để bạn vượt lên trên mọi nghịch cảnh như chim ưng sải cánh giữa tầng mây.",
    prayer: "Lạy Đấng Toàn Năng, con ngửa trông nơi Chúa sức mạnh và sự khôn ngoan cho ngày hôm nay. Xin hà hơi sống của Thánh Linh trên tâm hồn con. Amen!",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
];

export const VIETNAMESE_WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function getTodayDevotion(targetDate = new Date()) {
  const dayOfWeek = VIETNAMESE_WEEKDAYS[targetDate.getDay()];
  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();

  // Index based on day of month to rotate through rich templates
  const templateIndex = (targetDate.getDate() + targetDate.getMonth() * 31) % DAILY_DEVOTION_TEMPLATES.length;
  const template = DAILY_DEVOTION_TEMPLATES[templateIndex];

  const dateString = `${dayOfWeek}, ${day}/${month}/${year}`;
  const title = `Lời Chúa — ${dateString}: ${template.topic}`;

  const fullContent = `${template.reflection}\n\n📖 Cầu nguyện sáng nay:\n"${template.prayer}"`;

  return {
    id: `daily-devotion-${year}-${month}-${day}`,
    dateString,
    title,
    topic: template.topic,
    scriptureReference: template.scriptureReference,
    scriptureVerse: `${template.scriptureVerse} — ${template.scriptureReference}`,
    content: fullContent,
    reflection: template.reflection,
    prayer: template.prayer,
    imageUrl: template.imageUrl,
    churchSlug: "loibansusong",
    churchName: "Ban Tĩnh Nguyện & Lời Chúa Mỗi Ngày",
    denomination: "Lời Ban Sự Sống • Tĩnh Nguyện Ban Mai",
    timeAgo: `Hôm nay lúc 06:00 • 🌐 Công khai`,
    category: "devotion",
    mediaType: "scripture",
    amenCount: 148 + (targetDate.getDate() * 7) % 60,
    loveCount: 86 + (targetDate.getDate() * 5) % 40,
    shareCount: 34 + (targetDate.getDate() * 3) % 20,
    comments: [
      {
        id: "dev-c1",
        author: "Mục sư Quản nhiệm Nguyễn Văn An",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
        content: `Amen! Nguyện Lời Chúa buổi sáng hôm nay (${dateString}) thêm sức mới và dẫn dắt từng gia đình tín hữu!`,
        time: "06:15 sáng nay",
      },
      {
        id: "dev-c2",
        author: "Chị Thảo (Ban Thanh Niên)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        content: "Thật đúng lúc cho hoàn cảnh của em hôm nay. Tạ ơn Chúa vì Lời Ngài luôn sống động và quyền năng!",
        time: "06:40 sáng nay",
      },
    ],
  };
}

export function getTodayFeedPost() {
  const d = getTodayDevotion();
  return {
    id: d.id,
    churchSlug: d.churchSlug,
    churchName: d.churchName,
    denomination: d.denomination,
    avatar: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=120&q=80",
    timeAgo: d.timeAgo,
    category: d.category,
    title: d.title,
    content: d.content,
    scriptureVerse: d.scriptureVerse,
    mediaType: "scripture" as const,
    mediaUrl: d.imageUrl,
    isLive: false,
    viewersCount: 0,
    amenCount: d.amenCount,
    loveCount: d.loveCount,
    shareCount: d.shareCount,
    comments: d.comments,
  };
}
