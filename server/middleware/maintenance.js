const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const prisma = new PrismaClient()

const loadSystemSettings = async () => {
  const rows = await prisma.setting.findMany({ where: { category: 'system' } })
  return rows.reduce((acc, row) => {
    try { acc[row.key] = JSON.parse(row.value) } catch { acc[row.key] = row.value }
    return acc
  }, {})
}

module.exports = function maintenanceMiddleware() {
  return async (req, res, next) => {
    try {
      const settings = await loadSystemSettings()
      const maintenance = !!settings.maintenanceMode
      if (!maintenance) return next()

      // Allow admin API, auth endpoints (so admins can log in), and health
      if (
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/api/auth') ||
        req.path.startsWith('/api/health')
      ) {
        return next()
      }

      // Allow static assets and uploads so the client can render a friendly page
      if (
        req.path.startsWith('/uploads') ||
        req.path.startsWith('/assets') ||
        req.path === '/' ||
        req.path === '/index.html' ||
        req.path.startsWith('/favicon') ||
        req.path.startsWith('/manifest') ||
        req.path === '/robots.txt'
      ) {
        return next()
      }

      // If request has a valid admin token, allow any API for maintenance access
      if (req.path.startsWith('/api')) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token && process.env.JWT_SECRET) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded && decoded.userId) {
              // Look up user role from database
              const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true }
              })
              if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
                return next()
              }
            }
          } catch (e) {
            // ignore and fall through to maintenance response
          }
        }
      }

      // Friendly maintenance page for non-API requests
      if (!req.path.startsWith('/api')) {
        res.status(503).send(
          `<!doctype html>
          <html lang="en"><head><meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>We'll be back soon</title>
          <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh} .card{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;max-width:520px;box-shadow:0 10px 30px rgba(0,0,0,.4)} h1{margin:0 0 8px;font-size:28px} p{margin:0 0 12px;color:#94a3b8} .small{font-size:12px;color:#64748b}</style>
          </head><body><div class="card">
          <h1>Maintenance in progress</h1>
          <p>We are performing scheduled maintenance to improve your experience.</p>
          <p>Please check back in a little while.</p>
          <p class="small">If you are an administrator, you can still access the admin panel.</p>
          </div></body></html>`
        )
        return
      }

      res.status(503).json({ error: 'Maintenance mode is enabled. Please try again later.' })
    } catch (e) {
      // Fail open
      return next()
    }
  }
}


