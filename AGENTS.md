# AGENTS.md — Backend Development Rules & Guidelines

You are an expert **Backend Engineer** specialized in Node.js, Express, TypeScript, and MongoDB/Mongoose. You are working on the **tech-dadu-backend** service.

Always adhere strictly to the following rules and project conventions.

---

## 🚀 Tech Stack
- **Runtime & Language:** Node.js, TypeScript
- **Framework:** Express.js (v5)
- **Database & ODM:** MongoDB, Mongoose
- **Development Tooling:** `tsx watch` for live reload, `tsc` for building
- **Environment:** `dotenv`

---

## 🏗️ Architecture & Folder Structure
Always follow a clean, modular MVC/service-based architecture inside `src/`:
```text
src/
├── config/         # Database, env, and server configurations (db.ts)
├── controllers/    # Request handling & HTTP response logic
├── middlewares/    # Authentication, validation, and error middlewares
├── models/         # Mongoose models & schemas with TypeScript interfaces
├── routes/         # Express route definitions
├── services/       # Core business logic (separated from controllers)
├── utils/          # Helper functions, custom error classes, response formatters
└── server.ts       # Application entry point
```

---

## 📏 Coding Standards & Best Practices

### 1. TypeScript & Typing
- **No `any`:** Always define explicit interfaces and types for request bodies, query params, responses, and Mongoose documents.
- Use strict typing for all function parameters, return values, and schema definitions.

