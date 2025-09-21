const prisma = require('./prisma');

// Circuit breaker pattern for database operations
class DatabaseWrapper {
  constructor() {
    this.isHealthy = true;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.threshold = 5; // Number of failures before opening circuit
    this.timeout = 60000; // 1 minute timeout before trying again
  }

  async execute(operation, ...args) {
    // Check if circuit is open
    if (!this.isHealthy) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.timeout) {
        throw new Error('Database circuit breaker is open. Too many failures.');
      } else {
        // Reset circuit breaker
        this.isHealthy = true;
        this.failureCount = 0;
      }
    }

    try {
      const result = await operation.apply(prisma, args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.isHealthy = true;
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.isHealthy = false;
      console.warn(`⚠️ Database circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', isHealthy: this.isHealthy };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, isHealthy: this.isHealthy };
    }
  }
}

const dbWrapper = new DatabaseWrapper();

// Export wrapped Prisma methods
module.exports = {
  // Raw Prisma client for direct access when needed
  prisma,
  
  // Wrapped methods with circuit breaker
  user: {
    findMany: (...args) => dbWrapper.execute(prisma.user.findMany, ...args),
    findUnique: (...args) => dbWrapper.execute(prisma.user.findUnique, ...args),
    create: (...args) => dbWrapper.execute(prisma.user.create, ...args),
    update: (...args) => dbWrapper.execute(prisma.user.update, ...args),
    delete: (...args) => dbWrapper.execute(prisma.user.delete, ...args),
    count: (...args) => dbWrapper.execute(prisma.user.count, ...args),
  },
  
  product: {
    findMany: (...args) => dbWrapper.execute(prisma.product.findMany, ...args),
    findUnique: (...args) => dbWrapper.execute(prisma.product.findUnique, ...args),
    create: (...args) => dbWrapper.execute(prisma.product.create, ...args),
    update: (...args) => dbWrapper.execute(prisma.product.update, ...args),
    delete: (...args) => dbWrapper.execute(prisma.product.delete, ...args),
    count: (...args) => dbWrapper.execute(prisma.product.count, ...args),
  },
  
  order: {
    findMany: (...args) => dbWrapper.execute(prisma.order.findMany, ...args),
    findUnique: (...args) => dbWrapper.execute(prisma.order.findUnique, ...args),
    create: (...args) => dbWrapper.execute(prisma.order.create, ...args),
    update: (...args) => dbWrapper.execute(prisma.order.update, ...args),
    delete: (...args) => dbWrapper.execute(prisma.order.delete, ...args),
    count: (...args) => dbWrapper.execute(prisma.order.count, ...args),
    aggregate: (...args) => dbWrapper.execute(prisma.order.aggregate, ...args),
  },
  
  category: {
    findMany: (...args) => dbWrapper.execute(prisma.category.findMany, ...args),
    findUnique: (...args) => dbWrapper.execute(prisma.category.findUnique, ...args),
    create: (...args) => dbWrapper.execute(prisma.category.create, ...args),
    update: (...args) => dbWrapper.execute(prisma.category.update, ...args),
    delete: (...args) => dbWrapper.execute(prisma.category.delete, ...args),
    count: (...args) => dbWrapper.execute(prisma.category.count, ...args),
  },
  
  brand: {
    findMany: (...args) => dbWrapper.execute(prisma.brand.findMany, ...args),
    findUnique: (...args) => dbWrapper.execute(prisma.brand.findUnique, ...args),
    create: (...args) => dbWrapper.execute(prisma.brand.create, ...args),
    update: (...args) => dbWrapper.execute(prisma.brand.update, ...args),
    delete: (...args) => dbWrapper.execute(prisma.brand.delete, ...args),
    count: (...args) => dbWrapper.execute(prisma.brand.count, ...args),
  },
  
  // Health check endpoint
  healthCheck: () => dbWrapper.healthCheck(),
  
  // Direct access to Prisma for complex operations
  $queryRaw: (...args) => dbWrapper.execute(prisma.$queryRaw, ...args),
  $executeRaw: (...args) => dbWrapper.execute(prisma.$executeRaw, ...args),
};


