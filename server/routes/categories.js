const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()


// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get categories list for dropdowns
router.get('/list', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories list:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router


