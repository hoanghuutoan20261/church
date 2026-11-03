// Default Daily Scriptures Library for Vietnamese Protestant Churches
// Provides deterministic automatic rotation every day of the year

export interface DefaultVerseItem {
  reference: string;
  verse: string;
  topic: string;
  imageUrl?: string;
}

export const DEFAULT_SCRIPTURE_VERSES: DefaultVerseItem[] = [
  {
    reference: "Thi-thiên 23:1-2",
    verse: "Đức Giê-hô-va là Đấng chăn giữ tôi: tôi chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.",
    topic: "Bình An & An Nghỉ",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Giăng 14:27",
    verse: "Ta để sự bình an lại cho các ngươi; Ta ban sự bình an của Ta cho các ngươi. Ta cho các ngươi sự bình an chẳng phải như thế gian cho. Lòng các ngươi chớ hề bối rối và đừng sợ hãi.",
    topic: "Sự Bình An Thật",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Phi-líp 4:6-7",
    verse: "Chớ lo phiền chi hết, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài xin, và sự tạ ơn mà trình các sự cầu xin của mình cho Đức Chúa Trời.",
    topic: "Trao Phó Lo Âu",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Rô-ma 8:28",
    verse: "Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.",
    topic: "Ý Muốn Tốt Lành",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Ca-thương 3:22-23",
    verse: "Ấy là nhờ sự nhân từ Đức Giê-hô-va mà chúng ta chưa tuyệt; vì sự thương xót của Ngài chẳng dứt. Mỗi buổi sớm mai lại mới luôn, sự thành tín Ngài là lớn lắm.",
    topic: "Ơn Mới Mỗi Sớm Mai",
    imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Châm-ngôn 3:5-6",
    verse: "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con; phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.",
    topic: "Dẫn Đường Chỉ Lối",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Ê-sai 40:31",
    verse: "Nhưng ai trông đợi Đức Giê-hô-va thì chắc được sức mới, cất cánh bay cao như chim ưng; chạy mà không mệt nhọc, đi mà không mòn mỏi.",
    topic: "Sức Mới Thiên Thượng",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Giăng 3:16",
    verse: "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
    topic: "Tình Yêu Vĩ Đại",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Giô-suê 1:9",
    verse: "Hãy vững lòng bền chí, chớ run sợ, chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ở cùng ngươi trong mọi nơi ngươi đi.",
    topic: "Can Đảm Trong Đức Tin",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Thi-thiên 46:1",
    verse: "Đức Chúa Trời là nơi nương náu và sức lực của chúng tôi, Ngài hằng giúp đỡ trong cơn hoạn nạn.",
    topic: "Nơi Nương Náu",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Ma-thi-ơ 11:28",
    verse: "Hỡi những kẻ mệt mỏi và gánh nặng, hãy đến cùng Ta, Ta sẽ cho các ngươi được yên nghỉ.",
    topic: "Sự Yên Nghỉ Thuộc Linh",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "2 Cô-rinh-tô 12:9",
    verse: "Ân điển Ta đủ cho ngươi rồi, vì sức mạnh của Ta nên trọn vẹn trong sự yếu đuối.",
    topic: "Ân Điển Dư Dật",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Thi-thiên 119:105",
    verse: "Lời Chúa là ngọn đèn cho chân tôi, ánh sáng cho đường lối tôi.",
    topic: "Ánh Sáng Lời Chúa",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Gia-cơ 1:5",
    verse: "Ví bằng trong anh em có kẻ thiếu sự khôn ngoan, hãy cầu xin Đức Chúa Trời, là Đấng ban cho mọi người cách rộng rãi, không trách móc ai, thì sẽ được ban cho.",
    topic: "Sự Khôn Ngoan",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "1 Tê-sa-lô-ni-ca 5:16-18",
    verse: "Hãy vui mừng mãi mãi, cầu nguyện không thôi, phàm việc gì cũng phải tạ ơn Chúa; vì bấy nhiêu âu là ý muốn của Đức Chúa Trời trong Đức Chúa Jêsus Christ đối với anh em.",
    topic: "Lòng Biết Ơn",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Thi-thiên 91:1-2",
    verse: "Người nào ngụ nơi kín đáo của Đấng Chí Cao, sẽ được hằng ở dưới bóng của Đấng Toàn Năng. Tôi nói về Đức Giê-hô-va rằng: Ngài là nơi nương náu tôi, và là đồn lũy tôi; cũng là Đức Chúa Trời tôi, tôi tin cậy nơi Ngài.",
    topic: "Sự Bảo Phủ Của Chúa",
    imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Rô-ma 12:2",
    verse: "Đừng làm theo đời này, nhưng hãy biến hóa bởi sự đổi mới của tâm thần mình, để thử cho biết ý muốn tốt lành, đẹp lòng và trọn vẹn của Đức Chúa Trời là thể nào.",
    topic: "Đổi Mới Tâm Trí",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Thi-thiên 27:1",
    verse: "Đức Giê-hô-va là ánh sáng và là sự cứu rỗi tôi: tôi sẽ sợ ai? Đức Giê-hô-va là đồn lũy của mạng sống tôi: tôi sẽ hãi hùng ai?",
    topic: "Đức Tin Vững Vàng",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Ma-thi-ơ 6:33",
    verse: "Nhưng trước hết, hãy tìm kiếm nước Đức Chúa Trời và sự công bình của Ngài, thì Ngài sẽ cho thêm các ngươi mọi điều ấy nữa.",
    topic: "Ưu Tiên Nước Chúa",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Ê-sai 41:10",
    verse: "Đừng sợ, vì Ta ở với ngươi; chớ kinh khiếp, vì Ta là Đức Chúa Trời ngươi! Ta sẽ làm cho ngươi mạnh mẽ; phải, Ta sẽ giúp đỡ ngươi, lấy tay hữu công bình Ta mà nâng đỡ ngươi.",
    topic: "Chúa Ở Cùng Ngươi",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Thi-thiên 37:4-5",
    verse: "Cũng hãy khoái lạc nơi Đức Giê-hô-va, thì Ngài sẽ ban cho ngươi điều lòng mình ao ước. Hãy phó thác đường lối mình cho Đức Giê-hô-va, và nhờ cậy nơi Ngài, thì Ngài sẽ làm thành việc ấy.",
    topic: "Khoái Lạc Nơi Chúa",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    reference: "Hê-bơ-rơ 11:1",
    verse: "Vả, đức tin là sự biết chắc vững vàng của những điều mình đang trông mong, là bằng cớ của những điều mình chẳng xem thấy.",
    topic: "Bản Chất Đức Tin",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
];

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns deterministic verse based on date.
 * Every single day of the year gets a designated verse automatically without any admin work.
 */
export function getAutoDailyVerse(targetDate = new Date()): DefaultVerseItem & { date: string } {
  const dateStr = formatDateToISO(targetDate);
  const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DEFAULT_SCRIPTURE_VERSES.length;
  const item = DEFAULT_SCRIPTURE_VERSES[index];

  return {
    ...item,
    date: dateStr,
  };
}
