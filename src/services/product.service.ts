import { Product, IProduct } from "../models/product.model";
import { Category } from "../models/category.model";
import { ClickTracking } from "../models/clickTracking.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import crypto from "crypto";

export interface IProductQueryFilters {
  category?: string;
  search?: string;
  isFeatured?: boolean;
  isComparison?: boolean;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "draft" | "published" | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "rating";
  page?: number;
  limit?: number;
}

export class ProductService {
  static async createProduct(data: any) {
    // Validate category
    const category = await Category.findById(data.category);
    if (!category) {
      throw new ApiError(400, "Invalid Category ID provided");
    }

    const slug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await Product.findOne({ slug });
    if (existing) {
      throw new ApiError(400, `Product with slug '${slug}' already exists`);
    }

    const product = await Product.create({
      ...data,
      slug,
    });

    return await product.populate("category", "name slug icon");
  }

  static async getAllProducts(filters: IProductQueryFilters) {
    const {
      category,
      search,
      isFeatured,
      badge,
      minPrice,
      maxPrice,
      status = "published",
      sort = "newest",
      page = 1,
      limit = 12,
    } = filters;

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = status;
    }

    if (category) {
      // Find category by slug or id
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { shortSummary: searchRegex },
        { description: searchRegex },
        { badges: searchRegex },
      ];
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    if (filters.isComparison !== undefined) {
      query["comparison.isFeatured"] = filters.isComparison;
    }

    if (badge) {
      query.badges = { $in: [badge] };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query["price.amount"] = {};
      if (minPrice !== undefined) query["price.amount"].$gte = minPrice;
      if (maxPrice !== undefined) query["price.amount"].$lte = maxPrice;
    }

    // Sort mapping
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price-asc") sortOptions = { "price.amount": 1 };
    else if (sort === "price-desc") sortOptions = { "price.amount": -1 };
    else if (sort === "popular") sortOptions = { clickCount: -1 };
    else if (sort === "rating") sortOptions = { rating: -1 };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug icon")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
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

  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug })
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      throw new ApiError(404, `Product '${slug}' not found`);
    }

    return product;
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id)
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  static async updateProduct(id: string, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    } else if (data.slug) {
      data.slug = slugify(data.slug);
    }

    if (data.slug) {
      const existing = await Product.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(400, `Product slug '${data.slug}' is already taken`);
      }
    }

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) {
        throw new ApiError(400, "Invalid Category ID");
      }
    }

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug icon");

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  static async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return { id, message: "Product deleted successfully" };
  }

  // Track outbound click from Pinterest/Site to Amazon & record analytics
  static async trackOutboundClick(
    productId: string,
    options: {
      platform?: string;
      referrer?: string;
      ip?: string;
      userAgent?: string;
    }
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Determine affiliate link to redirect to
    let targetLink = product.affiliateLinks.find(
      (link) => link.platform === options.platform
    );

    if (!targetLink) {
      targetLink =
        product.affiliateLinks.find((link) => link.isPrimary) ||
        product.affiliateLinks[0];
    }

    if (!targetLink || !targetLink.url) {
      throw new ApiError(404, "No affiliate link found for this product");
    }

    // Hash IP for privacy compliant tracking
    const ipHash = options.ip
      ? crypto.createHash("sha256").update(options.ip).digest("hex").slice(0, 16)
      : "anonymous";

    // Increment click count on the product asynchronously
    product.clickCount += 1;
    await product.save();

    // Log in ClickTracking
    await ClickTracking.create({
      targetType: "product",
      targetId: product._id,
      platform: targetLink.platform,
      referrer: options.referrer || "direct",
      ipHash,
      userAgent: options.userAgent || "",
    });

    return {
      url: targetLink.url,
      platform: targetLink.platform,
      title: product.title,
      clickCount: product.clickCount,
    };
  }
}

