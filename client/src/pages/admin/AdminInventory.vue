<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Inventory Management</h1>
          <p class="text-muted-foreground mt-2">Track and manage your product inventory</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="exportInventory"
            class="px-4 py-2 border border-input rounded-md hover:bg-muted flex items-center space-x-2"
          >
            <DownloadIcon class="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            @click="openStockAdjustmentModal"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2"
          >
            <PlusIcon class="h-4 w-4" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      <!-- Inventory Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Products</p>
              <p class="text-2xl font-bold">{{ inventoryStats.totalProducts || 0 }}</p>
            </div>
            <PackageIcon class="h-8 w-8 text-primary" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">In Stock</p>
              <p class="text-2xl font-bold text-green-600">{{ inventoryStats.inStock || 0 }}</p>
            </div>
            <CheckCircleIcon class="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p class="text-2xl font-bold text-yellow-600">{{ inventoryStats.lowStock || 0 }}</p>
            </div>
            <AlertTriangleIcon class="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p class="text-2xl font-bold text-red-600">{{ inventoryStats.outOfStock || 0 }}</p>
            </div>
            <XCircleIcon class="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div class="flex items-center space-x-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              v-model="stockFilter"
              class="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select
              v-model="categoryFilter"
              class="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshInventory"
              class="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <RefreshCwIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-card border border-border rounded-lg">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-border">
              <tr>
                <th class="text-left p-4 font-medium">Product</th>
                <th class="text-left p-4 font-medium">SKU</th>
                <th class="text-left p-4 font-medium">Category</th>
                <th class="text-left p-4 font-medium">Current Stock</th>
                <th class="text-left p-4 font-medium">Price</th>
                <th class="text-left p-4 font-medium">Status</th>
                <th class="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-b border-border">
                <td colspan="7" class="p-8 text-center">
                  <div class="flex justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredProducts.length === 0" class="border-b border-border">
                <td colspan="7" class="p-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
              <tr
                v-else
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-b border-border hover:bg-muted/50"
              >
                <td class="p-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        v-if="product.images && product.images.length > 0"
                        :src="product.images[0]"
                        :alt="product.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <PackageIcon class="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <h4 class="font-medium">{{ product.name }}</h4>
                      <p class="text-sm text-muted-foreground">{{ product.brand?.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="text-sm font-mono">{{ product.sku || 'N/A' }}</span>
                </td>
                <td class="p-4">
                  <span class="text-sm">{{ product.category?.name || 'Uncategorized' }}</span>
                </td>
                <td class="p-4">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium">{{ product.stock }}</span>
                    <button
                      @click="openStockAdjustmentModal(product)"
                      class="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <EditIcon class="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td class="p-4">
                  <span class="font-medium">{{ Number(product.price).toFixed(2) }} IQD</span>
                </td>
                <td class="p-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStockStatusClass(product.stock)
                    ]"
                  >
                    {{ getStockStatus(product.stock) }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewProduct(product)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="editProduct(product)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <EditIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Adjustment Modal -->
      <div v-if="showStockModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Adjust Stock</h2>
            <button @click="closeStockModal" class="p-2 hover:bg-muted rounded-full transition-colors">
              <XIcon class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="adjustStock" class="space-y-4">
            <div v-if="selectedProduct">
              <h3 class="font-medium">{{ selectedProduct.name }}</h3>
              <p class="text-sm text-muted-foreground">Current stock: {{ selectedProduct.stock }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Adjustment Type</label>
              <select
                v-model="stockAdjustment.type"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set Stock</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Quantity</label>
              <input
                v-model.number="stockAdjustment.quantity"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Reason</label>
              <textarea
                v-model="stockAdjustment.reason"
                rows="3"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter reason for adjustment"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="closeStockModal"
                class="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                <span v-if="saving">Adjusting...</span>
                <span v-else>Adjust Stock</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Product View Modal -->
    <div v-if="showProductModal && selectedProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-bold">Product Details</h2>
          <button @click="closeProductModal" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Product Images -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Product Images</h3>
              <div class="space-y-4">
                <div v-if="selectedProduct.images && selectedProduct.images.length > 0" class="grid grid-cols-2 gap-4">
                  <div
                    v-for="(image, index) in selectedProduct.images"
                    :key="index"
                    class="aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      :src="image"
                      :alt="`${selectedProduct.name} - Image ${index + 1}`"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div v-else class="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <PackageIcon class="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Product Information -->
            <div class="space-y-6">
              <!-- Basic Info -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-600">Product Name</label>
                    <p class="text-lg font-semibold">{{ selectedProduct.name }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">SKU</label>
                    <p class="font-mono text-sm">{{ selectedProduct.sku || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">Brand</label>
                    <p>{{ selectedProduct.brand?.name || 'No Brand' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">Category</label>
                    <p>{{ selectedProduct.category?.name || 'Uncategorized' }}</p>
                  </div>
                </div>
              </div>

              <!-- Pricing & Stock -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Pricing & Stock</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-600">Price</label>
                    <p class="text-xl font-bold text-green-600">{{ parseFloat(selectedProduct.price).toFixed(2) }} IQD</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">Stock</label>
                    <div class="flex items-center space-x-2">
                      <span class="text-xl font-bold" :class="getStockColor(selectedProduct.stock)">
                        {{ selectedProduct.stock }}
                      </span>
                      <span class="text-sm text-gray-500">units</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div v-if="selectedProduct.description">
                <h3 class="text-lg font-semibold mb-4">Description</h3>
                <p class="text-gray-700">{{ selectedProduct.description }}</p>
              </div>

              <!-- Product Status -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Status</h3>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-3 h-3 rounded-full',
                      selectedProduct.isActive ? 'bg-green-500' : 'bg-red-500'
                    ]"></div>
                    <span>{{ selectedProduct.isActive ? 'Active' : 'Inactive' }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-3 h-3 rounded-full',
                      selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                    ]"></div>
                    <span>{{ selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock' }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex space-x-3 pt-4 border-t">
                <button
                  @click="editProduct(selectedProduct)"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Product
                </button>
                <button
                  @click="openStockAdjustmentModal(selectedProduct)"
                  class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Adjust Stock
                </button>
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
  PackageIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  DownloadIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  XIcon,
  RefreshCwIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const products = ref([])
const categories = ref([])
const searchQuery = ref('')
const stockFilter = ref('')
const categoryFilter = ref('')
const showStockModal = ref(false)
const showProductModal = ref(false)
const selectedProduct = ref(null)

const inventoryStats = reactive({
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0
})

const stockAdjustment = reactive({
  type: 'add',
  quantity: 0,
  reason: ''
})

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value

  if (searchQuery.value) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (stockFilter.value) {
    filtered = filtered.filter(product => {
      switch (stockFilter.value) {
        case 'in-stock':
          return product.stock > 10
        case 'low-stock':
          return product.stock > 0 && product.stock <= 10
        case 'out-of-stock':
          return product.stock === 0
        default:
          return true
      }
    })
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(product => product.categoryId === categoryFilter.value)
  }

  return filtered
})

// Methods
const fetchInventory = async () => {
  loading.value = true
  try {
    const [productsResponse, categoriesResponse, statsResponse] = await Promise.all([
      axios.get('/api/products?limit=100'),
      axios.get('/api/admin/categories'),
      axios.get('/api/admin/inventory/stats')
    ])

    products.value = productsResponse.data.products || []
    categories.value = categoriesResponse.data.categories || []
    Object.assign(inventoryStats, statsResponse.data)

  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    toast.error('Failed to load inventory data')
  } finally {
    loading.value = false
  }
}

const refreshInventory = () => {
  fetchInventory()
}

const openStockAdjustmentModal = (product = null) => {
  selectedProduct.value = product
  stockAdjustment.type = 'add'
  stockAdjustment.quantity = 0
  stockAdjustment.reason = ''
  showStockModal.value = true
}

const closeStockModal = () => {
  showStockModal.value = false
  selectedProduct.value = null
}

const adjustStock = async () => {
  saving.value = true
  try {
    const adjustmentData = {
      productId: selectedProduct.value?.id,
      type: stockAdjustment.type,
      quantity: stockAdjustment.quantity,
      reason: stockAdjustment.reason
    }

    await axios.post('/api/admin/inventory/adjust', adjustmentData)
    toast.success('Stock adjusted successfully')
    closeStockModal()
    await fetchInventory()
  } catch (error) {
    console.error('Failed to adjust stock:', error)
    toast.error('Failed to adjust stock')
  } finally {
    saving.value = false
  }
}

const getStockStatus = (stock) => {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClass = (stock) => {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const viewProduct = (product) => {
  selectedProduct.value = product
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  selectedProduct.value = null
}

const editProduct = (product) => {
  router.push(`/admin/products?edit=${product.id}`)
}

const exportInventory = () => {
  // TODO: Implement inventory export
  toast.info('Export feature coming soon')
}

// Lifecycle
onMounted(async () => {
  // Wait for auth store to initialize
  while (!authStore.isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await fetchInventory()
})
</script>


