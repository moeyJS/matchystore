<template>
  <div class="admin-appearance">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Appearance</h1>
        <p class="text-gray-600">Customize your store's look and feel</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Appearance Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Customization</h2>
            <nav class="space-y-2">
              <button
                v-for="tab in appearanceTabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Appearance Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border">
            <!-- Theme Settings -->
            <div v-if="activeTab === 'theme'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Theme Settings</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      v-for="theme in colorThemes"
                      :key="theme.id"
                      @click="appearance.theme.colorScheme = theme.id"
                      :class="[
                        'p-4 rounded-lg border-2 transition-all',
                        appearance.theme.colorScheme === theme.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <div class="flex items-center space-x-2">
                        <div :class="theme.colors.primary" class="w-4 h-4 rounded-full"></div>
                        <div :class="theme.colors.secondary" class="w-4 h-4 rounded-full"></div>
                        <div :class="theme.colors.accent" class="w-4 h-4 rounded-full"></div>
                      </div>
                      <p class="text-sm font-medium text-gray-900 mt-2">{{ theme.name }}</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      v-for="layout in layoutStyles"
                      :key="layout.id"
                      @click="appearance.theme.layout = layout.id"
                      :class="[
                        'p-4 rounded-lg border-2 transition-all',
                        appearance.theme.layout === layout.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <div class="text-center">
                        <div class="text-2xl mb-2">{{ layout.icon }}</div>
                        <p class="text-sm font-medium text-gray-900">{{ layout.name }}</p>
                        <p class="text-xs text-gray-500">{{ layout.description }}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Header Settings -->
            <div v-if="activeTab === 'header'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Header Settings</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                  <select
                    v-model="appearance.header.style"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="centered">Centered</option>
                    <option value="full-width">Full Width</option>
                    <option value="sticky">Sticky</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div class="flex items-center space-x-4">
                    <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span v-if="!appearance.header.logo" class="text-gray-400 text-sm">Logo</span>
                      <img v-else :src="appearance.header.logo" alt="Logo" class="w-full h-full object-contain" />
                    </div>
                    <div>
                      <input
                        type="file"
                        @change="handleLogoUpload"
                        accept="image/*"
                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p class="text-xs text-gray-500 mt-1">Recommended: 200x60px, PNG or JPG</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Navigation Menu</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="appearance.header.showSearch"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Show search bar</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="appearance.header.showCart"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Show cart icon</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="appearance.header.showUserMenu"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Show user menu</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Settings -->
            <div v-if="activeTab === 'footer'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Footer Settings</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Footer Style</label>
                  <select
                    v-model="appearance.footer.style"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="detailed">Detailed</option>
                    <option value="newsletter">With Newsletter</option>
                    <option value="social">With Social Links</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Footer Content</label>
                  <textarea
                    v-model="appearance.footer.content"
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter footer content..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                      <input
                        v-model="appearance.footer.socialLinks.facebook"
                        type="url"
                        placeholder="Facebook URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-sm text-gray-500">Facebook</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <input
                        v-model="appearance.footer.socialLinks.twitter"
                        type="url"
                        placeholder="Twitter URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-sm text-gray-500">Twitter</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <input
                        v-model="appearance.footer.socialLinks.instagram"
                        type="url"
                        placeholder="Instagram URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-sm text-gray-500">Instagram</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="px-6 py-4 bg-gray-50 border-t">
              <div class="flex justify-end">
                <button
                  @click="saveAppearance"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Appearance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'AdminAppearance',
  setup() {
    const activeTab = ref('theme')
    
    const appearance = reactive({
      theme: {
        colorScheme: 'blue',
        layout: 'modern'
      },
      header: {
        style: 'minimal',
        logo: null,
        showSearch: true,
        showCart: true,
        showUserMenu: true
      },
      footer: {
        style: 'minimal',
        content: '',
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: ''
        }
      }
    })

    const appearanceTabs = [
      { id: 'theme', name: 'Theme' },
      { id: 'header', name: 'Header' },
      { id: 'footer', name: 'Footer' }
    ]

    const colorThemes = [
      {
        id: 'blue',
        name: 'Blue',
        colors: {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-300',
          accent: 'bg-blue-700'
        }
      },
      {
        id: 'green',
        name: 'Green',
        colors: {
          primary: 'bg-green-500',
          secondary: 'bg-green-300',
          accent: 'bg-green-700'
        }
      },
      {
        id: 'purple',
        name: 'Purple',
        colors: {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-300',
          accent: 'bg-purple-700'
        }
      },
      {
        id: 'red',
        name: 'Red',
        colors: {
          primary: 'bg-red-500',
          secondary: 'bg-red-300',
          accent: 'bg-red-700'
        }
      }
    ]

    const layoutStyles = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary',
        icon: '🎨'
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional and elegant',
        icon: '🏛️'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and focused',
        icon: '⚪'
      },
      {
        id: 'bold',
        name: 'Bold',
        description: 'Vibrant and attention-grabbing',
        icon: '🔥'
      }
    ]

    const handleLogoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          appearance.header.logo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const saveAppearance = async () => {
      try {
        // TODO: Implement API call to save appearance settings
        console.log('Saving appearance:', appearance)
        // Show success message
      } catch (error) {
        console.error('Error saving appearance:', error)
        // Show error message
      }
    }

    return {
      activeTab,
      appearance,
      appearanceTabs,
      colorThemes,
      layoutStyles,
      handleLogoUpload,
      saveAppearance
    }
  }
}
</script>
