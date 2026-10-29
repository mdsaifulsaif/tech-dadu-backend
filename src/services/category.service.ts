import { Category, ICategory } from "../models/category.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";

export class CategoryService {
  static async createCategory(data: Partial<ICategory>) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name || "");

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new ApiError(400, `Category with slug '${slug}' already exists`);
    }

    const category = await Category.create({
      ...data,
      slug,
    });

    return category;
  }

  static async getAllCategories(type?: string) {
    const query: Record<string, any> = {};
    if (type && type !== "all") {
      query.$or = [{ type }, { type: "all" }];
    }

    return await Category.find(query).sort({ order: 1, name: 1 }).lean();
  }

  static async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug }).lean();
    if (!category) {
      throw new ApiError(404, `Category '${slug}' not found`);
    }
    return category;
  }

  static async updateCategory(id: string, data: Partial<ICategory>) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    } else if (data.slug) {
      data.slug = slugify(data.slug);
    }

    if (data.slug) {
      const existing = await Category.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(400, `Category slug '${data.slug}' is already taken`);
      }
    }

    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  }

  static async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return { id, message: "Category deleted successfully" };
  }
}

