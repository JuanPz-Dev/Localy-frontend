<script setup lang="ts">
import { ref } from "vue";
import { Plus, Trash2, ListChecks } from "lucide-vue-next";
interface Feature {
  name: string;
  included: boolean;
}
const features = defineModel<Feature[]>({ required: true });
const newFeature = ref("");
function addFeature() {
  const name = newFeature.value.trim();
  if (!name) return;
  const alreadyExists = features.value.some(
    (feature) => feature.name.toLowerCase() === name.toLowerCase(),
  );
  if (alreadyExists) return;
  features.value = [...features.value, { name, included: true }];
  newFeature.value = "";
}
function removeFeature(index: number) {
  features.value = features.value.filter((_, i) => i !== index);
}
</script>
<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <!-- Encabezado -->
    <div class="flex items-start gap-3 border-b border-slate-100 px-5 py-6 sm:px-7">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
      >
        <ListChecks :size="21" :stroke-width="1.8" />
      </div>
      <div>
        <h2 class="text-base font-semibold tracking-tight text-slate-900">¿Qué incluye?</h2>
        <p class="mt-1 text-sm leading-5 text-slate-500">
          Describe los servicios y elementos que forman parte de la experiencia.
        </p>
      </div>
    </div>
    <div class="px-5 py-6 sm:px-7 sm:py-7">
      <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="addFeature">
        <input
          v-model="newFeature"
          type="text"
          maxlength="100"
          placeholder="Ej. Guía turístico profesional"
          aria-label="Nombre de la característica"
          class="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5"
        />
        <button
          type="submit"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 active:scale-[0.98]"
        >
          <Plus :size="17" />
          Agregar
        </button>
      </form>
      <div
        v-if="features.length === 0"
        class="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center"
      >
        <ListChecks :size="25" class="mx-auto mb-3 text-slate-400" :stroke-width="1.6" />
        <p class="text-sm font-medium text-slate-700">Aún no has agregado características</p>
        <p class="mt-1 text-xs leading-5 text-slate-500">
          Puedes añadir, por ejemplo, entradas, transporte o alimentación.
        </p>
      </div>
      <div v-else class="mt-5 space-y-3">
        <div
          v-for="(feature, index) in features"
          :key="`${feature.name}-${index}`"
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
          >
            <span class="text-sm font-semibold">✓</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="wrap-break-word text-sm font-medium text-slate-800">
              {{ feature.name }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">Incluido en la experiencia</p>
          </div>
          <button
            type="button"
            :aria-label="`Eliminar ${feature.name}`"
            :title="`Eliminar ${feature.name}`"
            @click="removeFeature(index)"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/10"
          >
            <Trash2 :size="17" :stroke-width="1.8" />
          </button>
        </div>
        <p class="pt-1 text-xs leading-5 text-slate-500">
          Las características añadidas se enviarán junto con los datos de tu experiencia.
        </p>
      </div>
    </div>
  </section>
</template>
