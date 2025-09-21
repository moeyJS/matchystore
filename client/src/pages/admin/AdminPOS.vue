<template>
  <AdminLayout>
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">POS System</h1>
          <p class="text-muted-foreground mt-2">Manage your point of sale operations</p>
        </div>
        <div class="flex gap-2 mt-4 md:mt-0">
          <button
            v-if="!activeSession"
            @click="startSession"
            :disabled="startingSession"
            class="btn-primary px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            <span v-if="startingSession">Starting...</span>
            <span v-else>Start Session</span>
          </button>
          <button
            v-if="activeSession"
            @click="endSession"
            :disabled="endingSession"
            class="btn-destructive px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            <span v-if="endingSession">Ending...</span>
            <span v-else>End Session</span>
          </button>
        </div>
      </div>

      <!-- POS Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <CreditCardIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p class="text-2xl font-bold">{{ stats.totalSessions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <ActivityIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Active Sessions</p>
              <p class="text-2xl font-bold">{{ stats.activeSessions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <DollarSignIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p class="text-2xl font-bold">{{ stats.totalSales.toFixed(2) }} IQD</p>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <TrendingUpIcon class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Today's Sales</p>
              <p class="text-2xl font-bold">${{ stats.todaySales.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Session Info -->
      <div v-if="activeSession" class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Active Session</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Cashier</p>
            <p class="text-lg">{{ activeSession.cashier?.name || 'Unknown' }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Started At</p>
            <p class="text-lg">{{ formatDate(activeSession.startTime) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Starting Cash</p>
            <p class="text-lg">${{ activeSession.startingCash.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- POS Configuration -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">POS Configuration</h2>
        
        <form @submit.prevent="updateConfig" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Store Name</label>
              <input
                v-model="config.storeName"
                type="text"
                required
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Currency</label>
              <select
                v-model="config.currency"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="IQD">IQD</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Store Address</label>
              <input
                v-model="config.storeAddress"
                type="text"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Store Phone</label>
              <input
                v-model="config.storePhone"
                type="text"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Store Email</label>
              <input
                v-model="config.storeEmail"
                type="email"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                v-model="config.taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Receipt Header</label>
            <textarea
              v-model="config.receiptHeader"
              rows="3"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Welcome to MatchyStore..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Receipt Footer</label>
            <textarea
              v-model="config.receiptFooter"
              rows="3"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Thank you for your business!"
            />
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="btn-primary px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save Configuration</span>
          </button>
        </form>
      </div>

      <!-- Recent Sessions -->
      <div class="bg-card border border-border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Sessions</h2>
        
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>

        <div v-else-if="sessions.length === 0" class="text-center py-8 text-muted-foreground">
          No sessions found
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th class="text-left py-3 px-4 font-medium">Cashier</th>
                <th class="text-left py-3 px-4 font-medium">Start Time</th>
                <th class="text-left py-3 px-4 font-medium">End Time</th>
                <th class="text-right py-3 px-4 font-medium">Starting Cash</th>
                <th class="text-right py-3 px-4 font-medium">Ending Cash</th>
                <th class="text-right py-3 px-4 font-medium">Total Sales</th>
                <th class="text-center py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="session in sessions"
                :key="session.id"
                class="border-t hover:bg-muted/50 transition-colors"
              >
                <td class="py-3 px-4">{{ session.cashier?.name || 'Unknown' }}</td>
                <td class="py-3 px-4">{{ formatDate(session.startTime) }}</td>
                <td class="py-3 px-4">{{ session.endTime ? formatDate(session.endTime) : '-' }}</td>
                <td class="py-3 px-4 text-right">{{ session.startingCash.toFixed(2) }} IQD</td>
                <td class="py-3 px-4 text-right">{{ session.endingCash ? `${session.endingCash.toFixed(2)} IQD` : '-' }}</td>
                <td class="py-3 px-4 text-right">{{ session.totalSales.toFixed(2) }} IQD</td>
                <td class="py-3 px-4 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ session.isActive ? 'Active' : 'Closed' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    <!-- End Session Modal -->
    <div v-if="showEndModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">End POS Session</h2>
        <p class="text-muted-foreground mb-6">
          Enter the ending cash amount to close this session.
        </p>
        
        <form @submit.prevent="confirmEndSession" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Ending Cash Amount</label>
            <input
              v-model="endingCash"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showEndModal = false"
              class="flex-1 btn-secondary py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="endingSession"
              class="flex-1 btn-destructive py-2 px-4 rounded-md disabled:opacity-50"
            >
              <span v-if="endingSession">Ending...</span>
              <span v-else>End Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout.vue'
import {
  CreditCardIcon,
  ActivityIcon,
  DollarSignIcon,
  TrendingUpIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const startingSession = ref(false)
const endingSession = ref(false)
const showEndModal = ref(false)
const endingCash = ref('')

const stats = reactive({
  totalSessions: 0,
  activeSessions: 0,
  totalSales: 0,
  todaySales: 0
})

const activeSession = ref(null)
const sessions = ref([])

const config = reactive({
  storeName: '',
  storeAddress: '',
  storePhone: '',
  storeEmail: '',
  currency: 'USD',
  taxRate: 0,
  receiptHeader: '',
  receiptFooter: ''
})

// Methods
const fetchStats = async () => {
  try {
    const response = await axios.get('/api/pos/dashboard/stats')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('Failed to fetch POS stats:', error)
  }
}

const fetchConfig = async () => {
  try {
    const response = await axios.get('/api/pos/config')
    Object.assign(config, response.data)
  } catch (error) {
    console.error('Failed to fetch POS config:', error)
  }
}

const fetchActiveSession = async () => {
  try {
    const response = await axios.get('/api/pos/session/active')
    activeSession.value = response.data
  } catch (error) {
    console.error('Failed to fetch active session:', error)
  }
}

const fetchSessions = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/pos/sessions')
    sessions.value = response.data.sessions
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    toast.error('Failed to load sessions')
  } finally {
    loading.value = false
  }
}

const updateConfig = async () => {
  saving.value = true
  try {
    await axios.put('/api/pos/config', config)
    toast.success('Configuration updated successfully')
  } catch (error) {
    console.error('Failed to update config:', error)
    toast.error('Failed to update configuration')
  } finally {
    saving.value = false
  }
}

const startSession = async () => {
  startingSession.value = true
  try {
    const response = await axios.post('/api/pos/session/start', {
      startingCash: 0
    })
    activeSession.value = response.data
    toast.success('POS session started successfully')
    fetchStats()
  } catch (error) {
    console.error('Failed to start session:', error)
    toast.error(error.response?.data?.error || 'Failed to start session')
  } finally {
    startingSession.value = false
  }
}

const endSession = () => {
  showEndModal.value = true
  endingCash.value = activeSession.value?.startingCash || 0
}

const confirmEndSession = async () => {
  endingSession.value = true
  try {
    await axios.post(`/api/pos/session/${activeSession.value.id}/end`, {
      endingCash: parseFloat(endingCash.value)
    })
    activeSession.value = null
    showEndModal.value = false
    toast.success('POS session ended successfully')
    fetchStats()
    fetchSessions()
  } catch (error) {
    console.error('Failed to end session:', error)
    toast.error(error.response?.data?.error || 'Failed to end session')
  } finally {
    endingSession.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else if (!['ADMIN', 'SUPER_ADMIN', 'WAREHOUSE', 'CUSTOMER_SERVICE'].includes(authStore.user?.role)) {
    router.push('/')
  } else {
    Promise.all([
      fetchStats(),
      fetchConfig(),
      fetchActiveSession(),
      fetchSessions()
    ])
  }
})
</script>


