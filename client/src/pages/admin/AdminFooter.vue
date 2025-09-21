<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Footer Configuration</h1>
          <p class="text-gray-600 mt-2">Manage footer sections, links, and social media</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="openSectionModal"
            class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Add Section</span>
          </button>
          <button
            @click="openSocialModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            <span>Add Social Link</span>
          </button>
        </div>
      </div>

      <!-- Footer Sections -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900">Footer Sections</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="section in footerSections"
            :key="section.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">{{ section.title }}</h3>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ section.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span class="text-xs text-gray-500">#{{ section.order }}</span>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div v-if="section.links.length === 0" class="text-sm text-gray-500 italic">
                No links yet
              </div>
              <div v-else class="space-y-1">
                <div
                  v-for="link in section.links.slice(0, 3)"
                  :key="link.id"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-gray-600">{{ link.text }}</span>
                  <span
                    :class="[
                      'px-1 py-0.5 rounded text-xs',
                      link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ link.isActive ? 'ON' : 'OFF' }}
                  </span>
                </div>
                <div v-if="section.links.length > 3" class="text-xs text-gray-500">
                  +{{ section.links.length - 3 }} more links
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  @click="editSection(section)"
                  class="text-gray-600 hover:text-gray-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="manageLinks(section)"
                  class="text-blue-600 hover:text-blue-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </button>
                <button
                  @click="deleteSection(section.id)"
                  class="text-red-600 hover:text-red-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="toggleSectionStatus(section)"
                :class="[
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  section.isActive
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                ]"
              >
                {{ section.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900">Social Media Links</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="social in socialLinks"
            :key="social.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <img 
                    v-if="social.icon && (social.icon.startsWith('data:') || social.icon.startsWith('http'))" 
                    :src="social.icon" 
                    :alt="social.platform" 
                    class="w-5 h-5 object-contain"
                  >
                  <span v-else-if="social.icon" v-html="social.icon" class="w-5 h-5"></span>
                  <div v-else class="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 capitalize">{{ social.platform }}</h3>
                  <p class="text-sm text-gray-600">{{ social.url }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    social.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ social.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span class="text-xs text-gray-500">#{{ social.order }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  @click="editSocial(social)"
                  class="text-gray-600 hover:text-gray-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteSocial(social.id)"
                  class="text-red-600 hover:text-red-900 p-1"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="toggleSocialStatus(social)"
                :class="[
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  social.isActive
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                ]"
              >
                {{ social.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Modal -->
    <div v-if="showSectionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ editingSection ? 'Edit Section' : 'Create Section' }}
          </h2>
          <button @click="closeSectionModal" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveSection" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Title *</label>
            <input
              v-model="sectionForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Order</label>
            <input
              v-model.number="sectionForm.order"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
          </div>
          <div class="flex items-center">
            <input
              v-model="sectionForm.isActive"
              type="checkbox"
              class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
            >
            <label class="ml-2 text-sm text-gray-900">Active</label>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeSectionModal"
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

    <!-- Social Modal -->
    <div v-if="showSocialModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ editingSocial ? 'Edit Social Link' : 'Create Social Link' }}
          </h2>
          <button @click="closeSocialModal" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveSocial" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Platform *</label>
            <select
              v-model="socialForm.platform"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Select Platform</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">URL *</label>
            <input
              v-model="socialForm.url"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Icon</label>
            <div class="space-y-3">
              <div class="flex space-x-2">
                <button
                  type="button"
                  @click="socialForm.iconType = 'svg'"
                  :class="[
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    socialForm.iconType === 'svg' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  SVG Code
                </button>
                <button
                  type="button"
                  @click="socialForm.iconType = 'file'"
                  :class="[
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    socialForm.iconType === 'file' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  File Upload
                </button>
                <button
                  type="button"
                  @click="socialForm.iconType = 'url'"
                  :class="[
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    socialForm.iconType === 'url' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  URL
                </button>
              </div>
              
              <!-- SVG Code Input -->
              <div v-if="socialForm.iconType === 'svg'">
                <textarea
                  v-model="socialForm.icon"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Paste SVG icon code here"
                ></textarea>
              </div>
              
              <!-- File Upload Input -->
              <div v-if="socialForm.iconType === 'file'">
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept="image/*,.svg"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                <p class="text-xs text-gray-500 mt-1">Upload PNG, JPG, or SVG file</p>
              </div>
              
              <!-- URL Input -->
              <div v-if="socialForm.iconType === 'url'">
                <input
                  v-model="socialForm.icon"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="https://example.com/icon.png"
                >
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Order</label>
            <input
              v-model.number="socialForm.order"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
          </div>
          <div class="flex items-center">
            <input
              v-model="socialForm.isActive"
              type="checkbox"
              class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
            >
            <label class="ml-2 text-sm text-gray-900">Active</label>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeSocialModal"
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
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'

// State
const footerSections = ref([])
const socialLinks = ref([])
const showSectionModal = ref(false)
const showSocialModal = ref(false)
const editingSection = ref(null)
const editingSocial = ref(null)
const loading = ref(false)

const sectionForm = reactive({
  title: '',
  order: 0,
  isActive: true
})

const socialForm = reactive({
  platform: '',
  url: '',
  icon: '',
  iconType: 'svg',
  order: 0,
  isActive: true
})

// Methods
const fetchFooter = async () => {
  try {
    const response = await axios.get('/api/footer/admin')
    footerSections.value = response.data.sections
    socialLinks.value = response.data.socialLinks
  } catch (error) {
    console.error('Error fetching footer:', error)
  }
}

const openSectionModal = () => {
  editingSection.value = null
  resetSectionForm()
  showSectionModal.value = true
}

const editSection = (section) => {
  editingSection.value = section
  sectionForm.title = section.title
  sectionForm.order = section.order
  sectionForm.isActive = section.isActive
  showSectionModal.value = true
}

const closeSectionModal = () => {
  showSectionModal.value = false
  editingSection.value = null
  resetSectionForm()
}

const resetSectionForm = () => {
  sectionForm.title = ''
  sectionForm.order = 0
  sectionForm.isActive = true
}

const saveSection = async () => {
  loading.value = true
  try {
    if (editingSection.value) {
      await axios.put(`/api/footer/admin/sections/${editingSection.value.id}`, sectionForm)
    } else {
      await axios.post('/api/footer/admin/sections', sectionForm)
    }
    await fetchFooter()
    closeSectionModal()
  } catch (error) {
    console.error('Error saving section:', error)
  } finally {
    loading.value = false
  }
}

const deleteSection = async (id) => {
  if (confirm('Are you sure you want to delete this section and all its links?')) {
    try {
      await axios.delete(`/api/footer/admin/sections/${id}`)
      await fetchFooter()
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }
}

const toggleSectionStatus = async (section) => {
  try {
    await axios.put(`/api/footer/admin/sections/${section.id}`, {
      ...section,
      isActive: !section.isActive
    })
    await fetchFooter()
  } catch (error) {
    console.error('Error toggling section status:', error)
  }
}

const manageLinks = (section) => {
  // TODO: Implement link management modal
  console.log('Manage links for section:', section)
}

const openSocialModal = () => {
  editingSocial.value = null
  resetSocialForm()
  showSocialModal.value = true
}

const editSocial = (social) => {
  editingSocial.value = social
  socialForm.platform = social.platform
  socialForm.url = social.url
  socialForm.icon = social.icon
  socialForm.order = social.order
  socialForm.isActive = social.isActive
  showSocialModal.value = true
}

const closeSocialModal = () => {
  showSocialModal.value = false
  editingSocial.value = null
  resetSocialForm()
}

const resetSocialForm = () => {
  socialForm.platform = ''
  socialForm.url = ''
  socialForm.icon = ''
  socialForm.iconType = 'svg'
  socialForm.order = 0
  socialForm.isActive = true
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      socialForm.icon = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveSocial = async () => {
  loading.value = true
  try {
    if (editingSocial.value) {
      await axios.put(`/api/footer/admin/social/${editingSocial.value.id}`, socialForm)
    } else {
      await axios.post('/api/footer/admin/social', socialForm)
    }
    await fetchFooter()
    closeSocialModal()
  } catch (error) {
    console.error('Error saving social link:', error)
  } finally {
    loading.value = false
  }
}

const deleteSocial = async (id) => {
  if (confirm('Are you sure you want to delete this social link?')) {
    try {
      await axios.delete(`/api/footer/admin/social/${id}`)
      await fetchFooter()
    } catch (error) {
      console.error('Error deleting social link:', error)
    }
  }
}

const toggleSocialStatus = async (social) => {
  try {
    await axios.put(`/api/footer/admin/social/${social.id}`, {
      ...social,
      isActive: !social.isActive
    })
    await fetchFooter()
  } catch (error) {
    console.error('Error toggling social status:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchFooter()
})
</script>
