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

  static async ensureDefaultCategories() {
    const defaults: Array<{
      name: string;
      slug: string;
      type: "template" | "product" | "blog";
      description: string;
      order: number;
      showInHero?: boolean;
      isDefaultHero?: boolean;
    }> = [
      { name: "Desk Setup Gear", slug: "desk-setup-gear", type: "product", description: "Keyboards, monitors, desks and workspace gadgets", order: 1, showInHero: true, isDefaultHero: true },
      { name: "Web Templates", slug: "web-templates", type: "template", description: "Next.js, React & full-stack web application templates", order: 2, showInHero: true, isDefaultHero: false },
      { name: "UI/UX Design", slug: "ui-ux-design", type: "template", description: "Figma UI kits, design systems, and mobile wireframes", order: 3, showInHero: true, isDefaultHero: false },
      { name: "Mobile App Kits", slug: "mobile-app-kits", type: "template", description: "iOS & Android Flutter/React Native UI kits", order: 4, showInHero: false, isDefaultHero: false },
      { name: "Tech Guides", slug: "tech-guides", type: "blog", description: "Tutorials, listicles, and hardware reviews", order: 5, showInHero: false, isDefaultHero: false },
    ];

    for (const cat of defaults) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }
  }

  static async getAllCategories(type?: string, heroOnly?: boolean) {
    // Ensure default starter categories exist
    await this.ensureDefaultCategories().catch(() => {});

    const query: Record<string, any> = {};
    if (type && type !== "all") {
      query.$or = [{ type }, { type: "all" }];
    }
    if (heroOnly) {
      query.showInHero = true;
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

