<script setup lang="ts">
import { Clock, MapPin, Star } from "lucide-vue-next";
import type { Tour } from "@/types/tour";

const props = defineProps<{
  tour: Tour;
}>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO").format(price);
};

const formatDuration = (minutes: number) => {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} horas`;
  }

  return `${hours} h ${remainingMinutes} min`;
};
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    @click="$router.push(`/tours/${props.tour.id}`)"
  >
    <!-- FOTO -->
    <div class="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
      <img
        v-if="props.tour.photos?.length"
        :src="props.tour.photos[0]"
        :alt="props.tour.title"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">
        Sin imagen disponible
      </div>

      <!-- BADGE CATEGORIA -->
      <div
        class="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur"
      >
        {{
          props.tour.category === "HISTORICAL"
            ? "Historia"
            : props.tour.category === "GASTRONOMIC"
              ? "Gastronomía"
              : props.tour.category === "ISLANDS_AND_BEACHES"
                ? "Playas"
                : props.tour.category === "CULTURAL"
                  ? "Cultura"
                  : "Vida nocturna"
        }}
      </div>
    </div>
    <!-- INFORMACIÓN -->
    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <h3 class="line-clamp-2 text-[15px] font-semibold leading-5 text-gray-900">
          {{ props.tour.title }}
        </h3>
        <div
          v-if="props.tour.averageRating !== null"
          class="flex shrink-0 items-center gap-1 text-sm"
        >
          <Star :size="15" fill="currentColor" class="text-gray-900" />
          <span class="font-medium">
            {{ props.tour.averageRating.toFixed(1) }}
          </span>
        </div>
      </div>
      <!-- CIUDAD -->
      <div class="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin :size="14" />
        {{ props.tour.meetingLocation?.city }}
      </div>
      <!-- DURACION -->
      <div class="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
        <Clock :size="14" />
        {{ formatDuration(props.tour.durationMinutes) }}
      </div>
      <!-- PRECIO -->
      <p class="mt-3 text-sm text-gray-600">
        Desde
        <span class="font-semibold text-gray-950"> ${{ formatPrice(props.tour.price) }} </span>
        <span class="text-gray-500"> COP por persona </span>
      </p>
    </div>
  </article>
</template>
