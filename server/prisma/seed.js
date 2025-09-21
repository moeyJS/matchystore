const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@matchystore.com' },
    update: {
      username: 'admin'
    },
    create: {
      email: 'admin@matchystore.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Super admin created:', superAdmin.email);

  // Create sample brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { name: 'Nike' },
      update: {},
      create: {
        name: 'Nike',
        logo: 'https://via.placeholder.com/100x50/000000/FFFFFF?text=Nike',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { name: 'Adidas' },
      update: {},
      create: {
        name: 'Adidas',
        logo: 'https://via.placeholder.com/100x50/000000/FFFFFF?text=Adidas',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { name: 'Puma' },
      update: {},
      create: {
        name: 'Puma',
        logo: 'https://via.placeholder.com/100x50/000000/FFFFFF?text=Puma',
        isActive: true
      }
    })
  ]);

  console.log('✅ Brands created:', brands.length);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Athletic Socks' },
      update: {},
      create: {
        name: 'Athletic Socks',
        description: 'High-performance socks for sports and exercise',
        image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Athletic',
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Casual Socks' },
      update: {},
      create: {
        name: 'Casual Socks',
        description: 'Comfortable everyday socks for daily wear',
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Casual',
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Dress Socks' },
      update: {},
      create: {
        name: 'Dress Socks',
        description: 'Formal socks for business and special occasions',
        image: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Dress',
        isActive: true
      }
    })
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'NKE-ATH-001' },
      update: {},
      create: {
        name: 'Nike Dri-FIT Crew Socks',
        description: 'Moisture-wicking athletic socks with cushioned sole for maximum comfort during workouts.',
        price: 12.99,
        sku: 'NKE-ATH-001',
        stock: 50,
        images: [
          'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Nike+Dri-FIT',
          'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Side+View'
        ],
        brandId: brands[0].id,
        categoryId: categories[0].id,
        isActive: true,
        attributes: {
          create: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'White' },
            { name: 'Material', value: 'Polyester, Nylon' }
          ]
        }
      }
    }),
    prisma.product.upsert({
      where: { sku: 'ADI-CAS-001' },
      update: {},
      create: {
        name: 'Adidas Originals 3-Stripe Socks',
        description: 'Classic casual socks with iconic 3-stripe design. Perfect for everyday wear.',
        price: 8.99,
        sku: 'ADI-CAS-001',
        stock: 75,
        images: [
          'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Adidas+3-Stripe',
          'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Detail+View'
        ],
        brandId: brands[1].id,
        categoryId: categories[1].id,
        isActive: true,
        attributes: {
          create: [
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Black' },
            { name: 'Material', value: 'Cotton, Polyester' }
          ]
        }
      }
    }),
    prisma.product.upsert({
      where: { sku: 'PUM-DRS-001' },
      update: {},
      create: {
        name: 'Puma Classic Dress Socks',
        description: 'Elegant dress socks made from fine cotton blend. Perfect for formal occasions.',
        price: 15.99,
        sku: 'PUM-DRS-001',
        stock: 30,
        images: [
          'https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=Puma+Dress',
          'https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=Formal+Style'
        ],
        brandId: brands[2].id,
        categoryId: categories[2].id,
        isActive: true,
        attributes: {
          create: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'Navy' },
            { name: 'Material', value: 'Cotton, Elastane' }
          ]
        }
      }
    }),
    prisma.product.upsert({
      where: { sku: 'NKE-ATH-002' },
      update: {},
      create: {
        name: 'Nike Elite Basketball Socks',
        description: 'High-performance basketball socks with extra cushioning and arch support.',
        price: 18.99,
        sku: 'NKE-ATH-002',
        stock: 25,
        images: [
          'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Nike+Elite',
          'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Basketball+Style'
        ],
        brandId: brands[0].id,
        categoryId: categories[0].id,
        isActive: true,
        attributes: {
          create: [
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Black/White' },
            { name: 'Material', value: 'Dri-FIT Technology' }
          ]
        }
      }
    }),
    prisma.product.upsert({
      where: { sku: 'ADI-CAS-002' },
      update: {},
      create: {
        name: 'Adidas Comfort Crew Socks',
        description: 'Ultra-comfortable crew socks with soft cotton blend and reinforced heel and toe.',
        price: 6.99,
        sku: 'ADI-CAS-002',
        stock: 100,
        images: [
          'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Adidas+Comfort',
          'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Comfort+Style'
        ],
        brandId: brands[1].id,
        categoryId: categories[1].id,
        isActive: true,
        attributes: {
          create: [
            { name: 'Size', value: 'S' },
            { name: 'Color', value: 'Gray' },
            { name: 'Material', value: 'Cotton, Spandex' }
          ]
        }
      }
    })
  ]);

  console.log('✅ Products created:', products.length);

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      username: 'customer'
    },
    create: {
      email: 'customer@example.com',
      username: 'customer',
      password: customerPassword,
      name: 'John Doe',
      phone: '+9641234567890',
      role: 'CUSTOMER'
    }
  });

  console.log('✅ Sample customer created:', customer.email);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Super Admin: admin@matchystore.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

