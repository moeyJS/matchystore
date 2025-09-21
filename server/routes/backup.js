const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const router = express.Router();


// Backup configuration - Fixed for Vercel serverless
const BACKUP_DIR = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'tmp', 'backups')
  : path.join(__dirname, '../backups');

// Only create directory if not in production (Vercel handles this differently)
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Manual backup
router.post('/create', [
  authenticateToken,
  requireAdmin,
  body('format').isIn(['json', 'sql']).withMessage('Invalid format'),
  body('type').isIn(['full', 'data', 'schema']).withMessage('Invalid backup type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format, type } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type}-${timestamp}.${format}`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    let backupData;

    if (format === 'json') {
      backupData = await createJSONBackup(type);
    } else if (format === 'sql') {
      backupData = await createSQLBackup(type);
    }

    // Write backup to file
    fs.writeFileSync(filepath, backupData);

    res.json({
      success: true,
      message: 'Backup created successfully',
      filename,
      filepath,
      size: fs.statSync(filepath).size,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// List backups
router.get('/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && (file.endsWith('.json') || file.endsWith('.sql')))
      .map(file => {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          type: file.includes('-full-') ? 'full' : file.includes('-data-') ? 'data' : 'schema',
          format: file.endsWith('.json') ? 'json' : 'sql'
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ backups: files });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Download backup
router.get('/download/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(filepath, filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Delete backup
router.delete('/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    fs.unlinkSync(filepath);

    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Get backup status
router.get('/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tasks = cron.getTasks();
    console.log('All cron tasks:', tasks);
    
    // Handle case where getTasks() might return different format
    let backupTask = null;
    if (Array.isArray(tasks)) {
      backupTask = tasks.find(task => task.name === 'auto-backup');
    } else if (tasks && typeof tasks === 'object') {
      // If it's an object, look for the task by name
      backupTask = tasks['auto-backup'] || null;
    }
    
    res.json({
      hasScheduledTask: !!backupTask,
      taskRunning: backupTask ? (backupTask.running || false) : false,
      taskScheduled: backupTask ? (backupTask.scheduled || false) : false,
      allTasks: Array.isArray(tasks) ? tasks.map(task => ({
        name: task.name,
        running: task.running,
        scheduled: task.scheduled
      })) : Object.keys(tasks).map(name => ({
        name,
        running: tasks[name].running || false,
        scheduled: tasks[name].scheduled || false
      }))
    });
  } catch (error) {
    console.error('Error getting backup status:', error);
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// Get backup settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get backup settings from database or return defaults
    const settings = await prisma.setting.findMany({
      where: {
        category: 'backup'
      }
    });

    const backupSettings = {
      autoBackup: false,
      frequency: 'daily',
      time: '02:00',
      format: 'json',
      type: 'full',
      retention: 30
    };

    settings.forEach(setting => {
      try {
        backupSettings[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        console.warn(`Failed to parse setting ${setting.key}:`, e);
      }
    });

    res.json(backupSettings);
  } catch (error) {
    console.error('Error getting backup settings:', error);
    res.status(500).json({ error: 'Failed to get backup settings' });
  }
});

// Test backup (for debugging)
router.post('/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Testing backup creation...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const backupData = await createJSONBackup('full');
    fs.writeFileSync(filepath, backupData);

    res.json({
      success: true,
      message: 'Test backup created successfully',
      filename,
      size: fs.statSync(filepath).size
    });
  } catch (error) {
    console.error('Error creating test backup:', error);
    res.status(500).json({ error: 'Failed to create test backup' });
  }
});

// Test cron job (run the scheduled backup function directly)
router.post('/test-cron', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Testing cron job execution...');
    
    // Get current settings
    const settings = await prisma.setting.findMany({
      where: { category: 'backup' }
    });

    const backupSettings = {
      autoBackup: false,
      frequency: 'daily',
      time: '02:00',
      format: 'json',
      type: 'full',
      retention: 30
    };

    settings.forEach(setting => {
      try {
        backupSettings[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        console.warn(`Failed to parse setting ${setting.key}:`, e);
      }
    });

    // Run the backup function directly (same as cron would)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-cron-backup-${timestamp}.${backupSettings.format}`;
    const filepath = path.join(BACKUP_DIR, filename);

    let backupData;
    if (backupSettings.format === 'json') {
      backupData = await createJSONBackup(backupSettings.type);
    } else {
      backupData = await createSQLBackup(backupSettings.type);
    }

    fs.writeFileSync(filepath, backupData);
    console.log(`Test cron backup created: ${filename}`);

    res.json({
      success: true,
      message: 'Cron job test completed successfully',
      filename,
      size: fs.statSync(filepath).size
    });
  } catch (error) {
    console.error('Error testing cron job:', error);
    res.status(500).json({ error: 'Failed to test cron job' });
  }
});

// Trigger scheduled backup manually (for testing)
router.post('/trigger', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Manually triggering scheduled backup...');
    
    // Get current settings
    const settings = await prisma.setting.findMany({
      where: { category: 'backup' }
    });

    const backupSettings = {
      autoBackup: false,
      frequency: 'daily',
      time: '02:00',
      format: 'json',
      type: 'full',
      retention: 30
    };

    settings.forEach(setting => {
      try {
        backupSettings[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        console.warn(`Failed to parse setting ${setting.key}:`, e);
      }
    });

    if (!backupSettings.autoBackup) {
      return res.status(400).json({ error: 'Auto backup is not enabled' });
    }

    // Run the backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${backupSettings.type}-${timestamp}.${backupSettings.format}`;
    const filepath = path.join(BACKUP_DIR, filename);

    let backupData;
    if (backupSettings.format === 'json') {
      backupData = await createJSONBackup(backupSettings.type);
    } else {
      backupData = await createSQLBackup(backupSettings.type);
    }

    fs.writeFileSync(filepath, backupData);
    console.log(`Manual trigger backup created: ${filename}`);

    res.json({
      success: true,
      message: 'Scheduled backup triggered successfully',
      filename,
      size: fs.statSync(filepath).size
    });
  } catch (error) {
    console.error('Error triggering scheduled backup:', error);
    res.status(500).json({ error: 'Failed to trigger scheduled backup' });
  }
});

// Update backup settings
router.put('/settings', [
  authenticateToken,
  requireAdmin,
  body('autoBackup').isBoolean(),
  body('frequency').isIn(['daily', 'weekly', 'monthly']),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('format').isIn(['json', 'sql']),
  body('type').isIn(['full', 'data', 'schema']),
  body('retention').isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { autoBackup, frequency, time, format, type, retention } = req.body;

    // Save settings to database
    const settings = [
      { category: 'backup', key: 'autoBackup', value: JSON.stringify(autoBackup) },
      { category: 'backup', key: 'frequency', value: JSON.stringify(frequency) },
      { category: 'backup', key: 'time', value: JSON.stringify(time) },
      { category: 'backup', key: 'format', value: JSON.stringify(format) },
      { category: 'backup', key: 'type', value: JSON.stringify(type) },
      { category: 'backup', key: 'retention', value: JSON.stringify(retention) }
    ];

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: {
          category_key: {
            category: setting.category,
            key: setting.key
          }
        },
        update: { value: setting.value },
        create: setting
      });
    }

    // Update cron job if auto backup is enabled
    if (autoBackup) {
      console.log('Enabling auto backup with settings:', { frequency, time, format, type });
      const task = scheduleBackup(frequency, time, format, type);
      if (task) {
        console.log('Auto backup task created successfully');
      } else {
        console.error('Failed to create auto backup task');
      }
    } else {
      // Cancel existing cron job
      console.log('Disabling auto backup - cancelling existing tasks');
      cron.getTasks().forEach(task => {
        if (task.name === 'auto-backup') {
          console.log('Destroying existing auto-backup task');
          task.destroy();
        }
      });
    }

    res.json({ success: true, message: 'Backup settings updated successfully' });
  } catch (error) {
    console.error('Error updating backup settings:', error);
    res.status(500).json({ error: 'Failed to update backup settings' });
  }
});

