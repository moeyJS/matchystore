const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const router = express.Router();


// Generate report
router.post('/generate', [
  authenticateToken,
  requireAdmin,
  body('type').isIn(['sales', 'orders', 'customers', 'products', 'inventory', 'financial']).withMessage('Invalid report type'),
  body('dateFrom').isISO8601().withMessage('Invalid date from'),
  body('dateTo').isISO8601().withMessage('Invalid date to'),
  body('format').isIn(['pdf', 'excel', 'csv']).withMessage('Invalid format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, dateFrom, dateTo, format } = req.body;
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    let reportData = {};

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case 'orders':
        reportData = await generateOrdersReport(startDate, endDate);
        break;
      case 'customers':
        reportData = await generateCustomersReport(startDate, endDate);
        break;
      case 'products':
        reportData = await generateProductsReport(startDate, endDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport(startDate, endDate);
        break;
      case 'financial':
        reportData = await generateFinancialReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate file based on format
    let fileName;
    let filePath;
    let downloadUrl;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFileName = `${type}-report-${timestamp}`;

    switch (format) {
      case 'pdf':
        fileName = `${baseFileName}.pdf`;
        filePath = path.join(reportsDir, fileName);
        await generatePDFReport(reportData, filePath, type, dateFrom, dateTo);
        break;
      case 'excel':
        fileName = `${baseFileName}.xlsx`;
        filePath = path.join(reportsDir, fileName);
        await generateExcelReport(reportData, filePath, type, dateFrom, dateTo);
        break;
      case 'csv':
        fileName = `${baseFileName}.csv`;
        filePath = path.join(reportsDir, fileName);
        await generateCSVReport(reportData, filePath, type, dateFrom, dateTo);
        break;
      default:
        return res.status(400).json({ error: 'Invalid format' });
    }

    downloadUrl = `/api/admin/reports/download/${fileName}`;

    res.json({
      success: true,
      downloadUrl,
      fileName,
      metadata: {
        type,
        dateFrom,
        dateTo,
        format,
        generatedAt: new Date().toISOString(),
        recordCount: reportData.orders?.length || reportData.customers?.length || reportData.products?.length || 0
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Download report file
router.get('/download/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../reports', filename);

    console.log('Download request for file:', filename);
    console.log('File path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download report' });
    }
  }
});

// Generate PDF report
async function generatePDFReport(data, filePath, type, dateFrom, dateTo) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const html = generateHTMLReport(data, type, dateFrom, dateTo);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    console.log('PDF generated successfully:', filePath);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate Excel report
async function generateExcelReport(data, filePath, type, dateFrom, dateTo) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`);

  // Add header
  worksheet.addRow([`${type.charAt(0).toUpperCase() + type.slice(1)} Report`]);
  worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  worksheet.addRow([`Date Range: ${dateFrom} to ${dateTo}`]);
  worksheet.addRow([]);

  // Add summary data
  if (data.summary) {
    worksheet.addRow(['Summary']);
    Object.entries(data.summary).forEach(([key, value]) => {
      if (key !== 'dateRange') {
        worksheet.addRow([key, value]);
      }
    });
    worksheet.addRow([]);
  }

  // Add data based on report type
  if (data.orders) {
    worksheet.addRow(['Orders']);
    worksheet.addRow(['ID', 'Customer Name', 'Total Amount', 'Status', 'Created At']);
    data.orders.forEach(order => {
      worksheet.addRow([
        order.id,
        order.customerName,
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleString()
      ]);
    });
  } else if (data.customers) {
    worksheet.addRow(['Customers']);
    worksheet.addRow(['ID', 'Name', 'Email', 'Username', 'Order Count', 'Total Spent', 'Created At']);
    data.customers.forEach(customer => {
      worksheet.addRow([
        customer.id,
        customer.name,
        customer.email,
        customer.username,
        customer.orderCount,
        customer.totalSpent,
        new Date(customer.createdAt).toLocaleString()
      ]);
    });
  } else if (data.products) {
    worksheet.addRow(['Products']);
    worksheet.addRow(['ID', 'Name', 'SKU', 'Price', 'Stock', 'Brand', 'Category', 'Sales Count']);
    data.products.forEach(product => {
      worksheet.addRow([
        product.id,
        product.name,
        product.sku,
        product.price,
        product.stock,
        product.brand,
        product.category,
        product.salesCount
      ]);
    });
  }

  await workbook.xlsx.writeFile(filePath);
}

// Generate CSV report
async function generateCSVReport(data, filePath, type, dateFrom, dateTo) {
  let records = [];

  if (data.orders) {
    records = data.orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: new Date(order.createdAt).toLocaleString()
    }));
  } else if (data.customers) {
    records = data.customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      username: customer.username,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent,
      createdAt: new Date(customer.createdAt).toLocaleString()
    }));
  } else if (data.products) {
    records = data.products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
      salesCount: product.salesCount
    }));
  }

  const csvWriter = createCsvWriter({
    path: filePath,
    header: records.length > 0 ? Object.keys(records[0]).map(key => ({ id: key, title: key })) : []
  });

  await csvWriter.writeRecords(records);
}

// Generate HTML for PDF
function generateHTMLReport(data, type, dateFrom, dateTo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Date Range: ${dateFrom} to ${dateTo}</p>
      </div>
      
      ${data.summary ? `
        <div class="summary">
          <h2>Summary</h2>
          ${Object.entries(data.summary).map(([key, value]) => 
            key !== 'dateRange' ? `<p><strong>${key}:</strong> ${value}</p>` : ''
          ).join('')}
        </div>
      ` : ''}
      
      ${data.orders ? `
        <h2>Orders</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
          ${data.orders.map(order => `
            <tr>
              <td>${order.id}</td>
              <td>${order.customerName}</td>
              <td>${order.totalAmount} IQD</td>
              <td>${order.status}</td>
              <td>${new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      
      ${data.customers ? `
        <h2>Customers</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Order Count</th>
            <th>Total Spent</th>
            <th>Created At</th>
          </tr>
          ${data.customers.map(customer => `
            <tr>
              <td>${customer.id}</td>
              <td>${customer.name}</td>
              <td>${customer.email}</td>
              <td>${customer.username}</td>
              <td>${customer.orderCount}</td>
              <td>${customer.totalSpent} IQD</td>
              <td>${new Date(customer.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      
      ${data.products ? `
        <h2>Products</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Sales Count</th>
          </tr>
          ${data.products.map(product => `
            <tr>
              <td>${product.id}</td>
              <td>${product.name}</td>
              <td>${product.sku}</td>
              <td>${product.price} IQD</td>
              <td>${product.stock}</td>
              <td>${product.brand || 'N/A'}</td>
              <td>${product.category || 'N/A'}</td>
              <td>${product.salesCount}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
    </body>
    </html>
  `;
}

// Generate sales report
async function generateSalesReport(startDate, endDate) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      dateRange: { startDate, endDate }
    },
    orders: orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: item.quantity * parseFloat(item.price)
      }))
    }))
  };
}

