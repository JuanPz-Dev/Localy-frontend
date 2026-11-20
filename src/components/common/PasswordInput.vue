<script setup lang="ts">
import { ref } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";

defineProps<{
  placeholder?: string;
  id?: string;
}>();

const model = defineModel<string>({ default: "" });
const show = ref(false);
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="model"
      :type="show ? 'text' : 'password'"
      :placeholder="placeholder"
      class="w-full rounded-lg border px-3 py-2 pr-10"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-3"
      :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      @click="show = !show"
    >
      <EyeOff v-if="show" class="h-5 w-5" />
      <Eye v-else class="h-5 w-5" />
    </button>
  </div>
</template>
