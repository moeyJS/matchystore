<template>
  <AdminLayout>
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Orders</h1>
        <p class="text-muted-foreground mt-2">Manage and track customer orders</p>
      </div>

      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Search</label>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Order number, customer name..."
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select
              v-model="statusFilter"
              @change="handleStatusFilter"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="PROCESSING">Processing</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date From</label>
            <input
              v-model="dateFrom"
              type="date"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date To</label>
            <input
              v-model="dateTo"
              type="date"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th class="text-left py-4 px-6 font-medium">Order</th>
                <th class="text-left py-4 px-6 font-medium">Customer</th>
                <th class="text-left py-4 px-6 font-medium">Items</th>
                <th class="text-right py-4 px-6 font-medium">Total</th>
                <th class="text-center py-4 px-6 font-medium">Status</th>
                <th class="text-center py-4 px-6 font-medium">Date</th>
                <th class="text-center py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t">
                <td colspan="7" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
              <tr v-else-if="orders.length === 0" class="border-t">
                <td colspan="7" class="text-center py-8 text-muted-foreground">
                  No orders found
                </td>
              </tr>
              <tr
                v-else
                v-for="order in orders"
                :key="order.id"
                class="border-t hover:bg-muted/50 transition-colors"
              >
                <!-- Order Info -->
                <td class="py-4 px-6">
                  <div>
                    <p class="font-medium">#{{ order.orderNumber }}</p>
                    <p class="text-sm text-muted-foreground">ID: {{ order.id.slice(0, 8) }}...</p>
                  </div>
                </td>

                <!-- Customer -->
                <td class="py-4 px-6">
                  <div>
                    <p class="font-medium">{{ order.customerName }}</p>
                    <p class="text-sm text-muted-foreground">{{ order.customerPhone }}</p>
                    <p v-if="order.user?.email" class="text-sm text-muted-foreground">{{ order.user.email }}</p>
                  </div>
                </td>

                <!-- Items -->
                <td class="py-4 px-6">
                  <div>
                    <p class="font-medium">{{ order.orderItems.length }} item(s)</p>
                    <p class="text-sm text-muted-foreground">
                      {{ order.orderItems.reduce((total, item) => total + item.quantity, 0) }} total qty
                    </p>
                  </div>
                </td>

                <!-- Total -->
                <td class="py-4 px-6 text-right">
                  <p class="font-medium">{{ parseFloat(order.totalAmount).toFixed(2) }} IQD</p>
                  <p v-if="order.shippingCost > 0" class="text-sm text-muted-foreground">
                    +{{ parseFloat(order.shippingCost).toFixed(2) }} IQD shipping
                  </p>
                </td>

                <!-- Status -->
                <td class="py-4 px-6 text-center">
                  <select
                    :value="order.status"
                    @change="updateOrderStatus(order.id, $event.target.value)"
                    :disabled="updating === order.id"
                    class="px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-primary"
                    :class="getStatusColor(order.status)"
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="EN_ROUTE">En Route</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>

                <!-- Date -->
                <td class="py-4 px-6 text-center">
                  <p class="text-sm">{{ formatDate(order.createdAt) }}</p>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="viewOrder(order)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                      title="View Details"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="generateQRCode(order)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Generate QR Code"
                    >
                      <QrCodeIcon class="h-4 w-4" />
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

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-bold">Order #{{ selectedOrder.orderNumber }}</h2>
          <button @click="selectedOrder = null" class="p-2 hover:bg-muted rounded-full transition-colors">
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Items -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Order Items</h3>
              <div class="space-y-4">
                <div
                  v-for="item in selectedOrder.orderItems"
                  :key="item.id"
                  class="flex gap-4 p-4 border border-border rounded-lg"
                >
                  <div class="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      :src="item.product.images[0] || '/placeholder-sock.jpg'"
                      :alt="item.product.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium">{{ item.product.name }}</h4>
                    <p v-if="item.product.brand" class="text-sm text-muted-foreground">
                      {{ item.product.brand.name }}
                    </p>
                    <div class="flex justify-between items-center mt-2">
                      <span class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</span>
                      <span class="font-medium">
                        {{ (item.quantity * parseFloat(item.price)).toFixed(2) }} IQD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="space-y-6">
              <!-- Customer Info -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Customer Information</h3>
                <div class="space-y-2 text-sm">
                  <p><strong>Name:</strong> {{ selectedOrder.customerName }}</p>
                  <p><strong>Phone:</strong> {{ selectedOrder.customerPhone }}</p>
                  <p v-if="selectedOrder.user?.email"><strong>Email:</strong> {{ selectedOrder.user.email }}</p>
                </div>
              </div>

              <!-- Shipping Address -->
              <div v-if="selectedOrder.shippingAddress">
                <h3 class="text-lg font-semibold mb-4">Shipping Address</h3>
                <div class="text-sm space-y-1">
                  <p>{{ selectedOrder.shippingAddress.street }}</p>
                  <p>{{ selectedOrder.shippingAddress.province }}, {{ selectedOrder.shippingAddress.country }}</p>
                </div>
              </div>

              <!-- Order Summary -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Order Summary</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{{ parseFloat(selectedOrder.totalAmount).toFixed(2) }} IQD</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Shipping:</span>
                    <span>{{ parseFloat(selectedOrder.shippingCost || 0).toFixed(2) }} IQD</span>
                  </div>
                  <div class="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>{{ (parseFloat(selectedOrder.totalAmount) + parseFloat(selectedOrder.shippingCost || 0)).toFixed(2) }} IQD</span>
                  </div>
                </div>
              </div>

              <!-- Order Notes -->
              <div v-if="selectedOrder.notes">
                <h3 class="text-lg font-semibold mb-4">Order Notes</h3>
                <p class="text-sm text-muted-foreground">{{ selectedOrder.notes }}</p>
              </div>

              <!-- QR Code -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Order QR Code</h3>
                <div class="flex flex-col items-center space-y-4">
                  <div v-if="qrCodeDataUrl" class="p-4 bg-white rounded-lg border">
                    <img :src="qrCodeDataUrl" alt="Order QR Code" class="w-32 h-32" />
                  </div>
                  <button
                    @click="generateQRCode(selectedOrder)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Generate QR Code
                  </button>
                  <p class="text-xs text-muted-foreground text-center">
                    Customers can scan this QR code to track their order
                  </p>
                </div>
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
  EyeIcon,
  XIcon,
  QrCodeIcon
} from 'lucide-vue-next'
import QRCode from 'qrcode'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const orders = ref([])
const selectedOrder = ref(null)
const loading = ref(false)
const updating = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const qrCodeDataUrl = ref('')

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
const fetchOrders = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      limit: pagination.limit,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(statusFilter.value && { status: statusFilter.value })
    }

    const response = await axios.get('/api/orders', { params })
    orders.value = response.data.orders
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    toast.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchOrders(1)
}

