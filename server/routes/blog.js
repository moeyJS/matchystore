const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();


// ===== BLOG CATEGORIES =====

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories (admin)
router.get('/admin/categories', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      prisma.blogCategory.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.blogCategory.count()
    ]);

    res.json({
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin blog categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/categories', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Category slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug, description } = req.body;

    // Check if slug already exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create blog category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/categories/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Category slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, slug, description, isActive } = req.body;

    // Check if slug already exists (excluding current category)
    const existingCategory = await prisma.blogCategory.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        isActive
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Update blog category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/categories/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has posts
    const postsCount = await prisma.blogPost.count({
      where: { categoryId: id }
    });

    if (postsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing posts. Please move or delete posts first.' 
      });
    }

    await prisma.blogCategory.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete blog category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== BLOG POSTS =====

// Get published posts (public)
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() }
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post (public)
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!post || post.status !== 'PUBLISHED' || post.publishedAt > new Date()) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    res.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts (admin)
router.get('/admin/posts', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post('/posts', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('title').notEmpty().withMessage('Post title is required'),
  body('slug').notEmpty().withMessage('Post slug is required'),
  body('content').notEmpty().withMessage('Post content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      publishedAt
    } = req.body;

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return res.status(400).json({ error: 'Post slug already exists' });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status: status || 'DRAFT',
        authorId: req.user.id,
        categoryId: categoryId || null,
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/posts/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), [
  body('title').notEmpty().withMessage('Post title is required'),
  body('slug').notEmpty().withMessage('Post slug is required'),
  body('content').notEmpty().withMessage('Post content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      publishedAt
    } = req.body;

    // Check if slug already exists (excluding current post)
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existingPost) {
      return res.status(400).json({ error: 'Post slug already exists' });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        categoryId: categoryId || null,
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/posts/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING']), async (req, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
