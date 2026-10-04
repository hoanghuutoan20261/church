import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThemeConfig {
  accentColor?: string;
  logoUrl?: string;
}

export interface IBankingConfig {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
}

export interface ICurrentService {
  title: string;
  speaker: string;
  speakerTitle: string;
  scriptureReference: string;
  welcomeMessage: string;
  isLive: boolean;
  viewersCount: number;
}

export interface IProfileConfig {
  coverImageUrl?: string;
  avatarUrl?: string;
  about?: string;
  leadPastor?: string;
  contactPhone?: string;
  contactEmail?: string;
  slogan?: string;
}

export interface ILiveLyrics {
  isEnabled: boolean;
  songId?: string;
  songNumber?: number | null;
  songTitle?: string;
  originalTitle?: string;
  stanzaIndex?: number;
  stanzaLabel?: string;
  lines?: string[];
  displayType?: "hymn" | "scripture";
  referenceTranslation?: string;
  layoutMode?: "lowerthird" | "subtitle" | "fullscreen";
  themeStyle?: "gold" | "white" | "teal" | "amber";
  updatedAt?: Date;
}

export interface IWorshipScheduleItem {
  id?: string;
  title: string;
  dayOfWeek: string;
  time: string;
  type?: string;
  description?: string;
}

export interface IChurch extends Document {
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  themeConfig: IThemeConfig;
  bankingConfig: IBankingConfig;
  profileConfig?: IProfileConfig;
  currentService?: ICurrentService;
  liveLyrics?: ILiveLyrics;
  liveSchedule: string;
  worshipSchedules?: IWorshipScheduleItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChurchSchema = new Schema<IChurch>(
  {
    name: {
      type: String,
      required: [true, "Tên Hội Thánh là bắt buộc"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Mã định danh slug là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    denomination: {
      type: String,
      default: "Tin Lành Việt Nam",
      trim: true,
    },
    address: {
      type: String,
      default: "Việt Nam",
      trim: true,
    },
    streamKey: {
      type: String,
      required: [true, "Stream key là bắt buộc"],
      unique: true,
      trim: true,
    },
    themeConfig: {
      accentColor: {
        type: String,
        default: "#c5a059",
      },
      logoUrl: {
        type: String,
        default: "",
      },
    },
    bankingConfig: {
      bankName: {
        type: String,
        default: "MB Bank",
      },
      accountNumber: {
        type: String,
        default: "0386888999",
      },
      accountHolder: {
        type: String,
        default: "HOI THANH TIN LANH",
      },
      branch: {
        type: String,
        default: "Việt Nam",
      },
    },
    liveSchedule: {
      type: String,
      default: "Chúa Nhật, 09:00 - 11:15",
    },
    worshipSchedules: [
      {
        title: { type: String, trim: true, default: "Lễ Thờ Phượng Chúa Nhật" },
        dayOfWeek: { type: String, trim: true, default: "Chúa Nhật" },
        time: { type: String, trim: true, default: "09:00 - 11:15" },
        type: { type: String, default: "main" },
        description: { type: String, trim: true, default: "Trực tiếp & Online" },
      },
    ],
    profileConfig: {
      coverImageUrl: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1548625361-195972886a86?auto=format&fit=crop&w=1920&q=80",
      },
      avatarUrl: {
        type: String,
        default: "",
      },
      about: {
        type: String,
        default:
          "Chào mừng bạn đến với trang thông tin chính thức của Hội Thánh. Nơi cùng nhau thờ phượng Chúa, gây dựng đức tin và kết nối yêu thương trong Đấng Christ.",
      },
      leadPastor: {
        type: String,
        default: "Mục sư Quản Nhiệm",
      },
      contactPhone: {
        type: String,
        default: "028 3822 5566",
      },
      contactEmail: {
        type: String,
        default: "mucvu@hoithanh.vn",
      },
      slogan: {
        type: String,
        default: "Hiệp Một — Yêu Thương — Phụng Sự",
      },
    },
    currentService: {
      title: {
        type: String,
        default: "Lễ Thờ Phượng Chúa Nhật — 'Bước Đi Trong Ân Điển'",
      },
      speaker: {
        type: String,
        default: "Mục sư Quản Nhiệm",
      },
      speakerTitle: {
        type: String,
        default: "Diễn giả",
      },
      scriptureReference: {
        type: String,
        default: "Ê-phê-sô 2:8–10",
      },
      welcomeMessage: {
        type: String,
        default:
          "Chào mừng quý ông bà anh chị em hiệp một thờ phượng Chúa sáng nay. Nguyện xin sự bình an và ân điển của Ba Ngôi Đức Chúa Trời ở cùng hết thảy chúng ta.",
      },
      isLive: {
        type: Boolean,
        default: false,
      },
      viewersCount: {
        type: Number,
        default: 0,
      },
    },
    liveLyrics: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      songId: {
        type: String,
        default: "",
      },
      songNumber: {
        type: Number,
        default: null,
      },
      songTitle: {
        type: String,
        default: "",
      },
      originalTitle: {
        type: String,
        default: "",
      },
      stanzaIndex: {
        type: Number,
        default: 0,
      },
      stanzaLabel: {
        type: String,
        default: "",
      },
      lines: {
        type: [String],
        default: [],
      },
      displayType: {
        type: String,
        default: "hymn",
      },
      referenceTranslation: {
        type: String,
        default: "BTT 1925",
      },
      layoutMode: {
        type: String,
        default: "lowerthird",
      },
      themeStyle: {
        type: String,
        default: "gold",
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite in dev reload
export const Church: Model<IChurch> =
  mongoose.models.Church || mongoose.model<IChurch>("Church", ChurchSchema);

export default Church;
