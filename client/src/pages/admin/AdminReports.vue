<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reports</h1>
          <p class="text-gray-600 mt-2">Generate and download business reports</p>
        </div>

        <!-- Report Filters -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select v-model="filters.reportType" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="sales">Sales Report</option>
                <option value="orders">Orders Report</option>
                <option value="customers">Customers Report</option>
                <option value="products">Products Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="financial">Financial Report</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                v-model="filters.dateFrom"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                v-model="filters.dateTo"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select v-model="filters.format" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
          
          <div class="mt-4 flex space-x-4">
            <button
              @click="generateReport"
              :disabled="loading"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ loading ? 'Generating...' : 'Generate Report' }}
            </button>
            <button
              @click="resetFilters"
              class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <!-- Quick Reports -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Sales Summary</h3>
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p class="text-sm text-gray-600 mb-4">Get a comprehensive overview of your sales performance</p>
            <button
              @click="generateQuickReport('sales')"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Generate Sales Report
            </button>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Customer Analysis</h3>
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <p class="text-sm text-gray-600 mb-4">Analyze customer behavior and demographics</p>
            <button
              @click="generateQuickReport('customers')"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate Customer Report
            </button>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <p class="text-sm text-gray-600 mb-4">Track inventory levels and stock movements</p>
            <button
              @click="generateQuickReport('inventory')"
              class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Generate Inventory Report
            </button>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Reports</h2>
          </div>
          <div class="p-6">
            <div v-if="recentReports.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by generating your first report.</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="report in recentReports"
                :key="report.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ report.name }}</h4>
                    <p class="text-sm text-gray-500">{{ report.type }} • {{ report.format.toUpperCase() }} • {{ formatDate(report.createdAt) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="downloadReport(report)"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Download
                  </button>
                  <button
                    @click="deleteReport(report.id)"
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

export default {
  name: 'AdminReports',
  components: {
    AdminLayout
  },
  setup() {
    const loading = ref(false)
    const filters = reactive({
      reportType: 'sales',
      dateFrom: '',
      dateTo: '',
      format: 'pdf'
    })
    const recentReports = ref([])

    const generateReport = async () => {
      loading.value = true
      try {
        const response = await axios.post('/api/admin/reports/generate', {
          type: filters.reportType,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          format: filters.format
        })
        
        if (response.data.success) {
          // Add to recent reports
          recentReports.value.unshift({
            id: Date.now(),
            name: `${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report`,
            type: filters.reportType,
            format: filters.format,
            createdAt: new Date().toISOString(),
            downloadUrl: response.data.downloadUrl,
            fileName: response.data.fileName
          })
          
          // Download the file
          if (response.data.downloadUrl) {
            try {
              const downloadResponse = await axios.get(response.data.downloadUrl, {
                responseType: 'blob'
              })
              
              const url = window.URL.createObjectURL(new Blob([downloadResponse.data]))
              const link = document.createElement('a')
              link.href = url
              link.download = response.data.fileName
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(url)
            } catch (downloadError) {
              console.error('Error downloading file:', downloadError)
              alert('Report generated but failed to download. You can download it from the recent reports list.')
            }
          }
        }
      } catch (error) {
        console.error('Error generating report:', error)
        alert('Failed to generate report. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const generateQuickReport = async (type) => {
      filters.reportType = type
      filters.dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
      filters.dateTo = new Date().toISOString().split('T')[0] // today
      await generateReport()
    }

    const downloadReport = async (report) => {
      if (report.downloadUrl && report.downloadUrl !== '#') {
        try {
          const response = await axios.get(report.downloadUrl, {
            responseType: 'blob'
          })
          
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.download = report.fileName || `${report.name}.${report.format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Error downloading report:', error)
          alert('Failed to download report. Please try again.')
        }
      } else {
        alert('Download URL not available for this report')
      }
    }

    const deleteReport = (reportId) => {
      if (confirm('Are you sure you want to delete this report?')) {
        recentReports.value = recentReports.value.filter(r => r.id !== reportId)
      }
    }

    const resetFilters = () => {
      filters.reportType = 'sales'
      filters.dateFrom = ''
      filters.dateTo = ''
      filters.format = 'pdf'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const fetchRecentReports = async () => {
      try {
        // This would be replaced with actual API calls
        // For now, using mock data
        recentReports.value = [
          {
            id: 1,
            name: 'Sales Report - December 2024',
            type: 'sales',
            format: 'pdf',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            downloadUrl: '#'
          },
          {
            id: 2,
            name: 'Customer Analysis - Q4 2024',
            type: 'customers',
            format: 'excel',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            downloadUrl: '#'
          }
        ]
      } catch (error) {
        console.error('Error fetching recent reports:', error)
      }
    }

    onMounted(() => {
      fetchRecentReports()
    })

    return {
      loading,
      filters,
      recentReports,
      generateReport,
      generateQuickReport,
      downloadReport,
      deleteReport,
      resetFilters,
      formatDate
    }
  }
}
</script>


