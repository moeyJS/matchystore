<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Quick Response Templates</h3>
      <button
        @click="showAddTemplate = true"
        class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Template
      </button>
    </div>

    <!-- Templates List -->
    <div class="space-y-2">
      <div
        v-for="template in templates"
        :key="template.id"
        class="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">{{ template.name }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ template.description }}</p>
            <div class="mt-2">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  {
                    'bg-green-100 text-green-800': template.category === 'greeting',
                    'bg-blue-100 text-blue-800': template.category === 'resolution',
                    'bg-yellow-100 text-yellow-800': template.category === 'escalation',
                    'bg-red-100 text-red-800': template.category === 'closing'
                  }
                ]"
              >
                {{ template.category }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="useTemplate(template)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Use
            </button>
            <button
              @click="editTemplate(template)"
              class="text-gray-600 hover:text-gray-800 text-sm"
            >
              Edit
            </button>
            <button
              @click="deleteTemplate(template.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Template Modal -->
    <Dialog v-model:open="showAddTemplate">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ editingTemplate ? 'Edit Template' : 'Add New Template' }}
          </DialogTitle>
          <DialogDescription>
            Create a quick response template for common support scenarios.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div>
            <Label for="template-name">Template Name</Label>
            <Input
              id="template-name"
              v-model="templateForm.name"
              placeholder="e.g., Order Status Inquiry"
              required
            />
          </div>

          <div>
            <Label for="template-description">Description</Label>
            <Input
              id="template-description"
              v-model="templateForm.description"
              placeholder="Brief description of when to use this template"
            />
          </div>

          <div>
            <Label for="template-category">Category</Label>
            <Select v-model="templateForm.category">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greeting">Greeting</SelectItem>
                <SelectItem value="resolution">Resolution</SelectItem>
                <SelectItem value="escalation">Escalation</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="template-content">Template Content</Label>
            <Textarea
              id="template-content"
              v-model="templateForm.content"
              placeholder="Enter the template content. Use {{variable}} for dynamic content like {{customerName}}, {{orderNumber}}, etc."
              rows="6"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              Available variables: {{customerName}}, {{orderNumber}}, {{orderStatus}}, {{companyName}}
            </p>
          </div>

          <div class="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              @click="cancelTemplate"
            >
              Cancel
            </Button>
            <Button type="submit">
              {{ editingTemplate ? 'Update Template' : 'Create Template' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'

export default {
  name: 'SupportTemplates',
  components: {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Button,
    Input,
    Label,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  },
  emits: ['use-template'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const templates = ref([
      {
        id: 1,
        name: 'Order Status Inquiry',
        description: 'Response for customers asking about order status',
        category: 'resolution',
        content: 'Hello {{customerName}},\n\nThank you for contacting us about your order #{{orderNumber}}. I can see that your order is currently {{orderStatus}}.\n\nIf you have any other questions, please don\'t hesitate to ask.\n\nBest regards,\n{{companyName}} Support Team'
      },
      {
        id: 2,
        name: 'Welcome Message',
        description: 'Greeting for new support conversations',
        category: 'greeting',
        content: 'Hello {{customerName}},\n\nThank you for reaching out to {{companyName}} support. I\'m here to help you with any questions or concerns you may have.\n\nHow can I assist you today?'
      },
      {
        id: 3,
        name: 'Issue Resolution',
        description: 'Template for resolved issues',
        category: 'resolution',
        content: 'Hello {{customerName}},\n\nI\'m happy to inform you that your issue has been resolved. Your order #{{orderNumber}} is now {{orderStatus}}.\n\nIf you experience any further issues, please don\'t hesitate to contact us.\n\nThank you for your patience.\n\nBest regards,\n{{companyName}} Support Team'
      },
      {
        id: 4,
        name: 'Escalation Notice',
        description: 'When escalating to higher support level',
        category: 'escalation',
        content: 'Hello {{customerName}},\n\nI understand your concern about {{issue}}. This requires specialized attention, so I\'m escalating your case to our senior support team.\n\nYou can expect a response within 24 hours. In the meantime, I\'ll continue to monitor your case.\n\nThank you for your patience.\n\nBest regards,\n{{companyName}} Support Team'
      },
      {
        id: 5,
        name: 'Closing Message',
        description: 'End of conversation template',
        category: 'closing',
        content: 'Hello {{customerName}},\n\nI believe we\'ve addressed your concern. If you have any other questions or need further assistance, please don\'t hesitate to contact us.\n\nThank you for choosing {{companyName}}!\n\nBest regards,\n{{companyName}} Support Team'
      }
    ])

    const showAddTemplate = ref(false)
    const editingTemplate = ref(null)
    const templateForm = ref({
      name: '',
      description: '',
      category: 'greeting',
      content: ''
    })

    const useTemplate = (template) => {
      emit('use-template', template.content)
    }

    const editTemplate = (template) => {
      editingTemplate.value = template
      templateForm.value = { ...template }
      showAddTemplate.value = true
    }

    const deleteTemplate = (templateId) => {
      if (confirm('Are you sure you want to delete this template?')) {
        const index = templates.value.findIndex(t => t.id === templateId)
        if (index > -1) {
          templates.value.splice(index, 1)
          toast.success('Template deleted successfully')
        }
      }
    }

    const saveTemplate = () => {
      if (!templateForm.value.name || !templateForm.value.content) {
        toast.error('Please fill in all required fields')
        return
      }

      if (editingTemplate.value) {
        // Update existing template
        const index = templates.value.findIndex(t => t.id === editingTemplate.value.id)
        if (index > -1) {
          templates.value[index] = {
            ...editingTemplate.value,
            ...templateForm.value
          }
          toast.success('Template updated successfully')
        }
      } else {
        // Create new template
        const newTemplate = {
          id: Date.now(),
          ...templateForm.value
        }
        templates.value.push(newTemplate)
        toast.success('Template created successfully')
      }

      cancelTemplate()
    }

    const cancelTemplate = () => {
      showAddTemplate.value = false
      editingTemplate.value = null
      templateForm.value = {
        name: '',
        description: '',
        category: 'greeting',
        content: ''
      }
    }

    const processTemplate = (content, variables = {}) => {
      let processedContent = content
      
      // Replace variables
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        processedContent = processedContent.replace(regex, variables[key] || `{{${key}}}`)
      })

      // Replace common variables with defaults
      processedContent = processedContent.replace(/{{companyName}}/g, 'MatchyStore')
      processedContent = processedContent.replace(/{{customerName}}/g, 'Valued Customer')
      processedContent = processedContent.replace(/{{orderNumber}}/g, 'N/A')
      processedContent = processedContent.replace(/{{orderStatus}}/g, 'Processing')

      return processedContent
    }

    return {
      templates,
      showAddTemplate,
      editingTemplate,
      templateForm,
      useTemplate,
      editTemplate,
      deleteTemplate,
      saveTemplate,
      cancelTemplate,
      processTemplate
    }
  }
}
</script>


