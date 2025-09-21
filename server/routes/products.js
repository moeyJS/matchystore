const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get all products (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().isString(),
  query('brand').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { categoryId: category }),
      ...(brand && { brandId: brand }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          attributes: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
        category: true,
        attributes: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireStaff, [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('sku').optional().trim(),
  body('barcode').optional().trim(),
  body('stock').isInt({ min: 0 }),
  body('images').isArray(),
  body('colors').optional().isArray(),
  body('brandId').optional().isString(),
  body('categoryId').optional().isString(),
  body('attributes').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      sku,
      barcode,
      stock,
      images,
      colors = [],
      brandId,
      categoryId,
      attributes = []
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingProduct) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Check if barcode already exists
    if (barcode) {
      const existingProduct = await prisma.product.findUnique({
        where: { barcode }
      });
      if (existingProduct) {
        return res.status(400).json({ error: 'Barcode already exists' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        sku,
        barcode,
        stock: parseInt(stock),
        images,
        colors,
        brandId: brandId || null,
        categoryId: categoryId || null,
        attributes: {
          create: attributes.map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        }
      },
      include: {
        brand: true,
        category: true,
        attributes: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireStaff, [
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('sku').optional().trim(),
  body('barcode').optional().trim(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  body('colors').optional().isArray(),
  body('brandId').optional().isString(),
  body('categoryId').optional().isString(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU already exists (if being updated)
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });
      if (skuExists) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Check if barcode already exists (if being updated)
    if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findUnique({
        where: { barcode: updateData.barcode }
      });
      if (barcodeExists) {
        return res.status(400).json({ error: 'Barcode already exists' });
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        ...(updateData.price && { price: parseFloat(updateData.price) }),
        ...(updateData.stock && { stock: parseInt(updateData.stock) })
      },
      include: {
        brand: true,
        category: true,
        attributes: true
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get brands
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, logo: true }
    });

    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, image: true }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

