import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPostComment {
  _id?: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: Date;
}

export type PostCategory =
  | "announcement"
  | "scripture"
  | "devotion"
  | "sermon"
  | "fellowship";

export interface IPost extends Document {
  churchId: mongoose.Types.ObjectId;
  churchSlug: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  category: PostCategory;
  title: string;
  content: string;
  scriptureVerse?: string;
  imageUrl?: string;
  videoUrl?: string;
  isPinned: boolean;
  likesCount: number;
  comments: IPostComment[];
  createdAt: Date;
  updatedAt: Date;
}

const PostCommentSchema = new Schema<IPostComment>(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
      default: "Tín Hữu",
    },
    authorRole: {
      type: String,
      default: "Thành viên",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const PostSchema = new Schema<IPost>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: "Church",
      required: true,
      index: true,
    },
    churchSlug: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    author: {
      name: {
        type: String,
        required: true,
        default: "Ban Truyền Thông Hội Thánh",
      },
      role: {
        type: String,
        default: "Quản Trị Viên",
      },
      avatarUrl: {
        type: String,
        default: "",
      },
    },
    category: {
      type: String,
      enum: ["announcement", "scripture", "devotion", "sermon", "fellowship"],
      default: "announcement",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề bài viết là bắt buộc"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Nội dung bài viết là bắt buộc"],
    },
    scriptureVerse: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [PostCommentSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast chronological sorting and pinned prioritization
PostSchema.index({ churchSlug: 1, isPinned: -1, createdAt: -1 });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