// Helper functions
async function createJSONBackup(type) {
  const backup = {
    metadata: {
      type,
      createdAt: new Date().toISOString(),
      version: '1.0'
    },
    data: {}
  };

  if (type === 'full' || type === 'data') {
    // Get all data from all tables - using the actual Prisma model names
    const tables = [
      'user', 'product', 'category', 'brand', 'order', 'orderItem', 'cartItem',
      'supportTicket', 'supportMessage', 'blogPost', 'fileUpload',
      'affiliateUser', 'page', 'setting', 'banner', 'footerSection', 'footerLink', 'socialLink',
      'productAttribute'
    ];

    for (const table of tables) {
      try {
        console.log(`Backing up table: ${table}`);
        const data = await prisma[table].findMany();
        backup.data[table] = data;
        console.log(`Backed up ${data.length} records from ${table}`);
      } catch (error) {
        console.warn(`Could not backup table ${table}:`, error.message);
        backup.data[table] = [];
      }
    }
  }

  if (type === 'full' || type === 'schema') {
    // Add schema information
    backup.schema = {
      version: '1.0',
      tables: Object.keys(backup.data),
      prismaVersion: '5.0.0'
    };
  }

  return JSON.stringify(backup, null, 2);
}

async function createSQLBackup(type) {
  // This is a simplified SQL backup
  // In a real implementation, you would use pg_dump or similar
  let sql = `-- Backup created at ${new Date().toISOString()}\n`;
  sql += `-- Type: ${type}\n\n`;

  if (type === 'full' || type === 'data') {
    // Export data as INSERT statements - include all tables
    const tables = [
      'user', 'product', 'category', 'brand', 'order', 'orderItem', 'cartItem',
      'supportTicket', 'supportMessage', 'blogPost', 'fileUpload',
      'affiliateUser', 'page', 'setting', 'banner', 'footerSection', 'footerLink', 'socialLink',
      'productAttribute'
    ];
    
    for (const table of tables) {
      try {
        console.log(`Backing up table for SQL: ${table}`);
        const data = await prisma[table].findMany();
        if (data.length > 0) {
          sql += `-- Data for table ${table}\n`;
          sql += `TRUNCATE TABLE "${table}" CASCADE;\n`;
          
          for (const record of data) {
            const columns = Object.keys(record).join(', ');
            const values = Object.values(record).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              return value;
            }).join(', ');
            
            sql += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`;
          }
          sql += '\n';
          console.log(`Backed up ${data.length} records from ${table} for SQL`);
        }
      } catch (error) {
        console.warn(`Could not backup table ${table}:`, error.message);
      }
    }
  }

  return sql;
}

function scheduleBackup(frequency, time, format, type) {
  // Cancel existing cron job
  cron.getTasks().forEach(task => {
    if (task.name === 'auto-backup') {
      task.destroy();
    }
  });

  let cronExpression;
  const [hour, minute] = time.split(':');

  switch (frequency) {
    case 'daily':
      cronExpression = `${minute} ${hour} * * *`;
      break;
    case 'weekly':
      cronExpression = `${minute} ${hour} * * 0`; // Sunday
      break;
    case 'monthly':
      cronExpression = `${minute} ${hour} 1 * *`; // First day of month
      break;
    default:
      cronExpression = `${minute} ${hour} * * *`;
  }

  console.log(`Scheduling backup with cron expression: ${cronExpression}`);
  console.log(`Backup will run at ${time} ${frequency}`);

  const task = cron.schedule(cronExpression, async () => {
    try {
      console.log('=== SCHEDULED BACKUP TRIGGERED ===');
      console.log('Current time:', new Date().toISOString());
      console.log('Backup type:', type, 'Format:', format);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${type}-${timestamp}.${format}`;
      const filepath = path.join(BACKUP_DIR, filename);

      let backupData;
      if (format === 'json') {
        backupData = await createJSONBackup(type);
      } else {
        backupData = await createSQLBackup(type);
      }

      fs.writeFileSync(filepath, backupData);
      console.log(`Scheduled backup created: ${filename}`);
      console.log(`File size: ${fs.statSync(filepath).size} bytes`);

      // Clean up old backups based on retention policy
      await cleanupOldBackups();
      console.log('=== SCHEDULED BACKUP COMPLETED ===');
    } catch (error) {
      console.error('Error in scheduled backup:', error);
    }
  }, {
    name: 'auto-backup',
    scheduled: true,
    timezone: 'Asia/Baghdad' // Use Iraq timezone (UTC+3)
  });

  console.log('Backup task scheduled successfully');
  return task;
}

