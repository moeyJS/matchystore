<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="loading" class="flex justify-center items-center py-24">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="max-w-3xl mx-auto text-center">
      <h1 class="text-2xl font-semibold mb-2">Page not found</h1>
      <p class="text-muted-foreground">The page you are looking for does not exist.</p>
    </div>

    <article v-else class="prose prose-slate max-w-none">
      <h1 class="mb-6">{{ page.title }}</h1>
      <div v-html="page.content"></div>
    </article>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'CmsPage',
  setup() {
    const route = useRoute()
    const loading = ref(true)
    const error = ref(false)
    const page = ref({ title: '', content: '', seoTitle: '', seoDescription: '' })

    const applySeo = (p) => {
      if (p.seoTitle || p.title) {
        document.title = p.seoTitle || p.title
      }
      if (p.seoDescription) {
        let meta = document.querySelector('meta[name="description"]')
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'description'
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', p.seoDescription)
      }
    }

    const load = async () => {
      loading.value = true
      error.value = false
      try {
        const slug = route.params.slug
        const res = await axios.get(`/api/admin/pages/public/slug/${slug}`)
        page.value = res.data.page
        applySeo(page.value)
      } catch (e) {
        error.value = true
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.slug, load)

    return { loading, error, page }
  }
}
</script>

<style>
/* optional: prose styling if Tailwind typography plugin is used */
</style>





