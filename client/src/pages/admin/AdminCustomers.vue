<template>
  <AdminLayout>
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Customers</h1>
        <p class="text-muted-foreground mt-2">Manage customer information and orders</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p class="text-2xl font-bold">{{ stats.totalCustomers }}</p>
            </div>
            <UsersIcon class="h-8 w-8 text-primary" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">New This Month</p>
              <p class="text-2xl font-bold">{{ stats.newCustomersThisMonth }}</p>
            </div>
            <UserPlusIcon class="h-8 w-8 text-primary" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Top Customers</p>
              <p class="text-2xl font-bold">{{ stats.topCustomers?.length || 0 }}</p>
            </div>
            <StarIcon class="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-card border border-border rounded-lg p-6 mb-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search customers by name, email, or phone..."
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th class="text-left py-4 px-6 font-medium">Customer</th>
                <th class="text-left py-4 px-6 font-medium">Contact</th>
                <th class="text-center py-4 px-6 font-medium">Orders</th>
                <th class="text-center py-4 px-6 font-medium">Member Since</th>
                <th class="text-center py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t">
                <td colspan="5" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
              <tr v-else-if="customers.length === 0" class="border-t">
                <td colspan="5" class="text-center py-8 text-muted-foreground">
                  No customers found
                </td>
              </tr>
              <tr
                v-else
                v-for="customer in customers"
                :key="customer.id"
                class="border-t hover:bg-muted/50 transition-colors"
              >
                <!-- Customer Info -->
                <td class="py-4 px-6">
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-medium">{{ customer.name || 'No name' }}</p>
                      <span v-if="customer.isGuest" class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                        Guest
                      </span>
                    </div>
                    <p class="text-sm text-muted-foreground">ID: {{ customer.id.slice(0, 8) }}...</p>
                  </div>
                </td>

                <!-- Contact -->
                <td class="py-4 px-6">
                  <div>
                    <p class="text-sm">{{ customer.email || 'No email' }}</p>
                    <p v-if="customer.phone" class="text-sm text-muted-foreground">{{ customer.phone }}</p>
                  </div>
                </td>

                <!-- Orders -->
                <td class="py-4 px-6 text-center">
                  <span class="font-medium">{{ customer.orderCount || 0 }}</span>
                </td>

                <!-- Member Since -->
                <td class="py-4 px-6 text-center">
                  <p class="text-sm">{{ formatDate(customer.createdAt) }}</p>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="viewCustomer(customer)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                      title="View Details"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-6 flex justify-center">
        <div class="flex gap-2">
          <button
            @click="loadPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-2 border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="loadPage(page)"
            :class="[
              'px-3 py-2 rounded-md',
              page === pagination.page
                ? 'bg-primary text-primary-foreground'
                : 'border border-input hover:bg-muted'
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="loadPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-2 border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

    <!-- Customer Details Modal -->
    <div v-if="selectedCustomer" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-bold">{{ selectedCustomer.name || 'Customer Details' }}</h2>
          <button @click="selectedCustomer = null" class="p-2 hover:bg-muted rounded-full transition-colors">
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Customer Info -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Customer Information</h3>
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Name</label>
                  <p class="text-sm">{{ selectedCustomer.name || 'Not provided' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Email</label>
                  <p class="text-sm">{{ selectedCustomer.email }}</p>
                </div>
                <div v-if="selectedCustomer.phone">
                  <label class="text-sm font-medium text-muted-foreground">Phone</label>
                  <p class="text-sm">{{ selectedCustomer.phone }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p class="text-sm">{{ formatDate(selectedCustomer.createdAt) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Total Orders</label>
                  <p class="text-sm font-medium">{{ selectedCustomer.orders?.length || 0 }}</p>
                </div>
              </div>
            </div>

            <!-- Order History -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Order History</h3>
              <div v-if="selectedCustomer.orders?.length > 0" class="space-y-3">
                <div
                  v-for="order in selectedCustomer.orders"
                  :key="order.id"
                  class="p-4 border border-border rounded-lg"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="font-medium">Order #{{ order.orderNumber }}</p>
                      <p class="text-sm text-muted-foreground">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(order.status)
                      ]"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">
                      {{ order.orderItems?.length || 0 }} item(s)
                    </span>
                    <span class="font-medium">{{ parseFloat(order.totalAmount).toFixed(2) }} IQD</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-muted-foreground">
                <p>No orders found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout.vue'
import {
  UsersIcon,
  UserPlusIcon,
  StarIcon,
  EyeIcon,
  XIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const customers = ref([])
const selectedCustomer = ref(null)
const loading = ref(false)
const searchQuery = ref('')
const stats = reactive({
  totalCustomers: 0,
  newCustomersThisMonth: 0,
  topCustomers: []
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Computed
const visiblePages = computed(() => {
  const current = pagination.page
  const total = pagination.pages
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const fetchCustomers = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      limit: pagination.limit,
      ...(searchQuery.value && { search: searchQuery.value })
    }

    const response = await axios.get('/api/customers', { params })
    customers.value = response.data.customers
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    toast.error('Failed to load customers')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/customers/stats/overview')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('Failed to fetch customer stats:', error)
  }
}

const handleSearch = () => {
  fetchCustomers(1)
}

const loadPage = (page) => {
  fetchCustomers(page)
}

const viewCustomer = async (customer) => {
  try {
    const response = await axios.get(`/api/customers/${customer.id}`)
    selectedCustomer.value = response.data
  } catch (error) {
    console.error('Failed to fetch customer details:', error)
    toast.error('Failed to load customer details')
  }
}

const getStatusColor = (status) => {
  const colors = {
    PROCESSING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    EN_ROUTE: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    PROCESSING: 'Processing',
    CONFIRMED: 'Confirmed',
    EN_ROUTE: 'En Route',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else if (!['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE'].includes(authStore.user?.role)) {
    router.push('/')
  } else {
    Promise.all([
      fetchCustomers(),
      fetchStats()
    ])
  }
})
</script>


