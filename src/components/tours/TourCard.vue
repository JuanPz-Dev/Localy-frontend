<script setup lang="ts">
import { computed } from "vue";
import { Clock, MapPin, Star } from "lucide-vue-next";
import type { Tour } from "@/types/tour";
import { cloudinaryUrl } from "@/utils/cloudinary";

const props = defineProps<{
  tour: Tour;
  priority?: boolean;
}>();

const formatPrice = (price: number) => new Intl.NumberFormat("es-CO").format(price);
const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) return "Duración por confirmar";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  return `${hours} h ${remainingMinutes} min`;
};

const categoryLabel = computed(() => {
  const categories: Record<string, string> = {
    HISTORICAL: "Historia",
    GASTRONOMIC: "Gastronomía",
    ISLANDS_AND_BEACHES: "Playas",
    CULTURAL: "Cultura",
    NIGHTLIFE: "Vida nocturna",
  };

  return categories[props.tour.category] ?? "Experiencia";
});

const city = computed(() => props.tour.meetingLocation?.city?.trim() || "Cartagena");

const hasRating = computed(
  () =>
    props.tour.averageRating != null &&
    Number.isFinite(props.tour.averageRating) &&
    props.tour.averageRating > 0,
);
</script>
<template>
  <article
    class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-900/5 focus-within:ring-2 focus-within:ring-gray-900"
    role="link"
    tabindex="0"
    :aria-label="`Ver experiencia: ${props.tour.title}`"
    @click="$router.push(`/tours/${props.tour.id}`)"
    @keydown.enter="$router.push(`/tours/${props.tour.id}`)"
    @keydown.space.prevent="$router.push(`/tours/${props.tour.id}`)"
  >
    <div class="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100">
      <img
        v-if="props.tour.photos?.length && props.tour.photos[0]"
        :src="cloudinaryUrl(props.tour.photos[0], 800)"
        :srcset="`${cloudinaryUrl(props.tour.photos[0], 400)} 400w, ${cloudinaryUrl(props.tour.photos[0], 800)} 800w`"
        sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 100vw"
        :alt="props.tour.title"
        width="800"
        height="600"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
        {{ categoryLabel }}
      </span>
      <div
        v-if="hasRating"
        class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur"
        :aria-label="`Calificación ${props.tour.averageRating!.toFixed(1)} de 5`"
      >
        <Star :size="14" fill="currentColor" class="text-amber-500" />
        {{ props.tour.averageRating!.toFixed(1) }}
      </div>
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <h3
        class="line-clamp-2 min-h-10 text-base font-semibold leading-5 tracking-tight text-gray-900 transition-colors group-hover:text-gray-600"
      >
        {{ props.tour.title }}
      </h3>
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div class="flex min-w-0 items-center gap-1.5 text-sm text-gray-500" :title="city">
          <MapPin :size="15" class="shrink-0 text-gray-400" />
          <span class="truncate">{{ city }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock :size="15" class="shrink-0 text-gray-400" />
          <span>{{ formatDuration(props.tour.durationMinutes) }}</span>
        </div>
      </div>
      <div class="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4 mt-4">
        <div class="min-w-0">
          <p class="text-xs text-gray-500">Desde</p>
          <p class="mt-0.5 flex flex-wrap items-baseline gap-x-1">
            <span class="text-lg font-bold tracking-tight text-gray-950">
              ${{ formatPrice(props.tour.price) }}
            </span>
            <span class="text-xs text-gray-500">COP / persona</span>
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
