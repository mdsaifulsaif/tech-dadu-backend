import { DigitalProduct, IDigitalProduct } from "../models/digitalProduct.model";
import { Category } from "../models/category.model";
import { ClickTracking } from "../models/clickTracking.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import crypto from "crypto";

export interface IDigitalProductFilters {
  category?: string;
  techStack?: string;
  isFree?: boolean;
  isFeatured?: boolean;
  search?: string;
  status?: "draft" | "published" | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  limit?: number;
}

export class DigitalProductService {
  static async createDigitalProduct(data: any) {
    const category = await Category.findById(data.category);
    if (!category) {
      throw new ApiError(400, "Invalid Category ID provided");
    }

    const slug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await DigitalProduct.findOne({ slug });
    if (existing) {
      throw new ApiError(400, `Template with slug '${slug}' already exists`);
    }

    const shortSummary =
      data.shortSummary || data.description?.slice(0, 160) || data.title;

    const digitalProduct = await DigitalProduct.create({
      ...data,
      shortSummary,
      slug,
      isFree: data.price === 0,
    });

    return await digitalProduct.populate("category", "name slug icon");
  }

  static async getAllDigitalProducts(filters: IDigitalProductFilters) {
    const {
      category,
      techStack,
      isFree,
      isFeatured,
      search,
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

    if (techStack) {
      query.techStack = { $in: [new RegExp(techStack, "i")] };
    }

    if (isFree !== undefined) {
      query.isFree = isFree;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { shortSummary: searchRegex },
        { description: searchRegex },
        { techStack: searchRegex },
        { features: searchRegex },
      ];
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "popular") sortOptions = { downloadCount: -1 };
    else if (sort === "price-asc") sortOptions = { price: 1 };
    else if (sort === "price-desc") sortOptions = { price: -1 };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      DigitalProduct.find(query)
        .populate("category", "name slug icon")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      DigitalProduct.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      templates: products,
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

  static async getDigitalProductBySlug(slug: string) {
    const product = await DigitalProduct.findOne({ slug })
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      throw new ApiError(404, `Template '${slug}' not found`);
    }

    return product;
  }

  static async getDigitalProductById(id: string) {
    const product = await DigitalProduct.findById(id)
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      throw new ApiError(404, "Template not found");
    }

    return product;
  }

  static async updateDigitalProduct(id: string, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    } else if (data.slug) {
      data.slug = slugify(data.slug);
    }

    if (data.slug) {
      const existing = await DigitalProduct.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(400, `Template slug '${data.slug}' is already taken`);
      }
    }

    if (data.price !== undefined) {
      data.isFree = data.price === 0;
    }

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) {
        throw new ApiError(400, "Invalid Category ID");
      }
    }

    const updated = await DigitalProduct.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug icon");

    if (!updated) {
      throw new ApiError(404, "Template not found");
    }

    return updated;
  }

  static async deleteDigitalProduct(id: string) {
    const deleted = await DigitalProduct.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, "Template not found");
    }
    return { id, message: "Template deleted successfully" };
  }

  // Track download/checkout click and increment download counter
  static async trackAction(
    id: string,
    options: {
      action?: "purchase" | "demo";
      referrer?: string;
      ip?: string;
      userAgent?: string;
    }
  ) {
    const product = await DigitalProduct.findById(id);
    if (!product) {
      throw new ApiError(404, "Template not found");
    }

    const action = options.action || "purchase";
    const targetUrl = action === "demo" ? product.liveDemoUrl : product.purchaseUrl;

    if (!targetUrl) {
      throw new ApiError(404, `No URL found for action '${action}'`);
    }

    if (action === "purchase") {
      product.downloadCount += 1;
      await product.save();

      const ipHash = options.ip
        ? crypto.createHash("sha256").update(options.ip).digest("hex").slice(0, 16)
        : "anonymous";

      await ClickTracking.create({
        targetType: "digital_product",
        targetId: product._id,
        platform: product.isFree ? "free_download" : "gumroad",
        referrer: options.referrer || "direct",
        ipHash,
        userAgent: options.userAgent || "",
      });
    }

    return {
      url: targetUrl,
      action,
      title: product.title,
      downloadCount: product.downloadCount,
    };
  }
}

