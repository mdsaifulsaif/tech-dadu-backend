"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
        type: String,
        required: [true, "Category slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        default: "",
    },
    icon: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ["product", "blog", "template", "all"],
        default: "all",
        index: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
