<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();
const { message, type, show } = storeToRefs(toastStore);
</script>

<template>
  <Transition name="toast">
    <div
      v-if="show"
      class="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-lg px-5 py-4 text-white shadow-lg"
      :class="{ 'bg-green-500': type === 'success', 'bg-red-500': type === 'error' }"
    >
      <span>
        {{ type === "success" ? "✓" : "X" }}
      </span>
      <p>{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
