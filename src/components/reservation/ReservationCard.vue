<script setup lang="ts">
import api from "@/api/api";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast.ts";
import {
  CalendarDays,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
  Minus,
  Plus,
} from "lucide-vue-next";
import axios from "axios";

const toastStore = useToastStore();
const route = useRoute();

interface Schedule {
  day: string;
  startTime: string;
}
const props = defineProps<{
  price: number;
  schedules: Schedule[];
}>();
type Section = "date" | "time" | "participants";

const openSection = ref<Section | null>(null);
const selectedDate = ref("");
const selectedSchedule = ref("");
const adults = ref(1);
const children = ref(0);

function toggle(section: Section) {
  openSection.value = openSection.value === section ? null : section;
}
const CHILD_PRICE_FACTOR = 1;

const formatCOP = (value: number) => value.toLocaleString("es-CO");
const formattedPrice = computed(() => formatCOP(Number(props.price)));
const participants = computed(() => adults.value + children.value);

const totalPrice = computed(() => {
  const unit = Number(props.price) || 0;
  return adults.value * unit + children.value * unit * CHILD_PRICE_FACTOR;
});
const formattedTotal = computed(() => formatCOP(totalPrice.value));
const WEEK_KEYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const weekHeaders = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const dayLabels: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};
function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const viewMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));

const monthLabel = computed(() => {
  const label = viewMonth.value.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
});

const canGoPrev = computed(
  () =>
    viewMonth.value.getFullYear() > today.getFullYear() ||
    viewMonth.value.getMonth() > today.getMonth(),
);

function changeMonth(step: number) {
  if (step < 0 && !canGoPrev.value) return;
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + step, 1);
}
const availableWeekdays = computed(() => new Set(props.schedules.map((s) => s.day)));

interface CalendarCell {
  key: string;
  day: number | null;
  date: string;
  disabled: boolean;
}
const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewMonth.value.getFullYear();
  const month = viewMonth.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < offset; i++) {
    cells.push({ key: `blank-${i}`, day: null, date: "", disabled: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isPast = date < today;
    const hasSchedule = availableWeekdays.value.has(WEEK_KEYS[date.getDay()] ?? "");
    cells.push({
      key: toDateString(date),
      day,
      date: toDateString(date),
      disabled: isPast || !hasSchedule,
    });
  }
  return cells;
});
const selectedDay = computed(() => {
  if (!selectedDate.value) return "";
  const date = new Date(`${selectedDate.value}T00:00:00`);
  return WEEK_KEYS[date.getDay()] ?? "";
});
const availableSchedules = computed(() =>
  selectedDay.value ? props.schedules.filter((s) => s.day === selectedDay.value) : [],
);
const formatTime = (time: string) => time.substring(0, 5);
const dateLabel = computed(() => {
  if (!selectedDate.value) return "Seleccionar fecha";
  const date = new Date(`${selectedDate.value}T00:00:00`);
  const text = date.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
});

const timeLabel = computed(() =>
  selectedSchedule.value ? formatTime(selectedSchedule.value) : "Seleccionar hora",
);

function selectDate(cell: CalendarCell) {
  if (cell.disabled || !cell.day) return;
  if (selectedDate.value !== cell.date) {
    selectedDate.value = cell.date;
    selectedSchedule.value = "";
  }
  openSection.value = "time";
}

function selectTime(time: string) {
  selectedSchedule.value = time;
  openSection.value = "participants";
}

function changeAdults(step: number) {
  adults.value = Math.max(1, adults.value + step);
}

function changeChildren(step: number) {
  children.value = Math.max(0, children.value + step);
}

