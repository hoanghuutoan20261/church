import { NextRequest, NextResponse } from "next/server";
import {
  BIBLE_BOOKS,
  findBibleBook,
  parseScriptureQuery,
} from "@/data/bibleBooks";
import { getChapterVerses } from "@/data/bibleDataset";

export const dynamic = "force-dynamic";

// GET /api/bible?book=PSA&chapter=23&version=BTT
// OR /api/bible?q=Giang%203:16
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const rawBook = searchParams.get("book") || "";
    const rawChapter = searchParams.get("chapter");
    const version = (searchParams.get("version") || "BTT 1925").toUpperCase();

    let book = null;
    let chapter = 1;
    let verseStart: number | undefined = undefined;
    let verseEnd: number | undefined = undefined;

    // 1. If raw search query provided (e.g. "Giăng 3:16" or "Thi Thiên 23")
    if (query.trim()) {
      const parsed = parseScriptureQuery(query);
      book = parsed.book;
      chapter = parsed.chapter;
      verseStart = parsed.verseStart;
      verseEnd = parsed.verseEnd;
    }

    // 2. Fallback to book and chapter params
    if (!book && rawBook.trim()) {
      book = findBibleBook(rawBook);
      if (rawChapter) {
        chapter = parseInt(rawChapter, 10) || 1;
      }
    }

    // 3. Default to Psalms 23 if not found
    if (!book) {
      book = BIBLE_BOOKS.find((b) => b.id === "PSA") || BIBLE_BOOKS[18];
      chapter = 23;
    }

    // Constrain chapter within totalChapters
    if (chapter < 1) chapter = 1;
    if (chapter > book.totalChapters) chapter = book.totalChapters;

    // 4. Fetch verses from local dataset
    const rawVerses = getChapterVerses(book.id, chapter, book.name);

    // Map according to selected version
    const verses = rawVerses.map((v) => {
      let text = v.text;
      if (version.includes("BDM") || version.includes("2011")) {
        text = v.textBdm || v.text;
      } else if (version.includes("NIV") || version.includes("ENG")) {
        text = v.textNiv || v.text;
      }

      return {
        verse: v.verse,
        text,
        textBtt: v.text,
        textBdm: v.textBdm || v.text,
        textNiv: v.textNiv || "",
      };
    });

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        name: book.name,
        shortName: book.shortName,
        englishName: book.englishName,
        testament: book.testament,
        category: book.category,
        totalChapters: book.totalChapters,
      },
      chapter,
      version,
      verseStart,
      verseEnd,
      verses,
    });
  } catch (error: any) {
    console.error("GET /api/bible error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tra cứu Kinh Thánh" },
      { status: 500 }
    );
  }
}
