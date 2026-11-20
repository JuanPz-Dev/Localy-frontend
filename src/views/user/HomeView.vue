<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import TourCard from "@/components/tours/TourCard.vue";
import { getTours } from "@/services/tourService";
import type { Category, Tour } from "@/types/tour";
import Marquee from "@/components/Marquee.vue";
import Fotter from "@/components/fotter.vue";

const PAGE_SIZE = 12;

const tours = ref<Tour[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref("");
const selectedCategory = ref<Category | null>(null);

const page = ref(0);
const hasMore = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;
let requestId = 0;

const categories: { label: string; value: Category | null }[] = [
  { label: "Todas", value: null },
  { label: "Historia", value: "HISTORICAL" },
  { label: "Gastronomía", value: "GASTRONOMIC" },
  { label: "Playas", value: "ISLANDS_AND_BEACHES" },
  { label: "Cultura", value: "CULTURAL" },
];

async function loadTours(reset = false) {
  if (reset) {
    requestId++;
    page.value = 0;
    hasMore.value = true;
    tours.value = [];
    error.value = "";
  } else if (loading.value || loadingMore.value || !hasMore.value) {
    return;
  }

  const currentRequestId = requestId;
  const requestedPage = page.value;

  if (requestedPage === 0) {
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const response = await getTours({
      category: selectedCategory.value ?? undefined,
      page: requestedPage,
      size: PAGE_SIZE,
    });

    if (currentRequestId !== requestId) return;
    const items: Tour[] = response.content ?? [];

    if (requestedPage === 0) {
      tours.value = items;
    } else {
      const existingIds = new Set(tours.value.map((tour) => tour.id));
      const newItems = items.filter((tour) => !existingIds.has(tour.id));

      tours.value.push(...newItems);
    }

    page.value = requestedPage + 1;
    hasMore.value = items.length === PAGE_SIZE;

    error.value = "";
  } catch (er) {
    if (currentRequestId !== requestId) return;

    console.error("Error cargando experiencias:", er);
    error.value =
      requestedPage === 0
        ? "No pudimos cargar las experiencias."
        : "No pudimos cargar más experiencias.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
      loadingMore.value = false;
    }
  }
}

async function selectCategory(category: Category | null) {
  if (selectedCategory.value === category) return;

  selectedCategory.value = category;
  await loadTours(true);
}

function observeLoadTrigger(element: HTMLElement | null) {
  if (!observer) return;

  observer.disconnect();

  if (element) {
    observer.observe(element);
  }
}

// Conectar el observador cuando Vue crea o cambia el elemento.
watch(loadMoreTrigger, (element) => {
  observeLoadTrigger(element);
});

onMounted(async () => {
  observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);

      if (isVisible && !loading.value && !loadingMore.value && hasMore.value) {
        void loadTours();
      }
    },
    {
      root: null,
      rootMargin: "400px 0px",
      threshold: 0,
    },
  );

  await loadTours(true);
  await nextTick();

  observeLoadTrigger(loadMoreTrigger.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  requestId++;
});
</script>

<template>
  <main class="min-h-screen bg-white">
    <Marquee />

    <section class="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
          Explora experiencias únicas
        </h1>

        <p class="mt-2 text-sm text-gray-500">
          Descubre actividades auténticas creadas por guías locales y encuentra nuevas formas de
          vivir cada destino.
        </p>
      </div>
      <div class="mb-8 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category.label"
          type="button"
          @click="selectCategory(category.value)"
          :class="[
            'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition cursor-pointer',
            selectedCategory === category.value
              ? 'bg-gray-950 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ category.label }}
        </button>
      </div>
      <div
        v-if="loading && tours.length === 0"
        class="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="item in 8" :key="item" class="animate-pulse">
          <div class="aspect-[4/3] rounded-2xl bg-gray-200"></div>
          <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
          <div class="mt-3 h-3 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
      <div
        v-else-if="error && tours.length === 0"
        class="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center"
      >
        <p class="font-medium text-gray-900">{{ error }}</p>

        <button
          type="button"
          @click="loadTours(true)"
          class="mt-4 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Intentar nuevamente
        </button>
      </div>
      <div
        v-else-if="tours.length === 0"
        class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-900">No encontramos experiencias</h2>

        <p class="mt-2 text-sm text-gray-500">
          Aún no hay experiencias disponibles en esta categoría.
        </p>
      </div>
      <template v-else>
        <div class="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <TourCard v-for="tour in tours" :key="tour.id" :tour="tour" />
        </div>
        <div
          ref="loadMoreTrigger"
          class="mt-10 flex min-h-20 flex-col items-center justify-center gap-3"
        >
          <span
            v-if="loadingMore"
            class="flex items-center gap-3 text-sm text-gray-500"
            role="status"
          >
            <span
              class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
            ></span>
            Cargando más experiencias...
          </span>

          <div v-else-if="error && tours.length > 0" class="text-center text-sm text-gray-500">
            <p>{{ error }}</p>
            <button
              type="button"
              @click="loadTours()"
              class="mt-2 font-semibold text-gray-900 underline"
            >
              Reintentar
            </button>
          </div>

          <button
            v-else-if="hasMore && tours.length > 0"
            type="button"
            @click="loadTours()"
            class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Cargar más experiencias
          </button>

          <p v-else-if="!hasMore && tours.length > 0" class="text-sm text-gray-400">
            Has llegado al final de las experiencias.
          </p>
        </div>
      </template>
    </section>
    <Fotter />
  </main>
</template>
