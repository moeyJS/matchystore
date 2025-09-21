<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p class="text-gray-600 mt-2">Manage promotional banners for your homepage</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Add Banner</span>
        </button>
      </div>

      <!-- Banners Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <!-- Banner Image -->
          <div class="aspect-video bg-gray-100 flex items-center justify-center">
            <img
              v-if="banner.imageUrl"
              :src="banner.imageUrl"
              :alt="banner.title"
              class="w-full h-full object-cover"
            >
            <div v-else class="text-center">
              <div class="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
              <p class="text-gray-500 text-sm">No Image</p>
            </div>
          </div>

          <!-- Banner Content -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900 line-clamp-1">{{ banner.title }}</h3>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ banner.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span class="text-xs text-gray-500">#{{ banner.order }}</span>
              </div>
            </div>
            <p class="text-gray-600 text-sm line-clamp-2 mb-3">{{ banner.description }}</p>
            <div v-if="banner.ctaText" class="text-sm text-gray-500 mb-3">
              CTA: {{ banner.ctaText }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  @click="editBanner(banner)"
                  class="text-gray-600 hover:text-gray-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteBanner(banner.id)"
                  class="text-red-600 hover:text-red-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="toggleBannerStatus(banner)"
                :class="[
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  banner.isActive
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                ]"
              >
                {{ banner.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="banners.length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
        <p class="text-gray-600 mb-4">Create your first promotional banner to get started.</p>
        <button
          @click="openCreateModal"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Banner
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ editingBanner ? 'Edit Banner' : 'Create Banner' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveBanner" class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-900 mb-2">Title *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter banner title"
              >
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-900 mb-2">Description *</label>
              <textarea
                v-model="form.description"
                required
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter banner description"
              ></textarea>
            </div>

            <!-- Image URL -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-900 mb-2">Image URL</label>
              <input
                v-model="form.imageUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              >
            </div>

            <!-- CTA Text -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">CTA Text</label>
              <input
                v-model="form.ctaText"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Shop Now"
              >
            </div>

            <!-- CTA URL -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">CTA URL</label>
              <input
                v-model="form.ctaUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="https://example.com"
              >
            </div>

            <!-- Order -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Display Order</label>
              <input
                v-model.number="form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
            </div>

            <!-- Active Status -->
            <div class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-900">Active</label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : (editingBanner ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

// State
const banners = ref([])
const showModal = ref(false)
const editingBanner = ref(null)
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  imageUrl: '',
  ctaText: '',
  ctaUrl: '',
  order: 0,
  isActive: true
})

// Methods
const fetchBanners = async () => {
  try {
    const response = await axios.get('/api/banners/admin')
    banners.value = response.data
  } catch (error) {
    console.error('Error fetching banners:', error)
  }
}

const openCreateModal = () => {
  editingBanner.value = null
  resetForm()
  showModal.value = true
}

const editBanner = (banner) => {
  editingBanner.value = banner
  form.title = banner.title
  form.description = banner.description
  form.imageUrl = banner.imageUrl || ''
  form.ctaText = banner.ctaText || ''
  form.ctaUrl = banner.ctaUrl || ''
  form.order = banner.order
  form.isActive = banner.isActive
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingBanner.value = null
  resetForm()
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.imageUrl = ''
  form.ctaText = ''
  form.ctaUrl = ''
  form.order = 0
  form.isActive = true
}

const saveBanner = async () => {
  loading.value = true
  try {
    if (editingBanner.value) {
      await axios.put(`/api/banners/admin/${editingBanner.value.id}`, form)
    } else {
      await axios.post('/api/banners/admin', form)
    }
    await fetchBanners()
    closeModal()
  } catch (error) {
    console.error('Error saving banner:', error)
  } finally {
    loading.value = false
  }
}

const deleteBanner = async (id) => {
  if (confirm('Are you sure you want to delete this banner?')) {
    try {
      await axios.delete(`/api/banners/admin/${id}`)
      await fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }
}

const toggleBannerStatus = async (banner) => {
  try {
    await axios.put(`/api/banners/admin/${banner.id}`, {
      ...banner,
      isActive: !banner.isActive
    })
    await fetchBanners()
  } catch (error) {
    console.error('Error toggling banner status:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchBanners()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>



