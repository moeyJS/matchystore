const express = require('express')
const { body, validationResult } = require('express-validator')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()


const loadCategorySettings = async (category) => {
  const rows = await prisma.setting.findMany({ where: { category } })
  return rows.reduce((acc, row) => {
    try {
      acc[row.key] = JSON.parse(row.value)
    } catch {
      acc[row.key] = row.value
    }
    return acc
  }, {})
}

const saveCategorySettings = async (category, data) => {
  const keys = Object.keys(data || {})
  const ops = keys.map((key) =>
    prisma.setting.upsert({
      where: { category_key: { category, key } },
      update: { value: typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]) },
      create: { category, key, value: typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]) }
    })
  )
  await prisma.$transaction(ops)
}

// Get general settings
router.get('/general', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('general')
    res.json({
      storeName: settings.storeName || 'MatchyStore',
      storeEmail: settings.storeEmail || 'admin@matchystore.com',
      phone: settings.phone || '+1 (555) 123-4567',
      currency: settings.currency || 'USD',
      address: settings.address || '123 Main Street, City, State 12345'
    })
  } catch (error) {
    console.error('Failed to fetch general settings:', error)
    res.status(500).json({ error: 'Failed to fetch general settings' })
  }
})

// Update general settings
router.put('/general', [
  authenticateToken,
  requireAdmin,
  body('storeName').optional().notEmpty().withMessage('Store name cannot be empty'),
  body('storeEmail').optional().isEmail().withMessage('Store email must be valid'),
  body('phone').optional(),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD']).withMessage('Invalid currency'),
  body('address').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    await saveCategorySettings('general', req.body)
    res.json({ message: 'General settings updated successfully' })
  } catch (error) {
    console.error('Failed to update general settings:', error)
    res.status(500).json({ error: 'Failed to update general settings' })
  }
})

// Get appearance settings
router.get('/appearance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('appearance')
    res.json({
      primaryColor: settings.primaryColor || '#3b82f6',
      secondaryColor: settings.secondaryColor || '#1e40af',
      logo: settings.logo || null
    })
  } catch (error) {
    console.error('Failed to fetch appearance settings:', error)
    res.status(500).json({ error: 'Failed to fetch appearance settings' })
  }
})

// Update appearance settings
router.put('/appearance', [
  authenticateToken,
  requireAdmin,
  body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Primary color must be a valid hex color'),
  body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Secondary color must be a valid hex color'),
  body('logo').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    await saveCategorySettings('appearance', req.body)
    res.json({ message: 'Appearance settings updated successfully' })
  } catch (error) {
    console.error('Failed to update appearance settings:', error)
    res.status(500).json({ error: 'Failed to update appearance settings' })
  }
})

// Get notification settings
router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real app, these would come from a settings table
    const settings = {
      orderNotifications: true,
      customerRegistration: true,
      lowStockAlerts: true,
      systemUpdates: false
    }

    res.json(settings)
  } catch (error) {
    console.error('Failed to fetch notification settings:', error)
    res.status(500).json({ error: 'Failed to fetch notification settings' })
  }
})

// Update notification settings
router.put('/notifications', [
  authenticateToken,
  requireAdmin,
  body('orderNotifications').optional().isBoolean(),
  body('customerRegistration').optional().isBoolean(),
  body('lowStockAlerts').optional().isBoolean(),
  body('systemUpdates').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    await saveCategorySettings('notifications', req.body)
    res.json({ message: 'Notification settings updated successfully' })
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    res.status(500).json({ error: 'Failed to update notification settings' })
  }
})

// System settings (maintenance mode, cache toggle)
router.get('/system', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('system')
    res.json({
      maintenanceMode: settings.maintenanceMode || false,
      cacheEnabled: settings.cacheEnabled || true
    })
  } catch (error) {
    console.error('Failed to fetch system settings:', error)
    res.status(500).json({ error: 'Failed to fetch system settings' })
  }
})

router.put('/system', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await saveCategorySettings('system', req.body)
    res.json({ message: 'System settings updated successfully' })
  } catch (error) {
    console.error('Failed to update system settings:', error)
    res.status(500).json({ error: 'Failed to update system settings' })
  }
})

