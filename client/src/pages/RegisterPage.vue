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
        <h2 class="text-3xl font-bold">Create your account</h2>
        <p class="text-muted-foreground mt-2">Join MatchyStore today</p>
      </div>

      <!-- Registration Form -->
      <div class="bg-card border border-border rounded-lg p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your email"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="+964 123 456 7890"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Optional - for order updates via SMS
            </p>
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
                minlength="6"
                class="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Create a password"
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
            <p class="text-xs text-muted-foreground mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Confirm your password"
            />
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="mt-1 rounded border-input text-primary focus:ring-primary"
            />
            <label for="terms" class="ml-2 text-sm text-muted-foreground">
              I agree to the 
              <a href="#" class="text-primary hover:underline">Terms of Service</a>
              and 
              <a href="#" class="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full btn-primary py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>
      </div>

      <!-- Sign In Link -->
      <div class="text-center">
        <p class="text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-primary hover:underline font-medium">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Form state
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const loading = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword &&
    form.password.length >= 6 &&
    form.acceptTerms
  )
})

// Methods
const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }

  loading.value = true
  try {
    const result = await authStore.register({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password
    })
    
    if (result.success) {
      toast.success('Account created successfully!')
      router.push('/')
    } else {
      toast.error(result.error)
    }
  } catch (error) {
    console.error('Registration error:', error)
    toast.error('An error occurred during registration')
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