const handleStatusFilter = () => {
  fetchOrders(1)
}

const loadPage = (page) => {
  fetchOrders(page)
}

const updateOrderStatus = async (orderId, newStatus) => {
  updating.value = orderId
  try {
    await axios.put(`/api/orders/${orderId}/status`, {
      status: newStatus
    })
    
    toast.success('Order status updated')
    fetchOrders(pagination.page)
  } catch (error) {
    console.error('Failed to update order status:', error)
    toast.error('Failed to update order status')
  } finally {
    updating.value = null
  }
}

const viewOrder = (order) => {
  selectedOrder.value = order
  qrCodeDataUrl.value = '' // Reset QR code when viewing new order
}

const generateQRCode = async (order) => {
  try {
    // Create a URL that customers can use to track their order
    const trackingUrl = `${window.location.origin}/track-orders?orderNumber=${order.orderNumber}`
    
    // Generate QR code
    const qrCodeDataUrlGenerated = await QRCode.toDataURL(trackingUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    qrCodeDataUrl.value = qrCodeDataUrlGenerated
    toast.success('QR Code generated successfully')
  } catch (error) {
    console.error('Error generating QR code:', error)
    toast.error('Failed to generate QR code')
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
  } else if (!['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE'].includes(authStore.user?.role)) {
    router.push('/')
  } else {
    fetchOrders()
  }
})
</script>


