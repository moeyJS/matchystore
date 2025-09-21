<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Customer Analytics</h1>
          <p class="text-gray-600 mt-2">Track customer behavior and insights</p>
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
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Customers</p>
                <p class="text-2xl font-semibold text-gray-900">{{ analytics.totalCustomers }}</p>
                <p class="text-sm text-blue-600">{{ analytics.customerGrowth }}% vs last period</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Customers</p>
                <p class="text-2xl font-semibold text-gray-900">{{ analytics.activeCustomers }}</p>
                <p class="text-sm text-gray-500">{{ Math.round((analytics.activeCustomers / analytics.totalCustomers) * 100) }}% of total</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Average Order Value</p>
                <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(analytics.averageOrderValue) }} IQD</p>
                <p class="text-sm text-purple-600">Per customer</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Customer Lifetime Value</p>
                <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(analytics.customerLifetimeValue) }} IQD</p>
                <p class="text-sm text-yellow-600">Average CLV</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Customer Growth Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          <!-- Customer Segments -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">New Customers</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ analytics.newCustomers }}</p>
                  <p class="text-xs text-gray-500">{{ Math.round((analytics.newCustomers / analytics.totalCustomers) * 100) }}%</p>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Returning Customers</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ analytics.returningCustomers }}</p>
                  <p class="text-xs text-gray-500">{{ Math.round((analytics.returningCustomers / analytics.totalCustomers) * 100) }}%</p>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">VIP Customers</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ analytics.vipCustomers }}</p>
                  <p class="text-xs text-gray-500">{{ Math.round((analytics.vipCustomers / analytics.totalCustomers) * 100) }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Customers Table -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Top Customers</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="customer in analytics.topCustomers" :key="customer.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ customer.name || 'Guest Customer' }}</div>
                        <div class="text-sm text-gray-500">{{ customer.username || 'No username' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ customer.email || 'No email' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ customer.orderCount || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatNumber(customer.totalSpent || 0) }} IQD
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

const selectedRange = ref('30')
const analytics = reactive({
  totalCustomers: 0,
  activeCustomers: 0,
  newCustomers: 0,
  returningCustomers: 0,
  vipCustomers: 0,
  customerGrowth: 0,
  averageOrderValue: 0,
  customerLifetimeValue: 0,
  topCustomers: []
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
    const response = await axios.get('/api/admin/analytics/customers')
    Object.assign(analytics, response.data)
  } catch (error) {
    console.error('Error fetching customer analytics:', error)
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>


