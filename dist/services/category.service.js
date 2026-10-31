"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_model_1 = require("../models/category.model");
const ApiError_1 = require("../utils/ApiError");
const slugify_1 = require("../utils/slugify");
class CategoryService {
    static async createCategory(data) {
        const slug = data.slug ? (0, slugify_1.slugify)(data.slug) : (0, slugify_1.slugify)(data.name || "");
        const existing = await category_model_1.Category.findOne({ slug });
        if (existing) {
            throw new ApiError_1.ApiError(400, `Category with slug '${slug}' already exists`);
        }
        const category = await category_model_1.Category.create({
            ...data,
            slug,
        });
        return category;
    }
    static async ensureDefaultCategories() {
        const defaults = [
            { name: "Desk Setup Gear", slug: "desk-setup-gear", type: "product", description: "Keyboards, monitors, desks and workspace gadgets", order: 1, showInHero: true, isDefaultHero: true },
            { name: "Web Templates", slug: "web-templates", type: "template", description: "Next.js, React & full-stack web application templates", order: 2, showInHero: true, isDefaultHero: false },
            { name: "UI/UX Design", slug: "ui-ux-design", type: "template", description: "Figma UI kits, design systems, and mobile wireframes", order: 3, showInHero: true, isDefaultHero: false },
            { name: "Mobile App Kits", slug: "mobile-app-kits", type: "template", description: "iOS & Android Flutter/React Native UI kits", order: 4, showInHero: false, isDefaultHero: false },
            { name: "Tech Guides", slug: "tech-guides", type: "blog", description: "Tutorials, listicles, and hardware reviews", order: 5, showInHero: false, isDefaultHero: false },
        ];
        for (const cat of defaults) {
            const exists = await category_model_1.Category.findOne({ slug: cat.slug });
            if (!exists) {
                await category_model_1.Category.create(cat);
            }
        }
    }
    static async getAllCategories(type, heroOnly) {
        // Ensure default starter categories exist
        await this.ensureDefaultCategories().catch(() => { });
        const query = {};
        if (type && type !== "all") {
            query.$or = [{ type }, { type: "all" }];
        }
        if (heroOnly) {
            query.showInHero = true;
        }
        return await category_model_1.Category.find(query).sort({ order: 1, name: 1 }).lean();
    }
    static async getCategoryBySlug(slug) {
        const category = await category_model_1.Category.findOne({ slug }).lean();
        if (!category) {
            throw new ApiError_1.ApiError(404, `Category '${slug}' not found`);
        }
        return category;
    }
    static async updateCategory(id, data) {
        if (data.name && !data.slug) {
            data.slug = (0, slugify_1.slugify)(data.name);
        }
        else if (data.slug) {
            data.slug = (0, slugify_1.slugify)(data.slug);
        }
        if (data.slug) {
            const existing = await category_model_1.Category.findOne({
                slug: data.slug,
                _id: { $ne: id },
            });
            if (existing) {
                throw new ApiError_1.ApiError(400, `Category slug '${data.slug}' is already taken`);
            }
        }
        const category = await category_model_1.Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            throw new ApiError_1.ApiError(404, "Category not found");
        }
        return category;
    }
    static async deleteCategory(id) {
        const category = await category_model_1.Category.findByIdAndDelete(id);
        if (!category) {
            throw new ApiError_1.ApiError(404, "Category not found");
        }
        return { id, message: "Category deleted successfully" };
    }
}
exports.CategoryService = CategoryService;