### 2. Standardized API Response
Always return JSON responses with a consistent format:
```json
// Success Response:
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}

// Error Response:
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

### 3. Error Handling & HTTP Status Codes
- Never let unhandled promise rejections crash the server.
- Use a centralized global error handler middleware.
- Return appropriate HTTP status codes:
  - `200 OK` / `201 Created`
  - `400 Bad Request`
  - `401 Unauthorized` / `403 Forbidden`
  - `404 Not Found`
  - `500 Internal Server Error`

### 4. Mongoose & Database
- Define proper timestamps (`{ timestamps: true }`) in schemas.
- Use `.lean()` for read-only queries where Mongoose document methods aren't needed.
- Always handle connection errors and disconnections gracefully.

### 5. Security & Configuration
- Never hardcode sensitive credentials, secrets, or ports. Always read from `process.env`.
- Ensure CORS is restricted to trusted origins (configured via `CLIENT_URL`) with `credentials: true`.
- Sanitize inputs and validate incoming request data using Zod.
- Use HttpOnly, Secure, SameSite cookies for sensitive tokens (refresh tokens).

---

## 🎯 Project Vision & Business Strategy (Tech Dadu)

**Target Audience:**
- 80% Tech-savvy users aged 18–34 (Developers, Designers, Students, Remote workers).
- 63% Male, 70% Desktop/Web users.
- Traffic Source: High-volume Pinterest referral traffic (400k+ impressions/mo) + Google SEO.

**Monetization Streams:**
1. **Affiliate Marketing (Amazon / AliExpress / Tech Brands):** Desk setups, laptop accessories, mechanical keyboards, ergonomic mice.
2. **Digital Products & Templates:** Selling/downloading Next.js landing pages, Tailwind kits, and MERN boilerplates (Gumroad/Lemon Squeezy integration).
3. **Tech & Coding Blog (AdSense & Sponsored Posts):** Listicles ("Top 10 Desk Setup Items 2026") driving organic traffic and ad revenue.
4. **Lead Generation / Freelancing:** Custom Next.js web development client acquisition.

---

## 🗄️ Database Models Architecture (Mongoose Schemas)

### 1. `User` (Authentication & Roles) — [Status: ✅ Completed]
- `name`: string
- `email`: string (unique, lowercase, index)
- `password`?: string (hashed with bcryptjs, select: false)
- `role`: 'user' | 'admin' (default: 'user')
- `avatar`?: string
- `provider`: 'credentials' | 'google'
- `googleId`?: string
- `isVerified`: boolean (email verification)
- `verificationToken`?: string (hashed)
- `verificationTokenExpires`?: Date
- `resetPasswordToken`?: string (hashed)
- `resetPasswordExpires`?: Date
- `refreshTokens`: string[] (for token rotation and multi-device logout)
- `timestamps`: true

---

### 2. `Category` (Taxonomy for Products & Blogs)
- `name`: string (e.g., "Desk Setup", "Laptop Accessories", "Next.js Templates", "Web Development")
- `slug`: string (unique, lowercase, URL-friendly, index)
- `description`?: string
- `icon`?: string
- `image`?: string
- `type`: 'product' | 'blog' | 'template' | 'all'
- `order`: number (for sorting in navbar/filters)
- `timestamps`: true

---

### 3. `Product` (Affiliate Tech Gadgets & Gear)
Designed for Pinterest deep-linking, SEO rich cards, and outbound affiliate click tracking:
- `title`: string (e.g., "Keychron K2 Wireless Mechanical Keyboard")
- `slug`: string (unique, index, SEO URL: `/products/keychron-k2-wireless-keyboard`)
- `category`: ObjectId ref `Category` (index)
- `images`: string[] (supports Pinterest 2:3 vertical aspect ratio & landscape)
- `shortSummary`: string (quick bullet point description)
- `description`: string (detailed review / markdown)
- `price`:
  - `amount`: number
  - `currency`: string (default "USD")
  - `formatted`: string (e.g., "$79.99")
- `affiliateLinks`: [
  - `platform`: 'amazon' | 'aliexpress' | 'official' | 'other'
  - `url`: string (original affiliate link)
  - `isPrimary`: boolean
]
- `rating`: number (1.0 to 5.0)
- `pros`: string[] (highlighted selling points)
- `cons`: string[] (honest review points)
- `badges`: string[] (e.g., "Best Seller", "Saif's Top Pick", "Staff Pick", "Budget Choice")
- `isFeatured`: boolean (default: false)
- `status`: 'draft' | 'published'
- `clickCount`: number (tracks every time a user clicks the outbound affiliate link)
- `seo`:
  - `metaTitle`: string
  - `metaDescription`: string
  - `keywords`: string[]
  - `ogImage`: string (for Pinterest Rich Pin and Twitter card)
- `timestamps`: true

---

### 4. `Blog` (Listicles, Tutorials, Product Reviews)
Optimized for Google SEO, Pinterest Rich Articles, and in-article product linking:
- `title`: string (e.g., "Top 10 Desk Setup Gadgets for Developers in 2026")
- `slug`: string (unique, index, SEO URL: `/blog/top-10-desk-setup-gadgets-2026`)
- `excerpt`: string (short summary for cards and search snippets)
- `content`: string (Rich Markdown or HTML with embedded product cards)
- `coverImage`: string
- `author`: ObjectId ref `User`
- `category`: ObjectId ref `Category` (index)
- `tags`: string[] (e.g., ["desk setup", "gadgets", "coding", "productivity"])
- `linkedProducts`: ObjectId[] ref `Product` (embeds real product affiliate cards inside the article)
- `readingTime`: number (minutes)
- `views`: number (default: 0)
- `status`: 'draft' | 'published'
- `publishedAt`?: Date
- `seo`:
  - `metaTitle`: string
  - `metaDescription`: string
  - `canonicalUrl`?: string
  - `ogImage`: string
  - `keywords`: string[]
- `timestamps`: true

---

### 5. `DigitalProduct` (Templates, Boilerplates & UI Kits)
Showcases developer templates (Next.js / MERN stack) with direct checkout:
- `title`: string (e.g., "Modern Next.js SaaS Starter & Landing Page")
- `slug`: string (unique, index)
- `category`: ObjectId ref `Category`
- `description`: string
- `features`: string[]
- `techStack`: string[] (e.g., ["Next.js 15", "Tailwind CSS", "TypeScript", "Prisma"])
- `price`: number (0 for free)
- `isFree`: boolean
- `liveDemoUrl`: string
- `purchaseUrl`: string (Gumroad / Lemon Squeezy / GitHub link)
- `previewImages`: string[]
- `downloadCount`: number (default: 0)
- `status`: 'draft' | 'published'
- `seo`:
  - `metaTitle`: string
  - `metaDescription`: string
  - `ogImage`: string
- `timestamps`: true

---

### 6. `Subscriber` (Newsletter & Lead Capture)
Collects emails from Pinterest visitors with lead magnets:
- `email`: string (unique, lowercase, index)
- `source`: string (e.g., 'free_template_modal', 'blog_footer', 'tech_deals')
- `status`: 'subscribed' | 'unsubscribed'
- `timestamps`: true

---

### 7. `ClickTracking` (Outbound Affiliate & Pinterest Analytics)
Crucial for optimizing Pinterest pins that actually convert into earnings:
- `targetType`: 'product' | 'digital_product'
- `targetId`: ObjectId (ref Product or DigitalProduct)
- `platform`: string ('amazon', 'gumroad', etc.)
- `referrer`: string (e.g., 'pinterest', 'google', 'direct')
- `ipHash`: string (anonymized for privacy & unique tracking)
- `userAgent`: string
- `timestamp`: Date

---

### 8. `SiteSetting` (Dynamic GTM, GA4, Meta Pixel, Pinterest & SEO Config) [✅ COMPLETED]
Allows changing tracking IDs and meta tags dynamically from Admin Dashboard:
- `siteName`: string
- `siteTagline`: string
- `siteDescription`: string
- `siteUrl`: string
- `logoUrl`?: string
- `faviconUrl`?: string
- `defaultOgImage`?: string
- `socialLinks`: { pinterest, github, twitter, youtube, facebook, linkedin }
- `analytics`:
  - `gtmId`: string (e.g., "GTM-XXXXXXX")
  - `gaId`: string (e.g., "G-XXXXXXXXXX")
  - `metaPixelId`: string
  - `pinterestTagId`: string
  - `pinterestVerification`: string (Pinterest domain claim meta tag)
  - `googleVerification`: string (Google search console verification)
- `announcement`: { enabled, text, link }
- `timestamps`: true

---

## 🗺️ Step-by-Step Implementation Roadmap

```text
Phase 1: Authentication & User System [✅ COMPLETED]
  ├── MVC Setup, TypeScript Config, Error Middleware
  ├── User Model with Role, Google Provider, Refresh Tokens
  ├── Email Verification & Password Reset with Nodemailer
  ├── Access Token (JWT) + Refresh Token Rotation in HttpOnly Cookie
  └── NextAuth Google Login Bridge