async function cleanupOldBackups() {
  try {
    // Check if backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }

    const settings = await prisma.setting.findMany({
      where: { category: 'backup' }
    });

    const retention = settings.find(s => s.key === 'retention')?.value || '30';
    const retentionDays = parseInt(JSON.parse(retention));

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        createdAt: fs.statSync(path.join(BACKUP_DIR, file)).birthtime
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    for (const file of files) {
      if (new Date(file.createdAt) < cutoffDate) {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

// Initialize backup settings on startup
async function initializeBackupSettings() {
  try {
    const settings = await prisma.setting.findMany({
      where: { category: 'backup' }
    });

    const backupSettings = {
      autoBackup: false,
      frequency: 'daily',
      time: '02:00',
      format: 'json',
      type: 'full',
      retention: 30
    };

    settings.forEach(setting => {
      try {
        backupSettings[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        console.warn(`Failed to parse setting ${setting.key}:`, e);
      }
    });

    if (backupSettings.autoBackup) {
      console.log('Initializing auto backup on startup with settings:', backupSettings);
      scheduleBackup(backupSettings.frequency, backupSettings.time, backupSettings.format, backupSettings.type);
    }
  } catch (error) {
    console.error('Error initializing backup settings:', error);
  }
}

// Initialize on module load
initializeBackupSettings();

// Test cron job every minute to verify it's working
cron.schedule('* * * * *', () => {
  console.log('Cron test - Current time:', new Date().toISOString());
}, {
  name: 'cron-test',
  scheduled: true,
  timezone: 'Asia/Baghdad' // Use Iraq timezone (UTC+3)
});

module.exports = router;
