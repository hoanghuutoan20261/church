import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISalvationDecision extends Document {
  churchSlug: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  hasPrayed: boolean;
  serviceTheme: string;
  status: "pending_pastoral_care" | "contacted" | "discipleship";
  createdAt: Date;
  updatedAt: Date;
}

const SalvationDecisionSchema = new Schema<ISalvationDecision>(
  {
    churchSlug: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "Chưa rõ",
    },
    hasPrayed: {
      type: Boolean,
      default: true,
    },
    serviceTheme: {
      type: String,
      default: "Thờ Phượng Chúa Nhật",
    },
    status: {
      type: String,
      enum: ["pending_pastoral_care", "contacted", "discipleship"],
      default: "pending_pastoral_care",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SalvationDecision: Model<ISalvationDecision> =
  mongoose.models.SalvationDecision ||
  mongoose.model<ISalvationDecision>("SalvationDecision", SalvationDecisionSchema);

export default SalvationDecision;
