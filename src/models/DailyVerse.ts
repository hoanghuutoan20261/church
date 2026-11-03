import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyVerse extends Document {
  date: string; // YYYY-MM-DD
  verse: string;
  reference: string;
  topic?: string;
  imageUrl?: string;
  isCustom: boolean; // true if superadmin overrode it manually
  isPinned?: boolean; // if true, pinned regardless of date
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyVerseSchema = new Schema<IDailyVerse>(
  {
    date: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    verse: {
      type: String,
      required: [true, "Nội dung câu Kinh Thánh là bắt buộc"],
      trim: true,
    },
    reference: {
      type: String,
      required: [true, "Địa hạt câu Kinh Thánh là bắt buộc"],
      trim: true,
    },
    topic: {
      type: String,
      default: "Nuôi Dưỡng Tâm Linh",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      default: "Hệ thống tự động",
    },
  },
  {
    timestamps: true,
  }
);

export const DailyVerse: Model<IDailyVerse> =
  mongoose.models.DailyVerse || mongoose.model<IDailyVerse>("DailyVerse", DailyVerseSchema);
