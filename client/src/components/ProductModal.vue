<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">{{ product.name }}</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <XIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden">
        <!-- Images -->
        <div class="lg:w-1/2 p-6">
          <div class="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <img
              v-if="selectedImage || (product.images && product.images.length > 0)"
              :src="selectedImage || product.images[0]"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <div class="text-center">
                <div class="w-32 h-32 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                <p class="text-gray-600">No Image Available</p>
              </div>
            </div>
          </div>
          
          <!-- Image Thumbnails -->
          <div v-if="product.images && product.images.length > 1" class="flex gap-2 mt-4">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectedImage = image"
              :class="[
                'w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                selectedImage === image || (!selectedImage && index === 0)
                  ? 'border-gray-900'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <img
                :src="image"
                :alt="`${product.name} view ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Details -->
        <div class="lg:w-1/2 p-6 space-y-6 overflow-y-auto">
          <!-- Brand -->
          <div v-if="product.brand" class="text-sm text-gray-500 uppercase tracking-wide">
            {{ product.brand.name }}
          </div>

          <!-- Price -->
          <div class="text-3xl font-bold text-gray-900">
            {{ parseFloat(product.price).toFixed(2) }} IQD
          </div>

          <!-- Stock Status -->
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              ]"
            />
            <span class="text-sm text-gray-600">
              {{ product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock' }}
            </span>
          </div>

          <!-- Description -->
          <div v-if="product.description">
            <h3 class="font-semibold mb-2 text-gray-900">Description</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <!-- Attributes -->
          <div v-if="product.attributes && product.attributes.length > 0">
            <h3 class="font-semibold mb-2 text-gray-900">Product Details</h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="attr in product.attributes"
                :key="attr.id"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-500">{{ attr.name }}:</span>
                <span class="font-medium text-gray-900">{{ attr.value }}</span>
              </div>
            </div>
          </div>

          <!-- Quantity and Actions -->
          <div class="space-y-4">
            <!-- Quantity Selector -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-900">Quantity</label>
              <div class="flex items-center gap-2">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon class="h-4 w-4" />
                </button>
                <span class="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center text-gray-900">
                  {{ quantity }}
                </span>
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= product.stock"
                  class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="addToCart"
                :disabled="product.stock === 0 || loading"
                class="flex-1 bg-gray-900 text-white hover:bg-gray-800 py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon class="h-4 w-4" />
                <span v-if="loading">Adding...</span>
                <span v-else>Add to Cart</span>
              </button>
              <button
                @click="buyNow"
                :disabled="product.stock === 0 || loading"
                class="flex-1 bg-red-600 text-white hover:bg-red-700 py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ZapIcon class="h-4 w-4" />
                Buy Now
              </button>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <TruckIcon class="h-4 w-4" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div class="flex items-center gap-2">
              <RefreshCwIcon class="h-4 w-4" />
              <span>30-day return policy</span>
            </div>
            <div class="flex items-center gap-2">
              <ShieldIcon class="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useToast } from 'vue-toastification'
import {
  XIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  ZapIcon,
  TruckIcon,
  RefreshCwIcon,
  ShieldIcon
} from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'add-to-cart'])

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// Local state
const selectedImage = ref(null)
const quantity = ref(1)
const loading = ref(false)

// Computed
const maxQuantity = computed(() => props.product.stock)

// Methods
const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (props.product.stock === 0) return

  loading.value = true
  try {
    const result = await cartStore.addToCart(props.product.id, quantity.value)
    if (result.success) {
      toast.success(`Added ${quantity.value} item(s) to cart!`)
      emit('add-to-cart', props.product)
      emit('close')
    } else {
      toast.error(result.error)
    }
  } finally {
    loading.value = false
  }
}

const buyNow = async () => {
  if (props.product.stock === 0) return

  loading.value = true
  try {
    // Add to cart first
    const result = await cartStore.addToCart(props.product.id, quantity.value)
    if (result.success) {
      // Navigate to checkout
      emit('close')
      router.push('/checkout')
    } else {
      toast.error(result.error)
    }
  } finally {
    loading.value = false
  }
}
</script>





