const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()


// Sales Analytics
router.get('/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalSales,
      monthlySales,
      lastMonthSales,
      totalOrders,
      monthlyOrders,
      lastMonthOrders,
      avgOrderValue,
      topProducts
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
      }),
      prisma.order.aggregate({
        _avg: { totalAmount: true }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: { select: { name: true } },
          _count: { select: { orderItems: true } }
        }
      })
    ])

    const currentSales = monthlySales._sum.totalAmount || 0
    const previousSales = lastMonthSales._sum.totalAmount || 0
    const salesGrowth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0

    const currentOrders = monthlyOrders
    const previousOrders = lastMonthOrders
    const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0

    const aov = avgOrderValue._avg.totalAmount || 0
    const aovGrowth = 0 // TODO: Calculate AOV growth

    res.json({
      totalSales: totalSales._sum.totalAmount || 0,
      salesGrowth: Math.round(salesGrowth * 100) / 100,
      totalOrders,
      orderGrowth: Math.round(orderGrowth * 100) / 100,
      avgOrderValue: aov,
      aovGrowth,
      conversionRate: 12.5, // TODO: Calculate from analytics
      conversionGrowth: 0,
      topProducts: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        sales: product._count.orderItems,
        revenue: product._count.orderItems * parseFloat(product.price)
      }))
    })
  } catch (error) {
    console.error('Failed to fetch sales analytics:', error)
    res.status(500).json({ error: 'Failed to fetch sales analytics' })
  }
})

// Customer Analytics
router.get('/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalCustomers,
      newCustomers,
      activeCustomers,
      customerLifetimeValue
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.order.aggregate({
        _avg: { totalAmount: true }
      })
    ])

    const activePercentage = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0
    const clv = customerLifetimeValue._avg.totalAmount || 0

    res.json({
      totalCustomers,
      newCustomers,
      activeCustomers,
      activePercentage: Math.round(activePercentage * 100) / 100,
      clv,
      clvGrowth: 0, // TODO: Calculate CLV growth
      retentionRate: 75.2, // TODO: Calculate retention rate
      retentionGrowth: 0
    })
  } catch (error) {
    console.error('Failed to fetch customer analytics:', error)
    res.status(500).json({ error: 'Failed to fetch customer analytics' })
  }
})

// Product Analytics
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalProducts,
      newProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } })
    ])

    const activePercentage = totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0

    res.json({
      totalProducts,
      newProducts,
      activeProducts,
      activePercentage: Math.round(activePercentage * 100) / 100,
      lowStockItems: lowStockProducts,
      outOfStock: outOfStockProducts
    })
  } catch (error) {
    console.error('Failed to fetch product analytics:', error)
    res.status(500).json({ error: 'Failed to fetch product analytics' })
  }
})

module.exports = router




