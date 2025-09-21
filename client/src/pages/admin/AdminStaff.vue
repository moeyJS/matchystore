<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p class="text-gray-600 mt-2">Manage staff members and their roles</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Add Staff</span>
        </button>
      </div>

      <!-- Staff Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="member in staff" :key="member.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">{{ member.name?.charAt(0) || 'U' }}</span>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ member.name || '—' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.username || '—' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.email || '—' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.phone || '—' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(member.role)">
                    {{ getRoleLabel(member.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ member.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewStaff(member)"
                      class="text-gray-600 hover:text-gray-900 p-1"
                      title="View"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button
                      @click="editStaff(member)"
                      class="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      @click="toggleStaffStatus(member)"
                      :class="[
                        'p-1',
                        member.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      ]"
                      :title="member.isActive ? 'Deactivate' : 'Activate'"
                    >
                      <svg v-if="member.isActive" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                      </svg>
                      <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                    <button
                      @click="revokeSession(member)"
                      class="text-orange-600 hover:text-orange-900 p-1"
                      title="Revoke Session"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                    </button>
                    <button
                      @click="deleteStaff(member)"
                      class="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ editingStaff ? 'Edit Staff' : 'Add Staff' }}
            </h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveStaff" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Name *</label>
              <input
                v-model="staffForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Full name"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Username *</label>
              <input
                v-model="staffForm.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="username"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                v-model="staffForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="email@example.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
              <input
                v-model="staffForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Role *</label>
              <select
                v-model="staffForm.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="CUSTOMER_SERVICE">Customer Service</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="MARKETING">Marketing</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div v-if="!editingStaff">
              <label class="block text-sm font-medium text-gray-900 mb-2">Password *</label>
              <input
                v-model="staffForm.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Password"
              >
            </div>
            <div class="flex items-center">
              <input
                v-model="staffForm.isActive"
                type="checkbox"
                class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-900">Active</label>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {{ loading ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- View Modal -->
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Staff Details</h2>
            <button @click="closeViewModal" class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-xl font-medium text-gray-700">{{ viewingStaff?.name?.charAt(0) || 'U' }}</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ viewingStaff?.name || '—' }}</h3>
                <p class="text-sm text-gray-600">{{ getRoleLabel(viewingStaff?.role) }}</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Username</label>
                <p class="text-sm text-gray-900">{{ viewingStaff?.username || '—' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Email</label>
                <p class="text-sm text-gray-900">{{ viewingStaff?.email || '—' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Phone</label>
                <p class="text-sm text-gray-900">{{ viewingStaff?.phone || '—' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Status</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="viewingStaff?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ viewingStaff?.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Joined</label>
                <p class="text-sm text-gray-900">{{ viewingStaff?.createdAt ? new Date(viewingStaff.createdAt).toLocaleDateString() : '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

// State
const staff = ref([])
const showModal = ref(false)
const showViewModal = ref(false)
const editingStaff = ref(null)
const viewingStaff = ref(null)
const loading = ref(false)

const staffForm = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  role: 'CUSTOMER_SERVICE',
  password: '',
  isActive: true
})

// Methods
const fetchStaff = async () => {
  try {
    const response = await axios.get('/api/admin/staff')
    staff.value = response.data.staff || []
  } catch (error) {
    console.error('Error fetching staff:', error)
  }
}

const openCreateModal = () => {
  editingStaff.value = null
  resetForm()
  showModal.value = true
}

const editStaff = (member) => {
  editingStaff.value = member
  staffForm.name = member.name || ''
  staffForm.username = member.username || ''
  staffForm.email = member.email || ''
  staffForm.phone = member.phone || ''
  staffForm.role = member.role || 'CUSTOMER_SERVICE'
  staffForm.isActive = member.isActive !== false
  showModal.value = true
}

const viewStaff = (member) => {
  viewingStaff.value = member
  showViewModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingStaff.value = null
  resetForm()
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingStaff.value = null
}

const resetForm = () => {
  staffForm.name = ''
  staffForm.username = ''
  staffForm.email = ''
  staffForm.phone = ''
  staffForm.role = 'CUSTOMER_SERVICE'
  staffForm.password = ''
  staffForm.isActive = true
}

const saveStaff = async () => {
  loading.value = true
  try {
    if (editingStaff.value) {
      await axios.put(`/api/admin/staff/${editingStaff.value.id}`, staffForm)
    } else {
      await axios.post('/api/admin/staff', staffForm)
    }
    await fetchStaff()
    closeModal()
  } catch (error) {
    console.error('Error saving staff:', error)
  } finally {
    loading.value = false
  }
}

const deleteStaff = async (member) => {
  if (confirm(`Are you sure you want to delete ${member.name || member.username}?`)) {
    try {
      await axios.delete(`/api/admin/staff/${member.id}`)
      await fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }
}

const toggleStaffStatus = async (member) => {
  try {
    await axios.put(`/api/admin/staff/${member.id}`, {
      ...member,
      isActive: !member.isActive
    })
    await fetchStaff()
  } catch (error) {
    console.error('Error toggling staff status:', error)
  }
}

const revokeSession = async (member) => {
  if (confirm(`Are you sure you want to revoke ${member.name || member.username}'s session?`)) {
    try {
      await axios.post(`/api/admin/staff/${member.id}/revoke-session`)
      // Show success message
    } catch (error) {
      console.error('Error revoking session:', error)
    }
  }
}

const getRoleLabel = (role) => {
  const labels = {
    'CUSTOMER_SERVICE': 'Customer Service',
    'WAREHOUSE': 'Warehouse',
    'MARKETING': 'Marketing',
    'ADMIN': 'Admin',
    'SUPER_ADMIN': 'Super Admin'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'CUSTOMER_SERVICE': 'bg-blue-100 text-blue-800',
    'WAREHOUSE': 'bg-yellow-100 text-yellow-800',
    'MARKETING': 'bg-purple-100 text-purple-800',
    'ADMIN': 'bg-green-100 text-green-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

// Lifecycle
onMounted(() => {
  fetchStaff()
})
</script>