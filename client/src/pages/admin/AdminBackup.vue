<template>
  <AdminLayout>
    <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Backup Management</h1>
      <p class="text-gray-600">Manage your database backups and configure automatic backup settings.</p>
    </div>

    <!-- Manual Backup Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Create Manual Backup</h2>
      <form @submit.prevent="createBackup" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Backup Type</label>
            <select v-model="backupForm.type" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="full">Full Backup</option>
              <option value="data">Data Only</option>
              <option value="schema">Schema Only</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select v-model="backupForm.format" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
            </select>
          </div>
          <div class="flex items-end space-x-2">
            <button
              type="submit"
              :disabled="isCreatingBackup"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isCreatingBackup ? 'Creating...' : 'Create Backup' }}
            </button>
            <button
              @click="testBackup"
              :disabled="isCreatingBackup"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test
            </button>
            <button
              @click="triggerScheduledBackup"
              :disabled="isCreatingBackup || !settings.autoBackup"
              class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Trigger Now
            </button>
            <button
              @click="testCronJob"
              :disabled="isCreatingBackup"
              class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Test Cron
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Backup Status Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Backup Status</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">Scheduled Task</h3>
          <p class="text-sm text-gray-600">{{ backupStatus.hasScheduledTask ? 'Active' : 'Inactive' }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">Task Running</h3>
          <p class="text-sm text-gray-600">{{ backupStatus.taskRunning ? 'Yes' : 'No' }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">Task Scheduled</h3>
          <p class="text-sm text-gray-600">{{ backupStatus.taskScheduled ? 'Yes' : 'No' }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">Current Time</h3>
          <p class="text-sm text-gray-600">{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- Backup Settings Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Automatic Backup Settings</h2>
      <form @submit.prevent="updateSettings" class="space-y-4">
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="settings.autoBackup"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm text-gray-700">Enable Automatic Backup</span>
          </label>
        </div>

        <div v-if="settings.autoBackup" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select v-model="settings.frequency" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              v-model="settings.time"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select v-model="settings.format" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select v-model="settings.type" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="full">Full Backup</option>
              <option value="data">Data Only</option>
              <option value="schema">Schema Only</option>
            </select>
          </div>
        </div>

        <div v-if="settings.autoBackup" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Retention (Days)</label>
            <input
              type="number"
              v-model="settings.retention"
              min="1"
              max="365"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
          </div>
          <div class="flex items-end">
            <button
              type="submit"
              :disabled="isUpdatingSettings"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ isUpdatingSettings ? 'Updating...' : 'Update Settings' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Backup List Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Backup Files</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filename
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="backup in backups" :key="backup.filename">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ backup.filename }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-blue-100 text-blue-800': backup.type === 'full',
                        'bg-green-100 text-green-800': backup.type === 'data',
                        'bg-yellow-100 text-yellow-800': backup.type === 'schema'
                      }">
                  {{ backup.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-purple-100 text-purple-800': backup.format === 'json',
                        'bg-orange-100 text-orange-800': backup.format === 'sql'
                      }">
                  {{ backup.format.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatFileSize(backup.size) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(backup.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="downloadBackup(backup.filename)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Download
                  </button>
                  <button
                    @click="deleteBackup(backup.filename)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout.vue'

const backups = ref([])
const isCreatingBackup = ref(false)
const isUpdatingSettings = ref(false)
const backupStatus = ref({
  hasScheduledTask: false,
  taskRunning: false,
  taskScheduled: false
})

const currentTime = ref('')

const backupForm = ref({
  type: 'full',
  format: 'json'
})

const settings = ref({
  autoBackup: false,
  frequency: 'daily',
  time: '02:00',
  format: 'json',
  type: 'full',
  retention: 30
})

const createBackup = async () => {
  try {
    isCreatingBackup.value = true
    const response = await axios.post('/api/admin/backup/create', backupForm.value)
    
    if (response.data.success) {
      alert('Backup created successfully!')
      await fetchBackups()
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    alert('Failed to create backup')
  } finally {
    isCreatingBackup.value = false
  }
}

const testBackup = async () => {
  try {
    isCreatingBackup.value = true
    const response = await axios.post('/api/admin/backup/test')
    
    if (response.data.success) {
      alert(`Test backup created successfully! File: ${response.data.filename}`)
      await fetchBackups()
    }
  } catch (error) {
    console.error('Error creating test backup:', error)
    alert('Failed to create test backup')
  } finally {
    isCreatingBackup.value = false
  }
}

const triggerScheduledBackup = async () => {
  try {
    isCreatingBackup.value = true
    const response = await axios.post('/api/admin/backup/trigger')
    
    if (response.data.success) {
      alert(`Scheduled backup triggered successfully! File: ${response.data.filename}`)
      await fetchBackups()
    }
  } catch (error) {
    console.error('Error triggering scheduled backup:', error)
    alert('Failed to trigger scheduled backup')
  } finally {
    isCreatingBackup.value = false
  }
}

const testCronJob = async () => {
  try {
    isCreatingBackup.value = true
    const response = await axios.post('/api/admin/backup/test-cron')
    
    if (response.data.success) {
      alert(`Cron job test completed successfully! File: ${response.data.filename}`)
      await fetchBackups()
    }
  } catch (error) {
    console.error('Error testing cron job:', error)
    alert('Failed to test cron job')
  } finally {
    isCreatingBackup.value = false
  }
}

const updateSettings = async () => {
  try {
    isUpdatingSettings.value = true
    const response = await axios.put('/api/admin/backup/settings', settings.value)
    
    if (response.data.success) {
      alert('Settings updated successfully!')
      await fetchStatus() // Refresh status after updating settings
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    alert('Failed to update settings')
  } finally {
    isUpdatingSettings.value = false
  }
}

const fetchBackups = async () => {
  try {
    const response = await axios.get('/api/admin/backup/list')
    backups.value = response.data.backups
  } catch (error) {
    console.error('Error fetching backups:', error)
  }
}

const downloadBackup = async (filename) => {
  try {
    const response = await axios.get(`/api/admin/backup/download/${filename}`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading backup:', error)
    alert('Failed to download backup')
  }
}

const deleteBackup = async (filename) => {
  if (!confirm('Are you sure you want to delete this backup?')) return
  
  try {
    const response = await axios.delete(`/api/admin/backup/${filename}`)
    
    if (response.data.success) {
      alert('Backup deleted successfully!')
      await fetchBackups()
    }
  } catch (error) {
    console.error('Error deleting backup:', error)
    alert('Failed to delete backup')
  }
}

const fetchSettings = async () => {
  try {
    const response = await axios.get('/api/admin/backup/settings')
    Object.assign(settings.value, response.data)
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const fetchStatus = async () => {
  try {
    const response = await axios.get('/api/admin/backup/status')
    backupStatus.value = response.data
  } catch (error) {
    console.error('Error fetching backup status:', error)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('en-US', {
    timeZone: 'Asia/Baghdad',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(async () => {
  updateCurrentTime()
  setInterval(updateCurrentTime, 1000) // Update every second
  
  await Promise.all([
    fetchBackups(),
    fetchSettings(),
    fetchStatus()
  ])
})
</script>
