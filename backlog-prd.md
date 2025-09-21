# Backlog – Full-Stack Socks Store CMS

## Epic 1: Frontpage (Customer Side)
- **Story 1.1:** As a customer, I want to view products in a grid layout.  
  - Task: Implement product grid (image, name, price, add to cart, buy now, quantity, view icon).  
- **Story 1.2:** As a customer, I want to open a product modal with more details.  
  - Task: Create modal with bigger image, name, size, quantity, add to cart, buy now.  

## Epic 2: Cart Page
- **Story 2.1:** As a customer, I want to see items in my cart.  
  - Task: Cart table: Image | Name | Quantity | Price per item | Total | Actions.  
- **Story 2.2:** As a customer, I want to adjust quantity in the cart.  
  - Task: Quantity increase/decrease logic.  
- **Story 2.3:** As a customer, I want to manage items in the cart.  
  - Task: Delete item button, view item modal.  
- **Story 2.4:** As a customer, I want to checkout or clear the cart.  
  - Task: Add checkout button, clear all button.  

## Epic 3: Checkout & OTP
- **Story 3.1:** As a customer, I want to enter my shipping info.  
  - Task: Form with Name, Country (default Iraq), Province, Street, Phone.  
  - Task: Fetch country/province data from admin DB.  
- **Story 3.2:** As a customer, I want to verify via WhatsApp OTP.  
  - Task: Send OTP via WhatsApp API (Twilio/Vonage).  
  - Task: OTP input form (6 digits).  
  - Task: Success modal → redirect to orders page.  

## Epic 4: Orders & Tracking
- **Story 4.1:** As a customer, I want to see my order history.  
  - Task: Orders page filtered by phone number.  
- **Story 4.2:** As a customer, I want live order status updates.  
  - Task: WebSocket live status updates.  
- **Story 4.3:** As a customer, I want to contact support.  
  - Task: Customer service button → support chat.  

## Epic 5: Roles & Permissions
- **Story 5.1:** As an admin, I want to define staff roles.  
  - Task: Role-based access (Customer Service, Warehouse, Marketing, Admin, Super Admin).  
- **Story 5.2:** As staff, I want to access only my modules.  
  - Task: Permission system with RBAC.  

## Epic 6: Super Admin Dashboard
- **Story 6.1:** As Super Admin, I want a statistics dashboard.  
- **Story 6.2:** As Super Admin, I want a POS system.  
  - Tasks: POS Manager (sell, customers, shipping, discounts, filters).  
  - Tasks: POS Config (activation toggle).  
- **Story 6.3:** As Super Admin, I want to manage products.  
  - Tasks: CRUD products, brands, categories, attributes, SKU, bulk import/export.  
- **Story 6.4:** As Super Admin, I want to manage orders.  
- **Story 6.5:** As Super Admin, I want to manage customers (phone number identity).  
- **Story 6.6:** As Marketing, I want to manage offers, newsletters, subscribers, coupons.  
- **Story 6.7:** As Marketing, I want to manage blog & categories.  
- **Story 6.8:** As Admin, I want to manage product queries & uploaded files.  
- **Story 6.9:** As Support, I want a live chat system.  
- **Story 6.10:** As Affiliate Manager, I want to manage affiliate system.  
- **Story 6.11:** As Admin, I want offline payment methods & wallet recharge.  
- **Story 6.12:** As Admin, I want website setup controls (header, footer, banners, pages, appearance).  
- **Story 6.13:** As Super Admin, I want system settings.  
  - Shop settings, general settings, OTP settings, languages, currencies, SMTP, payments, analytics, backup, shipping.  
- **Story 6.14:** As Super Admin, I want to manage staff.  
  - Staff CRUD, roles.  
- **Story 6.15:** As Super Admin, I want to manage system updates & addons.  

## Epic 7: Security
- **Story 7.1:** As a developer, I want secure authentication.  
  - Tasks: JWT + NextAuth.js integration.  
  - Tasks: Short-lived tokens, refresh tokens, HttpOnly cookies.  
- **Story 7.2:** As a developer, I want to prevent vulnerabilities.  
  - Tasks: Enforce HTTPS, anti-XSS, anti-clickjacking, token protection.  

## Epic 8: Realtime
- **Story 8.1:** As a customer, I want live order updates.  
  - Task: WebSocket channel for order statuses.  
- **Story 8.2:** As customer service, I want live chat with customers.  
  - Task: WebSocket chat system.  
- **Story 8.3:** As staff, I want real-time notifications.  
  - Task: WebSocket notifications system.  

## Epic 9: Deployment
- **Story 9.1:** As a developer, I want to deploy the system easily.  
  - Tasks: Configure for Vercel/Netlify.  
  - Tasks: Add Docker setup (optional).  

---

# Deliverables
- Frontend (Vue + Shadcn)  
- Backend (Node + Prisma + REST + WebSockets)  
- Database (PostgreSQL)  
- Auth (JWT + NextAuth.js)  
- Admin Dashboard with modules  
- Customer Frontpage, Cart, Checkout, Orders  
- OTP Integration (WhatsApp)  
- Documentation (`cursor.md`)  
