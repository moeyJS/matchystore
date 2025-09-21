# MatchyStore CMS - Full-Stack Socks Store

A complete e-commerce CMS built with Vue.js, Node.js, and PostgreSQL, specifically designed for selling socks with advanced admin features.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Secure checkout with OTP verification via WhatsApp/SMS
- **Order Tracking**: Real-time order status updates
- **Responsive Design**: Mobile-first, modern UI with Tailwind CSS

### Admin Features
- **Dashboard**: Comprehensive analytics and overview
- **Product Management**: CRUD operations, inventory management
- **Order Management**: Process orders, update statuses
- **Customer Management**: View customer information and order history
- **Real-time Updates**: WebSocket integration for live notifications

### Technical Features
- **Authentication**: JWT-based auth with refresh tokens
- **Security**: HTTPS, CSRF protection, secure cookies
- **Real-time**: WebSocket for live updates
- **OTP Integration**: WhatsApp, Twilio, Vonage support
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful API with comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### External Services
- **Twilio** - SMS/WhatsApp OTP
- **Vonage** - Alternative SMS provider
- **Vercel/Netlify** - Deployment ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd matchystore
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb matchystorecms

# Copy environment file
cd server
cp env.example .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://postgres:toor@localhost:5432/matchystorecms?schema=public"
```

### 4. Environment Configuration
Update `server/.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:toor@localhost:5432/matchystorecms?schema=public"

# JWT Secrets (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# OTP Services (optional for development)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Server
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 5. Database Migration & Seeding
```bash
cd server

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 6. Start Development Servers
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
# Backend (Terminal 1)
cd server && npm run dev

# Frontend (Terminal 2)  
cd client && npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database Studio**: `cd server && npm run db:studio`

## 🔐 Default Login Credentials

After seeding the database, you can login with:

**Admin Account:**
- Email: `admin@matchystore.com`
- Password: `admin123`

**Customer Account:**
- Email: `customer@example.com`
- Password: `customer123`

## 📁 Project Structure

```
matchystore/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Pinia stores
│   │   └── main.js        # App entry point
│   ├── index.html
│   └── package.json
├── server/                 # Node.js backend
│   ├── prisma/            # Database schema & migrations
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm run start        # Start production server
```

### Server
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### Client
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### OTP
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/resend` - Resend OTP

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcryptjs
- **HTTPS Enforcement** in production
- **CSRF Protection** via helmet
- **Rate Limiting** on API endpoints
- **Input Validation** using express-validator
- **SQL Injection Protection** via Prisma ORM

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**: Go to [Vercel](https://vercel.com) and import your GitHub repository
2. **Configure Build Settings**:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`
3. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   NODE_ENV=production
   ```
4. **Deploy**: Vercel will automatically deploy on every push to main branch

### Netlify
1. Build the frontend: `cd client && npm run build`
2. Deploy the `client/dist` folder to Netlify
3. Deploy the backend separately (Railway, Heroku, etc.)

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 Configuration

### OTP Services
The application supports multiple OTP providers:

1. **Twilio** (Recommended)
2. **Vonage** (Alternative)
3. **Development Mode** (Logs OTP to console)

Set `OTP_PROVIDER` in your environment variables.

### Database
- **PostgreSQL** (Primary)
- **Prisma ORM** for type-safe database access
- **Migrations** for schema management

## 📱 Mobile Support

- **Responsive Design** - Works on all device sizes
- **Touch-Friendly** - Optimized for mobile interactions
- **PWA Ready** - Can be installed as a mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

### Phase 1 (Current) - MVP ✅
- [x] Customer shopping experience
- [x] Basic admin dashboard
- [x] Order management
- [x] OTP verification

### Phase 2 - Extended Features
- [ ] POS System
- [ ] Marketing tools
- [ ] Blog management
- [ ] Support chat
- [ ] Affiliate system

### Phase 3 - Full CMS
- [ ] Advanced settings
- [ ] Multi-language support
- [ ] Payment gateways
- [ ] Advanced analytics
- [ ] Addon system

---

**Built with ❤️ for the MatchyStore team**








