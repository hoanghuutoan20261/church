import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    // Require authenticated user (pastor, admin, tech_leader, superadmin, or registered member)
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Yêu cầu đăng nhập tài khoản để tải tệp tin lên hệ thống.",
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

    // Check MIME type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Tệp tin tải lên phải là hình ảnh hợp lệ (JPEG, PNG, WebP, GIF...)." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const originalSize = file.size;
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Generate safe, unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const outputFilename = `${type}_${timestamp}_${randomSuffix}.webp`;
    const outputPath = path.join(uploadDir, outputFilename);

    let processedBuffer: Buffer;

    // Apply Sharp compression & resizing according to image purpose
    try {
      let sharpInstance = sharp(rawBuffer);

      if (type === "avatar") {
        sharpInstance = sharpInstance.resize(400, 400, {
          fit: "cover",
          position: "center",
        });
      } else if (type === "cover") {
        sharpInstance = sharpInstance.resize(1920, 800, {
          fit: "inside",
          withoutEnlargement: true,
        });
      } else {
        // Post or general image
        sharpInstance = sharpInstance.resize(1400, 1400, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Convert to WebP with 80% quality for optimal balance of sharpness and tiny file size
      processedBuffer = await sharpInstance
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    } catch {
      // Fallback if sharp transformation fails for any reason
      processedBuffer = rawBuffer;
    }

    // Save to disk
    await fs.writeFile(outputPath, processedBuffer);

    const relativeUrl = `/uploads/${outputFilename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename: outputFilename,
      originalSize,
      savedSize: processedBuffer.length,
      savedPercent: originalSize > 0 
        ? Math.max(0, Math.round(((originalSize - processedBuffer.length) / originalSize) * 100))
        : 0,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi xử lý hình ảnh: " + error.message },
      { status: 500 }
    );
  }
}
