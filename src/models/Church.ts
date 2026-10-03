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

export interface IChurch extends Document {
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  themeConfig: IThemeConfig;
  bankingConfig: IBankingConfig;
  liveSchedule: string;
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
