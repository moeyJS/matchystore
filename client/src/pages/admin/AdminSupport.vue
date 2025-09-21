<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Support Center</h1>
          <p class="text-gray-600">Manage customer support tickets and messages</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-sm text-gray-500">Online Agents</div>
            <div class="text-lg font-semibold text-green-600">{{ onlineAgents }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Active Chats</div>
            <div class="text-lg font-semibold text-blue-600">{{ activeChats }}</div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <AlertCircleIcon class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Open Tickets</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.openTickets }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.inProgressTickets }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Closed Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.closedToday }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <MessageCircleIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg Response</p>
              <p class="text-2xl font-bold text-gray-900">{{ avgResponseTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tickets..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            v-model="priorityFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <button
            @click="refreshTickets"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCwIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="ticket in filteredTickets"
                :key="ticket.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="openTicket(ticket)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      #{{ ticket.id.slice(-8) }}
                    </div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">
                      {{ ticket.subject }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ ticket.user?.name?.charAt(0) || 'U' }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {{ ticket.user?.name || 'Unknown' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ ticket.user?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      {
                        'bg-green-100 text-green-800': ticket.status === 'OPEN',
                        'bg-yellow-100 text-yellow-800': ticket.status === 'IN_PROGRESS',
                        'bg-red-100 text-red-800': ticket.status === 'CLOSED'
                      }
                    ]"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      {
                        'bg-gray-100 text-gray-800': ticket.priority === 'LOW',
                        'bg-blue-100 text-blue-800': ticket.priority === 'MEDIUM',
                        'bg-orange-100 text-orange-800': ticket.priority === 'HIGH',
                        'bg-red-100 text-red-800': ticket.priority === 'URGENT'
                      }
                    ]"
                  >
                    {{ ticket.priority }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatTime(ticket.updatedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click.stop="openTicket(ticket)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      @click.stop="updateTicketStatus(ticket)"
                      class="text-green-600 hover:text-green-900"
                    >
                      {{ ticket.status === 'CLOSED' ? 'Reopen' : 'Close' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(currentPage * pageSize, totalTickets) }}</span>
                of
                <span class="font-medium">{{ totalTickets }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <Dialog v-model:open="isTicketModalOpen">
      <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ticket #{{ selectedTicket?.id?.slice(-8) }}</DialogTitle>
          <DialogDescription>
            {{ selectedTicket?.subject }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="flex-1 overflow-y-auto min-h-0">
          <!-- Ticket Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Customer</label>
                <p class="text-sm text-gray-900">{{ selectedTicket?.user?.name }}</p>
                <p class="text-xs text-gray-500">{{ selectedTicket?.user?.email }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Order</label>
                <p class="text-sm text-gray-900">
                  {{ selectedTicket?.order?.orderNumber || 'N/A' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Status</label>
                <select
                  :value="selectedTicket?.status"
                  @change="updateTicketStatus(selectedTicket, $event.target.value)"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Priority</label>
                <select
                  :value="selectedTicket?.priority"
                  @change="updateTicketPriority(selectedTicket, $event.target.value)"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="space-y-4 mb-4 max-h-96 overflow-y-auto">
            <div
              v-for="message in selectedTicket?.messages || []"
              :key="message.id"
              :class="[
                'flex',
                message.isFromAdmin ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs px-4 py-2 rounded-lg',
                  message.isFromAdmin
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                <p class="text-sm">{{ message.message }}</p>
                <p class="text-xs opacity-70 mt-1">
                  {{ formatTime(message.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Reply Form -->
          <div class="border-t pt-4 mt-auto">
            <!-- Quick Templates -->
            <div class="mb-4">
              <SupportTemplates @use-template="useTemplate" />
            </div>
            
            <div class="flex space-x-2">
              <textarea
                v-model="replyMessage"
                placeholder="Type your reply..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                @keydown.enter.prevent="sendReply"
              ></textarea>
              <div class="flex flex-col space-y-2">
                <button
                  @click="sendReply"
                  :disabled="!replyMessage.trim()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
                <button
                  @click="clearReply"
                  class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'vue-toastification'
import { io } from 'socket.io-client'
import AdminLayout from '../../components/AdminLayout.vue'
import SupportTemplates from '../../components/SupportTemplates.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import {
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'

export default {
  name: 'AdminSupport',
  components: {
    AdminLayout,
    SupportTemplates,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    AlertCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    MessageCircleIcon,
    RefreshCwIcon,
    ChevronLeftIcon,
    ChevronRightIcon
  },
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()

    // Reactive data
    const tickets = ref([])
    const stats = ref({
      openTickets: 0,
      inProgressTickets: 0,
      closedToday: 0,
      totalTickets: 0
    })
    const onlineAgents = ref(0)
    const activeChats = ref(0)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalTickets = ref(0)
    const isTicketModalOpen = ref(false)
    const selectedTicket = ref(null)
    const replyMessage = ref('')
    const socket = ref(null)
    const isConnected = ref(false)

    // Computed properties
    const filteredTickets = computed(() => {
      return tickets.value.filter(ticket => {
        const matchesSearch = !searchQuery.value || 
          ticket.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          ticket.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesStatus = !statusFilter.value || ticket.status === statusFilter.value
        const matchesPriority = !priorityFilter.value || ticket.priority === priorityFilter.value
        
        return matchesSearch && matchesStatus && matchesPriority
      })
    })

    const totalPages = computed(() => Math.ceil(totalTickets.value / pageSize.value))

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, start + 4)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const avgResponseTime = computed(() => {
      // Mock calculation - in real app, calculate from actual data
      return '2.5m'
    })

    // Methods
    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: pageSize.value,
          ...(statusFilter.value && { status: statusFilter.value }),
          ...(priorityFilter.value && { priority: priorityFilter.value }),
          ...(searchQuery.value && { search: searchQuery.value })
        })

        const response = await fetch(`/api/support/tickets?${params}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          tickets.value = data.tickets
          totalTickets.value = data.pagination.total
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        toast.error('Failed to fetch tickets')
      }
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/support/stats/overview', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          stats.value = data
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const openTicket = (ticket) => {
      selectedTicket.value = ticket
      isTicketModalOpen.value = true
    }

    const updateTicketStatus = async (ticket, newStatus) => {
      try {
        const status = newStatus || (ticket.status === 'CLOSED' ? 'OPEN' : 'CLOSED')
        const response = await fetch(`/api/support/tickets/${ticket.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            status: status
          })
        })

        if (response.ok) {
          toast.success('Ticket status updated')
          fetchTickets()
        } else {
          throw new Error('Failed to update status')
        }
      } catch (error) {
        console.error('Error updating ticket status:', error)
        toast.error('Failed to update ticket status')
      }
    }

    const updateTicketPriority = async (ticket, newPriority) => {
      try {
        const response = await fetch(`/api/support/tickets/${ticket.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            priority: newPriority
          })
        })

        if (response.ok) {
          toast.success('Ticket priority updated')
          fetchTickets()
        } else {
          throw new Error('Failed to update priority')
        }
      } catch (error) {
        console.error('Error updating ticket priority:', error)
        toast.error('Failed to update ticket priority')
      }
    }

    const initializeSocket = () => {
      if (socket.value) return

      console.log('Initializing admin socket connection...')
      socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')
      
      socket.value.on('connect', () => {
        console.log('Admin connected to support chat')
        isConnected.value = true
        // Join admin room
        console.log('Joining admin room...')
        socket.value.emit('join-admin-room')
      })

      socket.value.on('disconnect', () => {
        console.log('Admin disconnected from support chat')
        isConnected.value = false
      })

      socket.value.on('connect_error', (error) => {
        console.error('Admin socket connection error:', error)
      })

      socket.value.on('support-message', (message) => {
        console.log('Admin received socket message:', message)
        console.log('isFromAdmin:', message.isFromAdmin)
        // Update the selected ticket if it matches
        if (selectedTicket.value && selectedTicket.value.id === message.ticketId) {
          selectedTicket.value.messages.push(message)
        }
        // Refresh tickets list to show updated message count
        fetchTickets()
      })

      socket.value.on('new-support-ticket', (ticket) => {
        // Add new ticket to the list
        tickets.value.unshift(ticket)
        totalTickets.value += 1
        toast.info('New support ticket received')
      })
    }

    const sendReply = async () => {
      if (!replyMessage.value.trim() || !selectedTicket.value) return

      try {
        const response = await fetch(`/api/support/tickets/${selectedTicket.value.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            message: replyMessage.value
          })
        })

        if (response.ok) {
          const message = await response.json()
          // Don't add to local array - let socket handle it to avoid duplication
          // The server will broadcast the message back via socket
          
          replyMessage.value = ''
          toast.success('Reply sent')
        } else {
          throw new Error('Failed to send reply')
        }
      } catch (error) {
        console.error('Error sending reply:', error)
        toast.error('Failed to send reply')
      }
    }

    const useTemplate = (templateContent) => {
      // Process template with ticket data
      const variables = {
        customerName: selectedTicket.value?.user?.name || 'Valued Customer',
        orderNumber: selectedTicket.value?.order?.orderNumber || 'N/A',
        orderStatus: selectedTicket.value?.order?.status || 'Processing',
        companyName: 'MatchyStore'
      }

      let processedContent = templateContent
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        processedContent = processedContent.replace(regex, variables[key])
      })

      replyMessage.value = processedContent
    }

    const clearReply = () => {
      replyMessage.value = ''
    }

    const refreshTickets = () => {
      fetchTickets()
      fetchStats()
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    // Watchers
    watch([currentPage, statusFilter, priorityFilter], () => {
      fetchTickets()
    })

    watch(searchQuery, (newQuery) => {
      // Debounce search
      clearTimeout(searchQuery.timeout)
      searchQuery.timeout = setTimeout(() => {
        fetchTickets()
      }, 500)
    })

    // Lifecycle
    onMounted(() => {
      fetchTickets()
      fetchStats()
      initializeSocket()
    })

    onUnmounted(() => {
      if (socket.value) {
        socket.value.disconnect()
      }
    })

    return {
      tickets,
      stats,
      onlineAgents,
      activeChats,
      searchQuery,
      statusFilter,
      priorityFilter,
      currentPage,
      pageSize,
      totalTickets,
      isTicketModalOpen,
      selectedTicket,
      replyMessage,
      filteredTickets,
      totalPages,
      visiblePages,
      avgResponseTime,
      openTicket,
      updateTicketStatus,
      updateTicketPriority,
      sendReply,
      useTemplate,
      clearReply,
      refreshTickets,
      previousPage,
      nextPage,
      goToPage,
      formatTime
    }
  }
}
</script>
