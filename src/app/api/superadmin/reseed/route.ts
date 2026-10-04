import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/superadminAuth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    const scriptPath = path.join(process.cwd(), "src", "scripts", "reseed.mjs");
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`);

    return NextResponse.json({
      success: true,
      message: "Đã tái tạo cơ sở dữ liệu mẫu đa dạng thành công!",
      details: stdout || stderr,
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/reseed error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi chạy script reseed: " + error.message },
      { status: 500 }
    );
  }
}
