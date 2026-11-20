<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import { Upload, X, Plus } from "lucide-vue-next";

const photos = defineModel<File[]>("photos", { required: true });
const photoPreviews = ref<string[]>([]);
const MAX_PHOTOS = 5;

const emit = defineEmits<{
  (e: "previews-change", previews: string[]): void;
}>();

watch(
  photos,
  (newPhotos, oldPhotos = []) => {
    const previousPreviews = photoPreviews.value;
    previousPreviews.forEach((url, index) => {
      const oldPhoto = oldPhotos[index];
      if (oldPhoto && !newPhotos.includes(oldPhoto)) {
        URL.revokeObjectURL(url);
      }
    });
    photoPreviews.value = newPhotos.map((file) => {
      const oldIndex = oldPhotos.indexOf(file);
      const existingUrl = oldIndex !== -1 ? photoPreviews.value[oldIndex] : undefined;
      return existingUrl ?? URL.createObjectURL(file);
    });
    emit("previews-change", [...photoPreviews.value]);
  },
  { immediate: true },
);
function handlePhotos(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files ?? []);
  const availableSlots = MAX_PHOTOS - photos.value.length;
  const validFiles = selectedFiles.filter((file) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type),
  );
  photos.value = [...photos.value, ...validFiles.slice(0, availableSlots)];
  input.value = "";
}
function removePhoto(index: number) {
  photos.value = photos.value.filter((_, i) => i !== index);
}
onBeforeUnmount(() => {
  photoPreviews.value.forEach((url) => URL.revokeObjectURL(url));
});
</script>
<template>
  <section class="form-section overflow-hidden">
    <div class="form-section-header">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Fotografías</h2>
          <p class="mt-1 text-sm leading-5 text-slate-500">
            Muestra los lugares y momentos que vivirán los viajeros.
          </p>
        </div>
        <span
          class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"
        >
          {{ photos.length }}/{{ MAX_PHOTOS }}
        </span>
      </div>
    </div>
    <div class="p-5 sm:p-7">
      <label
        v-if="photos.length === 0"
        class="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-teal-700 hover:bg-teal-50/40"
      >
        <span
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-800 ring-1 ring-slate-200"
        >
          <Upload :size="22" />
        </span>
        <span class="text-sm font-semibold text-slate-900"> Añade fotografías </span>
        <span class="mt-1 max-w-sm text-sm leading-5 text-slate-500">
          La primera imagen será la portada de tu experiencia.
        </span>
        <span class="btn-primary mt-5"> Seleccionar imágenes </span>
        <span class="mt-3 text-xs text-slate-400"> JPG, PNG o WEBP · Máximo 5 imágenes </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="sr-only"
          @change="handlePhotos"
        />
      </label>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="(preview, index) in photoPreviews"
          :key="preview"
          :class="[
            'group relative overflow-hidden rounded-xl bg-slate-100',
            index === 0 ? 'col-span-2 aspect-2/1 sm:col-span-2' : 'aspect-square',
          ]"
        >
          <img
            :src="preview"
            :alt="`Fotografía ${index + 1} de la experiencia`"
            class="h-full w-full object-cover"
          />
          <span
            v-if="index === 0"
            class="absolute bottom-3 left-3 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
          >
            Foto de portada
          </span>
          <button
            type="button"
            :aria-label="`Eliminar fotografía ${index + 1}`"
            @click="removePhoto(index)"
            class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <X :size="17" />
          </button>
        </div>

        <label
          v-if="photos.length < MAX_PHOTOS"
          class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-teal-700 hover:bg-teal-50/40"
        >
          <Plus :size="22" class="text-teal-800" />
          <span class="mt-2 text-xs font-medium text-slate-600"> Añadir foto </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            class="sr-only"
            @change="handlePhotos"
          />
        </label>
      </div>
    </div>
  </section>
</template>
