<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Mobile menu button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 text-gray-900 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

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
            <!-- Search Bar -->
            <div class="hidden md:block relative">
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="Search products..."
                class="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <button class="p-2 text-gray-900 hover:text-gray-700">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a10 10 0 1 1 20 0v5z"></path>
              </svg>
            </button>
            <router-link to="/cart" class="flex items-center space-x-2 bg-gray-900 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
              </svg>
              <span class="hidden sm:inline font-medium">MY CART</span>
              <span v-if="cartItemCount > 0" class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{ cartItemCount }}</span>
            </router-link>
            <router-link to="/login" class="p-2 text-gray-900 hover:text-gray-700">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg class="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Mobile Search -->
        <div v-if="mobileMenuOpen" class="lg:hidden py-4 border-t border-gray-200">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Breadcrumbs -->
    <div class="bg-gray-50 py-3">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="text-sm">
          <span class="text-gray-500">Man Fashion</span>
          <span class="mx-2 text-gray-400">></span>
          <span class="text-gray-900 font-medium">All Products</span>
        </nav>
      </div>
    </div>

    <!-- Hero Banner Carousel -->
    <div v-if="banners.length > 0" class="bg-gradient-to-r from-gray-50 to-gray-100 py-8 lg:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative">
          <!-- Banner Carousel -->
          <div class="overflow-hidden rounded-2xl">
            <div 
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentBannerIndex * 100}%)` }"
            >
              <div 
                v-for="(banner, index) in banners" 
                :key="banner.id"
                class="w-full flex-shrink-0 bg-white rounded-2xl p-6 lg:p-8 shadow-lg"
              >
                <div class="flex flex-col lg:flex-row items-center justify-between">
                  <div class="flex-1 text-center lg:text-left">
                    <h1 class="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">{{ banner.title }}</h1>
                    <p class="text-base lg:text-lg text-gray-600 mb-6">{{ banner.description }}</p>
                    <div v-if="banner.ctaText" class="flex items-center justify-center lg:justify-start">
                      <a 
                        :href="banner.ctaUrl || '#'" 
                        class="inline-flex items-center text-gray-900 font-medium hover:text-gray-700"
                      >
                        <span>{{ banner.ctaText }}</span>
                        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div class="mt-6 lg:mt-0 lg:ml-8">
                    <div class="w-48 h-48 lg:w-64 lg:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <img v-if="banner.imageUrl" :src="banner.imageUrl" :alt="banner.title" class="w-full h-full object-cover rounded-lg">
                      <div v-else class="text-center">
                        <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                        <p class="text-gray-600">Banner Image</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Controls -->
          <div v-if="banners.length > 1" class="flex items-center justify-center mt-4 space-x-2">
            <button 
              @click="previousBanner"
              class="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="flex space-x-1">
              <button 
                v-for="(banner, index) in banners" 
                :key="index"
                @click="currentBannerIndex = index"
                :class="[
                  'w-2 h-2 rounded-full transition-colors',
                  currentBannerIndex === index ? 'bg-gray-900' : 'bg-gray-300'
                ]"
              ></button>
            </div>
            <button 
              @click="nextBanner"
              class="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Main Content Area -->
      <main class="w-full">
          <!-- Results Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p class="text-gray-600">
                Showing {{ products.length }} results from total {{ pagination.total }} for "{{ searchQuery || 'All Products' }}"
              </p>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Sort by</span>
                <select v-model="sortBy" @change="handleSort" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="createdAt">Newest</option>
                  <option value="name">Name</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>


          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>

          <!-- Product Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              v-for="product in products" 
              :key="product.id" 
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              @click="openProductModal(product)"
            >
              <div class="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  v-if="product.images && product.images.length > 0" 
                  :src="product.images[0]" 
                  :alt="product.name"
                  class="w-full h-full object-cover"
                >
                <div v-else class="text-center">
                  <div class="w-32 h-32 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                  <p class="text-gray-600 text-sm">No Image</p>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-medium text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>
                <p class="text-lg font-semibold text-gray-900 mb-3">{{ product.price }} IQD</p>
                <div class="flex items-center justify-between">
                  <div class="flex space-x-1">
                    <div 
                      v-for="color in product.colors" 
                      :key="color"
                      class="w-4 h-4 rounded-full border border-gray-300"
                      :style="{ backgroundColor: color }"
                      :title="color"
                    ></div>
                    <div v-if="!product.colors || product.colors.length === 0" class="w-4 h-4 bg-gray-300 rounded-full"></div>
                  </div>
                  <button 
                    @click.stop="addToCart(product)"
                    class="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Products Message -->
          <div v-if="!loading && products.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p class="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="flex items-center justify-center space-x-2">
            <button 
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← PREVIOUS
            </button>
            
            <template v-for="page in visiblePages" :key="page">
              <button 
                v-if="page !== '...'"
                @click="changePage(page)"
                :class="[
                  'px-3 py-2 text-sm rounded-md',
                  page === pagination.page 
                    ? 'bg-gray-900 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
            </template>
            
            <button 
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- Other Fashion Categories -->
    <div class="bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">OTHER FASHION CATEGORY</h2>
        <div class="flex space-x-6 overflow-x-auto pb-4">
          <div class="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Woman Fashion</h3>
              <button class="text-gray-400 hover:text-gray-600">←</button>
            </div>
            <p class="text-gray-600 mb-4">Explore our stylish and trendy woman fashion</p>
            <button class="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
              EXPLORE PRODUCT →
            </button>
            <div class="mt-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">Woman Fashion Image</p>
            </div>
          </div>
          <div class="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Shoes Fashion</h3>
              <button class="text-gray-400 hover:text-gray-600">→</button>
            </div>
            <p class="text-gray-600 mb-4">Explore our many type of shoes that trendy and fashionable</p>
            <button class="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
              EXPLORE PRODUCT →
            </button>
            <div class="mt-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">Shoes Fashion Image</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explore Fashion Catalog Banner -->
    <div class="relative py-16 bg-gray-900 text-white">
      <div class="absolute inset-0 bg-gray-800 opacity-50"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold mb-4">EXPLORE OUR FASHION CATALOG</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Browse through our fashion catalog to find a wide range of stylish clothing options. From classic looks to the latest trends, there's something for everyone.
        </p>
        <button class="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          SEE OUR INSTAGRAM →
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="section in footerSections" :key="section.id" v-show="section.isActive">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ section.title }}</h3>
            <ul class="space-y-2">
              <li v-for="link in section.links" :key="link.id" v-show="link.isActive">
                <a :href="link.url" class="text-gray-600 hover:text-gray-900">{{ link.text }}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Social Links -->
        <div v-if="socialLinks.length > 0" class="mt-8 pt-8 border-t border-gray-200">
          <div class="flex justify-center space-x-6">
            <a 
              v-for="social in socialLinks" 
              :key="social.id" 
              :href="social.url" 
              class="text-gray-400 hover:text-gray-600"
              v-show="social.isActive"
            >
              <img 
                v-if="social.icon && (social.icon.startsWith('data:') || social.icon.startsWith('http'))" 
                :src="social.icon" 
                :alt="social.platform" 
                class="w-6 h-6 object-contain"
              >
              <span v-else-if="social.icon" v-html="social.icon" class="w-6 h-6"></span>
              <div v-else class="w-6 h-6 bg-gray-300 rounded"></div>
            </a>
          </div>
        </div>
        
        <div class="mt-12 pt-8 border-t border-gray-200 text-center">
          <div class="text-6xl font-bold text-gray-400 opacity-20">MATCHYSTORE</div>
          <p class="mt-4 text-gray-600">© {{ currentYear }} MatchyStore. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Product Modal -->
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="closeProductModal"
      @add-to-cart="addToCart"
    />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProductStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import ProductModal from './ProductModal.vue'
import axios from 'axios'

const productStore = useProductStore()
const cartStore = useCartStore()

// State
const mobileMenuOpen = ref(false)
const showFilters = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const selectedProduct = ref(null)
const currentBannerIndex = ref(0)

// Data
const products = ref([])
const categories = ref([])
const brands = ref([])
const banners = ref([])
const footerSections = ref([])
const socialLinks = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Filters
const openFilters = reactive({
  category: true,
  price: false,
  brand: false
})

const selectedCategories = ref([])
const selectedBrands = ref([])
const priceRange = reactive({
  min: null,
  max: null
})

const sortBy = ref('createdAt')

// Computed
const currentYear = computed(() => new Date().getFullYear())

const appliedFilters = computed(() => {
  const filters = []
  if (selectedCategories.value.length > 0) {
    filters.push({ key: 'categories', label: `Categories (${selectedCategories.value.length})` })
  }
  if (selectedBrands.value.length > 0) {
    filters.push({ key: 'brands', label: `Brands (${selectedBrands.value.length})` })
  }
  if (priceRange.min || priceRange.max) {
    const min = priceRange.min || 0
    const max = priceRange.max || '∞'
    filters.push({ key: 'price', label: `$${min} - $${max}` })
  }
  return filters
})

const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) pages.push('...')
    pages.push(total)
  }
  
  return pages
})

// Methods
const toggleFilter = (filterName) => {
  openFilters[filterName] = !openFilters[filterName]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      sortBy: sortBy.value.replace('-desc', ''),
      sortOrder: sortBy.value.includes('-desc') ? 'desc' : 'asc'
    }
    
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategories.value.length > 0) params.category = selectedCategories.value[0]
    if (selectedBrands.value.length > 0) params.brand = selectedBrands.value[0]
    if (priceRange.min) params.minPrice = priceRange.min
    if (priceRange.max) params.maxPrice = priceRange.max
    
    const response = await axios.get('/api/products', { params })
    products.value = response.data.products
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/products/categories/list')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchBrands = async () => {
  try {
    const response = await axios.get('/api/products/brands/list')
    brands.value = response.data
  } catch (error) {
    console.error('Error fetching brands:', error)
  }
}

const fetchBanners = async () => {
  try {
    const response = await axios.get('/api/banners')
    banners.value = response.data
  } catch (error) {
    console.error('Error fetching banners:', error)
  }
}

const fetchFooter = async () => {
  try {
    const response = await axios.get('/api/footer')
    footerSections.value = response.data.sections
    socialLinks.value = response.data.socialLinks
  } catch (error) {
    console.error('Error fetching footer:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchProducts()
}

// Watch search query for real-time search
watch(searchQuery, (newQuery) => {
  if (newQuery.length >= 2 || newQuery.length === 0) {
    pagination.value.page = 1
    fetchProducts()
  }
})

const handleSort = () => {
  pagination.value.page = 1
  fetchProducts()
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchProducts()
}

const removeFilter = (filterKey) => {
  if (filterKey === 'categories') selectedCategories.value = []
  if (filterKey === 'brands') selectedBrands.value = []
  if (filterKey === 'price') {
    priceRange.min = null
    priceRange.max = null
  }
  applyFilters()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchProducts()
  }
}

const openProductModal = (product) => {
  selectedProduct.value = product
}

const closeProductModal = () => {
  selectedProduct.value = null
}

const addToCart = async (product) => {
  try {
    await cartStore.addToCart(product.id, 1)
    // Show success message or toast
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
}

const previousBanner = () => {
  currentBannerIndex.value = currentBannerIndex.value === 0 
    ? banners.value.length - 1 
    : currentBannerIndex.value - 1
}

// Auto-advance banner carousel
let bannerInterval = null
const startBannerCarousel = () => {
  if (banners.value.length > 1) {
    bannerInterval = setInterval(nextBanner, 5000)
  }
}

const stopBannerCarousel = () => {
  if (bannerInterval) {
    clearInterval(bannerInterval)
    bannerInterval = null
  }
}

// Watchers
watch(() => pagination.value.page, fetchProducts)
watch(banners, () => {
  stopBannerCarousel()
  startBannerCarousel()
})

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBrands(),
      fetchBanners(),
      fetchFooter()
    ])
    startBannerCarousel()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

// Cleanup
onUnmounted(() => {
  stopBannerCarousel()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>