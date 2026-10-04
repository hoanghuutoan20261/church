/**
 * Comprehensive Protestant Bible Translations Registry
 * Supports official Vietnamese Protestant editions and world standard English versions.
 */

export interface BibleTranslation {
  id: string; // e.g. "BTT", "BTHD", "BDM", "BPT", "BD2011", "NIV", "KJV", "ESV", "NLT"
  name: string; // Full name
  shortName: string; // Display name
  language: "vi" | "en";
  languageName: string; // "Tiếng Việt" | "English"
  year: number | string;
  badge: string; // "Kinh Điển", "Hiệu Đính", "Đương Đại", "Phổ Thông", "Học Thuật", "Song Ngữ"
  description: string;
  bollsCode?: string; // Remote API mapping for full 66 books 1189 chapters
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // ================= 🇻🇳 BẢN DỊCH TIẾNG VIỆT =================
  {
    id: "BTT",
    name: "Bản Truyền Thống 1925",
    shortName: "BTT 1925",
    language: "vi",
    languageName: "Tiếng Việt",
    year: 1925,
    badge: "Kinh Điển",
    description: "Bản dịch lịch sử hơn 100 năm qua của Giáo Hội Tin Lành Việt Nam, văn phong uy nghi, trang trọng và quen thuộc nhất.",
    bollsCode: "VI1934",
  },
  {
    id: "BTHD",
    name: "Bản Hiệu Đính 2010 (RVV2011)",
    shortName: "BTHĐ 2010",
    language: "vi",
    languageName: "Tiếng Việt",
    year: 2010,
    badge: "Hiệu Đính",
    description: "Bản dịch hiệu đính của Liên Hiệp Thánh Kinh Hội (UBS) & HTTLVN, từ ngữ trong sáng, chuẩn mực, giải nghĩa trung thực.",
    bollsCode: "VI1934",
  },
  {
    id: "BDM",
    name: "Bản Dịch Mới 2002 (NVB)",
    shortName: "BDM 2002",
    language: "vi",
    languageName: "Tiếng Việt",
    year: 2002,
    badge: "Đương Đại",
    description: "Dịch trực tiếp từ nguyên bản Hê-bơ-rơ và Hy Lạp, văn phong hiện đại, rất được giới trẻ và sinh viên Cơ Đốc yêu thích.",
  },
  {
    id: "BPT",
    name: "Bản Phổ Thông (ERV-VI)",
    shortName: "Bản Phổ Thông",
    language: "vi",
    languageName: "Tiếng Việt",
    year: 2006,
    badge: "Dễ Hiểu",
    description: "Văn phong giản dị, trong sáng, diễn đạt rõ ý, rất thích hợp cho thiếu nhi, gia đình và thân hữu mới tin nhận Chúa.",
  },
  {
    id: "BD2011",
    name: "Bản Dịch 2011 (MS Đặng Ngọc Báu)",
    shortName: "BD 2011",
    language: "vi",
    languageName: "Tiếng Việt",
    year: 2011,
    badge: "Học Thuật",
    description: "Công trình dịch thuật công phu của Mục sư Đặng Ngọc Báu, chuẩn mực học thuật cao, phục vụ nghiên cứu và giải kinh sâu sắc.",
  },

  // ================= 🇬🇧 BẢN DỊCH TIẾNG ANH (SONG NGỮ) =================
  {
    id: "NIV",
    name: "New International Version",
    shortName: "NIV (English)",
    language: "en",
    languageName: "English",
    year: 2011,
    badge: "Toàn Cầu",
    description: "Bản dịch tiếng Anh đương đại phổ biến nhất trên thế giới hiện nay, tối ưu cho thờ phượng và trình chiếu song ngữ.",
    bollsCode: "NIV",
  },
  {
    id: "KJV",
    name: "King James Version (1611)",
    shortName: "KJV (Classic)",
    language: "en",
    languageName: "English",
    year: 1611,
    badge: "Kinh Điển",
    description: "Bản dịch tiếng Anh kinh điển lịch sử lừng danh 1611, trang nghiêm, giàu chất thi ca và chiều sâu thần học.",
    bollsCode: "KJV",
  },
  {
    id: "ESV",
    name: "English Standard Version",
    shortName: "ESV (Literal)",
    language: "en",
    languageName: "English",
    year: 2016,
    badge: "Chuẩn Nghĩa",
    description: "Bản dịch tiếng Anh dịch nghĩa đen chữ-đối-chữ chuẩn xác thần học, được các diễn giả và nhà giải kinh hàng đầu tin cậy.",
    bollsCode: "ESV",
  },
  {
    id: "NLT",
    name: "New Living Translation",
    shortName: "NLT (Living)",
    language: "en",
    languageName: "English",
    year: 2015,
    badge: "Sống Động",
    description: "Bản dịch tiếng Anh diễn đạt ý niệm mượt mà, ấm áp, tạo cảm hứng tươi mới và dễ nắm bắt.",
    bollsCode: "NLT",
  },
];

export function getTranslationInfo(id: string): BibleTranslation {
  const clean = (id || "").toUpperCase().trim();
  const found = BIBLE_TRANSLATIONS.find(
    (t) =>
      t.id === clean ||
      t.shortName.toUpperCase().includes(clean) ||
      clean.includes(t.id)
  );
  return found || BIBLE_TRANSLATIONS[0];
}
