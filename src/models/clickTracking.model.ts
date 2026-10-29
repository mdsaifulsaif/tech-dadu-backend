import { Schema, model, Document, Types } from "mongoose";

export interface IClickTracking extends Document {
  targetType: "product" | "digital_product" | "blog_link";
  targetId: Types.ObjectId;
  platform: string;
  referrer: string;
  ipHash: string;
  userAgent: string;
  createdAt: Date;
}

const clickTrackingSchema = new Schema<IClickTracking>(
  {
    targetType: {
      type: String,
      enum: ["product", "digital_product", "blog_link"],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ClickTracking = model<IClickTracking>(
  "ClickTracking",
  clickTrackingSchema
);

