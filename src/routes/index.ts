import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import uploadRoutes from "./upload.routes";
import blogRoutes from "./blog.routes";
import digitalProductRoutes from "./digitalProduct.routes";
import subscriberRoutes from "./subscriber.routes";
import feedRoutes from "./feed.routes";
import siteSettingRoutes from "./siteSetting.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/upload", uploadRoutes);
router.use("/blogs", blogRoutes);
router.use("/templates", digitalProductRoutes);
router.use("/newsletter", subscriberRoutes);
router.use("/feeds", feedRoutes);
router.use("/settings", siteSettingRoutes);

export default router;
