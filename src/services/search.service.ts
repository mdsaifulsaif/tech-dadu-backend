import { Product } from "../models/product.model";
import { DigitalProduct } from "../models/digitalProduct.model";
import { Blog } from "../models/blog.model";
import { Category } from "../models/category.model";

export class SearchService {
  static async globalSearch(queryStr: string) {
    const q = (queryStr || "").trim();
    if (!q) {
      return {
        query: "",
        total: 0,
        products: [],
        templates: [],
        blogs: [],
        categories: [],
      };
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [products, templates, blogs, categories] = await Promise.all([
      Product.find({
        status: "published",
        $or: [
          { title: regex },
          { shortSummary: regex },
          { pros: regex },
          { badges: regex },
          { "seo.keywords": regex },
        ],
      })
        .select("title slug price rating images badges shortSummary category")
        .populate("category", "name slug")
        .limit(6)
        .lean(),

      DigitalProduct.find({
        status: "published",
        $or: [
          { title: regex },
          { shortSummary: regex },
          { techStack: regex },
          { features: regex },
          { "seo.keywords": regex },
        ],
      })
        .select("title slug price isFree techStack previewImages badges shortSummary category")
        .populate("category", "name slug")
        .limit(6)
        .lean(),

      Blog.find({
        status: "published",
        $or: [
          { title: regex },
          { excerpt: regex },
          { tags: regex },
          { "seo.keywords": regex },
        ],
      })
        .select("title slug coverImage readingTime category tags excerpt publishedAt")
        .populate("category", "name slug")
        .limit(6)
        .lean(),

      Category.find({
        $or: [{ name: regex }, { description: regex }],
      })
        .select("name slug icon type description")
        .limit(6)
        .lean(),
    ]);

    const total = products.length + templates.length + blogs.length + categories.length;

    return {
      query: q,
      total,
      products,
      templates,
      blogs,
      categories,
    };
  }
}
