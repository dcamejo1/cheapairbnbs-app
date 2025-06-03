<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    style="background-color: rgba(0, 0, 0, 0.4)"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <h3 class="text-xl font-bold text-gray-900">Share Your Feedback</h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-6">
        <!-- Success Message -->
        <div
          v-if="success"
          class="p-4 bg-green-50 border border-green-200 rounded-xl text-center"
        >
          <div class="flex items-center justify-center mb-2">
            <Icon
              name="heroicons:check-circle"
              class="w-6 h-6 text-green-600"
            />
          </div>
          <p class="text-green-800 font-medium">{{ success }}</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-4 bg-red-50 border border-red-200 rounded-xl text-center"
        >
          <div class="flex items-center justify-center mb-2">
            <Icon
              name="heroicons:exclamation-circle"
              class="w-6 h-6 text-red-600"
            />
          </div>
          <p class="text-red-800 font-medium">{{ error }}</p>
        </div>

        <!-- Form Fields (hidden when success message is shown) -->
        <div v-if="!success" class="space-y-6">
          <!-- Feedback Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              What type of feedback is this?
            </label>
            <div class="space-y-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="feedbackType"
                  type="radio"
                  value="bug"
                  class="w-4 h-4 text-airbnb-rausch border-gray-300 focus:ring-airbnb-rausch"
                />
                <span class="ml-3 text-gray-900">🐛 Bug Report</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="feedbackType"
                  type="radio"
                  value="feature_request"
                  class="w-4 h-4 text-airbnb-rausch border-gray-300 focus:ring-airbnb-rausch"
                />
                <span class="ml-3 text-gray-900">💡 Feature Request</span>
              </label>
            </div>
          </div>

          <!-- Dynamic Label -->
          <div>
            <label
              for="feedback-description"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{
                feedbackType === "bug"
                  ? "Describe the bug you encountered"
                  : "Describe the feature you'd like to see"
              }}
            </label>

            <!-- Description Text Area -->
            <textarea
              id="feedback-description"
              v-model="description"
              rows="4"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent resize-none"
              placeholder="✨ Your feedback makes this page better"
              maxlength="2000"
            ></textarea>

            <!-- Character Counter -->
            <div class="flex justify-between items-center mt-2">
              <div></div>
              <span
                class="text-sm"
                :class="
                  description.length > 1800
                    ? 'text-orange-600'
                    : description.length > 1900
                    ? 'text-red-600'
                    : 'text-gray-500'
                "
              >
                {{ description.length }}/2000 characters
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200"
      >
        <button
          @click="closeModal"
          class="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          :class="
            success
              ? 'bg-airbnb-rausch text-white hover:bg-airbnb-rausch/90 rounded-xl'
              : ''
          "
        >
          {{ success ? "Close" : "Cancel" }}
        </button>
        <button
          v-if="!success"
          @click="submitFeedback"
          :disabled="!description.trim() || submitting"
          class="px-6 py-2 bg-airbnb-rausch text-white font-medium rounded-xl hover:bg-airbnb-rausch/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
        >
          <Icon
            v-if="submitting"
            name="heroicons:arrow-path"
            class="w-4 h-4 animate-spin"
          />
          <span>{{ submitting ? "Submitting..." : "Submit Feedback" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const _props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["close"]);

// Data
const feedbackType = ref("bug");
const description = ref("");
const submitting = ref(false);
const error = ref("");
const success = ref("");

// Methods
const closeModal = () => {
  if (!submitting.value) {
    resetForm();
    emit("close");
  }
};

const resetForm = () => {
  feedbackType.value = "bug";
  description.value = "";
  error.value = "";
  success.value = "";
  submitting.value = false;
};

const validateForm = () => {
  if (!description.value.trim()) {
    return false;
  }

  if (description.value.length > 2000) {
    return false;
  }

  return true;
};

const submitFeedback = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  error.value = "";
  success.value = "";

  try {
    const _response = await $fetch("/api/feedback", {
      method: "POST",
      body: {
        type: feedbackType.value,
        description: description.value.trim(),
      },
    });

    success.value = "Thank you! Your feedback has been submitted successfully.";

    // Close modal after 8 seconds
    setTimeout(() => {
      closeModal();
    }, 8000);
  } catch (err) {
    console.error("Error submitting feedback:", err);
    error.value =
      err.data?.message || "Failed to submit feedback. Please try again.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Airbnb brand colors */
.text-airbnb-rausch {
  color: #ff5a5f;
}

.bg-airbnb-rausch {
  background-color: #ff5a5f;
}

.bg-airbnb-rausch-dark {
  background-color: #e7464b;
}

.hover\:bg-airbnb-rausch-dark:hover {
  background-color: #e7464b;
}

.focus\:ring-airbnb-rausch:focus {
  --tw-ring-color: #ff5a5f;
}

.focus\:border-airbnb-rausch:focus {
  border-color: #ff5a5f;
}

.border-airbnb-rausch {
  border-color: #ff5a5f;
}
</style>
