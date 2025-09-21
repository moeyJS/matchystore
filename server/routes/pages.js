const express = require('express')
const { body, param } = require('express-validator')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()


// List pages (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json({ pages })
  } catch (error) {
    console.error('Failed to list pages:', error)
    res.status(500).json({ error: 'Failed to list pages' })
  }
})

// Get single page by id (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = await prisma.page.findUnique({ where: { id: req.params.id } })
    if (!page) return res.status(404).json({ error: 'Page not found' })
    res.json({ page })
  } catch (error) {
    console.error('Failed to get page:', error)
    res.status(500).json({ error: 'Failed to get page' })
  }
})

// Create page
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [body('title').notEmpty(), body('slug').notEmpty(), body('content').notEmpty()],
  async (req, res) => {
    try {
      const { title, slug, content, seoTitle, seoDescription, status, publishedAt } = req.body
      const page = await prisma.page.create({
        data: { title, slug, content, seoTitle, seoDescription, status, publishedAt }
      })
      res.status(201).json({ page })
    } catch (error) {
      console.error('Failed to create page:', error)
      res.status(500).json({ error: 'Failed to create page' })
    }
  }
)

// Update page
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [param('id').notEmpty()],
  async (req, res) => {
    try {
      const { title, slug, content, seoTitle, seoDescription, status, publishedAt } = req.body
      const page = await prisma.page.update({
        where: { id: req.params.id },
        data: { title, slug, content, seoTitle, seoDescription, status, publishedAt }
      })
      res.json({ page })
    } catch (error) {
      console.error('Failed to update page:', error)
      res.status(500).json({ error: 'Failed to update page' })
    }
  }
)

// Delete page
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete page:', error)
    res.status(500).json({ error: 'Failed to delete page' })
  }
})

// Public: get by slug when published
router.get('/public/slug/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED' }
    })
    if (!page) return res.status(404).json({ error: 'Page not found' })
    res.json({ page })
  } catch (error) {
    console.error('Failed to fetch page by slug:', error)
    res.status(500).json({ error: 'Failed to fetch page' })
  }
})

module.exports = router






