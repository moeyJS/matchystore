<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <div class="h-12 w-12 rounded bg-primary flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-xl">M</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold">Welcome back</h2>
        <p class="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      <!-- Login Form -->
      <div class="bg-card border border-border rounded-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your username"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <EyeIcon v-if="!showPassword" class="h-4 w-4" />
                <EyeOffIcon v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="rounded border-input text-primary focus:ring-primary"
              />
              <span class="ml-2 text-sm text-muted-foreground">Remember me</span>
            </label>
            <a href="#" class="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>
        </div>

        <!-- Demo Credentials
        <div class="mt-6 p-4 bg-muted/50 rounded-md">
          <h3 class="text-sm font-medium mb-2">Demo Credentials:</h3>
          <div class="text-xs text-muted-foreground space-y-1">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Customer:</strong> customer / customer123</p>
          </div>
        </div> -->
      </div>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-muted-foreground">
          Don't have an account?
          <router-link to="/register" class="text-primary hover:underline font-medium">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Form state
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)

// Methods
const handleLogin = async () => {
  loading.value = true
  try {
    const result = await authStore.login(form.username, form.password)
    
    if (result.success) {
      toast.success('Welcome back!')
      
      // Redirect based on user role
      if (['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'WAREHOUSE', 'MARKETING'].includes(result.user.role)) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      toast.error(result.error)
    }
  } catch (error) {
    console.error('Login error:', error)
    toast.error('An error occurred during login')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Redirect if already authenticated
  if (authStore.isAuthenticated) {
    const user = authStore.user
    if (['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'WAREHOUSE', 'MARKETING'].includes(user.role)) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
})
</script>





