const { PrismaClient } = require('@prisma/client');

// Configure connection pooling in the database URL
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Add connection pooling parameters to the URL
  const url = new URL(baseUrl);
  url.searchParams.set('connection_limit', '5');
  url.searchParams.set('pool_timeout', '20');
  url.searchParams.set('connect_timeout', '60');
  
  return url.toString();
};

// Create a single Prisma client instance with connection pooling
const prisma = new PrismaClient({
  log: ['error', 'warn'], // Reduced logging to minimize overhead
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

// Add connection retry mechanism
const connectWithRetry = async (retries = 3) => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    if (retries > 0) {
      console.log(`❌ Database connection failed. Retrying in 5 seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectWithRetry(retries - 1);
    } else {
      console.error('❌ Failed to connect to database after all retries:', error);
      throw error;
    }
  }
};

// Initialize connection
connectWithRetry().catch(console.error);

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔄 Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
