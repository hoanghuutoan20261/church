export interface StanzaLine {
  text: string;
  chords?: string; // Optional chords line or embedded
}

export interface SongStanza {
  id: string;
  label: string; // e.g. "Câu 1", "Điệp khúc", "Câu 2", "Bridge", "Kết"
  lines: string[];
  chordsLines?: string[];
}

export interface WorshipSong {
  id: string;
  number?: number | null; // e.g. 415 for TC 415
  title: string;
  originalTitle?: string;
  author: string;
  category: "traditional" | "contemporary" | "communion" | "praise" | "christmas";
  categoryName: string;
  defaultKey: string;
  tempo: string;
  timeSignature: string;
  theme: string;
  stanzas: SongStanza[];
}

// Semitone scale for transposition
const CHROMATIC_SCALE = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SHARP_MAP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

/**
 * Transpose a single chord (e.g. "G", "Am", "F#m7", "C/E", "Bbadd9")
 */
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;

  // Handle slash chord (e.g. C/E, G/B)
  if (chord.includes("/")) {
    const [root, bass] = chord.split("/");
    return `${transposeChord(root, semitones)}/${transposeChord(bass, semitones)}`;
  }

  // Regex to extract root note: A-G optional # or b
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const [, root, modifier] = match;

  let index = CHROMATIC_SCALE.indexOf(root);
  if (index === -1) {
    index = FLAT_SCALE.indexOf(root);
  }
  if (index === -1) return chord;

  const newIndex = (index + semitones + 24) % 12;
  return `${CHROMATIC_SCALE[newIndex]}${modifier}`;
}

/**
 * Transpose a full line of chords, preserving spaces
 */
