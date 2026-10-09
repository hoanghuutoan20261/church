import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hoithanhvn.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    await connectDB();
    const churches = await Church.find({ isActive: true })
      .select("slug updatedAt")
      .lean();

    const churchRoutes: MetadataRoute.Sitemap = churches.map((c) => ({
      url: `${baseUrl}/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    return [...staticRoutes, ...churchRoutes];
  } catch (err) {
    console.error("Lỗi tạo sitemap.xml:", err);
    return staticRoutes;
  }
}