async function createReservation() {
  if (!selectedDate.value) {
    toastStore.showToast("Selecciona una fecha", "error");
    openSection.value = "date";
    return;
  }
  if (!selectedSchedule.value) {
    toastStore.showToast("Selecciona un horario", "error");
    openSection.value = "time";
    return;
  }
  if (adults.value < 1) {
    toastStore.showToast("Debe haber al menos un adulto", "error");
    return;
  }
  try {
    const tourServiceId = route.params.id;
    const reservationRequest = {
      reservationDate: selectedDate.value,
      startTime: selectedSchedule.value,
      adults: adults.value,
      children: children.value,
    };
    await api.post(`/reservations/tour/${tourServiceId}`, reservationRequest);
    toastStore.showToast("Reserva creada correctamente", "success");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      toastStore.showToast("Debes iniciar sesión para reservar", "error");
      return;
    }
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      toastStore.showToast("No puedes reservar tus servicios", "error");
      return;
    }
    toastStore.showToast("No fue posible crear la reserva. Inténtalo nuevamente.", "error");
  }
}
</script>
<template>
  <div class="sticky top-24 w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
    <p class="text-sm text-gray-500">Desde</p>
    <div class="mt-1 flex items-baseline">
      <span class="text-3xl font-semibold text-gray-900"> COP {{ formattedPrice }} </span>
      <span class="ml-2 text-sm text-gray-500"> por persona </span>
    </div>
    <form @submit.prevent="createReservation" class="mt-4">
      <div class="border-t border-gray-200">
        <button
          type="button"
          class="flex w-full items-center gap-3 py-4 text-left"
          :aria-expanded="openSection === 'date'"
          @click="toggle('date')"
        >
          <CalendarDays class="h-5 w-5 shrink-0 text-gray-700" />
          <span class="flex-1 text-gray-900">{{ dateLabel }}</span>
          <component
            :is="openSection === 'date' ? ChevronUp : ChevronDown"
            class="h-5 w-5 text-gray-700"
          />
        </button>
        <div v-if="openSection === 'date'" class="pb-4">
          <div class="mb-3 flex items-center justify-between px-1">
            <button
              type="button"
              class="rounded-full p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              :disabled="!canGoPrev"
              aria-label="Mes anterior"
              @click="changeMonth(-1)"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>
            <span class="text-gray-800">{{ monthLabel }}</span>
            <button
              type="button"
              class="rounded-full p-1 text-gray-600 hover:bg-gray-100"
              aria-label="Mes siguiente"
              @click="changeMonth(1)"
            >
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>
          <div class="grid grid-cols-7 gap-y-1 text-center">
            <span
              v-for="header in weekHeaders"
              :key="header"
              class="pb-2 text-sm font-semibold text-[#14B8A6]"
            >
              {{ header }}
            </span>
            <template v-for="cell in calendarCells" :key="cell.key">
              <span v-if="!cell.day" />
              <button
                v-else
                type="button"
                :disabled="cell.disabled"
                :class="[
                  'mx-auto h-9 w-9 rounded-full text-sm transition',
                  cell.disabled
                    ? 'cursor-not-allowed text-gray-400 line-through'
                    : selectedDate === cell.date
                      ? 'bg-cyan-700 font-semibold text-white'
                      : 'text-gray-900 hover:bg-cyan-50',
                ]"
                @click="selectDate(cell)"
              >
                {{ cell.day }}
              </button>
            </template>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200">
        <button
          type="button"
          class="flex w-full items-center gap-3 py-4 text-left"
          :aria-expanded="openSection === 'time'"
          @click="toggle('time')"
        >
          <Clock class="h-5 w-5 shrink-0 text-gray-700" />
          <span class="flex-1 text-gray-900">{{ timeLabel }}</span>
          <component
            :is="openSection === 'time' ? ChevronUp : ChevronDown"
            class="h-5 w-5 text-gray-700"
          />
        </button>
        <div v-if="openSection === 'time'" class="pb-4">
          <div
            v-if="!selectedDate"
            class="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-500"
          >
            Primero selecciona la fecha
          </div>
          <div
            v-else-if="availableSchedules.length === 0"
            class="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500"
          >
            El guía no tiene horarios disponibles para {{ dayLabels[selectedDay] }}.
          </div>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="schedule in availableSchedules"
              :key="`${schedule.day}-${schedule.startTime}`"
              type="button"
              :class="[
                'rounded-full border px-3 py-2 text-sm transition',
                selectedSchedule === schedule.startTime
                  ? 'border-cyan-700 bg-cyan-700 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-600',
              ]"
              @click="selectTime(schedule.startTime)"
            >
              {{ formatTime(schedule.startTime) }}
            </button>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200">
        <button
          type="button"
          class="flex w-full items-center gap-3 py-4 text-left"
          :aria-expanded="openSection === 'participants'"
          @click="toggle('participants')"
        >
          <Users class="h-5 w-5 shrink-0 text-gray-700" />
          <span class="flex-1 text-gray-900">Participantes: {{ participants }}</span>
          <component
            :is="openSection === 'participants' ? ChevronUp : ChevronDown"
            class="h-5 w-5 text-gray-700"
          />
        </button>
        <div v-if="openSection === 'participants'" class="space-y-3 pb-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-800">Adultos</span>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full border border-gray-300 text-gray-700 hover:border-cyan-600 disabled:opacity-30"
                :disabled="adults <= 1"
                aria-label="Quitar un adulto"
                @click="changeAdults(-1)"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="w-5 text-center text-gray-900">{{ adults }}</span>
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full border border-gray-300 text-gray-700 hover:border-cyan-600"
                aria-label="Agregar un adulto"
                @click="changeAdults(1)"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-800">Niños</span>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full border border-gray-300 text-gray-700 hover:border-cyan-600 disabled:opacity-30"
                :disabled="children <= 0"
                aria-label="Quitar un niño"
                @click="changeChildren(-1)"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="w-5 text-center text-gray-900">{{ children }}</span>
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full border border-gray-300 text-gray-700 hover:border-cyan-600"
                aria-label="Agregar un niño"
                @click="changeChildren(1)"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-end justify-between border-t border-gray-200 pt-4">
        <div>
          <p class="text-sm text-gray-500">Total</p>
          <p class="text-xs text-gray-400">
            {{ participants }} {{ participants === 1 ? "participante" : "participantes" }}
          </p>
        </div>
        <p class="text-2xl font-semibold text-gray-900">COP {{ formattedTotal }}</p>
      </div>
      <p class="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Info class="h-3.5 w-3.5 shrink-0" />
        Precios mostrados en pesos colombianos (COP)
      </p>
      <button
        type="submit"
        class="mt-4 w-full rounded-full bg-[#14B8A6] py-3 font-semibold text-white transition hover:bg-[#0F766E] cursor-pointer"
      >
        Reservar ahora
      </button>
    </form>
  </div>
</template>
