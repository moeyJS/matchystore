<template>
  <AdminLayout>
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Products</h1>
          <p class="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <button
          @click="openCreateModal"
          class="btn-primary px-4 py-2 rounded-md font-medium mt-4 md:mt-0"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <!-- Filters and Search -->
      <div class="bg-card border border-border rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Search</label>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search products..."
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <select
              v-model="selectedCategory"
              @change="handleCategoryFilter"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Brand</label>
            <select
              v-model="selectedBrand"
              @change="handleBrandFilter"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Brands</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select
              v-model="statusFilter"
              @change="handleStatusFilter"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th class="text-left py-4 px-6 font-medium">Product</th>
                <th class="text-left py-4 px-6 font-medium">Category</th>
                <th class="text-left py-4 px-6 font-medium">Brand</th>
                <th class="text-left py-4 px-6 font-medium">Barcode</th>
                <th class="text-right py-4 px-6 font-medium">Price</th>
                <th class="text-right py-4 px-6 font-medium">Stock</th>
                <th class="text-center py-4 px-6 font-medium">Status</th>
                <th class="text-center py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t">
                <td colspan="8" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
              <tr v-else-if="products.length === 0" class="border-t">
                <td colspan="8" class="text-center py-8 text-muted-foreground">
                  No products found
                </td>
              </tr>
              <tr
                v-else
                v-for="product in products"
                :key="product.id"
                class="border-t hover:bg-muted/50 transition-colors"
              >
                <!-- Product Info -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        :src="product.images[0] || '/placeholder-sock.jpg'"
                        :alt="product.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 class="font-medium">{{ product.name }}</h3>
                      <p class="text-sm text-muted-foreground">SKU: {{ product.sku || 'N/A' }}</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-6">
                  <span class="text-sm">{{ product.category?.name || 'N/A' }}</span>
                </td>

                <!-- Brand -->
                <td class="py-4 px-6">
                  <span class="text-sm">{{ product.brand?.name || 'N/A' }}</span>
                </td>

                <!-- Barcode -->
                <td class="py-4 px-6">
                  <span class="text-sm font-mono">{{ product.barcode || 'N/A' }}</span>
                </td>

                <!-- Price -->
                <td class="py-4 px-6 text-right">
                  <span class="font-medium">{{ parseFloat(product.price).toFixed(2) }} IQD</span>
                </td>

                <!-- Stock -->
                <td class="py-4 px-6 text-right">
                  <span :class="product.stock <= 10 ? 'text-destructive font-medium' : ''">
                    {{ product.stock }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-4 px-6 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="editProduct(product)"
                      class="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <EditIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteProduct(product.id)"
                      class="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                      title="Delete Product"
                    >
                      <TrashIcon class="h-4 w-4" />
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

    <!-- Create/Edit Product Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-bold">{{ isEditing ? 'Edit Product' : 'Add Product' }}</h2>
          <button @click="closeModal" class="p-2 hover:bg-muted rounded-full transition-colors">
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form @submit.prevent="saveProduct" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  v-model="productForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">SKU</label>
                <input
                  v-model="productForm.sku"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Barcode</label>
                <input
                  v-model="productForm.barcode"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter product barcode"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Colors (comma-separated)</label>
                <input
                  v-model="productForm.colorsInput"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., #FF0000, #00FF00, #0000FF"
                />
                <p class="text-xs text-muted-foreground mt-1">Enter color codes separated by commas</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Price *</label>
                <input
                  v-model="productForm.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Stock *</label>
                <input
                  v-model="productForm.stock"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Category</label>
                <select
                  v-model="productForm.categoryId"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Brand</label>
                <select
                  v-model="productForm.brandId"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Brand</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea
                v-model="productForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Images</label>
              <div class="space-y-4">
                <!-- File Upload -->
                <div>
                  <input
                    type="file"
                    @change="handleImageUpload"
                    multiple
                    accept="image/*"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p class="text-xs text-muted-foreground mt-1">Upload multiple images or enter URLs below</p>
                </div>
                
                <!-- URL Input -->
                <div>
                  <textarea
                    v-model="imageUrls"
                    rows="3"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p class="text-xs text-muted-foreground mt-1">Enter one image URL per line</p>
                </div>
                
                <!-- Preview Images -->
                <div v-if="previewImages.length > 0" class="grid grid-cols-4 gap-2">
                  <div v-for="(image, index) in previewImages" :key="index" class="relative">
                    <img :src="image" :alt="`Preview ${index + 1}`" class="w-full h-20 object-cover rounded border">
                    <button
                      @click="removePreviewImage(index)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="isActive"
                v-model="productForm.isActive"
                type="checkbox"
                class="rounded border-input text-primary focus:ring-primary"
              />
              <label for="isActive" class="ml-2 text-sm text-muted-foreground">
                Product is active
              </label>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 btn-secondary py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 btn-primary py-2 px-4 rounded-md disabled:opacity-50"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>{{ isEditing ? 'Update' : 'Create' }} Product</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout.vue'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// State
const products = ref([])
const categories = ref([])
const brands = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedBrand = ref('')
const statusFilter = ref('')

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const productForm = reactive({
  id: null,
  name: '',
  description: '',
  price: '',
  sku: '',
  barcode: '',
  stock: '',
  categoryId: '',
  brandId: '',
  colorsInput: '',
  isActive: true
})

const imageUrls = ref('')
const previewImages = ref([])

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
const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      limit: pagination.limit,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
      ...(selectedBrand.value && { brand: selectedBrand.value }),
      ...(statusFilter.value && { isActive: statusFilter.value === 'active' })
    }

    const response = await axios.get('/api/products', { params })
    products.value = response.data.products
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    toast.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/products/categories/list')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchBrands = async () => {
  try {
    const response = await axios.get('/api/products/brands/list')
    brands.value = response.data
  } catch (error) {
    console.error('Failed to fetch brands:', error)
  }
}