// Generate orders report
async function generateOrdersReport(startDate, endDate) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalOrders: orders.length,
      statusCounts,
      dateRange: { startDate, endDate }
    },
    orders: orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress
    }))
  };
}

// Generate customers report
async function generateCustomersReport(startDate, endDate) {
  const customers = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      orders: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter(customer => customer.orders.length > 0).length;

  return {
    summary: {
      totalCustomers,
      customersWithOrders,
      conversionRate: totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0,
      dateRange: { startDate, endDate }
    },
    customers: customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      username: customer.username,
      createdAt: customer.createdAt,
      orderCount: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
    }))
  };
}

// Generate products report
async function generateProductsReport(startDate, endDate) {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      orderItems: {
        where: {
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock <= 10).length;

  return {
    summary: {
      totalProducts,
      activeProducts,
      lowStockProducts,
      dateRange: { startDate, endDate }
    },
    products: products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: parseFloat(product.price),
      stock: product.stock,
      isActive: product.isActive,
      brand: product.brand?.name,
      category: product.category?.name,
      salesCount: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: product.createdAt
    }))
  };
}

// Generate inventory report
async function generateInventoryReport(startDate, endDate) {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true
    },
    orderBy: {
      stock: 'asc'
    }
  });

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * product.stock), 0);

  return {
    summary: {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      dateRange: { startDate, endDate }
    },
    products: products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: parseFloat(product.price),
      stock: product.stock,
      value: parseFloat(product.price) * product.stock,
      brand: product.brand?.name,
      category: product.category?.name,
      isActive: product.isActive
    }))
  };
}

// Generate financial report
async function generateFinancialReport(startDate, endDate) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate revenue by day
  const revenueByDay = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + parseFloat(order.totalAmount);
    return acc;
  }, {});

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      dateRange: { startDate, endDate }
    },
    revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    })),
    orders: orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt
    }))
  };
}

module.exports = router;
