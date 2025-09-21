<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          {
            'border-l-4 border-blue-500': notification.type === 'info',
            'border-l-4 border-green-500': notification.type === 'success',
            'border-l-4 border-yellow-500': notification.type === 'warning',
            'border-l-4 border-red-500': notification.type === 'error'
          }
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                :class="[
                  'h-6 w-6',
                  {
                    'text-blue-500': notification.type === 'info',
                    'text-green-500': notification.type === 'success',
                    'text-yellow-500': notification.type === 'warning',
                    'text-red-500': notification.type === 'error'
                  }
                ]"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ notification.message }}
              </p>
              <div v-if="notification.actions" class="mt-3 flex space-x-2">
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(notification, action)"
                  :class="[
                    'text-sm font-medium rounded-md px-3 py-1 transition-colors',
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span class="sr-only">Close</span>
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <!-- Progress bar for auto-dismiss -->
        <div
          v-if="notification.autoDismiss"
          class="h-1 bg-gray-200"
        >
          <div
            class="h-full bg-blue-500 transition-all duration-1000 ease-linear"
            :style="{ width: `${notification.progress}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageCircle,
  Bell
} from 'lucide-vue-next'

export default {
  name: 'NotificationSystem',
  components: {
    X,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    MessageCircle,
    Bell
  },
  setup() {
    const router = useRouter()
    const notifications = ref([])
    const notificationId = ref(0)

    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success':
          return CheckCircle
        case 'warning':
          return AlertTriangle
        case 'error':
          return XCircle
        case 'support':
          return MessageCircle
        case 'system':
          return Bell
        default:
          return Info
      }
    }

    const addNotification = (notification) => {
      const id = ++notificationId.value
      const newNotification = {
        id,
        type: 'info',
        title: '',
        message: '',
        autoDismiss: true,
        duration: 5000,
        progress: 100,
        actions: [],
        ...notification
      }

      notifications.value.push(newNotification)

      // Auto-dismiss timer
      if (newNotification.autoDismiss) {
        const startTime = Date.now()
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, newNotification.duration - elapsed)
          newNotification.progress = (remaining / newNotification.duration) * 100

          if (remaining <= 0) {
            clearInterval(timer)
            removeNotification(id)
          }
        }, 50)
      }

      return id
    }

    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }

    const handleAction = (notification, action) => {
      if (action.handler) {
        action.handler(notification)
      }
      if (action.route) {
        router.push(action.route)
      }
      if (action.dismiss !== false) {
        removeNotification(notification.id)
      }
    }

    // Support chat notifications
    const showSupportNotification = (message) => {
      addNotification({
        type: 'support',
        title: 'New Support Message',
        message: message,
        actions: [
          {
            label: 'View Chat',
            primary: true,
            route: '/admin/support'
          },
          {
            label: 'Dismiss',
            primary: false
          }
        ]
      })
    }

    // System notifications
    const showSystemNotification = (title, message, type = 'info') => {
      addNotification({
        type,
        title,
        message,
        autoDismiss: true,
        duration: 3000
      })
    }

    // Success notifications
    const showSuccessNotification = (title, message) => {
      addNotification({
        type: 'success',
        title,
        message,
        autoDismiss: true,
        duration: 3000
      })
    }

    // Error notifications
    const showErrorNotification = (title, message) => {
      addNotification({
        type: 'error',
        title,
        message,
        autoDismiss: false,
        actions: [
          {
            label: 'Dismiss',
            primary: false
          }
        ]
      })
    }

    // Warning notifications
    const showWarningNotification = (title, message) => {
      addNotification({
        type: 'warning',
        title,
        message,
        autoDismiss: true,
        duration: 4000
      })
    }

    // Expose methods globally
    onMounted(() => {
      window.$notify = {
        add: addNotification,
        remove: removeNotification,
        support: showSupportNotification,
        system: showSystemNotification,
        success: showSuccessNotification,
        error: showErrorNotification,
        warning: showWarningNotification
      }
    })

    onUnmounted(() => {
      delete window.$notify
    })

    return {
      notifications,
      getNotificationIcon,
      removeNotification,
      handleAction
    }
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