const handleSearch = () => {
  fetchProducts(1)
}

const handleCategoryFilter = () => {
  fetchProducts(1)
}

const handleBrandFilter = () => {
  fetchProducts(1)
}

const handleStatusFilter = () => {
  fetchProducts(1)
}

const loadPage = (page) => {
  fetchProducts(page)
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editProduct = (product) => {
  isEditing.value = true
  Object.assign(productForm, {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price.toString(),
    sku: product.sku || '',
    barcode: product.barcode || '',
    stock: product.stock.toString(),
    categoryId: product.categoryId || '',
    brandId: product.brandId || '',
    colorsInput: product.colors ? product.colors.join(', ') : '',
    isActive: product.isActive
  })
  imageUrls.value = product.images.join('\n')
  previewImages.value = []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(productForm, {
    id: null,
    name: '',
    description: '',
    price: '',
    sku: '',
    barcode: '',
    stock: '',
    categoryId: '',
    brandId: '',
    colorsInput: '',
    isActive: true
  })
  imageUrls.value = ''
  previewImages.value = []
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removePreviewImage = (index) => {
  previewImages.value.splice(index, 1)
}

const saveProduct = async () => {
  saving.value = true
  try {
    // Combine uploaded images and URL images
    const urlImages = imageUrls.value.split('\n').filter(url => url.trim())
    const allImages = [...previewImages.value, ...urlImages]
    
    // Parse colors from input
    const colors = productForm.colorsInput
      .split(',')
      .map(color => color.trim())
      .filter(color => color.length > 0)
    
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      images: allImages,
      colors: colors,
      barcode: productForm.barcode || null,
      categoryId: productForm.categoryId || null,
      brandId: productForm.brandId || null
    }
    
    // Remove colorsInput from data as it's not needed in the API
    delete data.colorsInput

    if (isEditing.value) {
      await axios.put(`/api/products/${productForm.id}`, data)
      toast.success('Product updated successfully')
    } else {
      await axios.post('/api/products', data)
      toast.success('Product created successfully')
    }

    closeModal()
    fetchProducts(pagination.page)
  } catch (error) {
    console.error('Failed to save product:', error)
    toast.error(error.response?.data?.error || 'Failed to save product')
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product?')) {
    return
  }

  try {
    await axios.delete(`/api/products/${productId}`)
    toast.success('Product deleted successfully')
    fetchProducts(pagination.page)
  } catch (error) {
    console.error('Failed to delete product:', error)
    toast.error('Failed to delete product')
  }
}

// Watch for edit parameter in URL
watch(() => route.query.edit, async (editId) => {
  if (editId && products.value.length > 0) {
    const product = products.value.find(p => p.id === editId)
    if (product) {
      editProduct(product)
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else if (!['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'WAREHOUSE'].includes(authStore.user?.role)) {
    router.push('/')
  } else {
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBrands()
    ])
  }
})
</script>
