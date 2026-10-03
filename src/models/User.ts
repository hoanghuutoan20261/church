import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "pastor" | "tech_leader" | "moderator" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  churchSlug: string;
  churchId: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Họ và tên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email đăng nhập là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["pastor", "tech_leader", "moderator", "admin"],
      default: "pastor",
    },
    churchSlug: {
      type: String,
      required: [true, "Mã định danh Hội Thánh là bắt buộc"],
      lowercase: true,
      trim: true,
      index: true,
    },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: "Church",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
