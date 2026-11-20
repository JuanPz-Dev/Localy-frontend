<script setup lang="ts">
import { useConfirmStore } from "@/stores/confirm";
const confirm = useConfirmStore();
</script>
<template>
  <Teleport to="body">
    <div
      v-if="confirm.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="confirm.answer(false)"
      @keydown.esc="confirm.answer(false)"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold text-slate-900">{{ confirm.title }}</h2>
        <p v-if="confirm.description" class="mt-2 text-sm text-slate-600">
          {{ confirm.description }}
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            @click="confirm.answer(false)"
          >
            {{ confirm.cancelText }}
          </button>
          <button
            class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            @click="confirm.answer(true)"
          >
            {{ confirm.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
