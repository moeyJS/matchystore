<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">My Orders</h1>
      <p class="text-muted-foreground mt-2">Track your order status and history</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-12">
      <PackageIcon class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-xl font-semibold mb-2">No orders yet</h3>
      <p class="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
      <router-link to="/" class="btn-primary px-6 py-3 rounded-md">
        Start Shopping
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-card border border-border rounded-lg p-6"
      >
        <!-- Order Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold">Order #{{ order.orderNumber }}</h3>
            <p class="text-sm text-muted-foreground">
              Placed on {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <div class="flex items-center gap-3 mt-2 md:mt-0">
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                getStatusColor(order.status)
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>
            <button
              @click="generateQRCode(order)"
              class="p-2 hover:bg-muted rounded-md transition-colors"
              title="Generate QR Code"
            >
              <QrCodeIcon class="h-4 w-4" />
            </button>
            <button
              @click="toggleOrderDetails(order.id)"
              class="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <ChevronDownIcon 
                :class="[
                  'h-4 w-4 transition-transform',
                  expandedOrders.includes(order.id) ? 'rotate-180' : ''
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="flex flex-col md:flex-row md:items-center justify-between text-sm text-muted-foreground mb-4">
          <div class="flex gap-4">
            <span>{{ order.orderItems.length }} item(s)</span>
            <span>Total: {{ parseFloat(order.totalAmount).toFixed(2) }} IQD</span>
          </div>
          <div v-if="order.shippingAddress">
            <span>Shipping to: {{ order.shippingAddress.province }}, {{ order.shippingAddress.country }}</span>
          </div>
        </div>

        <!-- Expanded Order Details -->
        <div v-if="expandedOrders.includes(order.id)" class="space-y-4 pt-4 border-t">
          <!-- Order Items -->
          <div>
            <h4 class="font-medium mb-3">Order Items</h4>
            <div class="space-y-3">
              <div
                v-for="item in order.orderItems"
                :key="item.id"
                class="flex gap-4"
              >
                <div class="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img
                    :src="item.product.images[0] || '/placeholder-sock.jpg'"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h5 class="font-medium text-sm">{{ item.product.name }}</h5>
                  <p v-if="item.product.brand" class="text-xs text-muted-foreground">
                    {{ item.product.brand.name }}
                  </p>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</span>
                    <span class="font-medium">
                      {{ (item.quantity * parseFloat(item.price)).toFixed(2) }} IQD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div v-if="order.shippingAddress">
            <h4 class="font-medium mb-2">Shipping Address</h4>
            <div class="text-sm text-muted-foreground">
              <p>{{ order.customerName }}</p>
              <p>{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.province }}, {{ order.shippingAddress.country }}</p>
              <p>{{ order.customerPhone }}</p>
            </div>
          </div>

          <!-- Order Notes -->
          <div v-if="order.notes">
            <h4 class="font-medium mb-2">Order Notes</h4>
            <p class="text-sm text-muted-foreground">{{ order.notes }}</p>
          </div>

          <!-- QR Code -->
          <div v-if="orderQRCodes[order.id]" class="flex flex-col items-center space-y-3">
            <h4 class="font-medium">Order Tracking QR Code</h4>
            <div class="p-4 bg-white rounded-lg border">
              <img :src="orderQRCodes[order.id]" alt="Order QR Code" class="w-32 h-32" />
            </div>
            <p class="text-xs text-muted-foreground text-center">
              Scan this QR code to track your order status
            </p>
          </div>

          <!-- Order Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              @click="contactSupport(order)"
              class="btn-secondary px-4 py-2 rounded-md text-sm"
            >
              Contact Support
            </button>
            <button
              v-if="order.status === 'PROCESSING'"
              @click="cancelOrder(order.id)"
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center">
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
    </div>

    <!-- Support Chat -->
    <SupportChat
      v-if="showSupportChat"
      :order-id="selectedOrderForSupport?.id"
      @close="showSupportChat = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import {
  PackageIcon,
  ChevronDownIcon,
  QrCodeIcon
} from 'lucide-vue-next'
import QRCode from 'qrcode'
import SupportChat from '../components/SupportChat.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const orders = ref([])
const loading = ref(false)
const expandedOrders = ref([])
const orderQRCodes = ref({})
const showSupportChat = ref(false)
const selectedOrderForSupport = ref(null)
const pagination = reactive({
  page: 1,
  limit: 10,
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
  if (!authStore.isAuthenticated) {
    router.push('/track-orders')
    return
  }

  loading.value = true
  try {
    const response = await axios.get('/api/orders/my-orders', {
      params: { page, limit: pagination.limit }
    })
    
    orders.value = response.data.orders
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    toast.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const loadPage = (page) => {
  fetchOrders(page)
}

const toggleOrderDetails = (orderId) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const generateQRCode = async (order) => {
  try {
    // Create a URL that customers can use to track their order
    const trackingUrl = `${window.location.origin}/track-orders?orderNumber=${order.orderNumber}`
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Store QR code for this order
    orderQRCodes.value[order.id] = qrCodeDataUrl
    toast.success('QR Code generated successfully')
  } catch (error) {
    console.error('Error generating QR code:', error)
    toast.error('Failed to generate QR code')
  }
}

const contactSupport = (order) => {
  // Open support chat for this specific order
  showSupportChat.value = true
  selectedOrderForSupport.value = order
}

const cancelOrder = async (orderId) => {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return
  }

  try {
    await axios.put(`/api/orders/${orderId}/status`, {
      status: 'CANCELLED'
    })
    
    toast.success('Order cancelled')
    fetchOrders(pagination.page)
  } catch (error) {
    console.error('Failed to cancel order:', error)
    toast.error('Failed to cancel order')
  }
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    fetchOrders()
  }
})
</script>