// SMTP settings + test endpoint (mock send)
router.get('/smtp', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('smtp')
    res.json({
      host: settings.host || '',
      port: settings.port || 587,
      secure: settings.secure || false,
      user: settings.user || '',
      fromEmail: settings.fromEmail || ''
    })
  } catch (error) {
    console.error('Failed to fetch SMTP settings:', error)
    res.status(500).json({ error: 'Failed to fetch SMTP settings' })
  }
})

router.put('/smtp', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await saveCategorySettings('smtp', req.body)
    res.json({ message: 'SMTP settings updated successfully' })
  } catch (error) {
    console.error('Failed to update SMTP settings:', error)
    res.status(500).json({ error: 'Failed to update SMTP settings' })
  }
})

router.post('/smtp/test', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Mock: in real system use nodemailer
    const { to } = req.body
    if (!to) return res.status(400).json({ error: 'Recipient email required' })
    res.json({ message: `Test email sent to ${to} (mock)` })
  } catch (error) {
    console.error('Failed to send test email:', error)
    res.status(500).json({ error: 'Failed to send test email' })
  }
})

// OTP providers configuration
router.get('/otp', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('otp')
    res.json({
      provider: settings.provider || 'mock',
      senderId: settings.senderId || '',
      apiKey: settings.apiKey ? '***' : undefined
    })
  } catch (error) {
    console.error('Failed to fetch OTP settings:', error)
    res.status(500).json({ error: 'Failed to fetch OTP settings' })
  }
})

router.put('/otp', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Do not echo secrets back
    await saveCategorySettings('otp', req.body)
    res.json({ message: 'OTP settings updated successfully' })
  } catch (error) {
    console.error('Failed to update OTP settings:', error)
    res.status(500).json({ error: 'Failed to update OTP settings' })
  }
})

// Analytics settings (GA etc.)
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('analytics')
    res.json({
      gaMeasurementId: settings.gaMeasurementId || ''
    })
  } catch (error) {
    console.error('Failed to fetch analytics settings:', error)
    res.status(500).json({ error: 'Failed to fetch analytics settings' })
  }
})

router.put('/analytics', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await saveCategorySettings('analytics', req.body)
    res.json({ message: 'Analytics settings updated successfully' })
  } catch (error) {
    console.error('Failed to update analytics settings:', error)
    res.status(500).json({ error: 'Failed to update analytics settings' })
  }
})

// Payments providers (ZainCash, FastPay, QiCard)
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('payments')
    res.json({
      zaincash: settings.zaincash || { enabled: false, merchantId: '', secret: '', production: false },
      fastpay: settings.fastpay || { enabled: false, clientId: '', secret: '', production: false },
      qicard: settings.qicard || { enabled: false, terminalId: '', secret: '', production: false }
    })
  } catch (error) {
    console.error('Failed to fetch payments settings:', error)
    res.status(500).json({ error: 'Failed to fetch payments settings' })
  }
})

router.put('/payments', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Store the whole object keyed by provider
    await saveCategorySettings('payments', req.body)
    res.json({ message: 'Payments settings updated successfully' })
  } catch (error) {
    console.error('Failed to update payments settings:', error)
    res.status(500).json({ error: 'Failed to update payments settings' })
  }
})

// Localization: languages & currency
router.get('/localization', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await loadCategorySettings('localization')
    res.json({
      defaultLocale: settings.defaultLocale || 'en',
      supportedLocales: settings.supportedLocales || ['en'],
      currency: settings.currency || 'USD',
      currencyFormat: settings.currencyFormat || 'en-US'
    })
  } catch (error) {
    console.error('Failed to fetch localization settings:', error)
    res.status(500).json({ error: 'Failed to fetch localization settings' })
  }
})

router.put('/localization', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await saveCategorySettings('localization', req.body)
    res.json({ message: 'Localization settings updated successfully' })
  } catch (error) {
    console.error('Failed to update localization settings:', error)
    res.status(500).json({ error: 'Failed to update localization settings' })
  }
})

module.exports = router


