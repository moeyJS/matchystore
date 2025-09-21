const express = require('express')
const { body, param } = require('express-validator')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const bcrypt = require('bcryptjs')

const router = express.Router()


// List staff
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['CUSTOMER_SERVICE','WAREHOUSE','MARKETING','ADMIN','SUPER_ADMIN'] } },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        username: true,
        phone: true,
        role: true, 
        isActive: true,
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ staff })
  } catch (error) {
    console.error('Error fetching staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create staff
router.post('/', [
  authenticateToken, 
  requireAdmin, 
  body('name').notEmpty().withMessage('Name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['CUSTOMER_SERVICE','WAREHOUSE','MARKETING','ADMIN','SUPER_ADMIN']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const { name, username, email, phone, role, password, isActive = true } = req.body

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: username },
          { email: email }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email: email || null,
        phone: phone || null,
        role,
        password: hashedPassword,
        isActive
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    res.status(201).json({ user })
  } catch (error) {
    console.error('Error creating staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update staff
router.put('/:id', [
  authenticateToken, 
  requireAdmin, 
  param('id').notEmpty(),
  body('name').notEmpty().withMessage('Name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('role').isIn(['CUSTOMER_SERVICE','WAREHOUSE','MARKETING','ADMIN','SUPER_ADMIN']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const { id } = req.params
    const { name, username, email, phone, role, isActive } = req.body

    // Check if username/email already exists for other users
    const existingUser = await prisma.user.findFirst({
      where: { 
        AND: [
          { id: { not: id } },
          {
            OR: [
              { username: username },
              { email: email }
            ]
          }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        username,
        email: email || null,
        phone: phone || null,
        role,
        isActive
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    res.json({ user })
  } catch (error) {
    console.error('Error updating staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete staff
router.delete('/:id', [authenticateToken, requireAdmin, param('id').notEmpty()], async (req, res) => {
  try {
    const { id } = req.params

    // Don't allow deleting super admin
    const user = await prisma.user.findUnique({ where: { id } })
    if (user && user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Cannot delete super admin' })
    }

    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Toggle staff status
router.put('/:id/status', [authenticateToken, requireAdmin, param('id').notEmpty()], async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    res.json({ user })
  } catch (error) {
    console.error('Error toggling staff status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Revoke session (mock implementation)
router.post('/:id/revoke-session', [authenticateToken, requireAdmin, param('id').notEmpty()], async (req, res) => {
  try {
    const { id } = req.params
    
    // In a real implementation, you would:
    // 1. Invalidate all JWT tokens for this user
    // 2. Add tokens to a blacklist
    // 3. Force re-login on next request
    
    res.json({ message: 'Session revoked successfully' })
  } catch (error) {
    console.error('Error revoking session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update role (legacy endpoint)
router.put('/:id/role', [authenticateToken, requireAdmin, param('id').notEmpty(), body('role').isString()], async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const user = await prisma.user.update({ 
      where: { id }, 
      data: { role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    res.json({ user })
  } catch (error) {
    console.error('Error updating role:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router