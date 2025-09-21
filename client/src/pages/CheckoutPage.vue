<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Checkout</h1>
      <p class="text-muted-foreground mt-2">Complete your order - No account required!</p>
    </div>

    <!-- Empty Cart Redirect -->
    <div v-if="cartStore.isEmpty" class="text-center py-12">
      <ShoppingCartIcon class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-xl font-semibold mb-2">Your cart is empty</h3>
      <p class="text-muted-foreground mb-6">Add some products to checkout!</p>
      <router-link to="/" class="btn-primary px-6 py-3 rounded-md">
        Continue Shopping
      </router-link>
    </div>

    <!-- Checkout Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Checkout Form -->
      <div class="space-y-6">
        <!-- Customer Information -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Customer Information</h2>
          
          <form @submit.prevent="submitCheckout" class="space-y-4">
            <!-- Name -->
            <div>
              <label for="customerName" class="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                id="customerName"
                v-model="form.customerName"
                type="text"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your full name"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="customerPhone" class="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                id="customerPhone"
                v-model="form.customerPhone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="+964 123 456 7890"
              />
              <p class="text-xs text-muted-foreground mt-1">
                We'll send you an OTP to verify this number
              </p>
            </div>

            <!-- Shipping Address -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium">Shipping Address</h3>
              
              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium mb-2">
                  Country *
                </label>
                <select
                  id="country"
                  v-model="form.shippingAddress.country"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Country</option>
                  <option value="Iraq">Iraq</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>

              <!-- Province -->
              <div>
                <label for="province" class="block text-sm font-medium mb-2">
                  Province/State *
                </label>
                <input
                  id="province"
                  v-model="form.shippingAddress.province"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter province or state"
                />
              </div>

              <!-- Street Address -->
              <div>
                <label for="street" class="block text-sm font-medium mb-2">
                  Street Address *
                </label>
                <textarea
                  id="street"
                  v-model="form.shippingAddress.street"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>

            <!-- Order Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Any special instructions for your order"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Processing...</span>
              <span v-else>Place Order</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="space-y-6">
        <!-- Order Items -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div class="space-y-4">
            <div
              v-for="item in cartStore.items"
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
                <h3 class="font-medium text-sm truncate">{{ item.product.name }}</h3>
                <p v-if="item.product.brand" class="text-xs text-muted-foreground">
                  {{ item.product.brand.name }}
                </p>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</span>
                  <span class="font-medium">
                    {{ (item.quantity * parseFloat(item.product.price)).toFixed(2) }} IQD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Order Total</h3>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Subtotal ({{ cartStore.itemCount }} items):</span>
              <span>{{ cartStore.totalPrice.toFixed(2) }} IQD</span>
            </div>
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{{ cartStore.totalPrice.toFixed(2) }} IQD</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Info -->
        <div class="bg-muted/50 border border-border rounded-lg p-4">
          <div class="flex items-start gap-3">
            <ShieldIcon class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div class="text-sm">
              <p class="font-medium mb-1">Secure Guest Checkout</p>
              <p class="text-muted-foreground">
                No account required! We'll verify your order via OTP sent to your phone number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OTP Verification Modal -->
    <div v-if="showOTPModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Verify Your Phone Number</h2>
        <p class="text-muted-foreground mb-4">
          We've sent a 6-digit verification code to {{ form.customerPhone }}
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import {
  ShoppingCartIcon,
  ShieldIcon
} from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const toast = useToast()

// Form state
const form = reactive({
  customerName: '',
  customerPhone: '',
  shippingAddress: {
    country: 'Iraq',
    province: '',
    street: ''
  },
  notes: ''
})

// OTP state
const showOTPModal = ref(false)
const otpCode = ref('')
const loading = ref(false)
const verifying = ref(false)
const resending = ref(false)
const developmentMode = ref(false)
const lastOTPCode = ref('')

// Methods
const submitCheckout = async () => {
  // Validate required fields
  if (!form.customerName.trim()) {
    toast.error('Please enter your full name')
    return
  }
  
  if (!form.customerPhone.trim()) {
    toast.error('Please enter your phone number')
    return
  }
  
  if (!form.shippingAddress.country || !form.shippingAddress.province || !form.shippingAddress.street.trim()) {
    toast.error('Please complete your shipping address')
    return
  }

  loading.value = true
  try {
    // Clean phone number (remove spaces, dashes, parentheses, etc.)
    const cleanPhone = form.customerPhone.replace(/[\s\-\(\)\+]/g, '')
    
    // Send OTP first
    const otpResponse = await axios.post('/api/otp/send', {
      phone: cleanPhone,
      purpose: 'checkout'
    })

    if (otpResponse.data.message) {
      developmentMode.value = otpResponse.data.developmentMode || false
      lastOTPCode.value = otpResponse.data.code || ''
      showOTPModal.value = true
      
      if (developmentMode.value) {
        // In development mode, we'll get the code from the server logs
        // The user will need to check the server console
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
    // Clean phone number
    const cleanPhone = form.customerPhone.replace(/[\s\-\(\)\+]/g, '')
    
    // Verify OTP
    const verifyResponse = await axios.post('/api/otp/verify', {
      phone: cleanPhone,
      code: otpCode.value,
      purpose: 'checkout'
    })

    if (verifyResponse.data.verified) {
      // Create order
      await createOrder()
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error)
    toast.error(error.response?.data?.error || 'Invalid verification code')
  } finally {
    verifying.value = false
  }
}

const createOrder = async () => {
  try {
    console.log('Creating guest order with form:', form)
    console.log('Cart items:', cartStore.items)
    
    // Prepare cart items for the API
    const cartItems = cartStore.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
    
    const orderData = {
      ...form,
      cartItems
    }
    
    const orderResponse = await axios.post('/api/orders/guest', orderData)
    
    if (orderResponse.data.order) {
      toast.success('Order placed successfully!')
      showOTPModal.value = false
      // Clear cart after successful order
      await cartStore.clearCart()
      // Redirect to track orders with phone number for automatic login
      router.push({
        path: '/track-orders',
        query: { phone: cleanPhone, autoLogin: 'true' }
      })
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    console.error('Error details:', error.response?.data)
    toast.error(error.response?.data?.error || 'Failed to place order')
  }
}

const resendOTP = async () => {
  resending.value = true
  try {
    // Clean phone number
    const cleanPhone = form.customerPhone.replace(/[\s\-\(\)\+]/g, '')
    
    const resendResponse = await axios.post('/api/otp/resend', {
      phone: cleanPhone,
      purpose: 'checkout'
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

// Lifecycle
onMounted(async () => {
  // Fetch cart from server first
  await cartStore.fetchCart()
  
  if (cartStore.isEmpty) {
    router.push('/')
    return
  }
  
  // Pre-fill form if user is logged in (optional)
  if (authStore.isAuthenticated && authStore.user) {
    form.customerName = authStore.user.name || ''
    form.customerPhone = authStore.user.phone || ''
  }
})
</script>
