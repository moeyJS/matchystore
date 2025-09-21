<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Categories</h1>
              <p class="text-gray-600 mt-2">Manage product categories</p>
            </div>
            <button
              @click="openCategoryModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Category
            </button>
          </div>
        </div>

        <!-- Categories Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img
                        v-if="category.image"
                        :src="category.image"
                        :alt="category.name"
                        class="h-10 w-10 rounded-lg object-cover"
                      >
                      <div v-else class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                        <div v-if="category.description" class="text-sm text-gray-500">{{ category.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ category.products?.length || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.parent?.name || 'None' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="editCategory(category)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteCategory(category.id)"
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

        <!-- Category Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
              </h3>
              
              <form @submit.prevent="saveCategory" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    v-model="categoryForm.name"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    v-model="categoryForm.description"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category description"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    v-model="categoryForm.parentId"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    v-model="categoryForm.image"
                    type="url"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL"
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
                    {{ editingCategory ? 'Update' : 'Create' }}
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
  name: 'AdminCategories',
  components: {
    AdminLayout
  },
  setup() {
    const categories = ref([])
    const parentCategories = ref([])
    const showModal = ref(false)
    const editingCategory = ref(null)
    
    const categoryForm = ref({
      name: '',
      description: '',
      parentId: '',
      image: ''
    })

    const fetchCategories = async () => {
      try {
        // This would be replaced with actual API calls
        // For now, using mock data
        categories.value = [
          {
            id: 1,
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            image: '/api/placeholder/40/40',
            parent: null,
            products: [
              { id: 1, name: 'Smartphone' },
              { id: 2, name: 'Laptop' }
            ]
          },
          {
            id: 2,
            name: 'Smartphones',
            description: 'Mobile phones and accessories',
            image: '/api/placeholder/40/40',
            parent: { id: 1, name: 'Electronics' },
            products: [
              { id: 1, name: 'iPhone 15' },
              { id: 2, name: 'Samsung Galaxy' }
            ]
          },
          {
            id: 3,
            name: 'Accessories',
            description: 'Phone and laptop accessories',
            image: '/api/placeholder/40/40',
            parent: null,
            products: [
              { id: 3, name: 'Phone Case' },
              { id: 4, name: 'Laptop Stand' }
            ]
          }
        ]

        // Set parent categories (categories without parent)
        parentCategories.value = categories.value.filter(cat => !cat.parent)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const openCategoryModal = () => {
      editingCategory.value = null
      categoryForm.value = {
        name: '',
        description: '',
        parentId: '',
        image: ''
      }
      showModal.value = true
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = {
        name: category.name,
        description: category.description || '',
        parentId: category.parent?.id || '',
        image: category.image || ''
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingCategory.value = null
      categoryForm.value = {
        name: '',
        description: '',
        parentId: '',
        image: ''
      }
    }

    const saveCategory = async () => {
      try {
        if (editingCategory.value) {
          // Update existing category
          const index = categories.value.findIndex(cat => cat.id === editingCategory.value.id)
          if (index !== -1) {
            categories.value[index] = {
              ...categories.value[index],
              ...categoryForm.value,
              parent: categoryForm.value.parentId ? 
                parentCategories.value.find(cat => cat.id === parseInt(categoryForm.value.parentId)) : null
            }
          }
        } else {
          // Create new category
          const newCategory = {
            id: Date.now(), // In real app, this would come from the server
            ...categoryForm.value,
            parent: categoryForm.value.parentId ? 
              parentCategories.value.find(cat => cat.id === parseInt(categoryForm.value.parentId)) : null,
            products: []
          }
          categories.value.push(newCategory)
        }
        
        closeModal()
      } catch (error) {
        console.error('Error saving category:', error)
      }
    }

    const deleteCategory = async (categoryId) => {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          categories.value = categories.value.filter(cat => cat.id !== categoryId)
        } catch (error) {
          console.error('Error deleting category:', error)
        }
      }
    }

    onMounted(() => {
      fetchCategories()
    })

    return {
      categories,
      parentCategories,
      showModal,
      editingCategory,
      categoryForm,
      openCategoryModal,
      editCategory,
      closeModal,
      saveCategory,
      deleteCategory
    }
  }
}
</script>




