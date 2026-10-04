import { NextRequest, NextResponse } from "next/server";
import {
  BIBLE_BOOKS,
  findBibleBook,
  parseScriptureQuery,
} from "@/data/bibleBooks";
import {
  FOUNDATIONAL_CHAPTERS,
  getChapterVerses,
  getVerseTextByTranslation,
} from "@/data/bibleDataset";
import {
  BIBLE_TRANSLATIONS,
  getTranslationInfo,
} from "@/data/bibleTranslations";

export const dynamic = "force-dynamic";

// In-memory cache for remote fetched chapters: key = `${bollsCode}_${bookNumber}_${chapter}`
const remoteChapterCache = new Map<string, { verse: number; text: string }[]>();

async function fetchRemoteChapter(
  bollsCode: string,
  bookNumber: number,
  chapter: number
): Promise<{ verse: number; text: string }[] | null> {
  const cacheKey = `${bollsCode}_${bookNumber}_${chapter}`;
  if (remoteChapterCache.has(cacheKey)) {
    return remoteChapterCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);
    const res = await fetch(
      `https://bolls.life/get-chapter/${bollsCode}/${bookNumber}/${chapter}/`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const cleanVerses = data.map((item: any) => ({
      verse: Number(item.verse),
      text: (item.text || "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    }));

    remoteChapterCache.set(cacheKey, cleanVerses);
    return cleanVerses;
  } catch {
    return null;
  }
}

// GET /api/bible?book=PSA&chapter=23&version=BTT&secondaryVersion=NIV
// OR /api/bible?q=Giang%203:16&bilingual=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Return translations catalog if requested
    if (searchParams.get("listTranslations") === "true") {
      return NextResponse.json({
        success: true,
        translations: BIBLE_TRANSLATIONS,
      });
    }

    const query = searchParams.get("q") || searchParams.get("query") || "";
    const rawBook = searchParams.get("book") || "";
    const rawChapter = searchParams.get("chapter");
    const rawVersion = searchParams.get("version") || "BTT";
    const rawSecondary = searchParams.get("secondaryVersion") || "";
    const isBilingual =
      searchParams.get("bilingual") === "true" || !!rawSecondary.trim();

    let book = null;
    let chapter = 1;
    let verseStart: number | undefined = undefined;
    let verseEnd: number | undefined = undefined;

    // 1. If raw search query provided (e.g. "Giăng 3:16-17" or "Thi Thiên 23")
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

    // Constrain chapter within book range
    if (chapter < 1) chapter = 1;
    if (chapter > book.totalChapters) chapter = book.totalChapters;

    const primaryTrans = getTranslationInfo(rawVersion);
    const secondaryTrans = isBilingual
      ? getTranslationInfo(rawSecondary || "NIV")
      : null;

    // Helper to resolve verses for a specific translation
    const resolveVersesForTranslation = async (trans: typeof primaryTrans) => {
      const key = `${book!.id}_${chapter}`;
      const localChapter = FOUNDATIONAL_CHAPTERS[key];

      // 1. Try remote API first if translation has bollsCode (gives authentic full 66 books text)
      if (trans.bollsCode) {
        const remote = await fetchRemoteChapter(
          trans.bollsCode,
          book!.bookNumber,
          chapter
        );
        if (remote && remote.length > 0) {
          return remote;
        }
      }

      // 2. If foundational chapter exists locally
      if (localChapter && localChapter.length > 0) {
        return localChapter.map((v) => ({
          verse: v.verse,
          text: getVerseTextByTranslation(v, trans.id),
        }));
      }

      // 3. Fallback to local chapter generator
      const fallback = getChapterVerses(book!.id, chapter, book!.name);
      return fallback.map((v) => ({
        verse: v.verse,
        text: getVerseTextByTranslation(v, trans.id),
      }));
    }

    const [primaryVerses, secondaryVerses] = await Promise.all([
      resolveVersesForTranslation(primaryTrans),
      secondaryTrans
        ? resolveVersesForTranslation(secondaryTrans)
        : Promise.resolve(null),
    ]);

    // Build verses list with primary and secondary texts
    const verses = primaryVerses.map((pv) => {
      const sv = secondaryVerses?.find((s) => s.verse === pv.verse);
      const secondaryText = sv ? sv.text.replace(/^[“"']+|[”"']+$/g, "").trim() : undefined;
      return {
        verse: pv.verse,
        text: pv.text,
        secondaryText,
        bilingualText: secondaryText
          ? `[${pv.verse}] ${pv.text}\n“${secondaryText}”`
          : `[${pv.verse}] ${pv.text}`,
      };
    });

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        bookNumber: book.bookNumber,
        name: book.name,
        shortName: book.shortName,
        englishName: book.englishName,
        testament: book.testament,
        category: book.category,
        totalChapters: book.totalChapters,
      },
      chapter,
      primaryTranslation: {
        id: primaryTrans.id,
        name: primaryTrans.name,
        shortName: primaryTrans.shortName,
        language: primaryTrans.language,
        badge: primaryTrans.badge,
      },
      secondaryTranslation: secondaryTrans
        ? {
            id: secondaryTrans.id,
            name: secondaryTrans.name,
            shortName: secondaryTrans.shortName,
            language: secondaryTrans.language,
            badge: secondaryTrans.badge,
          }
        : null,
      isBilingual: !!secondaryTrans,
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
