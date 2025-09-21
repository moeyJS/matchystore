<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Shopping Cart</h1>
      <p class="text-muted-foreground mt-2">
        {{ cartStore.itemCount }} item(s) in your cart
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="cartStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Empty Cart -->
    <div v-else-if="cartStore.isEmpty" class="text-center py-12">
      <ShoppingCartIcon class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-xl font-semibold mb-2">Your cart is empty</h3>
      <p class="text-muted-foreground mb-6">Add some products to get started!</p>
      <router-link to="/" class="btn-primary px-6 py-3 rounded-md">
        Continue Shopping
      </router-link>
    </div>

    <!-- Cart Items -->
    <div v-else class="space-y-6">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-4 px-2">Product</th>
              <th class="text-center py-4 px-2">Quantity</th>
              <th class="text-right py-4 px-2">Price</th>
              <th class="text-right py-4 px-2">Total</th>
              <th class="text-center py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cartStore.items"
              :key="item.id"
              class="border-b hover:bg-muted/50 transition-colors"
            >
              <!-- Product Info -->
              <td class="py-4 px-2">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-md overflow-hidden bg-muted">
                    <img
                      :src="item.product.images[0] || '/placeholder-sock.jpg'"
                      :alt="item.product.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 class="font-medium">{{ item.product.name }}</h3>
                    <p v-if="item.product.brand" class="text-sm text-muted-foreground">
                      {{ item.product.brand.name }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      SKU: {{ item.product.sku || 'N/A' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Quantity -->
              <td class="py-4 px-2">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1 || updating"
                    class="p-1 border border-input rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon class="h-4 w-4" />
                  </button>
                  <span class="px-3 py-1 border border-input rounded min-w-[50px] text-center">
                    {{ item.quantity }}
                  </span>
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    :disabled="item.quantity >= item.product.stock || updating"
                    class="p-1 border border-input rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>

              <!-- Price -->
              <td class="py-4 px-2 text-right">
                {{ parseFloat(item.product.price).toFixed(2) }} IQD
              </td>

              <!-- Total -->
              <td class="py-4 px-2 text-right font-medium">
                {{ (item.quantity * parseFloat(item.product.price)).toFixed(2) }} IQD
              </td>

              <!-- Actions -->
              <td class="py-4 px-2">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewProduct(item.product)"
                    class="p-2 hover:bg-muted rounded-md transition-colors"
                    title="View Product"
                  >
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="removeItem(item.id)"
                    :disabled="removing === item.id"
                    class="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors disabled:opacity-50"
                    title="Remove Item"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="bg-card border border-border rounded-lg p-4 space-y-4"
        >
          <!-- Product Info -->
          <div class="flex gap-4">
            <div class="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img
                :src="item.product.images[0] || '/placeholder-sock.jpg'"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate">{{ item.product.name }}</h3>
              <p v-if="item.product.brand" class="text-sm text-muted-foreground">
                {{ item.product.brand.name }}
              </p>
              <p class="text-lg font-bold text-primary">
                {{ parseFloat(item.product.price).toFixed(2) }} IQD
              </p>
            </div>
          </div>

          <!-- Quantity and Actions -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1 || updating"
                class="p-2 border border-input rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MinusIcon class="h-4 w-4" />
              </button>
              <span class="px-3 py-1 border border-input rounded min-w-[50px] text-center">
                {{ item.quantity }}
              </span>
              <button
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock || updating"
                class="p-2 border border-input rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon class="h-4 w-4" />
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="viewProduct(item.product)"
                class="p-2 hover:bg-muted rounded-md transition-colors"
                title="View Product"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                @click="removeItem(item.id)"
                :disabled="removing === item.id"
                class="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors disabled:opacity-50"
                title="Remove Item"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Total -->
          <div class="text-right">
            <span class="text-lg font-bold">
              Total: {{ (item.quantity * parseFloat(item.product.price)).toFixed(2) }} IQD
            </span>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="space-y-4">
          <div class="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span class="font-bold">{{ cartStore.totalPrice.toFixed(2) }} IQD</span>
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Items ({{ cartStore.itemCount }}):</span>
            <span>{{ cartStore.totalPrice.toFixed(2) }} IQD</span>
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div class="border-t pt-4">
            <div class="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{{ cartStore.totalPrice.toFixed(2) }} IQD</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 space-y-3">
          <button
            @click="proceedToCheckout"
            class="w-full btn-primary py-3 px-4 rounded-md font-medium"
          >
            Proceed to Checkout
          </button>
          <button
            @click="clearCart"
            :disabled="clearing"
            class="w-full btn-secondary py-3 px-4 rounded-md font-medium disabled:opacity-50"
          >
            Clear Cart
          </button>
          <router-link
            to="/"
            class="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useProductStore } from '../stores/products'
import { useToast } from 'vue-toastification'
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon
} from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()
const toast = useToast()

// Local state
const updating = ref(false)
const removing = ref(null)
const clearing = ref(false)

// Methods
const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) return

  updating.value = true
  try {
    const result = await cartStore.updateQuantity(itemId, newQuantity)
    if (result.success) {
      toast.success('Quantity updated')
    } else {
      toast.error(result.error)
    }
  } finally {
    updating.value = false
  }
}

const removeItem = async (itemId) => {
  removing.value = itemId
  try {
    const result = await cartStore.removeFromCart(itemId)
    if (result.success) {
      toast.success('Item removed from cart')
    } else {
      toast.error(result.error)
    }
  } finally {
    removing.value = null
  }
}

const clearCart = async () => {
  clearing.value = true
  try {
    const result = await cartStore.clearCart()
    if (result.success) {
      toast.success('Cart cleared')
    } else {
      toast.error(result.error)
    }
  } finally {
    clearing.value = false
  }
}

const viewProduct = (product) => {
  productStore.openModal(product)
}

const proceedToCheckout = () => {
  router.push('/checkout')
}

// Lifecycle
onMounted(() => {
  cartStore.loadCart()
})
</script>






