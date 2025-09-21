<template>
  <div class="min-h-screen bg-gray-50">
    <AdminLayout>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Pages</h1>
            <p class="text-gray-600 mt-2">Manage site pages and SEO</p>
          </div>
          <button @click="openEditor()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">New Page</button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="page in pages" :key="page.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ page.title }}</div>
                    <div class="text-sm text-gray-500" v-if="page.seoTitle">{{ page.seoTitle }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{{ page.slug }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      page.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ page.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button @click="openEditor(page)" class="text-blue-600 hover:text-blue-900">Edit</button>
                    <button @click="remove(page.id)" class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Editor Modal -->
        <div v-if="showEditor" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">{{ form.id ? 'Edit Page' : 'New Page' }}</h3>
              <button @click="closeEditor" class="text-gray-600 hover:text-gray-900">Close</button>
            </div>

            <form @submit.prevent="save" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input v-model="form.title" type="text" required class="w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input v-model="form.slug" type="text" required class="w-full border rounded px-3 py-2" placeholder="about-us"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input v-model="form.seoTitle" type="text" class="w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea v-model="form.seoDescription" rows="2" class="w-full border rounded px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Content (HTML/Markdown)</label>
                <textarea v-model="form.content" rows="10" required class="w-full border rounded px-3 py-2 font-mono"></textarea>
              </div>
              <div class="flex items-center justify-between">
                <div class="space-x-3">
                  <label class="inline-flex items-center space-x-2">
                    <input type="radio" value="DRAFT" v-model="form.status"/>
                    <span>Draft</span>
                  </label>
                  <label class="inline-flex items-center space-x-2">
                    <input type="radio" value="PUBLISHED" v-model="form.status"/>
                    <span>Published</span>
                  </label>
                </div>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
  
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout.vue'

export default {
  name: 'AdminPages',
  components: { AdminLayout },
  setup() {
    const pages = ref([])
    const showEditor = ref(false)
    const form = ref({ id: '', title: '', slug: '', content: '', seoTitle: '', seoDescription: '', status: 'DRAFT' })

    const load = async () => {
      const res = await axios.get('/api/admin/pages')
      pages.value = res.data.pages || []
    }

    const openEditor = (page) => {
      if (page) {
        form.value = { ...page }
      } else {
        form.value = { id: '', title: '', slug: '', content: '', seoTitle: '', seoDescription: '', status: 'DRAFT' }
      }
      showEditor.value = true
    }

    const closeEditor = () => {
      showEditor.value = false
    }

    const save = async () => {
      if (form.value.id) {
        await axios.put(`/api/admin/pages/${form.value.id}`, form.value)
      } else {
        await axios.post('/api/admin/pages', form.value)
      }
      showEditor.value = false
      await load()
    }

    const remove = async (id) => {
      if (!confirm('Delete this page?')) return
      await axios.delete(`/api/admin/pages/${id}`)
      await load()
    }

    onMounted(load)

    return { pages, showEditor, form, openEditor, closeEditor, save, remove }
  }
}
</script>