Phase 2: Categories & Affiliate Product Showcase [✅ COMPLETED]
  ├── Category Model, Service, Controller & Routes
  ├── Product Model with Affiliate Links, Pricing & Pros/Cons
  ├── Outbound Click Redirection Endpoint (/api/products/:id/click)
  ├── Filter by category, price, staff pick, search, pagination
  └── Admin CRUD for Categories & Products (Role Protected)

Phase 3: SEO-Optimized Blog & Listicle Engine [✅ COMPLETED]
  ├── Blog Model with Dynamic Product Linking
  ├── Reading time auto-calculator & markdown support
  ├── View count tracking & related posts engine
  └── Category, Tag & Keyword SEO filters

Phase 4: Digital Templates & Freebies Showcase [✅ COMPLETED]
  ├── DigitalProduct Model with Live Demo & Purchase URLs
  ├── Tech stack tagging (Next.js, MERN, Tailwind, TypeScript)
  ├── Free vs Paid filter & download/action tracking
  └── Admin CRUD & Zod validation

Phase 5: Newsletter & Pinterest Growth Automation [✅ COMPLETED]
  ├── Subscriber Model & Welcome Email Service
  ├── Newsletter Subscription & Admin Broadcast API
  ├── Valid RSS 2.0 Media Feed for Pinterest Auto-Pinning (/api/feeds/pinterest.xml)
  └── Dynamic XML Sitemap Generator for Google Search Console (/api/feeds/sitemap.xml)
```
