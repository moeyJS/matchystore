import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Set up axios interceptor for token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && refreshToken.value) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken: refreshToken.value
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          setTokens(accessToken, newRefreshToken)
          
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${accessToken}`
          return axios.request(error.config)
        } catch (refreshError) {
          logout()
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    }
  )

  const setTokens = (accessToken, newRefreshToken) => {
    token.value = accessToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    
    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })

      const { user: userData, accessToken, refreshToken: newRefreshToken } = response.data
      
      user.value = userData
      setTokens(accessToken, newRefreshToken)

      return { success: true, user: userData }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)

      const { user: newUser, accessToken, refreshToken: newRefreshToken } = response.data
      
      user.value = newUser
      setTokens(accessToken, newRefreshToken)

      return { success: true, user: newUser }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    delete axios.defaults.headers.common['Authorization']
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const response = await axios.get('/api/auth/me')
      user.value = response.data.user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  const initialize = async () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await fetchUser()
    }
    isInitialized.value = true
  }

  // Initialize auth state on store creation
  initialize()

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    fetchUser,
    initialize
  }
})