export function transposeChordsLine(line: string, semitones: number): string {
  if (!line || semitones === 0) return line;
  return line.replace(/\b([A-G][#b]?(?:m|maj|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g, (c) =>
    transposeChord(c, semitones)
  );
}

export const HYMNS_DATABASE: WorshipSong[] = [
  {
    id: "tc-415",
    number: 415,
    title: "Tâm Linh Tôi Yên Ninh Thay",
    originalTitle: "It Is Well With My Soul",
    author: "Horatio G. Spafford / Philip P. Bliss (1873)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "C",
    tempo: "Trầm lắng, tin quyết (68 bpm)",
    timeSignature: "4/4",
    theme: "Bình An & Đức Tin",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Khi sống phẳng lặng như dòng sông xuôi dòng,",
          "Khi gặp đau thương ba đào dâng ngập lòng,",
          "Dù trong cảnh ngộ nào, Chúa dạy tôi ghi nhớ luôn:",
          "Linh hồn tôi yên ninh thay, an ninh thay!",
        ],
        chordsLines: [
          "C           G/B        Am     Am/G",
          "F           C/E        Dm7    G",
          "C      G/B       Am        F",
          "C/G    G7              C",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Tâm linh tôi, yên ninh thay!",
          "Linh hồn tôi, an ninh thay, an ninh thay!",
        ],
        chordsLines: [
          "      G                C",
          "      F       C/G      G       C",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Dầu Sa-tan dấy lên mưu hại trăm bề,",
          "Thử thách tư bề lòng chẳng hề sợ chi;",
          "Vì Đấng Christ thấy rõ cảnh khốn cùng tâm trí tôi,",
          "Ngài đổ huyết chuộc mua linh hồn tôi rồi.",
        ],
        chordsLines: [
          "C           G/B        Am     Am/G",
          "F           C/E        Dm7    G",
          "C      G/B       Am        F",
          "C/G    G7              C",
        ],
      },
      {
        id: "v3",
        label: "Câu 3",
        lines: [
          "Ôi phước hạnh thay niềm tin quyết tuyệt vời:",
          "Tội khiên tôi không còn vướng mắc đời đời;",
          "Mọi tội lỗi đóng đinh trên thập tự giá xưa rồi,",
          "Hỡi linh hồn ơi, hãy ngợi khen danh Ngài!",
        ],
        chordsLines: [
          "C           G/B        Am     Am/G",
          "F           C/E        Dm7    G",
          "C      G/B       Am        F",
          "C/G    G7              C",
        ],
      },
      {
        id: "v4",
        label: "Câu 4",
        lines: [
          "Và lạy Chúa, xin mau đến ngày quang vinh,",
          "Đức tin hóa mắt thấy Chúa ngự hiển vinh;",
          "Kèn rền vang, trời cuốn lại như cuốn sách kia,",
          "Chúa trở lại, tâm linh tôi yên ninh thay!",
        ],
        chordsLines: [
          "C           G/B        Am     Am/G",
          "F           C/E        Dm7    G",
          "C      G/B       Am        F",
          "C/G    G7              C",
        ],
      },
    ],
  },
  {
    id: "tc-280",
    number: 280,
    title: "Ơn Lạ Lùng",
    originalTitle: "Amazing Grace",
    author: "John Newton (1779)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "G",
    tempo: "Nhẹ nhàng, sâu lắng (72 bpm)",
    timeSignature: "3/4",
    theme: "Ân Điển & Cứu Rỗi",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Ơn lạ lùng thay ban xuống cho tôi,",
          "Kẻ khốn cùng được cứu rỗi;",
          "Xưa tôi lạc mất, nay tìm thấy rồi,",
          "Xưa đui mù, nay sáng tươi.",
        ],
        chordsLines: [
          "G          G7       C      G",
          "G          Em       Am     D",
          "G          G7       C      G",
          "Em         D        G",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Ơn lạ dẹp tan nỗi sợ trong lòng,",
          "Lòng tôi hằng ghi nhớ ơn;",
          "Quí giá dường bao khi mới tin Ngài,",
          "Giờ phút đầu tiên đón Cha.",
        ],
        chordsLines: [
          "G          G7       C      G",
          "G          Em       Am     D",
          "G          G7       C      G",
          "Em         D        G",
        ],
      },
      {
        id: "v3",
        label: "Câu 3",
        lines: [
          "Qua bao gian truân hiểm nguy trong đời,",
          "Tôi nay về nơi cõi trời;",
          "Ân điển dắt đưa an toàn tới bờ,",
          "Ân điển đưa tôi về nhà.",
        ],
        chordsLines: [
          "G          G7       C      G",
          "G          Em       Am     D",
          "G          G7       C      G",
          "Em         D        G",
        ],
      },
      {
        id: "v4",
        label: "Câu 4",
        lines: [
          "Khi ta ở nơi vinh quang muôn ngàn năm,",
          "Rực rỡ ngời như thái dương;",
          "Ta sẽ ngợi khen Chúa không ngớt lời,",
          "Hơn lúc ban đầu mới tin.",
        ],
        chordsLines: [
          "G          G7       C      G",
          "G          Em       Am     D",
          "G          G7       C      G",
          "Em         D        G",
        ],
      },
    ],
  },
  {
    id: "tc-23",
    number: 23,
    title: "Tôn Vinh Chân Thần",
    originalTitle: "Doxology (Praise God from Whom All Blessings Flow)",
    author: "Thomas Ken / Louis Bourgeois (1674)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "G",
    tempo: "Hùng tráng, uy nghi (80 bpm)",
    timeSignature: "4/4",
    theme: "Tôn Vinh Ba Ngôi",
    stanzas: [
      {
        id: "v1",
        label: "Lời Tôn Vinh",
        lines: [
          "Tôn vinh Chân Thần nguồn ơn vô đối,",
          "Dưới đất chúng sinh tụng ngợi khắp nơi;",
          "Trời cao cũng chung ca ngợi Ba Ngôi,",
          "Chúa Cha, Chúa Con cùng Linh muôn đời. A-men!",
        ],
        chordsLines: [
          "G      D     Em    C    G",
          "Em     Am    D     G",
          "G      Em    C     G    D",
          "Em     C     G     D    G   C  G",
        ],
      },
    ],
  },
  {
    id: "tc-26",
    number: 26,
    title: "Thành Tín Chúa Rất Lớn Thay",
    originalTitle: "Great Is Thy Faithfulness",
    author: "Thomas O. Chisholm / William M. Runyan (1923)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "D",
    tempo: "Thiết tha, vững chãi (76 bpm)",
    timeSignature: "3/4",
    theme: "Sự Thành Tín",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Thành tín Chúa rất lớn thay muôn đời bất biến,",
          "Không bóng đổi dời, lòng xót thương không phai;",
          "Ngài không hề thay dẫu đất trời dời đổi,",
          "Chúa xưa thế nào, nay vẫn y nguyên hoài.",
        ],
        chordsLines: [
          "D        G/D     A7          D",
          "G        D       E7          A",
          "A7       D       D7          G",
          "Em7      D/A     A7          D",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Thành tín Chúa rất lớn thay! Thành tín Chúa rất lớn thay!",
          "Mỗi buổi sáng mai ơn Ngài lại mới hoài;",
          "Mọi sự tôi cần, tay Chúa ban đầy đủ,",
          "Thành tín Chúa rất lớn thay, Chúa của lòng tôi!",
        ],
        chordsLines: [
          "A        D       B7         Em",
          "A7       D       E7         A",
          "A7       D       D7         G",
          "Em7      D/A     A7         D",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Mùa hè, đông, thu, xuân chuyển luân đều đặn mãi,",
          "Mặt trời, trăng, sao bay trên vòm trời cao;",
          "Đồng hiệp cùng vạn vật cất tiếng ngợi khen Chúa,",
          "Bởi sự thành tín thương yêu lớn là dường bao!",
        ],
        chordsLines: [
          "D        G/D     A7          D",
          "G        D       E7          A",
          "A7       D       D7          G",
          "Em7      D/A     A7          D",
        ],
      },
      {
        id: "v3",
        label: "Câu 3",
        lines: [
          "Tội tôi được tha, ban bình an thật bền vững,",
          "Sự hiện diện Chúa dắt lối từng ngày qua;",
          "Sức mới hôm nay, hy vọng mai ngời sáng,",
          "Phước hạnh ngập tràn bởi ân điển Chúa Cha!",
        ],
        chordsLines: [
          "D        G/D     A7          D",
          "G        D       E7          A",
          "A7       D       D7          G",
          "Em7      D/A     A7          D",
        ],
      },
    ],
  },
  {
    id: "tc-414",
    number: 414,
    title: "Neo Tôi Nơi Chúa",
    originalTitle: "Will Your Anchor Hold",
    author: "Priscilla J. Owens / William J. Kirkpatrick (1882)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "F",
    tempo: "Rộn rã, mạnh mẽ (92 bpm)",
    timeSignature: "4/4",
    theme: "Trông Cậy Chúa",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Dù phong ba bão táp gầm thét trong đời,",
          "Neo linh hồn anh có giữ vững được chăng?",
          "Khi thuyền chao đảo trước ngọn sóng ba đào,",
          "Liệu neo anh có giữ yên thuyền vượt qua?",
        ],
        chordsLines: [
          "F          Bb        F       C",
          "F          Bb        C7      F",
          "F          Bb        F       C",
          "F          Bb        C7      F",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Tôi có một chiếc neo vững an vô cùng,",
          "Giữ chắc linh hồn tôi giữa bão giông gầm!",
          "Móc sâu vào vầng Đá muôn đời vững bền,",
          "Nơi tình yêu Chúa không hề lung lay!",
        ],
        chordsLines: [
          "F          Bb        F       C",
          "F          Bb        C7      F",
          "Bb         F         C7      F",
          "Bb         F         C7      F",
        ],
      },
    ],
  },
  {
    id: "tc-1",
    number: 1,
    title: "Hỡi Môn Đồ Trung Tín",
    originalTitle: "O Come, All Ye Faithful (Adeste Fideles)",
    author: "John Francis Wade (1743)",
    category: "christmas",
    categoryName: "Giáng Sinh & Tạ Ơn",
    defaultKey: "G",
    tempo: "Hoan ca, rộn ràng (88 bpm)",
    timeSignature: "4/4",
    theme: "Giáng Sinh",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Hỡi môn đồ trung tín, vui mừng reo hân hoan,",
          "Mau cùng nhau đến chốn Bết-lê-hem quỳ tôn thờ;",
          "Đến ngắm Hài Nhi mới sinh nơi máng chiên nghèo,",
          "Nào cùng tôn thờ Vua Thánh, cùng tôn thờ Vua Thánh,",
          "Nào cùng tôn vinh Đấng Christ là Vua muôn loài!",
        ],
        chordsLines: [
          "G          D       G     D    G",
          "Em         D/F#    G     D",
          "G/B   C    G/D     D     G/B  C    G/D  D",
          "G          D       G     C    G/D  D    G",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Hỡi thiên thần ca hát, tưng bừng reo vang lừng,",
          "Khắp bầu trời thiên quốc cùng nhau hợp tiếng chúc tôn:",
          "Sáng danh Thiên Chúa ngự trên chốn cao vời!",
          "Nào cùng tôn thờ Vua Thánh, cùng tôn thờ Vua Thánh,",
          "Nào cùng tôn vinh Đấng Christ là Vua muôn loài!",
        ],
        chordsLines: [
          "G          D       G     D    G",
          "Em         D/F#    G     D",
          "G/B   C    G/D     D     G/B  C    G/D  D",
          "G          D       G     C    G/D  D    G",
        ],
      },
    ],
  },
  {
    id: "cp-howgreat",
    number: null,
    title: "Lớn Bấy Duy Ngài",
    originalTitle: "How Great Is Our God",
    author: "Chris Tomlin, Jesse Reeves, Ed Cash (2004)",
    category: "contemporary",
    categoryName: "Thờ Phượng Đương Đại",
    defaultKey: "G",
    tempo: "Uy nghi, ấm áp (78 bpm)",
    timeSignature: "4/4",
    theme: "Tôn Vinh Đức Chúa Trời",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Vua vinh hiển oai quyền, khoác áo sáng ngời vinh quang,",
          "Trái đất hãy reo mừng, muôn loài hãy reo mừng.",
          "Ngài bọc quanh ánh quang, bóng tối trốn chạy tan biến,",
          "Run rẩy trước tiếng Ngài, run rẩy trước tiếng Ngài.",
        ],
        chordsLines: [
          "G                      Em7",
          "                      C2",
          "                      D",
          "G                      Em7",
          "                      C2                   D",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Lớn bấy duy Ngài! Cùng ngợi khen Chúa lớn bấy thay!",
          "Muôn mắt sẽ thấy rằng Chúa lớn lao dường bao!",
        ],
        chordsLines: [
          "G                          Em7",
          "                C2         D          G",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Đời đời Ngài đứng vững, thời gian trong tay Ngài giữ,",
          "Khởi đầu và kết thúc, Alpha và Omega.",
          "Ba Ngôi hiệp một Đấng: Cha, Con và Thánh Linh,",
          "Là Sư Tử Giu-đa, Chiên Con thánh vô tội.",
        ],
        chordsLines: [
          "G                      Em7",
          "                      C2                   D",
          "G                      Em7",
          "                      C2                   D",
        ],
      },
      {
        id: "b1",
        label: "Bridge",
        lines: [
          "Danh vượt trên muôn danh, xứng đáng chúc tụng tôn vinh,",
          "Tâm linh tôi hát khen: Ngài vĩ đại dường bao!",
        ],
        chordsLines: [
          "G                       Em7",
          "               C2        D          G",
        ],
      },
    ],
  },
  {
    id: "cp-10000reasons",
    number: null,
    title: "10,000 Lý Do (Chúc Tôn Chúa Hỡi Linh Hồn Ta)",
    originalTitle: "10,000 Reasons (Bless The Lord)",
    author: "Matt Redman, Jonas Myrin (2011)",
    category: "contemporary",
    categoryName: "Thờ Phượng Đương Đại",
    defaultKey: "G",
    tempo: "Ngọt ngào, tự do (73 bpm)",
    timeSignature: "4/4",
    theme: "Ngợi Khen & Tạ Ơn",
    stanzas: [
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Chúc tôn Chúa, hỡi linh hồn ta, chúc tôn danh Ngài!",
          "Hãy hát lên với lòng tôn kính chân thành,",
          "Nguyện hòa lời ca mới dâng lên Chúa muôn loài,",
          "Hỡi linh hồn tôi, chúc tôn danh Ngài hoài!",
        ],
        chordsLines: [
          "C        G        D/F#     Em",
          "C        G        Dsus4    D",
          "C        Em       C   D    Em",
          "C        D        G",
        ],
      },
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Trời hừng đông lên, một ngày mới lại đến,",
          "Con cất tiếng hát chúc tôn danh Cha.",
          "Dù điều chi xảy đến, hay thử thách phía trước,",
          "Khi chiều dần buông con vẫn ca ngợi Ngài.",
        ],
        chordsLines: [
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        Dsus4    D",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Lòng Ngài chan chứa yêu thương, chậm cơn giận phẫn,",
          "Danh Chúa vĩ đại, tấm lòng từ ái bao la.",
          "Bởi sự nhân từ Chúa, con tìm thấy mười ngàn lý do,",
          "Mười ngàn lý do để ngợi tôn danh Ngài!",
        ],
        chordsLines: [
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        Dsus4    D",
        ],
      },
      {
        id: "v3",
        label: "Câu 3",
        lines: [
          "Và khi ngày ấy đến, sức con tàn mòn,",
          "Thời khắc cuối cùng trên đời điểm danh;",
          "Linh hồn con vẫn cất tiếng hát không ngừng nghỉ,",
          "Mười ngàn năm sau và cho đến đời đời!",
        ],
        chordsLines: [
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        D        Em",
          "C        G        Dsus4    D",
        ],
      },
    ],
  },
  {
    id: "cp-waymaker",
    number: null,
    title: "Đường Đi Chúa Mở",
    originalTitle: "Way Maker",
    author: "Sinach (2015)",
    category: "contemporary",
    categoryName: "Thờ Phượng Đương Đại",
    defaultKey: "C",
    tempo: "Mạnh mẽ, tôn cao (68 bpm)",
    timeSignature: "4/4",
    theme: "Quyền Năng & Phép Lạ",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Ngài đang ở đây, ngự giữa nơi này,",
          "Con tôn thờ Ngài, lòng con tôn thờ Ngài.",
          "Ngài đang ở đây, chữa lành tấm lòng vỡ tan,",
          "Con tôn thờ Ngài, lòng con tôn thờ Ngài.",
        ],
        chordsLines: [
          "F                        C",
          "G                        Am7",
          "F                        C",
          "G                        Am7",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Ngài là Đấng mở đường, làm nên phép lạ,",
          "Đấng giữ lời hứa, sự sáng trong nơi tối tăm,",
          "Chúa của con, Ngài là Đấng như vậy!",
        ],
        chordsLines: [
          "         F                        C",
          "         G                        Am7",
          "         F          G             C",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Ngài đang ở đây, chạm đến mọi đời sống,",
          "Con tôn thờ Ngài, lòng con tôn thờ Ngài.",
          "Ngài đang ở đây, xoay chuyển mọi hoàn cảnh,",
          "Con tôn thờ Ngài, lòng con tôn thờ Ngài.",
        ],
        chordsLines: [
          "F                        C",
          "G                        Am7",
          "F                        C",
          "G                        Am7",
        ],
      },
      {
        id: "b1",
        label: "Bridge",
        lines: [
          "Dẫu mắt không thấy, Ngài vẫn đang hành động,",
          "Dẫu không cảm nhận, Ngài vẫn đang làm việc;",
          "Ngài không ngừng hành động, Ngài không ngừng hành động!",
        ],
        chordsLines: [
          "F                        C",
          "G                        Am7",
          "F            C           G        Am7",
        ],
      },
    ],
  },
  {
    id: "cp-recklesslove",
    number: null,
    title: "Tình Yêu Tuyệt Đối",
    originalTitle: "Reckless Love",
    author: "Cory Asbury, Caleb Culver, Ran Jackson (2017)",
    category: "contemporary",
    categoryName: "Thờ Phượng Đương Đại",
    defaultKey: "G",
    tempo: "Sâu lắng, xúc động (68 bpm)",
    timeSignature: "6/8",
    theme: "Tình Yêu Chúa",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Trước khi con cất tiếng khóc chào đời, Ngài đã yêu con rồi,",
          "Ngài quá đỗi nhân từ đối với con.",
          "Trước khi con có hơi thở đầu tiên, Ngài đã thổi sự sống,",
          "Ngài quá đỗi tốt lành đối với con.",
        ],
        chordsLines: [
          "Em          D             C",
          "Em          D             C",
          "Em          D             C",
          "Em          D             C",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Ôi tình yêu Chúa quá đỗi diệu kỳ, không thôi tìm kiếm con,",
          "Để lại chín mươi chín con chiên kia, đuổi theo chỉ vì con.",
          "Con không xứng đáng, cũng chẳng thể tự mua lấy ơn Ngài,",
          "Thế nhưng Ngài đã phó chính thân Ngài vì con!",
        ],
        chordsLines: [
          "     Em          D                 C          G",
          "     Em          D                 C          G",
          "     Em          D                 C          G",
          "     Em          D                 C          G",
        ],
      },
      {
        id: "b1",
        label: "Bridge",
        lines: [
          "Không bóng tối nào Ngài chẳng thắp sáng,",
          "Không đỉnh núi nào Ngài chẳng trèo qua để đuổi theo con.",
          "Không bức tường nào Ngài chẳng phá đổ,",
          "Không lời dối trá nào Ngài chẳng bẻ gãy vì yêu con!",
        ],
        chordsLines: [
          "Em              D              C             G",
          "Em              D              C             G",
          "Em              D              C             G",
          "Em              D              C             G",
        ],
      },
    ],
  },
  {
    id: "cp-holyspirit",
    number: null,
    title: "Xin Thần Linh Chúa Đến",
    originalTitle: "Holy Spirit You Are Welcome Here",
    author: "Bryan & Katie Torwalt (2011)",
    category: "praise",
    categoryName: "Ca Ngợi & Cầu Nguyện",
    defaultKey: "D",
    tempo: "Êm dịu, khao khát (72 bpm)",
    timeSignature: "4/4",
    theme: "Đức Thánh Linh",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Chẳng có điều chi trên đời này sánh bằng,",
          "Chẳng có kho tàng nào thỏa mãn tâm can;",
          "Sự hiện diện Ngài là nguồn trông cậy sống,",
          "Ngự nơi đây lạy Chúa của con!",
        ],
        chordsLines: [
          "D                 G",
          "D                 G",
          "D                 G",
          "Em7               A",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Thánh Linh ôi xin Ngài ngự đến nơi này,",
          "Tràn ngập chốn đây vinh quang của Ngài.",
          "Lòng con khao khát được chìm đắm trong Ngài,",
          "Để vinh quang Chúa bao phủ nơi đây!",
        ],
        chordsLines: [
          "D",
          "G                      Em7",
          "D",
          "G                      Em7      A",
        ],
      },
    ],
  },
  {
    id: "cp-thankyoulord",
    number: null,
    title: "Tạ Ơn Cha",
    originalTitle: "Give Thanks (With a Grateful Heart)",
    author: "Henry Smith (1978)",
    category: "praise",
    categoryName: "Ca Ngợi & Cầu Nguyện",
    defaultKey: "F",
    tempo: "Tri ân, ấm áp (84 bpm)",
    timeSignature: "4/4",
    theme: "Tạ Ơn",
    stanzas: [
      {
        id: "v1",
        label: "Lời Bài Hát",
        lines: [
          "Tạ ơn Cha với cả tấm lòng chân thành,",
          "Tạ ơn Đấng Thánh Khiết nguồn ơn phước lành,",
          "Cảm tạ Cha đã ban Chúa Giê-xu Con Một Ngài.",
          "Giờ đây kẻ yếu đuối hãy nói: 'Tôi mạnh mẽ!'",
          "Kẻ nghèo thiếu hãy nói: 'Tôi giàu có!'",
          "Bởi những điều Chúa đã làm cho chính tôi, tạ ơn Cha!",
        ],
        chordsLines: [
          "F          C/E       Dm",
          "Am/C       Bb        F/A",
          "Eb                   Csus4   C",
          "Am         Dm        Gm7     C",
          "Am         Dm        Eb      Csus4   C",
          "F          Bb        F",
        ],
      },
    ],
  },
  {
    id: "tc-145",
    number: 145,
    title: "Đêm Yên Lặng",
    originalTitle: "Silent Night, Holy Night",
    author: "Joseph Mohr / Franz Gruber (1818)",
    category: "christmas",
    categoryName: "Giáng Sinh",
    defaultKey: "Bb",
    tempo: "Êm dịu, thánh thót (80 bpm)",
    timeSignature: "3/4",
    theme: "Chúa Giáng Sinh",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Đêm yên lặng, cảnh thanh tịnh,",
          "Mọi vật đều đang ngủ say;",
          "Kìa người mẹ thánh cùng Con trẻ dịu dàng,",
          "Con thơ thánh thiện tươi cười giữa máng cỏ rơm,",
          "An nghỉ nơi chốn bình an thiên đàng,",
          "An nghỉ nơi chốn bình an.",
        ],
        chordsLines: [
          "Bb",
          "F7            Bb",
          "Eb            Bb",
          "Eb            Bb",
          "F7            Bb",
          "Bb    F7      Bb",
        ],
      },
      {
        id: "v2",
        label: "Câu 2",
        lines: [
          "Đêm yên lặng, ánh sao ngời,",
          "Kìa đoàn mục đồng hãi kinh;",
          "Từ trời vinh hiển rực soi sáng cả đồi đồng,",
          "Thiên binh chúc tụng danh Cứu Chúa giáng trần,",
          "Chúa Cứu Thế nay đã ra đời!",
          "Chúa Cứu Thế nay đã ra đời!",
        ],
        chordsLines: [
          "Bb",
          "F7            Bb",
          "Eb            Bb",
          "Eb            Bb",
          "F7            Bb",
          "Bb    F7      Bb",
        ],
      },
    ],
  },
  {
    id: "tc-374",
    number: 374,
    title: "Nơi Gô-gô-tha",
    originalTitle: "At Calvary",
    author: "William R. Newell / Daniel B. Towner (1895)",
    category: "traditional",
    categoryName: "Thánh Ca Truyền Thống",
    defaultKey: "C",
    tempo: "Vui mừng, ngợi khen (96 bpm)",
    timeSignature: "4/4",
    theme: "Sự Cứu Rỗi & Thập Tự Giá",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Bao năm tôi đã sống trong hư vinh kiêu ngạo,",
          "Chẳng đoái hoài đến Chúa chết trên thập tự xưa;",
          "Nào hay Ngài chịu hình khổ vì cớ chính tôi,",
          "Nơi Gô-gô-tha đồi xưa.",
        ],
        chordsLines: [
          "C                     F         C",
          "G7                    C",
          "C                     F         C",
          "G7                    C",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Ơn Chúa rất lớn lao, lượng thứ tha khôn lường,",
          "Ân điển tuôn tràn lai láng cho tôi!",
          "Tâm linh tôi tìm được sự tự do thái an,",
          "Nơi Gô-gô-tha đồi xưa!",
        ],
        chordsLines: [
          "F                     C",
          "G7                    C",
          "F                     C",
          "G7                    C",
        ],
      },
    ],
  },
  {
    id: "cp-goodness",
    title: "Lòng Nhân Từ Chúa",
    originalTitle: "Goodness of God",
    author: "Jenn Johnson / Bethel Music (2019)",
    category: "contemporary",
    categoryName: "Thờ Phượng Hiện Đại",
    defaultKey: "Ab",
    tempo: "Sâu lắng, biết ơn (68 bpm)",
    timeSignature: "4/4",
    theme: "Tạ Ơn & Thành Tín",
    stanzas: [
      {
        id: "v1",
        label: "Câu 1",
        lines: [
          "Tôi yêu mến Ngài, ơn thương xót Chúa không hề dứt,",
          "Mỗi tháng ngày qua đời tôi nắm trong tay Ngài;",
          "Từ lúc ban mai tôi thức giấc cho đến khi màn đêm buông,",
          "Tôi sẽ hát tôn vinh lòng nhân từ Chúa!",
        ],
        chordsLines: [
          "Ab           Db/Ab      Ab",
          "Eb/G         Fm         Db      Eb",
          "Db           Ab/C       Fm      Db",
          "Db/Eb        Ab",
        ],
      },
      {
        id: "c1",
        label: "Điệp khúc",
        lines: [
          "Trọn cả đời tôi Chúa luôn thành tín,",
          "Trọn cả đời tôi Chúa luôn tốt lành!",
          "Từng hơi thở trong tôi Chúa ban cho tôi ngày nay,",
          "Tôi sẽ hát tôn vinh lòng nhân từ Chúa!",
        ],
        chordsLines: [
          "Db                   Ab",
          "Db                   Ab      Eb",
          "Db                   Ab/C    Fm",
          "Db           Eb      Ab",
        ],
      },
    ],
  },
];

export function findSong(query: string): WorshipSong | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // Check if number
  const num = parseInt(clean.replace(/\D/g, ""), 10);
  if (!isNaN(num)) {
    const foundByNum = HYMNS_DATABASE.find((s) => s.number === num);
    if (foundByNum) return foundByNum;
  }

  // Check title
  const found = HYMNS_DATABASE.find(
    (s) =>
      s.title.toLowerCase().includes(clean) ||
      (s.originalTitle && s.originalTitle.toLowerCase().includes(clean)) ||
      s.id.toLowerCase() === clean
  );
  return found || null;
}
