<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Left Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <router-link to="/" class="text-gray-900 hover:text-gray-700 font-medium">HOME</router-link>
            <div class="relative group">
              <button class="flex items-center text-gray-900 hover:text-gray-700 font-medium">
                SHOP
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            <router-link to="/about" class="text-gray-900 hover:text-gray-700 font-medium">ABOUT</router-link>
            <router-link to="/contact" class="text-gray-900 hover:text-gray-700 font-medium">CONTACT</router-link>
          </div>

          <!-- Center Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
              </div>
              <span class="text-xl lg:text-2xl font-bold text-gray-900">MATCHYSTORE</span>
            </router-link>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center space-x-2 lg:space-x-4">
            <router-link to="/cart" class="p-2 text-gray-900 hover:text-gray-700 relative">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Track Your Orders</h1>
        <p class="text-muted-foreground mt-2">Enter your phone number to view your orders</p>
      </div>

    <!-- Phone Lookup Form -->
    <div v-if="!phoneVerified" class="max-w-md mx-auto">
      <div class="bg-card border border-border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Enter Your Phone Number</h2>
        <form @submit.prevent="lookupOrders" class="space-y-4">
          <div>
            <label for="phone" class="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="phoneNumber"
              type="tel"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="+964 123 456 7890"
            />
            <p class="text-xs text-muted-foreground mt-1">
              We'll send you an OTP to verify this number
            </p>
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-2 px-4 rounded-md font-medium disabled:opacity-50"
          >
            <span v-if="loading">Sending OTP...</span>
            <span v-else>Verify & View Orders</span>
          </button>
        </form>
      </div>
    </div>

    <!-- OTP Verification Modal -->
    <div v-if="showOTPModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Verify Your Phone Number</h2>
        <p class="text-muted-foreground mb-4">
          We've sent a 6-digit verification code to {{ phoneNumber }}
        </p>
        
        <!-- Development Mode Notice -->
        <div v-if="developmentMode" class="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Development Mode</h3>
              <div class="mt-1 text-sm text-yellow-700">
                <p>OTP is not configured. Check the server console for the verification code.</p>
                <p class="font-mono mt-1 text-xs bg-yellow-100 p-2 rounded">{{ lastOTPCode || 'Code will appear here' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="verifyOTP" class="space-y-4">
          <div>
            <label for="otpCode" class="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              id="otpCode"
              v-model="otpCode"
              type="text"
              maxlength="6"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="000000"
            />
          </div>
          
          <div class="flex gap-3">
            <button
              type="button"
              @click="resendOTP"
              :disabled="resending"
              class="flex-1 btn-secondary py-2 px-4 rounded-md text-sm disabled:opacity-50"
            >
              <span v-if="resending">Sending...</span>
              <span v-else>Resend Code</span>
            </button>
            <button
              type="submit"
              :disabled="verifying || otpCode.length !== 6"
              class="flex-1 btn-primary py-2 px-4 rounded-md text-sm disabled:opacity-50"
            >
              <span v-if="verifying">Verifying...</span>
              <span v-else>Verify</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Orders Display -->
    <div v-if="phoneVerified">
      <!-- Header with verified phone and logout -->
      <div class="mb-6 flex items-center justify-end">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Verified: {{ phoneNumber }}</span>
          </div>
          <button
            @click="resetLookup"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 border border-border rounded-md hover:bg-muted"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-12">
        <PackageIcon class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">No orders found</h3>
        <p class="text-muted-foreground mb-6">No orders found for this phone number.</p>
        <router-link to="/" class="btn-primary px-6 py-3 rounded-md">
          Start Shopping
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold">Orders for {{ phoneNumber }}</h2>
          <p class="text-sm text-muted-foreground">{{ orders.length }} order(s) found</p>
        </div>

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
              
              <!-- Action Buttons -->
              <div class="flex items-center gap-2">
                <!-- Cancel Order Button (only for PROCESSING status) -->
                <button
                  v-if="order.status === 'PROCESSING'"
                  @click="cancelOrder(order.id)"
                  class="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
                
                <!-- Chat with Support Button -->
                <button
                  @click="openSupportChat(order.id)"
                  class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Chat with Support
                </button>
                
                <!-- Toggle Details Button -->
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
          </div>

          <!-- Order Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p class="text-sm text-muted-foreground">Customer</p>
              <p class="font-medium">{{ order.customerName }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Phone</p>
              <p class="font-medium">{{ order.customerPhone }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Amount</p>
              <p class="font-medium text-lg">{{ parseFloat(order.totalAmount).toFixed(2) }} IQD</p>
            </div>
          </div>

          <!-- Order Details (Expandable) -->
          <div v-if="expandedOrders.includes(order.id)" class="border-t pt-4">
            <!-- Shipping Address -->
            <div class="mb-4">
              <h4 class="font-medium mb-2">Shipping Address</h4>
              <div class="text-sm text-muted-foreground">
                <p>{{ order.shippingAddress.street }}</p>
                <p>{{ order.shippingAddress.province }}, {{ order.shippingAddress.country }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="mb-4">
              <h4 class="font-medium mb-2">Order Items</h4>
              <div class="space-y-2">
                <div
                  v-for="item in order.orderItems"
                  :key="item.id"
                  class="flex items-center gap-4 p-3 bg-muted/50 rounded-md"
                >
                  <div class="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
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

            <!-- Order Notes -->
            <div v-if="order.notes" class="mb-4">
              <h4 class="font-medium mb-2">Order Notes</h4>
              <p class="text-sm text-muted-foreground">{{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Chat Component -->
    <SupportChat />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import {
  PackageIcon,
  ArrowLeftIcon,
  ChevronDownIcon
} from 'lucide-vue-next'
import SupportChat from '../components/SupportChat.vue'

const router = useRouter()
const toast = useToast()

// State
const phoneNumber = ref('')
const phoneVerified = ref(false)
const orders = ref([])
const loading = ref(false)
const showOTPModal = ref(false)
const otpCode = ref('')
const verifying = ref(false)
const resending = ref(false)
const developmentMode = ref(false)
const lastOTPCode = ref('')
const expandedOrders = ref([])

// Persistence keys
const VERIFIED_PHONE_KEY = 'guest_verified_phone'
const VERIFIED_PHONE_TIMESTAMP_KEY = 'guest_verified_phone_timestamp'
const VERIFICATION_EXPIRY_HOURS = 24 // Phone verification expires after 24 hours

// Persistence methods
const saveVerifiedPhone = (phone) => {
  localStorage.setItem(VERIFIED_PHONE_KEY, phone)
  localStorage.setItem(VERIFIED_PHONE_TIMESTAMP_KEY, Date.now().toString())
}

const getVerifiedPhone = () => {
  const phone = localStorage.getItem(VERIFIED_PHONE_KEY)
  const timestamp = localStorage.getItem(VERIFIED_PHONE_TIMESTAMP_KEY)
  
  if (!phone || !timestamp) return null
  
  const now = Date.now()
  const verificationTime = parseInt(timestamp)
  const hoursSinceVerification = (now - verificationTime) / (1000 * 60 * 60)
  
  // Check if verification has expired
  if (hoursSinceVerification > VERIFICATION_EXPIRY_HOURS) {
    clearVerifiedPhone()
    return null
  }
  
  return phone
}

const clearVerifiedPhone = () => {
  localStorage.removeItem(VERIFIED_PHONE_KEY)
  localStorage.removeItem(VERIFIED_PHONE_TIMESTAMP_KEY)
}

const restoreVerifiedState = async () => {
  const savedPhone = getVerifiedPhone()
  if (savedPhone) {
    phoneNumber.value = savedPhone
    phoneVerified.value = true
    await fetchOrders()
  }
}

// Methods
const lookupOrders = async () => {
  if (!phoneNumber.value.trim()) {
    toast.error('Please enter your phone number')
    return
  }

  loading.value = true
  try {
    const cleanPhone = phoneNumber.value.replace(/[\s\-\(\)\+]/g, '')
    
    const otpResponse = await axios.post('/api/otp/send', {
      phone: cleanPhone,
      purpose: 'order_lookup'
    })

    if (otpResponse.data.message) {
      developmentMode.value = otpResponse.data.developmentMode || false
      lastOTPCode.value = otpResponse.data.code || ''
      showOTPModal.value = true
      
      if (developmentMode.value) {
        toast.info('Check the server console for your OTP code')
      } else {
        toast.success('Verification code sent to your WhatsApp!')
      }
    }
  } catch (error) {
    console.error('Failed to send OTP:', error)
    toast.error(error.response?.data?.error || 'Failed to send verification code')
  } finally {
    loading.value = false
  }
}

const verifyOTP = async () => {
  if (otpCode.value.length !== 6) {
    toast.error('Please enter a 6-digit code')
    return
  }

  verifying.value = true
  try {
    const cleanPhone = phoneNumber.value.replace(/[\s\-\(\)\+]/g, '')
    
    const verifyResponse = await axios.post('/api/otp/verify', {
      phone: cleanPhone,
      code: otpCode.value,
      purpose: 'order_lookup'
    })

    if (verifyResponse.data.verified) {
      phoneVerified.value = true
      showOTPModal.value = false
      saveVerifiedPhone(phoneNumber.value)
      await fetchOrders()
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error)
    toast.error(error.response?.data?.error || 'Invalid verification code')
  } finally {
    verifying.value = false
  }
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const cleanPhone = phoneNumber.value.replace(/[\s\-\(\)\+]/g, '')
    
    const response = await axios.get('/api/orders/by-phone', {
      params: { phone: cleanPhone }
    })
    
    orders.value = response.data.orders
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    toast.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const resendOTP = async () => {
  resending.value = true
  try {
    const cleanPhone = phoneNumber.value.replace(/[\s\-\(\)\+]/g, '')
    
    const resendResponse = await axios.post('/api/otp/resend', {
      phone: cleanPhone,
      purpose: 'order_lookup'
    })
    
    if (resendResponse.data.developmentMode) {
      toast.info('Check the server console for your new OTP code')
    } else {
      toast.success('Verification code resent to your WhatsApp!')
    }
  } catch (error) {
    console.error('Failed to resend OTP:', error)
    toast.error(error.response?.data?.error || 'Failed to resend code')
  } finally {
    resending.value = false
  }
}

const resetLookup = () => {
  phoneVerified.value = false
  phoneNumber.value = ''
  orders.value = []
  showOTPModal.value = false
  otpCode.value = ''
  expandedOrders.value = []
  clearVerifiedPhone()
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

const cancelOrder = async (orderId) => {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return
  }

  try {
    const response = await axios.put(`/api/orders/${orderId}/cancel`)
    if (response.data.success) {
      toast.success('Order cancelled successfully')
      // Refresh orders
      await fetchOrders()
    }
  } catch (error) {
    console.error('Failed to cancel order:', error)
    toast.error(error.response?.data?.error || 'Failed to cancel order')
  }
}

const openSupportChat = (orderId) => {
  // Find the order to get order number
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    // Emit event to open support chat with order context
    window.dispatchEvent(new CustomEvent('open-support-chat', {
      detail: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: order.customerPhone
      }
    }))
    toast.info('Opening support chat...')
  }
}

// Lifecycle
onMounted(() => {
  // Check for auto-login from checkout
  const urlParams = new URLSearchParams(window.location.search)
  const phoneParam = urlParams.get('phone')
  const autoLogin = urlParams.get('autoLogin')
  
  if (phoneParam && autoLogin === 'true') {
    // Auto-login with the phone number from checkout
    phoneNumber.value = phoneParam
    phoneVerified.value = true
    saveVerifiedPhone(phoneParam)
    fetchOrders()
    
    // Clean up URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)
  } else {
    // Normal restore from localStorage
    restoreVerifiedState()
  }
})
</script>
