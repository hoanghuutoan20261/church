import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "general"; // "avatar" | "cover" | "post" | "general"

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tệp tin tải lên." },
        { status: 400 }
      );
    }

    // Check MIME type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Tệp tin tải lên phải là hình ảnh (JPEG, PNG, WebP, GIF...)." },
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
    } catch (sharpErr) {
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
