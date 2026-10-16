import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  senderName: string;
  contact?: string;
  role: "believer" | "pastor" | "tech_team" | "visitor";
  category: "suggestion" | "bug" | "ui_ux" | "church_support" | "compliment";
  rating: number;
  message: string;
  churchSlug?: string;
  pageUrl?: string;
  status: "new" | "reviewed" | "resolved";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    senderName: {
      type: String,
      default: "Tín hữu / Khách thăm",
      trim: true,
    },
    contact: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["believer", "pastor", "tech_team", "visitor"],
      default: "believer",
    },
    category: {
      type: String,
      enum: ["suggestion", "bug", "ui_ux", "church_support", "compliment"],
      default: "suggestion",
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    message: {
      type: String,
      required: [true, "Nội dung góp ý là bắt buộc"],
      trim: true,
    },
    churchSlug: {
      type: String,
      default: "system",
      trim: true,
    },
    pageUrl: {
      type: String,
      default: "/",
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "resolved"],
      default: "new",
      index: true,
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
