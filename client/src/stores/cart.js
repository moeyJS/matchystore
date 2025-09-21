import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const itemCount = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const totalPrice = computed(() => 
    items.value.reduce((total, item) => 
      total + (item.quantity * parseFloat(item.product.price)), 0
    )
  )

  const isEmpty = computed(() => items.value.length === 0)

  const fetchCart = async () => {
    loading.value = true
    try {
      // Try to fetch from server first (for authenticated users)
      const response = await axios.get('/api/cart')
      items.value = response.data
    } catch (error) {
      // If not authenticated, try to load from localStorage
      console.log('Server cart not available, loading from localStorage')
      const localCart = localStorage.getItem('guestCart')
      if (localCart) {
        items.value = JSON.parse(localCart)
      }
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      // Try server first (for authenticated users)
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity
      })
      
      // Update local cart
      const existingItemIndex = items.value.findIndex(
        item => item.productId === productId
      )
      
      if (existingItemIndex >= 0) {
        items.value[existingItemIndex] = response.data
      } else {
        items.value.push(response.data)
      }

      return { success: true }
    } catch (error) {
      // If server fails, try local storage (for guest users)
      console.log('Server cart not available, using local storage')
      
      try {
        // Fetch product details
        const productResponse = await axios.get(`/api/products/${productId}`)
        const product = productResponse.data
        
        const existingItemIndex = items.value.findIndex(
          item => item.productId === productId
        )
        
        if (existingItemIndex >= 0) {
          items.value[existingItemIndex].quantity += quantity
        } else {
          items.value.push({
            id: `local-${Date.now()}`,
            productId,
            quantity,
            product
          })
        }
        
        // Save to localStorage
        localStorage.setItem('guestCart', JSON.stringify(items.value))
        
        return { success: true }
      } catch (productError) {
        console.error('Failed to add to cart:', productError)
        return { 
          success: false, 
          error: productError.response?.data?.error || 'Failed to add to cart' 
        }
      }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      // Try server first (for authenticated users)
      const response = await axios.put(`/api/cart/${itemId}`, { quantity })
      
      // Update local cart
      const itemIndex = items.value.findIndex(item => item.id === itemId)
      if (itemIndex >= 0) {
        items.value[itemIndex] = response.data
      }

      return { success: true }
    } catch (error) {
      // If server fails, update local storage (for guest users)
      console.log('Server cart not available, updating local storage')
      
      const itemIndex = items.value.findIndex(item => item.id === itemId)
      if (itemIndex >= 0) {
        items.value[itemIndex].quantity = quantity
        // Save to localStorage
        localStorage.setItem('guestCart', JSON.stringify(items.value))
        return { success: true }
      } else {
        return { 
          success: false, 
          error: 'Item not found in cart' 
        }
      }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      // Try server first (for authenticated users)
      await axios.delete(`/api/cart/${itemId}`)
      
      // Update local cart
      items.value = items.value.filter(item => item.id !== itemId)

      return { success: true }
    } catch (error) {
      // If server fails, update local storage (for guest users)
      console.log('Server cart not available, updating local storage')
      
      items.value = items.value.filter(item => item.id !== itemId)
      // Save to localStorage
      localStorage.setItem('guestCart', JSON.stringify(items.value))
      
      return { success: true }
    }
  }

  const clearCart = async () => {
    try {
      // Try server first (for authenticated users)
      await axios.delete('/api/cart')
      items.value = []
      localStorage.removeItem('guestCart')
      return { success: true }
    } catch (error) {
      // If server fails, clear local storage (for guest users)
      console.log('Server cart not available, clearing local storage')
      items.value = []
      localStorage.removeItem('guestCart')
      return { success: true }
    }
  }

  const getCartSummary = async () => {
    try {
      // Try server first (for authenticated users)
      const response = await axios.get('/api/cart/summary')
      return response.data
    } catch (error) {
      // If server fails, calculate from local cart (for guest users)
      console.log('Server cart not available, calculating from local storage')
      return {
        totalItems: itemCount.value,
        totalPrice: totalPrice.value
      }
    }
  }

  const loadCart = async () => {
    if (items.value.length === 0) {
      await fetchCart()
    }
  }

  // Initialize cart from localStorage on store creation
  const initializeGuestCart = () => {
    const localCart = localStorage.getItem('guestCart')
    if (localCart) {
      try {
        items.value = JSON.parse(localCart)
      } catch (error) {
        console.error('Failed to parse guest cart from localStorage:', error)
        localStorage.removeItem('guestCart')
      }
    }
  }

  // Initialize guest cart
  initializeGuestCart()

  return {
    items,
    loading,
    itemCount,
    totalPrice,
    isEmpty,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartSummary,
    loadCart
  }
})


