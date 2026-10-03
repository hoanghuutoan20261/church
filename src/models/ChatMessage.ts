import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  churchSlug: string;
  sender: string;
  role: "pastor" | "moderator" | "elder" | "member";
  location?: string;
  text: string;
  timestamp: string;
  isAmenOnly: boolean;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    churchSlug: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["pastor", "moderator", "elder", "member"],
      default: "member",
    },
    location: {
      type: String,
      default: "Trực tuyến",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    isAmenOnly: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
