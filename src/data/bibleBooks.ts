export interface BibleBook {
  id: string; // e.g. "GEN", "JHN", "PSA"
  bookNumber: number; // 1 to 66
  name: string; // Tên tiếng Việt: "Giăng", "Thi Thiên"
  shortName: string; // "Ga", "Thi", "Sa"
  englishName: string; // "John", "Psalms"
  testament: "OT" | "NT";
  category:
    | "law" // Ngũ Kinh
    | "history" // Lịch Sử
    | "poetry" // Thi Ca
    | "prophet_major" // Tiên Tri Lớn
    | "prophet_minor" // Tiên Tri Nhỏ
    | "gospel" // Phúc Âm
    | "apostolic_history" // Lịch Sử Sứ Đồ
    | "epistle_paul" // Thư Tín Phao-lô
    | "epistle_general" // Thư Tín Chung
    | "prophecy"; // Tiên Tri Khải Huyền
  totalChapters: number;
  aliases: string[]; // Viết tắt hoặc từ khóa tìm kiếm: ["giang", "jhn", "john", "ga"]
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ================= CỰU ƯỚC (39 SÁCH) =================
  // Ngũ Kinh
  {
    id: "GEN",
    bookNumber: 1,
    name: "Sáng Thế Ký",
    shortName: "Sa",
    englishName: "Genesis",
    testament: "OT",
    category: "law",
    totalChapters: 50,
    aliases: ["sang the ky", "sang the", "stk", "sa", "gen", "genesis"],
  },
  {
    id: "EXO",
    bookNumber: 2,
    name: "Xuất Ê-díp-tô Ký",
    shortName: "Xu",
    englishName: "Exodus",
    testament: "OT",
    category: "law",
    totalChapters: 40,
    aliases: ["xuat e-dip-to ky", "xuat", "xedtk", "xu", "exo", "exodus"],
  },
  {
    id: "LEV",
    bookNumber: 3,
    name: "Lê-vi Ký",
    shortName: "Le",
    englishName: "Leviticus",
    testament: "OT",
    category: "law",
    totalChapters: 27,
    aliases: ["le-vi ky", "levi", "lvk", "le", "lev", "leviticus"],
  },
  {
    id: "NUM",
    bookNumber: 4,
    name: "Dân Số Ký",
    shortName: "Dan",
    englishName: "Numbers",
    testament: "OT",
    category: "law",
    totalChapters: 36,
    aliases: ["dan so ky", "dan so", "dsk", "dan", "num", "numbers"],
  },
  {
    id: "DEU",
    bookNumber: 5,
    name: "Phục Truyền Luật Lệ Ký",
    shortName: "Phu",
    englishName: "Deuteronomy",
    testament: "OT",
    category: "law",
    totalChapters: 34,
    aliases: ["phuc truyen", "ptllk", "phuc", "phu", "deu", "deuteronomy"],
  },

  // Lịch Sử
  {
    id: "JOS",
    bookNumber: 6,
    name: "Giô-suê",
    shortName: "Gios",
    englishName: "Joshua",
    testament: "OT",
    category: "history",
    totalChapters: 24,
    aliases: ["gio-sue", "giosue", "gs", "jos", "joshua"],
  },
  {
    id: "JDG",
    bookNumber: 7,
    name: "Các Quan Xét",
    shortName: "Quan",
    englishName: "Judges",
    testament: "OT",
    category: "history",
    totalChapters: 21,
    aliases: ["cac quan xet", "quan xet", "cqx", "quan", "jdg", "judges"],
  },
  {
    id: "RUT",
    bookNumber: 8,
    name: "Ru-tơ",
    shortName: "Ru",
    englishName: "Ruth",
    testament: "OT",
    category: "history",
    totalChapters: 4,
    aliases: ["ru-to", "ruto", "ru", "rut", "ruth"],
  },
  {
    id: "1SA",
    bookNumber: 9,
    name: "1 Sa-mu-ên",
    shortName: "1Sm",
    englishName: "1 Samuel",
    testament: "OT",
    category: "history",
    totalChapters: 31,
    aliases: ["1 sa-mu-en", "1 samuen", "1sm", "1sa", "1 samuel"],
  },
  {
    id: "2SA",
    bookNumber: 10,
    name: "2 Sa-mu-ên",
    shortName: "2Sm",
    englishName: "2 Samuel",
    testament: "OT",
    category: "history",
    totalChapters: 24,
    aliases: ["2 sa-mu-en", "2 samuen", "2sm", "2sa", "2 samuel"],
  },
  {
    id: "1KI",
    bookNumber: 11,
    name: "1 Các Vua",
    shortName: "1Vua",
    englishName: "1 Kings",
    testament: "OT",
    category: "history",
    totalChapters: 22,
    aliases: ["1 cac vua", "1 vua", "1vua", "1ki", "1 kings"],
  },
  {
    id: "2KI",
    bookNumber: 12,
    name: "2 Các Vua",
    shortName: "2Vua",
    englishName: "2 Kings",
    testament: "OT",
    category: "history",
    totalChapters: 25,
    aliases: ["2 cac vua", "2 vua", "2vua", "2ki", "2 kings"],
  },
  {
    id: "1CH",
    bookNumber: 13,
    name: "1 Sử Ký",
    shortName: "1Su",
    englishName: "1 Chronicles",
    testament: "OT",
    category: "history",
    totalChapters: 29,
    aliases: ["1 su ky", "1 su", "1sk", "1ch", "1 chronicles"],
  },
  {
    id: "2CH",
    bookNumber: 14,
    name: "2 Sử Ký",
    shortName: "2Su",
    englishName: "2 Chronicles",
    testament: "OT",
    category: "history",
    totalChapters: 36,
    aliases: ["2 su ky", "2 su", "2sk", "2ch", "2 chronicles"],
  },
  {
    id: "EZR",
    bookNumber: 15,
    name: "E-xơ-ra",
    shortName: "Exr",
    englishName: "Ezra",
    testament: "OT",
    category: "history",
    totalChapters: 10,
    aliases: ["e-xo-ra", "exora", "ezr", "ezra"],
  },
  {
    id: "NEH",
    bookNumber: 16,
    name: "Nê-hê-mi",
    shortName: "Ne",
    englishName: "Nehemiah",
    testament: "OT",
    category: "history",
    totalChapters: 13,
    aliases: ["ne-he-mi", "nehemi", "nhm", "neh", "nehemiah"],
  },
  {
    id: "EST",
    bookNumber: 17,
    name: "Ê-xơ-tê",
    shortName: "Ext",
    englishName: "Esther",
    testament: "OT",
    category: "history",
    totalChapters: 10,
    aliases: ["e-xo-te", "exote", "est", "esther"],
  },

  // Thi Ca & Khôn Ngoan
  {
    id: "JOB",
    bookNumber: 18,
    name: "Gióp",
    shortName: "Giop",
    englishName: "Job",
    testament: "OT",
    category: "poetry",
    totalChapters: 42,
    aliases: ["giop", "job"],
  },
  {
    id: "PSA",
    bookNumber: 19,
    name: "Thi Thiên",
    shortName: "Thi",
    englishName: "Psalms",
    testament: "OT",
    category: "poetry",
    totalChapters: 150,
    aliases: ["thi thien", "thi", "tt", "psa", "ps", "psalm", "psalms"],
  },
  {
    id: "PRO",
    bookNumber: 20,
    name: "Châm Ngôn",
    shortName: "Cham",
    englishName: "Proverbs",
    testament: "OT",
    category: "poetry",
    totalChapters: 31,
    aliases: ["cham ngon", "cham", "cn", "pro", "proverbs"],
  },
  {
    id: "ECC",
    bookNumber: 21,
    name: "Truyền Đạo",
    shortName: "Truyen",
    englishName: "Ecclesiastes",
    testament: "OT",
    category: "poetry",
    totalChapters: 12,
    aliases: ["truyen dao", "truyen", "td", "ecc", "ecclesiastes"],
  },
  {
    id: "SNG",
    bookNumber: 22,
    name: "Nhã Ca",
    shortName: "Nha",
    englishName: "Song of Solomon",
    testament: "OT",
    category: "poetry",
    totalChapters: 8,
    aliases: ["nha ca", "nha", "nc", "song", "sng", "song of solomon"],
  },

  // Tiên Tri Lớn
  {
    id: "ISA",
    bookNumber: 23,
    name: "Ê-sai",
    shortName: "Es",
    englishName: "Isaiah",
    testament: "OT",
    category: "prophet_major",
    totalChapters: 66,
    aliases: ["e-sai", "esai", "es", "isa", "isaiah"],
  },
  {
    id: "JER",
    bookNumber: 24,
    name: "Giê-rê-mi",
    shortName: "Gie",
    englishName: "Jeremiah",
    testament: "OT",
    category: "prophet_major",
    totalChapters: 52,
    aliases: ["gie-re-mi", "gieremi", "gie", "jer", "jeremiah"],
  },
  {
    id: "LAM",
    bookNumber: 25,
    name: "Ca Thương",
    shortName: "Ca",
    englishName: "Lamentations",
    testament: "OT",
    category: "prophet_major",
    totalChapters: 5,
    aliases: ["ca thuong", "ca", "ct", "lam", "lamentations"],
  },
  {
    id: "EZK",
    bookNumber: 26,
    name: "Ê-xê-chi-ên",
    shortName: "Exe",
    englishName: "Ezekiel",
    testament: "OT",
    category: "prophet_major",
    totalChapters: 48,
    aliases: ["e-xe-chi-en", "exechien", "exe", "ezk", "ezekiel"],
  },
  {
    id: "DAN",
    bookNumber: 27,
    name: "Đa-ni-ên",
    shortName: "Da",
    englishName: "Daniel",
    testament: "OT",
    category: "prophet_major",
    totalChapters: 12,
    aliases: ["da-ni-en", "danien", "da", "dan", "daniel"],
  },

  // Tiên Tri Nhỏ
  {
    id: "HOS",
    bookNumber: 28,
    name: "Ô-sê",
    shortName: "Ose",
    englishName: "Hosea",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 14,
    aliases: ["o-se", "ose", "hos", "hosea"],
  },
  {
    id: "JOL",
    bookNumber: 29,
    name: "Giô-ên",
    shortName: "Gio",
    englishName: "Joel",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 3,
    aliases: ["gio-en", "gioen", "jol", "joel"],
  },
  {
    id: "AMO",
    bookNumber: 30,
    name: "A-mốt",
    shortName: "Am",
    englishName: "Amos",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 9,
    aliases: ["a-mot", "amot", "am", "amo", "amos"],
  },
  {
    id: "OBA",
    bookNumber: 31,
    name: "Áp-đia",
    shortName: "Ap",
    englishName: "Obadiah",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 1,
    aliases: ["ap-dia", "apdia", "oba", "obadiah"],
  },
  {
    id: "JON",
    bookNumber: 32,
    name: "Giô-na",
    shortName: "Gna",
    englishName: "Jonah",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 4,
    aliases: ["gio-na", "giona", "jon", "jonah"],
  },
  {
    id: "MIC",
    bookNumber: 33,
    name: "Mi-chê",
    shortName: "Mic",
    englishName: "Micah",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 7,
    aliases: ["mi-che", "miche", "mic", "micah"],
  },
  {
    id: "NAM",
    bookNumber: 34,
    name: "Na-hum",
    shortName: "Na",
    englishName: "Nahum",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 3,
    aliases: ["na-hum", "nahum", "nam", "nah"],
  },
  {
    id: "HAB",
    bookNumber: 35,
    name: "Ha-ba-cúc",
    shortName: "Hab",
    englishName: "Habakkuk",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 3,
    aliases: ["ha-ba-cuc", "habacuc", "hab", "habakkuk"],
  },
  {
    id: "ZEP",
    bookNumber: 36,
    name: "Xô-phô-ni",
    shortName: "Xo",
    englishName: "Zephaniah",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 3,
    aliases: ["xo-pho-ni", "xophoni", "zep", "zephaniah"],
  },
  {
    id: "HAG",
    bookNumber: 37,
    name: "A-ghê",
    shortName: "Ag",
    englishName: "Haggai",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 2,
    aliases: ["a-ghe", "aghe", "hag", "haggai"],
  },
  {
    id: "ZEC",
    bookNumber: 38,
    name: "Xa-cha-ri",
    shortName: "Xac",
    englishName: "Zechariah",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 14,
    aliases: ["xa-cha-ri", "xachari", "zec", "zechariah"],
  },
  {
    id: "MAL",
    bookNumber: 39,
    name: "Ma-la-chi",
    shortName: "Mal",
    englishName: "Malachi",
    testament: "OT",
    category: "prophet_minor",
    totalChapters: 4,
    aliases: ["ma-la-chi", "malachi", "mal"],
  },

  // ================= TÂN ƯỚC (27 SÁCH) =================
  // Phúc Âm (Tin Lành)
  {
    id: "MAT",
    bookNumber: 40,
    name: "Ma-thi-ơ",
    shortName: "Mt",
    englishName: "Matthew",
    testament: "NT",
    category: "gospel",
    totalChapters: 28,
    aliases: ["ma-thi-o", "mathio", "mathiơ", "mt", "mat", "matthew"],
  },
  {
    id: "MRK",
    bookNumber: 41,
    name: "Mác",
    shortName: "Mc",
    englishName: "Mark",
    testament: "NT",
    category: "gospel",
    totalChapters: 16,
    aliases: ["mac", "mc", "mrk", "mark"],
  },
  {
    id: "LUK",
    bookNumber: 42,
    name: "Lu-ca",
    shortName: "Lc",
    englishName: "Luke",
    testament: "NT",
    category: "gospel",
    totalChapters: 24,
    aliases: ["lu-ca", "luca", "lc", "luk", "luke"],
  },
  {
    id: "JHN",
    bookNumber: 43,
    name: "Giăng",
    shortName: "Ga",
    englishName: "John",
    testament: "NT",
    category: "gospel",
    totalChapters: 21,
    aliases: ["giang", "ga", "jhn", "jn", "john"],
  },

  // Lịch Sử Sứ Đồ
  {
    id: "ACT",
    bookNumber: 44,
    name: "Công Vụ Các Sứ Đồ",
    shortName: "Cv",
    englishName: "Acts",
    testament: "NT",
    category: "apostolic_history",
    totalChapters: 28,
    aliases: ["cong vu", "cong vu cac su do", "cv", "act", "acts"],
  },

  // Thư Tín Phao-lô
  {
    id: "ROM",
    bookNumber: 45,
    name: "Rô-ma",
    shortName: "Rm",
    englishName: "Romans",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 16,
    aliases: ["ro-ma", "roma", "rm", "rom", "romans"],
  },
  {
    id: "1CO",
    bookNumber: 46,
    name: "1 Cô-rinh-tô",
    shortName: "1Cr",
    englishName: "1 Corinthians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 16,
    aliases: ["1 co-rinh-to", "1 corinhto", "1cr", "1co", "1 corinthians"],
  },
  {
    id: "2CO",
    bookNumber: 47,
    name: "2 Cô-rinh-tô",
    shortName: "2Cr",
    englishName: "2 Corinthians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 13,
    aliases: ["2 co-rinh-to", "2 corinhto", "2cr", "2co", "2 corinthians"],
  },
  {
    id: "GAL",
    bookNumber: 48,
    name: "Ga-la-ti",
    shortName: "Gl",
    englishName: "Galatians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 6,
    aliases: ["ga-la-ti", "galati", "gl", "gal", "galatians"],
  },
  {
    id: "EPH",
    bookNumber: 49,
    name: "Ê-phê-sô",
    shortName: "Ep",
    englishName: "Ephesians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 6,
    aliases: ["e-phe-so", "epheso", "ep", "eph", "ephesians"],
  },
  {
    id: "PHP",
    bookNumber: 50,
    name: "Phi-líp",
    shortName: "Pl",
    englishName: "Philippians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 4,
    aliases: ["phi-lip", "philip", "pl", "php", "philippians"],
  },
  {
    id: "COL",
    bookNumber: 51,
    name: "Cô-lô-se",
    shortName: "Cl",
    englishName: "Colossians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 4,
    aliases: ["co-lo-se", "colose", "cl", "col", "colossians"],
  },
  {
    id: "1TH",
    bookNumber: 52,
    name: "1 Tê-sa-lô-ni-ca",
    shortName: "1Ts",
    englishName: "1 Thessalonians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 5,
    aliases: ["1 te-sa-lo-ni-ca", "1 tesalonica", "1ts", "1th", "1 thessalonians"],
  },
  {
    id: "2TH",
    bookNumber: 53,
    name: "2 Tê-sa-lô-ni-ca",
    shortName: "2Ts",
    englishName: "2 Thessalonians",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 3,
    aliases: ["2 te-sa-lo-ni-ca", "2 tesalonica", "2ts", "2th", "2 thessalonians"],
  },
  {
    id: "1TI",
    bookNumber: 54,
    name: "1 Ti-mô-thê",
    shortName: "1Tm",
    englishName: "1 Timothy",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 6,
    aliases: ["1 ti-mo-the", "1 timothe", "1tm", "1ti", "1 timothy"],
  },
  {
    id: "2TI",
    bookNumber: 55,
    name: "2 Ti-mô-thê",
    shortName: "2Tm",
    englishName: "2 Timothy",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 4,
    aliases: ["2 ti-mo-the", "2 timothe", "2tm", "2ti", "2 timothy"],
  },
  {
    id: "TIT",
    bookNumber: 56,
    name: "Tít",
    shortName: "Tt",
    englishName: "Titus",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 3,
    aliases: ["tit", "tt", "titus"],
  },
  {
    id: "PHM",
    bookNumber: 57,
    name: "Phi-lê-môn",
    shortName: "Phm",
    englishName: "Philemon",
    testament: "NT",
    category: "epistle_paul",
    totalChapters: 1,
    aliases: ["phi-le-mon", "philemon", "phm", "philemon"],
  },

  // Thư Tín Chung
  {
    id: "HEB",
    bookNumber: 58,
    name: "Hê-bơ-rơ",
    shortName: "He",
    englishName: "Hebrews",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 13,
    aliases: ["he-bo-ro", "heboro", "he", "heb", "hebrews"],
  },
  {
    id: "JAS",
    bookNumber: 59,
    name: "Gia-cơ",
    shortName: "Gc",
    englishName: "James",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 5,
    aliases: ["gia-co", "giaco", "gc", "jas", "james"],
  },
  {
    id: "1PE",
    bookNumber: 60,
    name: "1 Phi-e-rơ",
    shortName: "1Pr",
    englishName: "1 Peter",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 5,
    aliases: ["1 phi-e-ro", "1 phiero", "1pr", "1pe", "1 peter"],
  },
  {
    id: "2PE",
    bookNumber: 61,
    name: "2 Phi-e-rơ",
    shortName: "2Pr",
    englishName: "2 Peter",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 3,
    aliases: ["2 phi-e-ro", "2 phiero", "2pr", "2pe", "2 peter"],
  },
  {
    id: "1JN",
    bookNumber: 62,
    name: "1 Giăng",
    shortName: "1Ga",
    englishName: "1 John",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 5,
    aliases: ["1 giang", "1ga", "1jn", "1 john"],
  },
  {
    id: "2JN",
    bookNumber: 63,
    name: "2 Giăng",
    shortName: "2Ga",
    englishName: "2 John",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 1,
    aliases: ["2 giang", "2ga", "2jn", "2 john"],
  },
  {
    id: "3JN",
    bookNumber: 64,
    name: "3 Giăng",
    shortName: "3Ga",
    englishName: "3 John",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 1,
    aliases: ["3 giang", "3ga", "3jn", "3 john"],
  },
  {
    id: "JUD",
    bookNumber: 65,
    name: "Giu-đe",
    shortName: "Gde",
    englishName: "Jude",
    testament: "NT",
    category: "epistle_general",
    totalChapters: 1,
    aliases: ["giu-de", "giude", "gde", "jud", "jude"],
  },

  // Tiên Tri Khải Huyền
  {
    id: "REV",
    bookNumber: 66,
    name: "Khải Huyền",
    shortName: "Kh",
    englishName: "Revelation",
    testament: "NT",
    category: "prophecy",
    totalChapters: 22,
    aliases: ["khai huyen", "kh", "rev", "revelation"],
  },
];

