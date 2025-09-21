<template>
  <div class="admin-settings">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Manage your store settings and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Settings Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h2>
            <nav class="space-y-2">
              <button
                v-for="tab in settingsTabs"
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

        <!-- Settings Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border">
            <!-- General Settings -->
            <div v-if="activeTab === 'general'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">General Settings</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input
                    v-model="settings.general.storeName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter store name"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                  <textarea
                    v-model="settings.general.storeDescription"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter store description"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                  <input
                    v-model="settings.general.storeEmail"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter store email"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                  <input
                    v-model="settings.general.storePhone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter store phone"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <textarea
                    v-model="settings.general.storeAddress"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter store address"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Notifications Settings -->
            <div v-if="activeTab === 'notifications'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h3>
              
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p class="text-sm text-gray-500">Receive email notifications for orders and updates</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.emailEnabled"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p class="text-sm text-gray-500">Receive SMS notifications for urgent updates</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.smsEnabled"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p class="text-sm text-gray-500">Receive push notifications in the browser</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.pushEnabled"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Integrations Settings -->
            <div v-if="activeTab === 'integrations'" class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Integration Settings</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                  <select
                    v-model="settings.integrations.paymentGateway"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="square">Square</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Shipping Provider</label>
                  <select
                    v-model="settings.integrations.shippingProvider"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="usps">USPS</option>
                    <option value="dhl">DHL</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Analytics Provider</label>
                  <select
                    v-model="settings.integrations.analyticsProvider"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="google">Google Analytics</option>
                    <option value="mixpanel">Mixpanel</option>
                    <option value="amplitude">Amplitude</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="px-6 py-4 bg-gray-50 border-t">
              <div class="flex justify-end">
                <button
                  @click="saveSettings"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Settings
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
  name: 'AdminSettings',
  setup() {
    const activeTab = ref('general')
    
    const settings = reactive({
      general: {
        storeName: '',
        storeDescription: '',
        storeEmail: '',
        storePhone: '',
        storeAddress: ''
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true
      },
      integrations: {
        paymentGateway: 'stripe',
        shippingProvider: 'ups',
        analyticsProvider: 'google'
      }
    })

    const settingsTabs = [
      { id: 'general', name: 'General' },
      { id: 'notifications', name: 'Notifications' },
      { id: 'integrations', name: 'Integrations' }
    ]

    const saveSettings = async () => {
      try {
        // TODO: Implement API call to save settings
        console.log('Saving settings:', settings)
        // Show success message
      } catch (error) {
        console.error('Error saving settings:', error)
        // Show error message
      }
    }

    return {
      activeTab,
      settings,
      settingsTabs,
      saveSettings
    }
  }
}
</script>
