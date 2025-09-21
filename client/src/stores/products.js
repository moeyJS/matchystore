import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const selectedProduct = ref(null)
  const loading = ref(false)
  const filters = ref({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const brands = ref([])
  const categories = ref([])

  const filteredProducts = computed(() => products.value)

  const fetchProducts = async (page = 1) => {
    loading.value = true
    try {
      const params = {
        page,
        limit: pagination.value.limit,
        ...filters.value
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await axios.get('/api/products', { params })
      
      products.value = response.data.products
      pagination.value = response.data.pagination
    } catch (error) {
      console.error('Failed to fetch products:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id) => {
    try {
      const response = await axios.get(`/api/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      throw error
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/list')
      categories.value = response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }

  const openModal = (product) => {
    selectedProduct.value = product
  }

  const closeModal = () => {
    selectedProduct.value = null
  }

  const searchProducts = async (query) => {
    setFilters({ search: query, page: 1 })
    await fetchProducts(1)
  }

  const filterByCategory = async (categoryId) => {
    setFilters({ category: categoryId, page: 1 })
    await fetchProducts(1)
  }

  const filterByBrand = async (brandId) => {
    setFilters({ brand: brandId, page: 1 })
    await fetchProducts(1)
  }

  const sortProducts = async (sortBy, sortOrder = 'desc') => {
    setFilters({ sortBy, sortOrder, page: 1 })
    await fetchProducts(1)
  }

  const initialize = async () => {
    await Promise.all([
      fetchProducts(),
      fetchBrands(),
      fetchCategories()
    ])
  }

  return {
    products,
    selectedProduct,
    loading,
    filters,
    pagination,
    brands,
    categories,
    filteredProducts,
    fetchProducts,
    fetchProduct,
    fetchBrands,
    fetchCategories,
    setFilters,
    clearFilters,
    openModal,
    closeModal,
    searchProducts,
    filterByCategory,
    filterByBrand,
    sortProducts,
    initialize
  }
})








