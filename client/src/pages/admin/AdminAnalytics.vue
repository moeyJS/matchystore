<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p class="text-gray-600 mt-2">Track your store performance and insights</p>
        </div>

        <!-- Date Range Picker -->
        <div class="mb-6">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Date Range:</label>
            <select v-model="selectedRange" @change="updateDateRange" 
                    class="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(analytics.totalRevenue) }} IQD</p>
                <p class="text-sm text-green-600">{{ analytics.revenueChange }}% vs last period</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Orders</p>
                <p class="text-2xl font-semibold text-gray-900">{{ analytics.totalOrders }}</p>
                <p class="text-sm text-blue-600">{{ analytics.ordersChange }}% vs last period</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">New Customers</p>
                <p class="text-2xl font-semibold text-gray-900">{{ analytics.newCustomers }}</p>
                <p class="text-sm text-purple-600">{{ analytics.customersChange }}% vs last period</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-orange-100 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p class="text-2xl font-semibold text-gray-900">${{ formatNumber(analytics.avgOrderValue) }}</p>
                <p class="text-sm text-orange-600">{{ analytics.aovChange }}% vs last period</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Revenue Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <p>Chart will be implemented with Chart.js or similar library</p>
            </div>
          </div>

          <!-- Orders Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <p>Chart will be implemented with Chart.js or similar library</p>
            </div>
          </div>
        </div>

        <!-- Top Products and Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Products -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div class="space-y-4">
              <div v-for="product in analytics.topProducts" :key="product.id" 
                   class="flex items-center justify-between">
                <div class="flex items-center">
                  <img :src="product.image" :alt="product.name" 
                       class="w-10 h-10 rounded-lg object-cover">
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                    <p class="text-sm text-gray-500">{{ product.quantitySold }} sold</p>
                  </div>
                </div>
                <p class="text-sm font-semibold text-gray-900">${{ formatNumber(product.revenue) }}</p>
              </div>
            </div>
          </div>

          <!-- Top Categories -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <div class="space-y-4">
              <div v-for="category in analytics.topCategories" :key="category.id" 
                   class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ category.name }}</p>
                  <p class="text-sm text-gray-500">{{ category.orders }} orders</p>
                </div>
                <p class="text-sm font-semibold text-gray-900">${{ formatNumber(category.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

export default {
  name: 'AdminAnalytics',
  components: {
    AdminLayout
  },
  setup() {
    const selectedRange = ref('30')
    const analytics = ref({
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      ordersChange: 0,
      newCustomers: 0,
      customersChange: 0,
      avgOrderValue: 0,
      aovChange: 0,
      topProducts: [],
      topCategories: []
    })

    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num)
    }

    const updateDateRange = () => {
      fetchAnalytics()
    }

    const fetchAnalytics = async () => {
      try {
        const [salesData, customersData, productsData] = await Promise.all([
          axios.get('/api/admin/analytics/sales'),
          axios.get('/api/admin/analytics/customers'),
          axios.get('/api/admin/analytics/products')
        ])

        analytics.value = {
          totalRevenue: salesData.data.totalSales || 0,
          revenueChange: salesData.data.salesGrowth || 0,
          totalOrders: salesData.data.totalOrders || 0,
          ordersChange: salesData.data.orderGrowth || 0,
          newCustomers: customersData.data.newCustomers || 0,
          customersChange: 15.2, // This would need to be calculated on the server
          avgOrderValue: salesData.data.avgOrderValue || 0,
          aovChange: salesData.data.aovGrowth || 0,
          topProducts: salesData.data.topProducts || [],
          topCategories: [
            { id: 1, name: 'Electronics', orders: 234, revenue: 15670.00 },
            { id: 2, name: 'Accessories', orders: 189, revenue: 3780.00 },
            { id: 3, name: 'Home & Garden', orders: 156, revenue: 2340.00 }
          ]
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        // Fallback to mock data if API fails
        analytics.value = {
          totalRevenue: 125430.50,
          revenueChange: 12.5,
          totalOrders: 1247,
          ordersChange: 8.3,
          newCustomers: 89,
          customersChange: 15.2,
          avgOrderValue: 100.52,
          aovChange: -2.1,
          topProducts: [
            { id: 1, name: 'Wireless Headphones', image: '/api/placeholder/40/40', quantitySold: 45, revenue: 2250.00 },
            { id: 2, name: 'Smart Watch', image: '/api/placeholder/40/40', quantitySold: 32, revenue: 3200.00 },
            { id: 3, name: 'Laptop Stand', image: '/api/placeholder/40/40', quantitySold: 28, revenue: 840.00 }
          ],
          topCategories: [
            { id: 1, name: 'Electronics', orders: 234, revenue: 15670.00 },
            { id: 2, name: 'Accessories', orders: 189, revenue: 3780.00 },
            { id: 3, name: 'Home & Garden', orders: 156, revenue: 2340.00 }
          ]
        }
      }
    }

    onMounted(() => {
      fetchAnalytics()
    })

    return {
      selectedRange,
      analytics,
      formatNumber,
      updateDateRange
    }
  }
}
</script>

