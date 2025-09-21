const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const maintenance = require('./middleware/maintenance');
const otpRoutes = require('./routes/otp');
const supportRoutes = require('./routes/support');
const posRoutes = require('./routes/pos');
const marketingRoutes = require('./routes/marketing');
const blogRoutes = require('./routes/blog');
const pagesRoutes = require('./routes/pages');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');
const inventoryRoutes = require('./routes/inventory');
const staffRoutes = require('./routes/staff');
const bannersRoutes = require('./routes/banners');
const footerRoutes = require('./routes/footer');
const reportsRoutes = require('./routes/reports');
// Lazy load backup routes to avoid directory creation issues in Vercel
// const backupRoutes = require('./routes/backup');

// Initialize Prisma with error handling
let prisma;
try {
  prisma = require('./lib/prisma');
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  process.exit(1);
}

const app = express();

// Trust proxy for Vercel serverless environment
app.set('trust proxy', 1);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - configured for Vercel serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

// More lenient rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // limit each IP to 2000 requests per windowMs for admin
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

app.use('/api/', limiter);
app.use('/api/admin/', adminLimiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Maintenance middleware (after parsers, before routes)
app.use(maintenance());

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin/pages', pagesRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/brands', brandRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/admin/reports', reportsRoutes);
// Only load backup routes in development or when explicitly needed
if (process.env.NODE_ENV !== 'production') {
  const backupRoutes = require('./routes/backup');
  app.use('/api/admin/backup', backupRoutes);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    message: 'Store CMS API is running'
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for order updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room: user-${userId}`);
  });

  // Join admin room for support tickets
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined support room: admin-room');
    console.log('Admin socket ID:', socket.id);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    if (data.isFromAdmin) {
      socket.to(`user-${data.userId}`).emit('admin-typing', {
        ticketId: data.ticketId
      });
    } else {
      socket.to('admin-room').emit('customer-typing', {
        userId: data.userId,
        ticketId: data.ticketId
      });
    }
  });

  // Handle support chat messages
  socket.on('support-message', async (data) => {
    try {
      // Save message to database
      const message = await prisma.supportMessage.create({
        data: {
          ticketId: data.ticketId,
          message: data.message,
          isFromAdmin: data.isFromAdmin || false,
          attachments: data.attachments || null
        }
      });

      // Broadcast to relevant users
      if (data.isFromAdmin) {
        socket.to(`user-${data.userId}`).emit('support-message', {
          ...message,
          ticketId: data.ticketId,
          userId: data.userId
        });
      } else {
        socket.to('admin-room').emit('support-message', {
          ...message,
          ticketId: data.ticketId,
          userId: data.userId
        });
      }
    } catch (error) {
      console.error('Error handling support message:', error);
    }
  });

  // Handle ticket status updates
  socket.on('ticket-status-updated', (data) => {
    socket.to(`user-${data.userId}`).emit('ticket-status-updated', {
      ticketId: data.ticketId,
      status: data.status
    });
  });

  // Handle new ticket notifications
  socket.on('new-ticket', (ticket) => {
    socket.to('admin-room').emit('new-support-ticket', ticket);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, io, prisma };
