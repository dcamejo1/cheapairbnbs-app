<template>
  <div>
    <!-- Bell Icon Button -->
    <button
      @click="showModal = true"
      class="relative p-2 text-gray-600 hover:text-airbnb-rausch transition-colors duration-200 rounded-full hover:bg-gray-100"
      title="Get notified of new affordable destinations"
    >
      <Icon name="heroicons:bell" class="w-6 h-6" />

      <!-- Notification dot (optional - could be used for new features) -->
      <span
        v-if="hasNewFeatures"
        class="absolute -top-1 -right-1 w-3 h-3 bg-airbnb-rausch rounded-full"
      ></span>
    </button>

    <!-- Modal Overlay -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background-color: rgba(0, 0, 0, 0.4)"
      @click="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div v-if="subscriptionState !== 'success'" class="text-center mb-6">
          <div
            class="w-16 h-16 bg-airbnb-rausch/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="heroicons:bell" class="w-8 h-8 text-airbnb-rausch" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            Stay updated on new places!
          </h3>
          <p class="text-gray-600 text-sm">
            Get notified when we discover new affordable destinations around the
            world.
          </p>
        </div>

        <!-- Success State -->
        <div v-if="subscriptionState === 'success'" class="text-center">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="heroicons:check" class="w-8 h-8 text-green-600" />
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">
            You're all set!
          </h4>
          <p class="text-gray-600 text-sm mb-6">
            {{ successMessage }}
          </p>
          <button
            @click="closeModal"
            class="w-full bg-airbnb-rausch text-white py-3 px-4 rounded-xl font-semibold hover:bg-airbnb-rausch/90 transition-colors"
          >
            Close
          </button>
        </div>

        <!-- Form State -->
        <form v-else @submit.prevent="subscribe" class="space-y-4">
          <!-- Email Input -->
          <div>
            <label
              for="email"
              class="block text-sm font-semibold text-gray-900 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-airbnb-rausch transition-all"
              :disabled="isLoading"
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !email.trim()"
            class="w-full bg-airbnb-rausch text-white py-3 px-4 rounded-xl font-semibold hover:bg-airbnb-rausch/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
          >
            <Icon
              v-if="isLoading"
              name="heroicons:arrow-path"
              class="w-5 h-5 mr-2 animate-spin"
            />
            <span>{{ isLoading ? "Subscribing..." : "Get Notified" }}</span>
          </button>

          <!-- Disclaimer -->
          <p class="text-xs text-gray-500 text-center">
            Unsubscribe at any time
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SubscriptionResponse {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
  reactivated?: boolean;
}

const showModal = ref(false);
const email = ref("");
const isLoading = ref(false);
const error = ref("");
const subscriptionState = ref<"form" | "success">("form");
const successMessage = ref("");
const hasNewFeatures = ref(false); // Can be used to show notification dot

const closeModal = () => {
  showModal.value = false;
  // Reset form state when closing
  setTimeout(() => {
    subscriptionState.value = "form";
    email.value = "";
    error.value = "";
    successMessage.value = "";
  }, 300);
};

const subscribe = async () => {
  if (!email.value) return;

  isLoading.value = true;
  error.value = "";

  try {
    const response = await $fetch<SubscriptionResponse>(
      "/api/notifications/subscribe",
      {
        method: "POST",
        body: {
          email: email.value,
        },
      }
    );

    if (response.success) {
      subscriptionState.value = "success";
      successMessage.value = response.message;
    } else {
      error.value =
        response.message || "Something went wrong. Please try again.";
    }
  } catch (err: unknown) {
    console.error("Subscription error:", err);
    const errorMessage =
      err &&
      typeof err === "object" &&
      "data" in err &&
      err.data &&
      typeof err.data === "object" &&
      "message" in err.data
        ? String(err.data.message)
        : "Failed to subscribe. Please try again later.";
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

// Close modal when pressing Escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && showModal.value) {
      closeModal();
    }
  };
  document.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});
</script>

<style scoped>
/* Airbnb brand colors */
.text-airbnb-rausch {
  color: #ff5a5f;
}

.bg-airbnb-rausch {
  background-color: #ff5a5f;
}

.hover\:text-airbnb-rausch:hover {
  color: #ff5a5f;
}

.hover\:bg-airbnb-rausch\/90:hover {
  background-color: rgba(255, 90, 95, 0.9);
}

.bg-airbnb-rausch\/10 {
  background-color: rgba(255, 90, 95, 0.1);
}

.focus\:ring-airbnb-rausch:focus {
  --tw-ring-color: #ff5a5f;
}

.focus\:border-airbnb-rausch:focus {
  border-color: #ff5a5f;
}
</style>
