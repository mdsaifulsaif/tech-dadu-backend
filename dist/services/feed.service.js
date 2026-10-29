"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const blog_model_1 = require("../models/blog.model");
const product_model_1 = require("../models/product.model");
const digitalProduct_model_1 = require("../models/digitalProduct.model");
class FeedService {
    // Generates valid RSS 2.0 XML with media extensions for Pinterest Auto-Publishing
    static async generatePinterestRssFeed() {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const [blogs, products, templates] = await Promise.all([
            blog_model_1.Blog.find({ status: "published" }).sort({ publishedAt: -1 }).limit(25).lean(),
            product_model_1.Product.find({ status: "published" }).sort({ createdAt: -1 }).limit(25).lean(),
            digitalProduct_model_1.DigitalProduct.find({ status: "published" }).sort({ createdAt: -1 }).limit(25).lean(),
        ]);
        let itemsXml = "";
        // Blog items
        for (const blog of blogs) {
            const url = `${clientUrl}/blog/${blog.slug}`;
            const pubDate = new Date(blog.publishedAt || blog.createdAt).toUTCString();
            const imageUrl = blog.coverImage || "";
            itemsXml += `
        <item>
          <title><![CDATA[${blog.title}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description><![CDATA[${blog.excerpt}]]></description>
          <pubDate>${pubDate}</pubDate>
          ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ""}
          ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ""}
        </item>
      `;
        }
        // Product items (affiliate gadgets & desk accessories)
        for (const product of products) {
            const url = `${clientUrl}/products/${product.slug}`;
            const pubDate = new Date(product.createdAt).toUTCString();
            const imageUrl = product.images?.[0] || "";
            itemsXml += `
        <item>
          <title><![CDATA[${product.title}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description><![CDATA[${product.shortSummary}]]></description>
          <pubDate>${pubDate}</pubDate>
          ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ""}
          ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ""}
        </item>
      `;
        }
        // Digital templates
        for (const tpl of templates) {
            const url = `${clientUrl}/templates/${tpl.slug}`;
            const pubDate = new Date(tpl.createdAt).toUTCString();
            const imageUrl = tpl.previewImages?.[0] || "";
            itemsXml += `
        <item>
          <title><![CDATA[${tpl.title} - ${tpl.techStack.join(", ")}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description><![CDATA[${tpl.shortSummary}]]></description>
          <pubDate>${pubDate}</pubDate>
          ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ""}
          ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ""}
        </item>
      `;
        }
        return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tech Dadu - Desk Setup, Gadgets &amp; Developer Resources</title>
    <link>${clientUrl}</link>
    <description>Daily curated desk setup accessories, laptop gear, Next.js templates, and modern tech inspirations.</description>
    <language>en-us</language>
    <atom:link href="${clientUrl}/api/feeds/pinterest.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;
    }
    // Generates SEO XML Sitemap for Google Search Console
    static async generateSitemapXml() {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const [blogs, products, templates] = await Promise.all([
            blog_model_1.Blog.find({ status: "published" }).select("slug updatedAt").lean(),
            product_model_1.Product.find({ status: "published" }).select("slug updatedAt").lean(),
            digitalProduct_model_1.DigitalProduct.find({ status: "published" }).select("slug updatedAt").lean(),
        ]);
        let urlsXml = `
      <url>
        <loc>${clientUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${clientUrl}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${clientUrl}/products</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${clientUrl}/templates</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
    `;
        // Blogs
        for (const blog of blogs) {
            urlsXml += `
        <url>
          <loc>${clientUrl}/blog/${blog.slug}</loc>
          <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
        }
        // Products
        for (const prod of products) {
            urlsXml += `
        <url>
          <loc>${clientUrl}/products/${prod.slug}</loc>
          <lastmod>${new Date(prod.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
        }
        // Templates
        for (const tpl of templates) {
            urlsXml += `
        <url>
          <loc>${clientUrl}/templates/${tpl.slug}</loc>
          <lastmod>${new Date(tpl.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
        }
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
</urlset>`;
    }
}
exports.FeedService = FeedService;
