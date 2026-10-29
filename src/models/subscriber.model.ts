import { Schema, model, Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  source: string;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
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
  },
  {
    timestamps: true,
  }
);

export const Subscriber = model<ISubscriber>("Subscriber", subscriberSchema);

