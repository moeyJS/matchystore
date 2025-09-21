const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateUsers() {
  try {
    console.log('🌱 Updating users...')

    // Find existing users and update them
    const existingUsers = await prisma.user.findMany()
    console.log('Found existing users:', existingUsers.length)

    for (const user of existingUsers) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      if (user.email === 'admin@matchystore.com') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: 'admin',
            name: 'Admin User',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true
          }
        })
        console.log('✅ Updated admin user')
      } else if (user.email === 'customer@example.com') {
        const customerPassword = await bcrypt.hash('customer123', 10)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: 'customer',
            name: 'Customer User',
            password: customerPassword,
            role: 'CUSTOMER',
            isActive: true
          }
        })
        console.log('✅ Updated customer user')
      } else {
        // Update other users with username if they don't have one
        if (!user.username) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              username: user.email?.split('@')[0] || `user${user.id.slice(-4)}`,
              isActive: true
            }
          })
          console.log(`✅ Updated user ${user.email} with username`)
        }
      }
    }

    // Create staff user if it doesn't exist
    const staffExists = await prisma.user.findFirst({
      where: { username: 'staff' }
    })

    if (!staffExists) {
      const staffPassword = await bcrypt.hash('staff123', 10)
      await prisma.user.create({
        data: {
          username: 'staff',
          email: 'staff@matchystore.com',
          name: 'Staff User',
          password: staffPassword,
          role: 'CUSTOMER_SERVICE',
          isActive: true
        }
      })
      console.log('✅ Created staff user')
    }

    console.log('🎉 Users updated successfully!')
    console.log('\nDemo Credentials:')
    console.log('Admin: admin / admin123')
    console.log('Customer: customer / customer123')
    console.log('Staff: staff / staff123')

  } catch (error) {
    console.error('❌ Error updating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUsers()


