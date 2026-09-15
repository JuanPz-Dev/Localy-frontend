<script setup lang="ts">
import { onMounted, ref } from "vue";
import TourCard from "@/components/tours/TourCard.vue";
import { getTours } from "@/services/tourService";
import type { Category, Tour } from "@/types/tour";

const tours = ref<Tour[]>([]);
const loading = ref(false);
const error = ref("");

const selectedCategory = ref<Category | null>(null);

const categories: {
  label: string;
  value: Category | null;
}[] = [
  {
    label: "Todas",
    value: null,
  },
  {
    label: "Historia",
    value: "HISTORICAL",
  },
  {
    label: "Gastronomía",
    value: "GASTRONOMIC",
  },
  {
    label: "Playas",
    value: "ISLANDS_AND_BEACHES",
  },
  {
    label: "Cultura",
    value: "CULTURAL",
  },
];

async function loadTours() {
  try {
    loading.value = true;
    error.value = "";

    const response = await getTours({
      category: selectedCategory.value ?? undefined,
      page: 0,
      size: 12,
    });

    // IMPORTANTE:
    // Tu backend devuelve PageResult<Tour>
    tours.value = response.content;
  } catch (er) {
    console.error("Error cargando experiencias:", er);
    error.value = "No pudimos cargar las experiencias.";
  } finally {
    loading.value = false;
  }
}

async function selectCategory(category: Category | null) {
  selectedCategory.value = category;
  await loadTours();
}

onMounted(() => {
  loadTours();
});
</script>

<template>
  <main class="min-h-screen bg-white">
    <section class="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
          Experiencias en Cartagena
        </h1>

        <p class="mt-2 text-sm text-gray-500">Descubre experiencias creadas por guías locales.</p>
      </div>

      <!-- FILTROS -->
      <div class="mb-8 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category.label"
          type="button"
          @click="selectCategory(category.value)"
          :class="[
            'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition',
            selectedCategory === category.value
              ? 'bg-gray-950 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="item in 8" :key="item" class="animate-pulse">
          <div class="aspect-4/3 rounded-2xl bg-gray-200"></div>
          <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
          <div class="mt-3 h-3 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
        <p class="font-medium text-gray-900">
          {{ error }}
        </p>

        <button
          type="button"
          @click="loadTours"
          class="mt-4 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Intentar nuevamente
        </button>
      </div>

      <!-- SIN RESULTADOS -->
      <div
        v-else-if="tours.length === 0"
        class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-900">No encontramos experiencias</h2>

        <p class="mt-2 text-sm text-gray-500">
          Aún no hay experiencias disponibles en esta categoría.
        </p>
      </div>

      <!-- EXPERIENCIAS -->
      <div
        v-else
        class="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <TourCard v-for="tour in tours" :key="tour.id" :tour="tour" />
      </div>
    </section>
  </main>
</template>
