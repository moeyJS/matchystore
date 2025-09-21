<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
      <!-- Dashboard Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground mt-2">Welcome to your admin dashboard</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Products</p>
              <p class="text-2xl font-bold">{{ stats.totalProducts }}</p>
            </div>
            <PackageIcon class="h-8 w-8 text-primary" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p class="text-2xl font-bold">{{ stats.totalOrders }}</p>
            </div>
            <ShoppingCartIcon class="h-8 w-8 text-primary" />
          </div>
        </div>

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
              <p class="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p class="text-2xl font-bold">IQD {{ Number(stats.totalRevenue || 0).toFixed(2) }}</p>
            </div>
            <DollarSignIcon class="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Quick Actions -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <router-link
          to="/admin/products"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <PackageIcon class="h-8 w-8 text-primary" />
            <div>
              <h3 class="font-semibold">Manage Products</h3>
              <p class="text-sm text-muted-foreground">Add, edit, or remove products</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/admin/orders"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <ShoppingCartIcon class="h-8 w-8 text-primary" />
            <div>
              <h3 class="font-semibold">Manage Orders</h3>
              <p class="text-sm text-muted-foreground">View and update order status</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/admin/customers"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <UsersIcon class="h-8 w-8 text-primary" />
            <div>
              <h3 class="font-semibold">Manage Customers</h3>
              <p class="text-sm text-muted-foreground">View customer information</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/admin/pos"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <CreditCardIcon class="h-8 w-8 text-primary" />
            <div>
              <h3 class="font-semibold">POS System</h3>
              <p class="text-sm text-muted-foreground">Manage point of sale operations</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Recent Orders -->
      <div v-if="!loading && recentOrders.length > 0" class="bg-card border border-border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Orders</h2>
        <div class="space-y-4">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div>
              <p class="font-medium">Order #{{ order.orderNumber }}</p>
              <p class="text-sm text-muted-foreground">
                {{ order.customerName }} • {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getStatusColor(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <span class="font-medium">{{ parseFloat(order.totalAmount).toFixed(2) }} IQD</span>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center">
          <router-link
            to="/admin/orders"
            class="text-primary hover:underline font-medium"
          >
            View all orders
          </router-link>
        </div>
      </div>

      <!-- Low Stock Products -->
      <div v-if="!loading && lowStockProducts.length > 0" class="bg-card border border-border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Low Stock Products</h2>
        <div class="space-y-3">
          <div
            v-for="product in lowStockProducts"
            :key="product.id"
            class="flex items-center justify-between p-3 border border-border rounded-lg"
          >
            <div>
              <p class="font-medium">{{ product.name }}</p>
              <p class="text-sm text-muted-foreground">SKU: {{ product.sku || 'N/A' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-destructive font-medium">{{ product.stock }} left</p>
              <p class="text-sm text-muted-foreground">{{ parseFloat(product.price).toFixed(2) }} IQD</p>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center">
          <router-link
            to="/admin/products"
            class="text-primary hover:underline font-medium"
          >
            Manage products
          </router-link>
        </div>
      </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'vue-toastification'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'
import {
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  DollarSignIcon,
  CreditCardIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const loading = ref(false)
const stats = reactive({
  totalProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalRevenue: 0
})
const recentOrders = ref([])
const lowStockProducts = ref([])

// Methods
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [statsResponse, ordersResponse] = await Promise.all([
      axios.get('/api/admin/dashboard/stats'),
      axios.get('/api/orders/stats/overview')
    ])

    Object.assign(stats, statsResponse.data)
    recentOrders.value = ordersResponse.data.recentOrders || []
    lowStockProducts.value = statsResponse.data.lowStockProducts || []
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    toast.error('Failed to load dashboard data')
  } finally {
    loading.value = false
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else if (!['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'WAREHOUSE', 'MARKETING'].includes(authStore.user?.role)) {
    router.push('/')
  } else {
    fetchDashboardData()
  }
})
</script>
