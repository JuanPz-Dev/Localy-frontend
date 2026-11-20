<script setup lang="ts">
import { Plus, Trash2, Clock } from "lucide-vue-next";
type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
interface Schedule {
  day: DayOfWeek | "";
  startTime: string;
}
const schedules = defineModel<Schedule[]>({ required: true });
const days: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];
function addSchedule() {
  schedules.value = [...schedules.value, { day: "", startTime: "" }];
}
function removeSchedule(index: number) {
  schedules.value = schedules.value.filter((_, i) => i !== index);
}
</script>
<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div
      class="flex flex-col gap-4 border-b border-slate-100 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <Clock :size="21" :stroke-width="1.8" />
        </div>
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-900">
            Horarios disponibles
          </h2>
          <p class="mt-1 max-w-md text-sm leading-5 text-slate-500">
            Define los días y las horas en que los viajeros podrán reservar tu experiencia.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="addSchedule"
        class="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 active:scale-[0.98] sm:self-auto"
      >
        <Plus :size="17" :stroke-width="2.2" />
        Agregar horario
      </button>
    </div>
    <div class="px-5 py-6 sm:px-7 sm:py-7">
      <div
        v-if="schedules.length === 0"
        class="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center sm:py-12"
      >
        <div
          class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200"
        >
          <Clock :size="26" :stroke-width="1.6" />
        </div>
        <h3 class="text-sm font-semibold text-slate-800">Todavía no tienes horarios</h3>
        <p class="mt-1.5 max-w-xs text-sm leading-6 text-slate-500">
          Añade al menos un día y una hora para que los viajeros puedan elegir cuándo disfrutar tu
          experiencia.
        </p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(schedule, index) in schedules"
          :key="index"
          class="group rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300 hover:shadow-sm sm:p-5"
        >
          <div
            class="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.65fr)_44px] sm:items-end"
          >
            <div class="min-w-0">
              <label
                :for="`schedule-day-${index}`"
                class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Día de la semana
              </label>
              <select
                :id="`schedule-day-${index}`"
                v-model="schedule.day"
                class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="" disabled>Selecciona un día</option>
                <option v-for="day in days" :key="day.value" :value="day.value">
                  {{ day.label }}
                </option>
              </select>
            </div>
            <div class="min-w-0">
              <label
                :for="`schedule-time-${index}`"
                class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Hora de inicio
              </label>
              <input
                :id="`schedule-time-${index}`"
                v-model="schedule.startTime"
                type="time"
                class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>
            <button
              type="button"
              :aria-label="`Eliminar horario ${index + 1}`"
              title="Eliminar horario"
              @click="removeSchedule(index)"
              class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:h-12 sm:w-11"
            >
              <Trash2 :size="18" :stroke-width="1.8" />
              <span class="text-sm font-medium sm:hidden"> Eliminar horario </span>
            </button>
          </div>
        </div>
        <div class="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3.5">
          <Clock :size="16" class="mt-0.5 shrink-0 text-slate-500" />
          <p class="text-xs leading-5 text-slate-500">
            Configura los horarios reales en los que puedes atender reservas. Verifica que cada
            horario tenga un día y una hora de inicio.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
