const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()


// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    res.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get brands list for dropdowns
router.get('/list', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    res.json(brands)
  } catch (error) {
    console.error('Error fetching brands list:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router


