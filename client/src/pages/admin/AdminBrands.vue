<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Brands</h1>
              <p class="text-gray-600 mt-2">Manage product brands</p>
            </div>
            <button
              @click="openBrandModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Brand
            </button>
          </div>
        </div>

        <!-- Brands Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-center justify-center mb-4">
                <img
                  v-if="brand.logo"
                  :src="brand.logo"
                  :alt="brand.name"
                  class="h-16 w-16 object-contain"
                >
                <div v-else class="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">{{ brand.name }}</h3>
              
              <p v-if="brand.description" class="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                {{ brand.description }}
              </p>
              
              <div class="text-center mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ brand.products?.length || 0 }} products
                </span>
              </div>

              <div v-if="brand.country" class="text-center mb-4">
                <span class="text-sm text-gray-500">{{ brand.country }}</span>
              </div>

              <div class="flex justify-center space-x-2">
                <button
                  @click="editBrand(brand)"
                  class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  @click="deleteBrand(brand.id)"
                  class="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Brand Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingBrand ? 'Edit Brand' : 'Add New Brand' }}
              </h3>
              
              <form @submit.prevent="saveBrand" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    v-model="brandForm.name"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand name"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    v-model="brandForm.description"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand description"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    v-model="brandForm.logo"
                    type="url"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter logo URL"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    v-model="brandForm.website"
                    type="url"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website URL"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    v-model="brandForm.country"
                    type="text"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter country"
                  >
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ editingBrand ? 'Update' : 'Create' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'

export default {
  name: 'AdminBrands',
  components: {
    AdminLayout
  },
  setup() {
    const brands = ref([])
    const showModal = ref(false)
    const editingBrand = ref(null)
    
    const brandForm = ref({
      name: '',
      description: '',
      logo: '',
      website: '',
      country: ''
    })

    const fetchBrands = async () => {
      try {
        // This would be replaced with actual API calls
        // For now, using mock data
        brands.value = [
          {
            id: 1,
            name: 'Apple',
            description: 'Technology company that designs and manufactures consumer electronics',
            logo: '/api/placeholder/64/64',
            website: 'https://apple.com',
            country: 'United States',
            products: [
              { id: 1, name: 'iPhone 15' },
              { id: 2, name: 'MacBook Pro' }
            ]
          },
          {
            id: 2,
            name: 'Samsung',
            description: 'South Korean multinational electronics company',
            logo: '/api/placeholder/64/64',
            website: 'https://samsung.com',
            country: 'South Korea',
            products: [
              { id: 3, name: 'Galaxy S24' },
              { id: 4, name: 'Galaxy Watch' }
            ]
          },
          {
            id: 3,
            name: 'Sony',
            description: 'Japanese multinational conglomerate corporation',
            logo: '/api/placeholder/64/64',
            website: 'https://sony.com',
            country: 'Japan',
            products: [
              { id: 5, name: 'WH-1000XM5' },
              { id: 6, name: 'PlayStation 5' }
            ]
          },
          {
            id: 4,
            name: 'Nike',
            description: 'American multinational corporation that designs and manufactures athletic footwear',
            logo: '/api/placeholder/64/64',
            website: 'https://nike.com',
            country: 'United States',
            products: [
              { id: 7, name: 'Air Max 270' },
              { id: 8, name: 'Dri-FIT T-Shirt' }
            ]
          }
        ]
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }

    const openBrandModal = () => {
      editingBrand.value = null
      brandForm.value = {
        name: '',
        description: '',
        logo: '',
        website: '',
        country: ''
      }
      showModal.value = true
    }

    const editBrand = (brand) => {
      editingBrand.value = brand
      brandForm.value = {
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        country: brand.country || ''
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingBrand.value = null
      brandForm.value = {
        name: '',
        description: '',
        logo: '',
        website: '',
        country: ''
      }
    }

    const saveBrand = async () => {
      try {
        if (editingBrand.value) {
          // Update existing brand
          const index = brands.value.findIndex(brand => brand.id === editingBrand.value.id)
          if (index !== -1) {
            brands.value[index] = {
              ...brands.value[index],
              ...brandForm.value
            }
          }
        } else {
          // Create new brand
          const newBrand = {
            id: Date.now(), // In real app, this would come from the server
            ...brandForm.value,
            products: []
          }
          brands.value.push(newBrand)
        }
        
        closeModal()
      } catch (error) {
        console.error('Error saving brand:', error)
      }
    }

    const deleteBrand = async (brandId) => {
      if (confirm('Are you sure you want to delete this brand?')) {
        try {
          brands.value = brands.value.filter(brand => brand.id !== brandId)
        } catch (error) {
          console.error('Error deleting brand:', error)
        }
      }
    }

    onMounted(() => {
      fetchBrands()
    })

    return {
      brands,
      showModal,
      editingBrand,
      brandForm,
      openBrandModal,
      editBrand,
      closeModal,
      saveBrand,
      deleteBrand
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>




