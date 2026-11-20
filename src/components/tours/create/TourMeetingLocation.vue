<script setup lang="ts">
import { Clock } from "lucide-vue-next";
import MeetingLocationMap from "@/components/tours/MeetingLocationMap.vue";
interface MeetingLocation {
  meetingAddress: string;
  latitude: number;
  longitude: number;
}
const durationMinutes = defineModel<number | null>("durationMinutes", {
  required: true,
});
const emit = defineEmits<{
  "location-selected": [location: MeetingLocation];
}>();
</script>
<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-5 py-6 sm:px-7">
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <Clock :size="21" :stroke-width="1.8" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-slate-900">Detalles del encuentro</h2>
          <p class="mt-1 text-sm leading-5 text-slate-500">
            Define cuánto dura la experiencia y dónde comienza.
          </p>
        </div>
      </div>
    </div>
    <div class="grid gap-6 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-2">
      <div>
        <label for="durationMinutes" class="mb-2 block text-sm font-semibold text-slate-700">
          Duración de la experiencia
        </label>
        <div class="relative">
          <Clock
            :size="18"
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            id="durationMinutes"
            v-model.number="durationMinutes"
            class="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5"
          >
            <option :value="null" disabled>Selecciona la duración</option>
            <option :value="60">1 hora</option>
            <option :value="90">1 hora 30 minutos</option>
            <option :value="120">2 horas</option>
            <option :value="180">3 horas</option>
            <option :value="240">4 horas</option>
            <option :value="300">5 horas</option>
          </select>
        </div>
      </div>
      <div class="md:col-span-2">
        <label class="mb-2 block text-sm font-semibold text-slate-700"> Punto de encuentro </label>
        <p class="mb-3 text-sm text-slate-500">
          Haz clic en el mapa para marcar dónde se encontrarán con los viajeros.
        </p>
        <MeetingLocationMap @location-selected="emit('location-selected', $event)" />
      </div>
    </div>
  </section>
</template>
