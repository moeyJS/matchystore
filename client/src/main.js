import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import './style.css'

// Import components
import ProductGrid from './components/ProductGrid.vue'
import ProductModal from './components/ProductModal.vue'
import CartPage from './pages/CartPage.vue'
import CheckoutPage from './pages/CheckoutPage.vue'
import OrdersPage from './pages/OrdersPage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import AdminDashboard from './pages/admin/AdminDashboard.vue'
import AdminProducts from './pages/admin/AdminProducts.vue'
import AdminOrders from './pages/admin/AdminOrders.vue'
import AdminCustomers from './pages/admin/AdminCustomers.vue'
import AdminPOS from './pages/admin/AdminPOS.vue'
import AdminAnalytics from './pages/admin/AdminAnalytics.vue'
import AdminAnalyticsProducts from './pages/admin/AdminAnalyticsProducts.vue'
import AdminAnalyticsCustomers from './pages/admin/AdminAnalyticsCustomers.vue'
import AdminBackup from './pages/admin/AdminBackup.vue'
import AdminSupport from './pages/admin/AdminSupport.vue'
import AdminSettings from './pages/admin/AdminSettings.vue'
import AdminAppearance from './pages/admin/AdminAppearance.vue'
import AdminCategories from './pages/admin/AdminCategories.vue'
import AdminBrands from './pages/admin/AdminBrands.vue'
import AdminInventory from './pages/admin/AdminInventory.vue'
import AdminReports from './pages/admin/AdminReports.vue'
import AdminPages from './pages/admin/AdminPages.vue'
import CmsPage from './pages/CmsPage.vue'
import AdminStaff from './pages/admin/AdminStaff.vue'
import AdminBanners from './pages/admin/AdminBanners.vue'
import AdminFooter from './pages/admin/AdminFooter.vue'
import GuestOrdersPage from './pages/GuestOrdersPage.vue'

// Routes
const routes = [
  { path: '/', component: ProductGrid, name: 'home' },
  { path: '/cart', component: CartPage, name: 'cart' },
  { path: '/checkout', component: CheckoutPage, name: 'checkout' },
  { path: '/orders', component: OrdersPage, name: 'orders' },
  { path: '/track-orders', component: GuestOrdersPage, name: 'guest-orders' },
  { path: '/login', component: LoginPage, name: 'login' },
  { path: '/register', component: RegisterPage, name: 'register' },
  { path: '/admin', component: AdminDashboard, name: 'admin' },
  { path: '/admin/products', component: AdminProducts, name: 'admin-products' },
  { path: '/admin/products/categories', component: AdminCategories, name: 'admin-categories' },
  { path: '/admin/products/brands', component: AdminBrands, name: 'admin-brands' },
  { path: '/admin/inventory', component: AdminInventory, name: 'admin-inventory' },
  { path: '/admin/orders', component: AdminOrders, name: 'admin-orders' },
  { path: '/admin/customers', component: AdminCustomers, name: 'admin-customers' },
  { path: '/admin/pos', component: AdminPOS, name: 'admin-pos' },
  { path: '/admin/analytics', component: AdminAnalytics, name: 'admin-analytics' },
  { path: '/admin/analytics/sales', component: AdminAnalytics, name: 'admin-analytics-sales' },
  { path: '/admin/analytics/products', component: AdminAnalyticsProducts, name: 'admin-analytics-products' },
  { path: '/admin/analytics/customers', component: AdminAnalyticsCustomers, name: 'admin-analytics-customers' },
  { path: '/admin/backup', component: AdminBackup, name: 'admin-backup' },
  { path: '/admin/support', component: AdminSupport, name: 'admin-support' },
  { path: '/admin/appearance', component: AdminAppearance, name: 'admin-appearance' },
  { path: '/admin/settings', component: AdminSettings, name: 'admin-settings' },
  { path: '/admin/settings/general', component: AdminSettings, name: 'admin-settings-general' },
  { path: '/admin/settings/notifications', component: AdminSettings, name: 'admin-settings-notifications' },
  { path: '/admin/settings/integrations', component: AdminSettings, name: 'admin-settings-integrations' },
  { path: '/admin/reports', component: AdminReports, name: 'admin-reports' },
  { path: '/admin/pages', component: AdminPages, name: 'admin-pages' },
  { path: '/admin/banners', component: AdminBanners, name: 'admin-banners' },
  { path: '/admin/footer', component: AdminFooter, name: 'admin-footer' },
  { path: '/admin/staff', component: AdminStaff, name: 'admin-staff' },
  { path: '/pages/:slug', component: CmsPage, name: 'cms-page' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global components
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Register global components
app.component('ProductGrid', ProductGrid)
app.component('ProductModal', ProductModal)

// Router guard for authentication
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('./stores/auth')
  const authStore = useAuthStore()
  
  // Wait for auth initialization
  if (!authStore.isInitialized) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (authStore.isInitialized) {
          unwatch()
          resolve()
        }
      })
    })
  }
  
  // Check if route requires authentication
  const requiresAuth = to.path.startsWith('/admin') || to.path.startsWith('/orders')
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/admin')
  } else {
    next()
  }
})

app.mount('#app')
