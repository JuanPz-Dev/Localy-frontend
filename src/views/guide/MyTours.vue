<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Pencil, Trash2, MapPin, Clock, Plus, LoaderCircle, Compass } from "lucide-vue-next";
import api from "@/api/api";
import type { Tour } from "@/types/tour";
import { useConfirmStore } from "@/stores/confirm";

const confirmStore = useConfirmStore();

const router = useRouter();

const tours = ref<Tour[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const deletingTourId = ref<number | null>(null);

const categoryLabels: Record<string, string> = {
  HISTORICAL: "Historia",
  GASTRONOMIC: "Gastronomía",
  ISLANDS_AND_BEACHES: "Playas",
  CULTURAL: "Cultura",
  NIGHTLIFE: "Vida nocturna",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(price);

const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) return "Duración por confirmar";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} ${hours === 1 ? "hora" : "horas"}`;

  return `${hours} h ${remainingMinutes} min`;
};

const loadTours = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get<Tour[]>("/tours/my-tours", {
      params: {
        page: 0,
        size: 10,
      },
    });

    tours.value = response.data;
  } catch {
    errorMessage.value = "No fue posible cargar tus experiencias. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};

const editTour = (tourId: number) => {
  router.push(`/guide/services/${tourId}/edit`);
};

const deleteTour = async (tour: Tour) => {
  const ok = await confirmStore.ask({
    title: "¿Eliminar servicio?",
    description: "Esta acción no se puede deshacer.",
    confirmText: "Sí, Eliminar",
    cancelText: "Mantener Servicio",
  });
  if (!ok) return;
  deletingTourId.value = tour.id;
  errorMessage.value = "";

  try {
    await api.delete(`/tours/delete/${tour.id}`);
    tours.value = tours.value.filter((item) => item.id !== tour.id);
  } catch {
    errorMessage.value =
      "No fue posible eliminar la experiencia. Verifica tu conexión e inténtalo nuevamente.";
  } finally {
    deletingTourId.value = null;
  }
};

onMounted(loadTours);
</script>
<template>
  <main class="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
    <!-- Encabezado -->
    <header class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mis servicios</h1>
        <p class="mt-2 text-sm text-gray-500 sm:text-base">
          Administra las experiencias que ofreces a los viajeros.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 sm:self-auto"
        @click="router.push({ name: 'create-service' })"
      >
        <Plus :size="18" />
        Crear experiencia
      </button>
    </header>
    <div v-if="loading" class="flex min-h-64 items-center justify-center">
      <div class="flex items-center gap-3 text-sm text-gray-500">
        <LoaderCircle :size="22" class="animate-spin text-teal-700" />
        Cargando tus experiencias...
      </div>
    </div>
    <div
      v-else-if="errorMessage && tours.length === 0"
      class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <p class="text-sm text-red-700">{{ errorMessage }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        @click="loadTours"
      >
        Reintentar
      </button>
    </div>
    <section
      v-else-if="tours.length === 0"
      class="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center sm:py-16"
    >
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"
      >
        <Compass :size="26" :stroke-width="1.6" />
      </div>
      <h2 class="text-lg font-semibold text-gray-900">Aún no tienes experiencias</h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Publica tu primera experiencia para que los viajeros descubran lo que tienes preparado.
      </p>
      <button
        type="button"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        @click="router.push({ name: 'create-service' })"
      >
        <Plus :size="18" />
        Crear mi primera experiencia
      </button>
    </section>
    <section v-else>
      <div class="mb-5 flex items-center justify-between gap-3">
        <p class="text-sm text-gray-500">
          {{ tours.length }}
          {{ tours.length === 1 ? "experiencia" : "experiencias" }}
        </p>
        <button
          type="button"
          class="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          @click="loadTours"
        >
          Actualizar lista
        </button>
      </div>
      <div
        v-if="errorMessage"
        class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ errorMessage }}
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="tour in tours"
          :key="tour.id"
          class="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-900/5"
        >
          <!-- Imagen y categoría -->
          <div class="relative h-40 shrink-0 overflow-hidden bg-gray-100 sm:h-44">
            <img
              v-if="tour.photos?.length && tour.photos[0]"
              :src="tour.photos[0]"
              :alt="tour.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-400"
            >
              <MapPin :size="28" :stroke-width="1.5" />
              <span>Imagen próximamente</span>
            </div>
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent"
            />
            <span
              class="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-md"
            >
              {{ categoryLabels[tour.category] ?? "Experiencia" }}
            </span>
          </div>
          <div class="flex flex-1 flex-col p-3.5">
            <h2
              class="line-clamp-2 text-sm font-semibold leading-5 text-gray-900"
              :title="tour.title"
            >
              {{ tour.title }}
            </h2>
            <p class="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
              {{ tour.description }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div
                class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5"
                :title="tour.meetingLocation?.city || 'Ciudad por confirmar'"
              >
                <MapPin :size="15" class="shrink-0 text-gray-400" />
                <span class="truncate">
                  {{ tour.meetingLocation?.city || "Ciudad por confirmar" }}
                </span>
              </div>
              <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Clock :size="15" class="shrink-0 text-gray-400" />
                <span>{{ formatDuration(tour.durationMinutes) }}</span>
              </div>
            </div>
            <div
              class="mt-auto mt-4 flex items-end justify-between gap-2 border-t border-gray-100 pt-4"
            >
              <div class="min-w-0">
                <p class="text-xs text-gray-500">Precio por persona</p>
                <p class="mt-0.5 text-lg font-bold tracking-tight text-gray-950">
                  ${{ formatPrice(tour.price) }}
                  <span class="text-xs font-normal text-gray-500">COP</span>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  :aria-label="`Editar ${tour.title}`"
                  @click="editTour(tour.id)"
                >
                  <Pencil :size="15" />
                  Editar
                </button>
                <button
                  type="button"
                  class="inline-flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :aria-label="`Eliminar ${tour.title}`"
                  :title="`Eliminar ${tour.title}`"
                  :disabled="deletingTourId === tour.id"
                  @click="deleteTour(tour)"
                >
                  <LoaderCircle v-if="deletingTourId === tour.id" :size="16" class="animate-spin" />
                  <Trash2 v-else :size="16" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
