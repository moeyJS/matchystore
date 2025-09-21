<template>
  <div id="app">
    <main class="min-h-screen bg-gray-50">
      <router-view />
    </main>
    <NotificationSystem />
  </div>
</template>

<script>
import NotificationSystem from './components/NotificationSystem.vue'

export default {
  name: 'App',
  components: {
    NotificationSystem
  }
}
</script>
