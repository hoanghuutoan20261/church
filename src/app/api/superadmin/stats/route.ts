import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { PrayerRequest } from "@/models/PrayerRequest";
import { requireSuperadmin } from "@/lib/superadminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();

    const [
      churches,
      totalPosts,
      totalUsers,
      totalPrayers,
      recentPosts,
      pinnedPostsCount,
    ] = await Promise.all([
      Church.find({}).lean(),
      Post.countDocuments({}),
      User.countDocuments({}),
      PrayerRequest ? PrayerRequest.countDocuments({}) : 0,
      Post.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      Post.countDocuments({ isPinned: true }),
    ]);

    const activeChurches = churches.filter((c) => c.isActive !== false);
    const inactiveChurches = churches.filter((c) => c.isActive === false);
    const liveChurches = churches.filter((c) => Boolean(c.currentService?.isLive));
    const totalViewers = liveChurches.reduce(
      (sum, c) => sum + (c.currentService?.viewersCount || 0),
      0
    );

    // Compute aggregated post counts per church
    const postCountBySlug: Record<string, number> = {};
    const allPosts = await Post.find({}, "churchSlug likesCount comments").lean();
    let totalLikes = 0;
    let totalComments = 0;

    allPosts.forEach((p) => {
      postCountBySlug[p.churchSlug] = (postCountBySlug[p.churchSlug] || 0) + 1;
      totalLikes += p.likesCount || 0;
      totalComments += p.comments?.length || 0;
    });

    const churchesSummary = churches.map((c) => ({
      _id: (c._id as any).toString(),
      name: c.name,
      slug: c.slug,
      denomination: c.denomination,
      address: c.address,
      streamKey: c.streamKey,
      isActive: c.isActive !== false,
      isLive: Boolean(c.currentService?.isLive),
      viewersCount: c.currentService?.viewersCount || 0,
      liveTitle: c.currentService?.title || "",
      leadPastor: c.profileConfig?.leadPastor || "Mục sư Quản Nhiệm",
      postCount: postCountBySlug[c.slug] || 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalChurches: churches.length,
          activeChurches: activeChurches.length,
          inactiveChurches: inactiveChurches.length,
          liveChurchesCount: liveChurches.length,
          totalViewers,
          totalPosts,
          pinnedPostsCount,
          totalLikes,
          totalComments,
          totalUsers,
          totalPrayers,
        },
        liveStreams: liveChurches.map((c) => ({
          _id: (c._id as any).toString(),
          churchName: c.name,
          slug: c.slug,
          streamKey: c.streamKey,
          title: c.currentService?.title,
          speaker: c.currentService?.speaker,
          viewersCount: c.currentService?.viewersCount || 0,
          scripture: c.currentService?.scriptureReference,
        })),
        churches: churchesSummary,
        recentPosts: recentPosts.map((p) => ({
          _id: (p._id as any).toString(),
          churchSlug: p.churchSlug,
          title: p.title,
          category: p.category,
          isPinned: p.isPinned,
          authorName: p.author?.name,
          likesCount: p.likesCount || 0,
          commentsCount: p.comments?.length || 0,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải số liệu tổng quan: " + error.message },
      { status: 500 }
    );
  }
}
