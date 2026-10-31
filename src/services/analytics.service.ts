import { Product } from "../models/product.model";
import { DigitalProduct } from "../models/digitalProduct.model";
import { Blog } from "../models/blog.model";
import { Subscriber } from "../models/subscriber.model";
import { ClickTracking } from "../models/clickTracking.model";

export class AnalyticsService {
  static async getOverviewStats() {
    const [
      totalProducts,
      totalTemplates,
      totalBlogs,
      totalSubscribers,
      totalClicks,
      topProducts,
      platformStats,
      referrerStats,
      recentClicks,
    ] = await Promise.all([
      Product.countDocuments(),
      DigitalProduct.countDocuments(),
      Blog.countDocuments(),
      Subscriber.countDocuments({ status: "subscribed" }),
      ClickTracking.countDocuments(),
      Product.find()
        .sort({ clickCount: -1 })
        .limit(5)
        .select("title slug clickCount price images rating")
        .lean(),
      ClickTracking.aggregate([
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ClickTracking.aggregate([
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ClickTracking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      counts: {
        products: totalProducts,
        templates: totalTemplates,
        blogs: totalBlogs,
        subscribers: totalSubscribers,
        clicks: totalClicks,
      },
      topProducts,
      platformBreakdown: platformStats.map((item) => ({
        platform: item._id || "other",
        count: item.count,
      })),
      referrerBreakdown: referrerStats.map((item) => ({
        referrer: item._id || "direct",
        count: item.count,
      })),
      recentClicks,
    };
  }
}

