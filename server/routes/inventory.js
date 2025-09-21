const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { body, validationResult } = require('express-validator')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()


// Get inventory stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalProducts,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 10 } } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } })
    ])

    res.json({
      totalProducts,
      inStock: inStockProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts
    })
  } catch (error) {
    console.error('Failed to fetch inventory stats:', error)
    res.status(500).json({ error: 'Failed to fetch inventory stats' })
  }
})

// Adjust stock
router.post('/adjust', [
  authenticateToken,
  requireAdmin,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('type').isIn(['add', 'remove', 'set']).withMessage('Type must be add, remove, or set'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
  body('reason').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { productId, type, quantity, reason } = req.body

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let newStock = product.stock

    switch (type) {
      case 'add':
        newStock = product.stock + quantity
        break
      case 'remove':
        newStock = Math.max(0, product.stock - quantity)
        break
      case 'set':
        newStock = quantity
        break
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    })

    // Log the adjustment (in a real app, you'd have a stock adjustment log table)
    console.log(`Stock adjusted for product ${productId}: ${type} ${quantity} units. New stock: ${newStock}. Reason: ${reason || 'No reason provided'}`)

    res.json({
      message: 'Stock adjusted successfully',
      product: updatedProduct,
      adjustment: {
        type,
        quantity,
        previousStock: product.stock,
        newStock,
        reason
      }
    })
  } catch (error) {
    console.error('Failed to adjust stock:', error)
    res.status(500).json({ error: 'Failed to adjust stock' })
  }
})

// Get low stock products
router.get('/low-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { threshold = 10 } = req.query

    const products = await prisma.product.findMany({
      where: {
        stock: { lte: parseInt(threshold) },
        isActive: true
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { stock: 'asc' }
    })

    res.json({ products })
  } catch (error) {
    console.error('Failed to fetch low stock products:', error)
    res.status(500).json({ error: 'Failed to fetch low stock products' })
  }
})

// Get out of stock products
router.get('/out-of-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: 0,
        isActive: true
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    })

    res.json({ products })
  } catch (error) {
    console.error('Failed to fetch out of stock products:', error)
    res.status(500).json({ error: 'Failed to fetch out of stock products' })
  }
})

// Bulk stock update
router.post('/bulk-update', [
  authenticateToken,
  requireAdmin,
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.productId').notEmpty().withMessage('Product ID is required'),
  body('updates.*.stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { updates } = req.body

    const updatePromises = updates.map(update =>
      prisma.product.update({
        where: { id: update.productId },
        data: { stock: update.stock }
      })
    )

    const updatedProducts = await Promise.all(updatePromises)

    res.json({
      message: 'Bulk stock update completed',
      updatedCount: updatedProducts.length,
      products: updatedProducts
    })
  } catch (error) {
    console.error('Failed to perform bulk stock update:', error)
    res.status(500).json({ error: 'Failed to perform bulk stock update' })
  }
})

module.exports = router






