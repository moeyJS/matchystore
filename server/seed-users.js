const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        username: 'admin',
        email: 'admin@matchystore.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      },
      create: {
        username: 'admin',
        email: 'admin@matchystore.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    console.log('✅ Created/Updated admin user')

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10)
    const customer = await prisma.user.upsert({
      where: { username: 'customer' },
      update: {
        username: 'customer',
        email: 'customer@example.com',
        name: 'Customer User',
        password: customerPassword,
        role: 'CUSTOMER',
        isActive: true
      },
      create: {
        username: 'customer',
        email: 'customer@example.com',
        name: 'Customer User',
        password: customerPassword,
        role: 'CUSTOMER',
        isActive: true
      }
    })
    console.log('✅ Created/Updated customer user')

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10)
    const staff = await prisma.user.upsert({
      where: { username: 'staff' },
      update: {
        username: 'staff',
        email: 'staff@matchystore.com',
        name: 'Staff User',
        password: staffPassword,
        role: 'CUSTOMER_SERVICE',
        isActive: true
      },
      create: {
        username: 'staff',
        email: 'staff@matchystore.com',
        name: 'Staff User',
        password: staffPassword,
        role: 'CUSTOMER_SERVICE',
        isActive: true
      }
    })
    console.log('✅ Created/Updated staff user')

    console.log('🎉 Users seeded successfully!')
    console.log('\nDemo Credentials:')
    console.log('Admin: admin / admin123')
    console.log('Customer: customer / customer123')
    console.log('Staff: staff / staff123')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()

