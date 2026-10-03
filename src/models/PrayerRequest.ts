import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrayerRequest extends Document {
  churchSlug: string;
  name: string;
  isAnonymous: boolean;
  contact?: string;
  wantsPastorCall: boolean;
  category: string;
  confidentialLevel: "pastor_only" | "prayer_team";
  prayerContent: string;
  status: "new" | "praying" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const PrayerRequestSchema = new Schema<IPrayerRequest>(
  {
    churchSlug: {
      type: String,
      required: [true, "Mã Hội Thánh là bắt buộc"],
      index: true,
      trim: true,
    },
    name: {
      type: String,
      default: "Con cái Chúa (Ẩn danh)",
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: String,
      default: null,
      trim: true,
    },
    wantsPastorCall: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "Sức khỏe & Chữa lành",
      trim: true,
    },
    confidentialLevel: {
      type: String,
      enum: ["pastor_only", "prayer_team"],
      default: "pastor_only",
    },
    prayerContent: {
      type: String,
      required: [true, "Nội dung lời cầu thay là bắt buộc"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "praying", "completed"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PrayerRequest: Model<IPrayerRequest> =
  mongoose.models.PrayerRequest ||
  mongoose.model<IPrayerRequest>("PrayerRequest", PrayerRequestSchema);

export default PrayerRequest;
