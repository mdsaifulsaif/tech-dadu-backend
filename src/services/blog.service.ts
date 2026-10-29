import { Blog, IBlog } from "../models/blog.model";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import { Types } from "mongoose";

export interface IBlogQueryFilters {
  category?: string;
  tag?: string;
  search?: string;
  status?: "draft" | "published" | "all";
  sort?: "newest" | "popular" | "oldest";
  page?: number;
  limit?: number;
}

export class BlogService {
  static async createBlog(authorId: string, data: any) {
    const category = await Category.findById(data.category);
    if (!category) {
      throw new ApiError(400, "Invalid Category ID provided");
    }

    const slug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await Blog.findOne({ slug });
    if (existing) {
      throw new ApiError(400, `Blog with slug '${slug}' already exists`);
    }

    // Verify linked products if any provided
    if (data.linkedProducts && data.linkedProducts.length > 0) {
      const validProductsCount = await Product.countDocuments({
        _id: { $in: data.linkedProducts },
      });
      if (validProductsCount !== data.linkedProducts.length) {
        throw new ApiError(400, "One or more linked product IDs are invalid");
      }
    }

    const blog = await Blog.create({
      ...data,
      slug,
      author: new Types.ObjectId(authorId),
    });

    return await blog.populate([
      { path: "category", select: "name slug icon" },
      { path: "author", select: "name avatar" },
      {
        path: "linkedProducts",
        select: "title slug price images rating badges affiliateLinks",
      },
    ]);
  }

  static async getAllBlogs(filters: IBlogQueryFilters) {
    const {
      category,
      tag,
      search,
      status = "published",
      sort = "newest",
      page = 1,
      limit = 9,
    } = filters;

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = status;
    }

    if (category) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: category },
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
        ],
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
      ];
    }

    let sortOptions: Record<string, 1 | -1> = { publishedAt: -1 };
    if (sort === "popular") sortOptions = { views: -1 };
    else if (sort === "oldest") sortOptions = { publishedAt: 1 };

    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
      Blog.find(query)
        .populate("category", "name slug icon")
        .populate("author", "name avatar")
        .populate("linkedProducts", "title slug price images rating badges affiliateLinks")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      blogs,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getBlogBySlug(slug: string) {
    // Atomically increment view count
    const blog = await Blog.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("category", "name slug icon")
      .populate("author", "name avatar")
      .populate(
        "linkedProducts",
        "title slug shortSummary price images rating badges affiliateLinks clickCount"
      )
      .lean();

    if (!blog) {
      throw new ApiError(404, `Blog article '${slug}' not found`);
    }

    return blog;
  }

  static async getBlogById(id: string) {
    const blog = await Blog.findById(id)
      .populate("category", "name slug icon")
      .populate("author", "name avatar")
      .populate("linkedProducts", "title slug price images rating badges affiliateLinks")
      .lean();

    if (!blog) {
      throw new ApiError(404, "Blog article not found");
    }

    return blog;
  }

  static async updateBlog(id: string, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    } else if (data.slug) {
      data.slug = slugify(data.slug);
    }

    if (data.slug) {
      const existing = await Blog.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(400, `Blog slug '${data.slug}' is already taken`);
      }
    }

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) {
        throw new ApiError(400, "Invalid Category ID");
      }
    }

    const blog = await Blog.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "category", select: "name slug icon" },
      { path: "author", select: "name avatar" },
      { path: "linkedProducts", select: "title slug price images rating badges affiliateLinks" },
    ]);

    if (!blog) {
      throw new ApiError(404, "Blog article not found");
    }

    return blog;
  }

  static async deleteBlog(id: string) {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new ApiError(404, "Blog article not found");
    }
    return { id, message: "Blog article deleted successfully" };
  }

  // Get related blogs based on category or common tags
  static async getRelatedBlogs(blogId: string, limit: number = 4) {
    const currentBlog = await Blog.findById(blogId);
    if (!currentBlog) {
      throw new ApiError(404, "Blog not found");
    }

    const related = await Blog.find({
      _id: { $ne: currentBlog._id },
      status: "published",
      $or: [
        { category: currentBlog.category },
        { tags: { $in: currentBlog.tags } },
      ],
    })
      .populate("category", "name slug")
      .populate("author", "name avatar")
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .lean();

    return related;
  }
}

