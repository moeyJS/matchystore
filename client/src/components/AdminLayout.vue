<template>
  <div class="min-h-screen bg-muted/50">
    <!-- Admin Header -->
    <header class="bg-card border-b border-border sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="p-2 hover:bg-muted rounded-md transition-colors lg:hidden"
            >
              <MenuIcon class="h-5 w-5" />
            </button>
            <router-link to="/admin" class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span class="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span class="text-xl font-bold">MatchyStore Admin</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <a 
              href="/" 
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              <span>View Store</span>
            </a>
            <span class="text-sm text-muted-foreground">Welcome, {{ authStore.user?.name || 'Admin' }}</span>
            <button 
              @click="toggleMaintenance" 
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                maintenanceMode 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              ]"
            >
              {{ maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF' }}
            </button>
            <button @click="authStore.logout" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside 
        :class="[
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="p-6 border-b border-border">
            <h2 class="text-lg font-semibold">Admin Panel</h2>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4 space-y-2">
            <!-- Dashboard -->
            <router-link
              to="/admin"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'admin' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
            >
              <BarChart3Icon class="h-4 w-4" />
              <span>Dashboard</span>
            </router-link>

            <!-- Products -->
            <div>
              <button
                @click="toggleSubmenu('products')"
                class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div class="flex items-center space-x-3">
                  <PackageIcon class="h-4 w-4" />
                  <span>Products</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'h-4 w-4 transition-transform',
                    openSubmenus.products ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-if="openSubmenus.products" class="ml-6 mt-1 space-y-1">
                <router-link
                  to="/admin/products"
                  class="block px-3 py-2 rounded-md text-sm transition-colors"
                  :class="[
                    $route.name === 'admin-products' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  ]"
                >
                  All Products
                </router-link>
                <router-link
                  to="/admin/products/categories"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Categories
                </router-link>
                <router-link
                  to="/admin/products/brands"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Brands
                </router-link>
                <router-link
                  to="/admin/inventory"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Inventory
                </router-link>
              </div>
            </div>

            <!-- Orders -->
            <div>
              <button
                @click="toggleSubmenu('orders')"
                class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div class="flex items-center space-x-3">
                  <ShoppingCartIcon class="h-4 w-4" />
                  <span>Orders</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'h-4 w-4 transition-transform',
                    openSubmenus.orders ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-if="openSubmenus.orders" class="ml-6 mt-1 space-y-1">
                <router-link
                  to="/admin/orders"
                  class="block px-3 py-2 rounded-md text-sm transition-colors"
                  :class="[
                    $route.name === 'admin-orders' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  ]"
                >
                  All Orders
                </router-link>
                <router-link
                  to="/admin/orders/pending"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Pending Orders
                </router-link>
                <router-link
                  to="/admin/orders/processing"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Processing Orders
                </router-link>
              </div>
            </div>

            <!-- Customers -->
            <div>
              <button
                @click="toggleSubmenu('customers')"
                class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div class="flex items-center space-x-3">
                  <UsersIcon class="h-4 w-4" />
                  <span>Customers</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'h-4 w-4 transition-transform',
                    openSubmenus.customers ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-if="openSubmenus.customers" class="ml-6 mt-1 space-y-1">
                <router-link
                  to="/admin/customers"
                  class="block px-3 py-2 rounded-md text-sm transition-colors"
                  :class="[
                    $route.name === 'admin-customers' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  ]"
                >
                  All Customers
                </router-link>
                <router-link
                  to="/admin/customers/guests"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Guest Customers
                </router-link>
              </div>
            </div>

            <!-- POS -->
            <router-link
              to="/admin/pos"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'admin-pos' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
            >
              <CreditCardIcon class="h-4 w-4" />
              <span>POS System</span>
            </router-link>

            <!-- Analytics -->
            <div>
              <button
                @click="toggleSubmenu('analytics')"
                class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div class="flex items-center space-x-3">
                  <TrendingUpIcon class="h-4 w-4" />
                  <span>Analytics</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'h-4 w-4 transition-transform',
                    openSubmenus.analytics ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-if="openSubmenus.analytics" class="ml-6 mt-1 space-y-1">
                <router-link
                  to="/admin/analytics/sales"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Sales Reports
                </router-link>
                <router-link
                  to="/admin/analytics/customers"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Customer Analytics
                </router-link>
                <router-link
                  to="/admin/analytics/products"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Product Performance
                </router-link>
              </div>
            </div>

            <!-- Reports -->
            <router-link
              to="/admin/reports"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'admin-reports' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
            >
              <FileTextIcon class="h-4 w-4" />
              <span>Reports</span>
            </router-link>

            <!-- Staff -->
            <router-link
              to="/admin/staff"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'admin-staff' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
            >
              <UsersIcon class="h-4 w-4" />
              <span>Staff</span>
            </router-link>

            <!-- Settings -->
            <div>
              <button
                @click="toggleSubmenu('settings')"
                class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div class="flex items-center space-x-3">
                  <SettingsIcon class="h-4 w-4" />
                  <span>Settings</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'h-4 w-4 transition-transform',
                    openSubmenus.settings ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-if="openSubmenus.settings" class="ml-6 mt-1 space-y-1">
                <router-link
                  to="/admin/settings/general"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  General Settings
                </router-link>
                <router-link
                  to="/admin/settings/notifications"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Notifications
                </router-link>
                <router-link
                  to="/admin/settings/integrations"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Integrations
                </router-link>
                <router-link
                  to="/admin/appearance"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Appearance
                </router-link>
                <router-link
                  to="/admin/pages"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Pages
                </router-link>
                <router-link
                  to="/admin/banners"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Banners
                </router-link>
                <router-link
                  to="/admin/footer"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Footer
                </router-link>
                <router-link
                  to="/admin/backup"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Backup
                </router-link>
                <router-link
                  to="/admin/support"
                  class="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Support
                </router-link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-0">
        <div class="container mx-auto px-4 py-8">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import {
  MenuIcon,
  BarChart3Icon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  CreditCardIcon,
  TrendingUpIcon,
  SettingsIcon,
  ChevronDownIcon,
  FileTextIcon
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

// State
const sidebarOpen = ref(false)
const maintenanceMode = ref(false)
const openSubmenus = reactive({
  products: false,
  orders: false,
  customers: false,
  analytics: false,
  settings: false
})

// Methods
const toggleSubmenu = (submenu) => {
  openSubmenus[submenu] = !openSubmenus[submenu]
}

const fetchMaintenanceStatus = async () => {
  try {
    const response = await axios.get('/api/admin/settings/system')
    maintenanceMode.value = response.data.maintenanceMode || false
  } catch (error) {
    console.error('Failed to fetch maintenance status:', error)
  }
}

const toggleMaintenance = async () => {
  try {
    const newStatus = !maintenanceMode.value
    await axios.put('/api/admin/settings/system', {
      maintenanceMode: newStatus
    })
    maintenanceMode.value = newStatus
  } catch (error) {
    console.error('Failed to toggle maintenance mode:', error)
  }
}

// Auto-open relevant submenu based on current route
const updateSubmenuState = () => {
  const routeName = route.name
  
  // Reset all submenus
  Object.keys(openSubmenus).forEach(key => {
    openSubmenus[key] = false
  })
  
  // Open relevant submenu
  if (routeName?.includes('products')) {
    openSubmenus.products = true
  } else if (routeName?.includes('orders')) {
    openSubmenus.orders = true
  } else if (routeName?.includes('customers')) {
    openSubmenus.customers = true
  } else if (routeName?.includes('analytics')) {
    openSubmenus.analytics = true
  } else if (routeName?.includes('settings')) {
    openSubmenus.settings = true
  }
}

// Watch for route changes
watch(route, updateSubmenuState, { immediate: true })

// Close sidebar on mobile when route changes
watch(route, () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
})

onMounted(() => {
  updateSubmenuState()
  fetchMaintenanceStatus()
})
</script>
