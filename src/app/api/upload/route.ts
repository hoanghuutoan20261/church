import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

export async function POST(req: NextRequest) {
  try {
    // Allow authenticated user; also allow upload if session cookie is present
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Yêu cầu đăng nhập tài khoản quản trị để tải ảnh lên hệ thống.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawType = (formData.get("type") as string) || "general";
    const type = ["avatar", "cover", "post", "general"].includes(rawType)
      ? rawType
      : "general";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tệp tin tải lên." },
        { status: 400 }
      );
    }

    // Check File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Kích thước tệp tin vượt quá giới hạn cho phép (${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB).`,
        },
        { status: 400 }
      );
    }

    // Check MIME type or file extension (mobile browsers sometimes omit file.type)
    const isImageMime = file.type && file.type.startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|webp|gif|heic|heif|bmp|svg|avif)$/i.test(
      file.name || ""
    );
    if (!isImageMime && !isImageExt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tệp tin tải lên phải là hình ảnh hợp lệ (JPEG, PNG, WebP, GIF...).",
        },
        { status: 400 }
      );
    }

    const originalSize = file.size;
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Generate safe, unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const outputFilename = `${type}_${timestamp}_${randomSuffix}.webp`;

    let processedBuffer: Buffer;
    let outputMime = "image/webp";

    // Apply Sharp compression & resizing according to image purpose
    try {
      let sharpInstance = sharp(rawBuffer).rotate(); // auto-orient EXIF from mobile camera

      if (type === "avatar") {
        sharpInstance = sharpInstance.resize(400, 400, {
          fit: "cover",
          position: "center",
        });
      } else if (type === "cover") {
        sharpInstance = sharpInstance.resize(1600, 720, {
          fit: "inside",
          withoutEnlargement: true,
        });
      } else {
        // Post or general image
        sharpInstance = sharpInstance.resize(1280, 1280, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      processedBuffer = await sharpInstance
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
    } catch {
      processedBuffer = rawBuffer;
      outputMime = file.type || "image/webp";
    }

    // 1. Save to disk if filesystem is writable (local / VPS)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const outputPath = path.join(uploadDir, outputFilename);
      await fs.writeFile(outputPath, processedBuffer);
    } catch (fsErr) {
      console.warn("Notice: Could not write to public/uploads (using Data URL):", fsErr);
    }

    // 2. Build self-contained Data URL so the image ALWAYS displays on every environment
    // (avoids Next.js production static 404, container restarts, or read-only filesystems)
    const dataUrl = `data:${outputMime};base64,${processedBuffer.toString("base64")}`;
    const fileUrl = `/uploads/${outputFilename}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileUrl,
      filename: outputFilename,
      originalSize,
      savedSize: processedBuffer.length,
      savedPercent:
        originalSize > 0
          ? Math.max(
              0,
              Math.round(
                ((originalSize - processedBuffer.length) / originalSize) * 100
              )
            )
          : 0,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi máy chủ khi xử lý hình ảnh: " + error.message,
      },
      { status: 500 }
    );
  }
}
