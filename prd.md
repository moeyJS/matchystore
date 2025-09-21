# PRD – Full-Stack Socks Store CMS

## Overview
Build a **full-stack Store CMS** specialized for selling socks.  
- **Frontend:** Vue.js + Shadcn for UI/styling  
- **Backend:** Node.js (REST API + WebSockets)  
- **Database:** PostgreSQL + Prisma ORM  
- **Auth:** JWT + NextAuth.js  
- **Deployment:** Vercel / Netlify ready  
- **Security:** HTTPS, CSRF prevention, anti-clickjacking, token lifecycle best practices  
- **UX:** Simple, modern, responsive, RTL/LTR support  

---

## Core Features

### 1. Frontpage (Customer Side)
- Product grid with:
  - Image, product name, price
  - Add to cart icon
  - Buy now button
  - Quantity selector
  - View icon (eye)
- Product card opens **modal popup** with:
  - Larger image
  - Name
  - Sizes
  - Quantity selector
  - Add to cart
  - Buy now

### 2. Cart Page
- Simple table layout:  
  `Image | Product Name | Quantity | Price per item | Total | Actions`
- Quantity cell allows increase/decrease
- Actions:
  - Delete item
  - View product (eye, opens modal)
- Buttons:
  - Checkout
  - Clear all

### 3. Checkout Page
- Fields:
  - Name (required)
  - Address:
    - Country: Default Iraq (required, from admin country data)
    - Province: (required, filtered by country, from admin data)
    - Street address (required)
  - Phone number (Iraq only, for OTP via WhatsApp)
- OTP flow:
  1. Customer submits checkout form
  2. WhatsApp message sent with **6-digit code**
  3. Input screen for OTP
  4. On success → success modal + redirect to **Orders Page**

### 4. Orders Page (Customer)
- Orders list for that phone number
- Live status updates (via WebSocket)  
  Statuses: `Processing, Confirmed, En route, Delivered, Cancelled`
- Customer service button:
  - Opens support chat
  - Creates support ticket in admin dashboard
  - Customer Service can close session

---

## Roles & Permissions
- **Customer Service**: Manage support chats, tickets  
- **Warehouse**: Manage inventory, update order statuses  
- **Marketing**: Manage offers, newsletters, coupons  
- **Admin**: Manage products, customers, marketing, POS  
- **Super Admin**: Full access (system configs, settings, staff roles, addons)  

---

## Super Admin Dashboard Modules

### Dashboard
- Charts & statistics

### POS System
- **POS Manager**: Sell products, select/add customer & shipping, set shipping cost, discounts, filters (categories, sizes, brands, search)  
- **POS Config**: POS Activation  

### Products
- Add / Edit / Delete product  
- Brands (CRUD)  
- Categories & Subcategories (CRUD)  
- Attributes, SKU management  
- Bulk Import/Export (CSV, JSON)  

### Orders
- Manage & track customer orders

### Customers
- Phone number–based list (unique identifier)  

### Marketing
- Offers  
- Newsletters  
- Subscribers  
- Coupons  

### Blog
- Blogs CRUD  
- Blog categories CRUD  

### Product Queries
- Customer product questions  

### Uploaded Files
- Media/file manager  

### Support Chat
- Real-time customer service  

### Affiliate System
- Configurations  
- Affiliate users  
- Referral users  
- Withdraw requests  
- Affiliate log  

### Offline Payment System
- Manual methods  
- Offline wallet recharge  

### Website Setup
- **Header**: Topbar, logo, nav menu, links, language switcher, app store links, helpline  
- **Footer**: Logo, link widgets, contact info, app links, footer menu, copyright  
- **Banners**  
- **Pages**: CRUD + SEO fields (some locked main pages)  
- **Appearance**: Theme color, favicon, global SEO, custom CSS & scripts, cookie message  

### Settings
- **Shop Settings**: Info, meta, banners, featured products  
- **General Settings**: System name, logos, timezone, cache, features toggles, invoice settings  
- **OTP Settings**: Twilio, Vonage, WhatsApp, active gateway  
- **Languages**: Add/edit/translate full system  
- **Currency**: Formats, add/edit currencies  
- **SMTP Settings**  
- **Payment Methods**: Cash, ZainCash Iraq, Payoneer, PayTabs, FastPay Iraq, QiCard, etc.  
- **3rd Party**: Google Analytics  
- **Backup**  
- **Shipping**: Countries, governorates  

### Staffs
- All Staffs  
- Roles & permissions  

### System
- Updates (upload zip, version checks)  
- Server Status  
- Addons Manager  

### Topbar Shortcuts
- Clear Cache  
- Browse Website  
- Add New  
- Notifications  
- Language switcher  
- Profile  

---

## Technical Requirements

### Security
- **JWT + NextAuth.js** for auth
- HTTPS enforced
- Short-lived tokens with refresh
- HttpOnly, Secure cookies
- Regular security audits
- Prevent clickjacking, XSS, token leakage
- Anti third-party script abuse

### Realtime
- WebSockets for:
  - Notifications
  - Live order updates
  - Customer service chat

### Deployment
- Ready for Vercel/Netlify deployment
- Docker setup (optional)

---

## Architecture
- **Frontend:** Vue.js + Shadcn (clean UI components)  
- **Backend:** Node.js REST API + WebSocket server  
- **ORM:** Prisma (PostgreSQL)  
- **API Design:** REST (CRUD) + WebSocket channels  
- **Auth:** JWT + NextAuth.js  
- **CI/CD:** GitHub Actions → Vercel/Netlify  

---

## Deliverables
1. Full stack app (frontend + backend + DB)  
2. Clean, modular codebase with separation of concerns  
3. `cursor.md` (this file) as project reference  
4. Secure & production-ready deployment setup  

---

## Phase 3 – Progress Log

### Completed
- Pages CMS: Admin CRUD and public renderer (`/pages/:slug`).
- Appearance: theme colors + logo persisted in `settings`.
- Advanced Settings: System (maintenance/cache), SMTP (config + test), OTP (provider/sender/api key), Analytics (GA ID).
- Payments Settings: ZainCash, FastPay, QiCard provider configs (enable, credentials, production flag).
- Localization: default locale, supported locales, currency and format.
- Maintenance Mode: middleware that serves 503 JSON for public routes; admin routes bypassed.
- Staff Management: backend endpoints (list/update role/invite) and Admin UI for staff with role change and invite.

### Admin UI Updates
- Settings: added tabs for System, SMTP, OTP, Analytics, Payments, Localization.
- New modules: Appearance, Pages.