/**
 * Match a raw query string like "Giăng 3:16", "Thi Thiên 23", "Epheso 2:8-10"
 * Returns parsed { book, chapter, verseStart, verseEnd }
 */
export function parseScriptureQuery(query: string): {
  book: BibleBook | null;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return { book: null, chapter: 1 };
  }

  // Regex matches: [book name string] [chapter](:[verseStart](-[verseEnd])?)?
  // Examples: "giang 3:16", "thi thien 23", "1 corinthians 13:4-8", "epheso 2:8"
  const match = clean.match(/^([1-3]?\s*[^\d:]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);

  if (match) {
    const rawBookName = match[1].trim().replace(/\s+/g, " ");
    const chapter = parseInt(match[2], 10);
    const verseStart = match[3] ? parseInt(match[3], 10) : undefined;
    const verseEnd = match[4] ? parseInt(match[4], 10) : undefined;

    const book = findBibleBook(rawBookName);
    return {
      book,
      chapter: isNaN(chapter) ? 1 : chapter,
      verseStart,
      verseEnd,
    };
  }

  // If no chapter number given, check if it's just a book name
  const bookOnly = findBibleBook(clean);
  return {
    book: bookOnly,
    chapter: 1,
  };
}

export function findBibleBook(query: string): BibleBook | null {
  const clean = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  for (const b of BIBLE_BOOKS) {
    // Check aliases
    for (const alias of b.aliases) {
      const cleanAlias = alias
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

      if (clean === cleanAlias || clean.startsWith(cleanAlias + " ") || cleanAlias.startsWith(clean)) {
        return b;
      }
    }
  }

  return null;
}
