"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
const mongoose_1 = require("mongoose");
const subscriberSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email address is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address",
        ],
    },
    source: {
        type: String,
        default: "website_footer",
        trim: true,
    },
    status: {
        type: String,
        enum: ["subscribed", "unsubscribed"],
        default: "subscribed",
        index: true,
    },
}, {
    timestamps: true,
});
exports.Subscriber = (0, mongoose_1.model)("Subscriber", subscriberSchema);
