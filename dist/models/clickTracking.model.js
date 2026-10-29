"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickTracking = void 0;
const mongoose_1 = require("mongoose");
const clickTrackingSchema = new mongoose_1.Schema({
    targetType: {
        type: String,
        enum: ["product", "digital_product", "blog_link"],
        required: true,
        index: true,
    },
    targetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    platform: {
        type: String,
        default: "amazon",
    },
    referrer: {
        type: String,
        default: "direct",
    },
    ipHash: {
        type: String,
        default: "",
    },
    userAgent: {
        type: String,
        default: "",
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
exports.ClickTracking = (0, mongoose_1.model)("ClickTracking", clickTrackingSchema);
