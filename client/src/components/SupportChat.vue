<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Chat Toggle Button -->
    <button
      v-if="!isOpen"
      @click="openChat"
      class="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 relative group"
    >
      <MessageCircleIcon class="h-6 w-6" />
      <!-- Notification badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
      <!-- Tooltip -->
      <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {{ unreadCount > 0 ? `${unreadCount} unread messages` : 'Open support chat' }}
      </div>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="bg-white rounded-lg shadow-2xl border w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom-4 duration-300"
    >
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-3 h-3 bg-green-400 rounded-full absolute -bottom-1 -right-1 border-2 border-white"></div>
            <MessageCircleIcon class="h-6 w-6" />
          </div>
          <div>
            <h3 class="font-semibold">Support Chat</h3>
            <p class="text-sm opacity-90">
              {{ isConnected ? 'Online' : 'Connecting...' }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="minimizeChat"
            class="text-white hover:text-gray-200 transition-colors p-1"
            title="Minimize"
          >
            <MinusIcon class="h-4 w-4" />
          </button>
          <button
            @click="closeChat"
            class="text-white hover:text-gray-200 transition-colors p-1"
            title="Close"
          >
            <XIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Ticket Info (if order context) -->
      <div v-if="currentTicket" class="bg-gray-50 px-4 py-2 border-b">
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <span class="font-medium">Ticket #{{ currentTicket.id.slice(-8) }}</span>
            <span class="text-gray-500 ml-2">{{ currentTicket.subject }}</span>
          </div>
          <span
            :class="[
              'px-2 py-1 text-xs rounded-full',
              {
                'bg-green-100 text-green-800': currentTicket.status === 'OPEN',
                'bg-yellow-100 text-yellow-800': currentTicket.status === 'IN_PROGRESS',
                'bg-red-100 text-red-800': currentTicket.status === 'CLOSED'
              }
            ]"
          >
            {{ currentTicket.status }}
          </span>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messagesContainer">
        <!-- Welcome message for new chats -->
        <div v-if="messages.length === 0 && !isLoading" class="text-center py-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircleIcon class="h-8 w-8 text-blue-600" />
          </div>
          <h4 class="font-medium text-gray-900 mb-2">Welcome to Support Chat</h4>
          <p class="text-sm text-gray-500 mb-4">How can we help you today?</p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              v-for="quickAction in quickActions"
              :key="quickAction.text"
              @click="selectQuickAction(quickAction)"
              class="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
            >
              {{ quickAction.text }}
            </button>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Loading messages...</p>
        </div>

        <!-- Messages -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.isFromAdmin ? 'justify-start' : 'justify-end'
          ]"
        >
          <div
              :class="[
                'max-w-xs px-4 py-2 rounded-lg relative',
                message.isFromAdmin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              ]"
          >
            <p class="text-sm">{{ message.message }}</p>
            <p class="text-xs opacity-70 mt-1">
              {{ formatTime(message.createdAt) }}
            </p>
            <!-- Message status indicators -->
            <div v-if="!message.isFromAdmin" class="absolute -right-1 -bottom-1">
              <div v-if="message.status === 'sent'" class="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div v-else-if="message.status === 'delivered'" class="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div v-else-if="message.status === 'read'" class="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-gray-100 px-4 py-2 rounded-lg">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <span class="text-xs text-gray-500">Support agent is typing...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="border-t p-4 bg-gray-50">
        <!-- Closed ticket notice -->
        <div v-if="currentTicket && currentTicket.status === 'CLOSED'" class="mb-3 bg-red-50 border-l-4 border-red-400 p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                This support ticket has been closed. You cannot send new messages to this ticket.
              </p>
            </div>
          </div>
        </div>

        <!-- File attachment preview -->
        <div v-if="attachedFiles.length > 0" class="mb-3">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(file, index) in attachedFiles"
              :key="index"
              class="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border"
            >
              <PaperclipIcon class="h-4 w-4 text-gray-500" />
              <span class="text-sm text-gray-700">{{ file.name }}</span>
              <button
                @click="removeFile(index)"
                class="text-red-500 hover:text-red-700"
              >
                <XIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex space-x-2" :class="{ 'opacity-50': currentTicket && currentTicket.status === 'CLOSED' }">
          <!-- File attachment button -->
          <label class="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :class="{ 'opacity-50 cursor-not-allowed': currentTicket && currentTicket.status === 'CLOSED' }">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              class="hidden"
              :disabled="currentTicket && currentTicket.status === 'CLOSED'"
            >
            <PaperclipIcon class="h-5 w-5" />
          </label>

          <!-- Message input -->
          <div class="flex-1 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.prevent="handleEnterKey"
              @input="handleTyping"
              type="text"
              :placeholder="currentTicket && currentTicket.status === 'CLOSED' ? 'This ticket is closed' : 'Type your message...'"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              :disabled="sending || (currentTicket && currentTicket.status === 'CLOSED')"
              rows="1"
              ref="messageInput"
            ></textarea>
            <!-- Character count -->
            <div v-if="newMessage.length > 0" class="absolute bottom-1 right-2 text-xs text-gray-400">
              {{ newMessage.length }}/1000
            </div>
          </div>

          <!-- Send button -->
          <button
            @click="sendMessage"
            :disabled="(!newMessage.trim() && attachedFiles.length === 0) || sending || (currentTicket && currentTicket.status === 'CLOSED')"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <SendIcon v-if="!sending" class="h-4 w-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </button>
        </div>

        <!-- Quick actions -->
        <div v-if="showQuickActions" class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="action in quickActions"
            :key="action.text"
            @click="selectQuickAction(action)"
            class="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border hover:bg-gray-50 transition-colors"
          >
            {{ action.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { io } from 'socket.io-client'
import {
  MessageCircleIcon,
  XIcon,
  XCircleIcon,
  SendIcon,
  MinusIcon,
  PaperclipIcon
} from 'lucide-vue-next'

export default {
  name: 'SupportChat',
  props: {
    orderId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const toast = useToast()
    
    const isOpen = ref(false)
    const isMinimized = ref(false)
    const messages = ref([])
    const newMessage = ref('')
    const sending = ref(false)
    const isTyping = ref(false)
    const isLoading = ref(false)
    const isConnected = ref(false)
    const unreadCount = ref(0)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const fileInput = ref(null)
    const socket = ref(null)
    const currentTicket = ref(null)
    const attachedFiles = ref([])
    const showQuickActions = ref(false)
    const typingTimeout = ref(null)
    const orderContext = ref(null)
    
    // Chat persistence
    const CHAT_STORAGE_KEY = 'support_chat_state'
    
    // Quick action templates
    const quickActions = ref([
      { text: 'Order Status', action: 'order_status' },
      { text: 'Refund Request', action: 'refund' },
      { text: 'Technical Issue', action: 'technical' },
      { text: 'General Question', action: 'general' },
      { text: 'Speak to Human', action: 'human' }
    ])

    // Chat persistence functions
    const saveChatState = () => {
      const chatState = {
        isOpen: isOpen.value,
        currentTicket: currentTicket.value,
        messages: messages.value,
        orderContext: orderContext.value,
        timestamp: Date.now()
      }
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState))
    }

    const loadChatState = () => {
      try {
        const savedState = localStorage.getItem(CHAT_STORAGE_KEY)
        if (savedState) {
          const chatState = JSON.parse(savedState)
          // Only restore if the state is recent (within 1 hour)
          if (Date.now() - chatState.timestamp < 3600000) {
            currentTicket.value = chatState.currentTicket
            messages.value = chatState.messages || []
            orderContext.value = chatState.orderContext
            // Don't auto-open the chat, let user decide
          }
        }
      } catch (error) {
        console.error('Error loading chat state:', error)
      }
    }

    const clearChatState = () => {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }

    const openChat = () => {
      isOpen.value = true
      isMinimized.value = false
      unreadCount.value = 0
      
      // Load chat state if available
      loadChatState()
      
      initializeSocket()
    }

    const closeChat = () => {
      isOpen.value = false
      isMinimized.value = false
      
      // Save chat state before closing
      saveChatState()
      
      if (socket.value) {
        socket.value.disconnect()
        socket.value = null
      }
    }

    const minimizeChat = () => {
      isMinimized.value = true
    }

    const expandChat = () => {
      isMinimized.value = false
    }

    const initializeSocket = () => {
      if (socket.value) return

      socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')
      
      socket.value.on('connect', () => {
        console.log('Connected to support chat')
        isConnected.value = true
        // Join user room for support messages
        if (authStore.user?.id) {
          socket.value.emit('join-user-room', authStore.user.id)
        }
      })

      socket.value.on('disconnect', () => {
        console.log('Disconnected from support chat')
        isConnected.value = false
      })

      socket.value.on('support-message', (message) => {
        console.log('Received socket message:', message)
        console.log('isFromAdmin:', message.isFromAdmin)
        messages.value.push({
          ...message,
          status: 'delivered'
        })
        scrollToBottom()
        
        // Increment unread count if chat is not open
        if (!isOpen.value) {
          unreadCount.value++
        }
      })

      socket.value.on('admin-typing', () => {
        isTyping.value = true
        if (typingTimeout.value) {
          clearTimeout(typingTimeout.value)
        }
        typingTimeout.value = setTimeout(() => {
          isTyping.value = false
        }, 3000)
      })

      socket.value.on('ticket-status-updated', (data) => {
        if (currentTicket.value && currentTicket.value.id === data.ticketId) {
          currentTicket.value.status = data.status
        }
      })

      // Load existing messages
      loadMessages()
    }

    const loadMessages = async () => {
      try {
        isLoading.value = true
        
        if (currentTicket.value) {
          // Load messages for existing ticket
          const response = await fetch(`/api/support/tickets/${currentTicket.value.id}`, {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          })
          
          if (response.ok) {
            const ticket = await response.json()
            messages.value = ticket.messages || []
            currentTicket.value = ticket
          }
        } else {
          // Load recent messages or create new ticket
          messages.value = []
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        toast.error('Failed to load messages')
      } finally {
        isLoading.value = false
      }
    }

    const sendMessage = async () => {
      if ((!newMessage.value.trim() && attachedFiles.value.length === 0) || sending.value) return

      sending.value = true

      try {
        // Create or get ticket
        let ticketId = currentTicket.value?.id
        if (!ticketId) {
          ticketId = await createTicket()
        }

        // Send message
        const isAuthenticated = authStore.token && authStore.user
        const headers = {
          'Content-Type': 'application/json'
        }
        
        if (isAuthenticated) {
          headers['Authorization'] = `Bearer ${authStore.token}`
        }

        const endpoint = isAuthenticated 
          ? `/api/support/tickets/${ticketId}/messages`
          : `/api/support/tickets/${ticketId}/messages/guest`

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: newMessage.value,
            attachments: attachedFiles.value
          })
        })

        if (response.ok) {
          const message = await response.json()
          // Don't add to local array - let socket handle it to avoid duplication
          // The server will broadcast the message back via socket
          
          newMessage.value = ''
          attachedFiles.value = []
          showQuickActions.value = false
          // scrollToBottom() will be called by socket message handler
        } else {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 400 && errorData.error === 'Cannot send messages to closed tickets') {
            toast.error('This support ticket has been closed. Please create a new ticket if you need further assistance.')
            // Close the chat or redirect to create new ticket
            closeChat()
          } else {
            throw new Error(errorData.error || 'Failed to send message')
          }
        }
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message')
      } finally {
        sending.value = false
      }
    }

    const createTicket = async () => {
      // Check if user is authenticated
      const isAuthenticated = authStore.token && authStore.user
      
      if (isAuthenticated) {
        // Use authenticated endpoint
        const response = await fetch('/api/support/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            subject: 'Support Request',
            message: 'Customer initiated support chat',
            orderId: props.orderId || orderContext.value?.orderId,
            priority: 'MEDIUM'
          })
        })

        if (response.ok) {
          const ticket = await response.json()
          currentTicket.value = ticket
          return ticket.id
        } else {
          throw new Error('Failed to create ticket')
        }
      } else {
        // Use guest endpoint
        const response = await fetch('/api/support/tickets/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'Support Request',
            message: 'Customer initiated support chat',
            orderId: props.orderId || orderContext.value?.orderId,
            customerPhone: orderContext.value?.customerPhone || 'Unknown',
            customerName: orderContext.value?.customerName || 'Guest Customer',
            priority: 'MEDIUM'
          })
        })

        if (response.ok) {
          const ticket = await response.json()
          currentTicket.value = ticket
          return ticket.id
        } else {
          const errorData = await response.json()
          console.error('Guest ticket creation error:', errorData)
          throw new Error('Failed to create ticket')
        }
      }
    }

    const selectQuickAction = (action) => {
      switch (action.action) {
        case 'order_status':
          newMessage.value = 'I need help checking my order status.'
          break
        case 'refund':
          newMessage.value = 'I would like to request a refund for my order.'
          break
        case 'technical':
          newMessage.value = 'I\'m experiencing a technical issue with the website.'
          break
        case 'general':
          newMessage.value = 'I have a general question about your services.'
          break
        case 'human':
          newMessage.value = 'I would like to speak with a human support agent.'
          break
      }
      showQuickActions.value = false
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus()
        }
      })
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']

      files.forEach(file => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is 5MB.`)
          return
        }
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} is not supported.`)
          return
        }
        attachedFiles.value.push(file)
      })

      // Reset file input
      event.target.value = ''
    }

    const removeFile = (index) => {
      attachedFiles.value.splice(index, 1)
    }

    const handleEnterKey = (event) => {
      if (event.shiftKey) {
        // Allow new line with Shift+Enter
        return
      }
      event.preventDefault()
      sendMessage()
    }

    const handleTyping = () => {
      if (socket.value && isConnected.value) {
        socket.value.emit('typing', {
          userId: authStore.user?.id,
          ticketId: currentTicket.value?.id
        })
      }
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      // Auto-open chat if there's an order context
      if (props.orderId) {
        openChat()
      }

      // Listen for custom open-support-chat event
      const handleOpenSupportChat = (event) => {
        const { orderId, orderNumber, customerPhone } = event.detail
        // Set order context
        orderContext.value = {
          orderId,
          orderNumber,
          customerPhone
        }
        // Open the chat
        openChat()
        // Pre-fill message with order context
        if (orderNumber) {
          newMessage.value = `Hi, I need help with my order #${orderNumber}. `
        }
      }

      window.addEventListener('open-support-chat', handleOpenSupportChat)

    })

    // Watch for changes to save state
    watch([messages, currentTicket, orderContext], () => {
      if (isOpen.value) {
        saveChatState()
      }
    }, { deep: true })

    onUnmounted(() => {
      // Cleanup event listener
      window.removeEventListener('open-support-chat', handleOpenSupportChat)
      
      // Save state before unmounting
      saveChatState()
      
      // Disconnect socket
      if (socket.value) {
        socket.value.disconnect()
      }
    })

    return {
      isOpen,
      isMinimized,
      messages,
      newMessage,
      sending,
      isTyping,
      isLoading,
      isConnected,
      unreadCount,
      messagesContainer,
      messageInput,
      fileInput,
      currentTicket,
      attachedFiles,
      showQuickActions,
      quickActions,
      orderContext,
      openChat,
      closeChat,
      minimizeChat,
      expandChat,
      sendMessage,
      selectQuickAction,
      handleFileSelect,
      removeFile,
      handleEnterKey,
      handleTyping,
      formatTime
    }
  }
}
</script>


