<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { RefreshCw, Search, CalendarX2 } from "lucide-vue-next";
import { useToastStore } from "@/stores/toast";
import api from "@/api/api";

type ReservationStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
type StatusFilter = ReservationStatus | "ALL";

interface GuideReservation {
  id: number;
  tourId: number;
  tourName: string;
  guideName: string;
  touristName: string;
  reservationDate: string;
  startTime: string;
  adults: number;
  children: number;
  basePrice: number;
  commissionAmount: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}

const toastStore = useToastStore();

const reservations = ref<GuideReservation[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const selectedStatus = ref<StatusFilter>("ALL");
const search = ref("");

// Paginación
const currentPage = ref(0);
const pageSize = 10;
const totalElements = ref(0);
const hasMore = ref(true);

// Elemento que detecta cuando llegamos al final
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Pagadas", value: "PAID" },
  { label: "Canceladas", value: "CANCELLED" },
];

const statusMeta: Record<ReservationStatus, { label: string; dot: string; text: string }> = {
  PENDING: {
    label: "Pendiente",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  PAID: {
    label: "Pagada",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  COMPLETED: {
    label: "Completada",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  CANCELLED: {
    label: "Cancelada",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
};

const fallbackMeta = {
  label: "Sin estado",
  dot: "bg-slate-400",
  text: "text-slate-600",
};
const loadReservations = async () => {
  if (loading.value || loadingMore.value) return;

  loading.value = true;

  currentPage.value = 0;
  totalElements.value = 0;
  hasMore.value = true;
  reservations.value = [];

  try {
    const { data } = await api.get("/reservations/guide", {
      params: {
        page: 0,
        size: pageSize,
      },
    });
    const content: GuideReservation[] = Array.isArray(data?.content) ? data.content : [];
    reservations.value = content;
    totalElements.value = Number(data?.totalElements ?? content.length);
    currentPage.value = Number(data?.page ?? 0);
    hasMore.value = reservations.value.length < totalElements.value;
  } catch {
    toastStore.showToast("No fue posible cargar las reservas recibidas.", "error");
  } finally {
    loading.value = false;
  }
};
const loadMoreReservations = async () => {
  if (loading.value || loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  const nextPage = currentPage.value + 1;

  try {
    const { data } = await api.get("/reservations/guide", {
      params: {
        page: nextPage,
        size: pageSize,
      },
    });
    const content: GuideReservation[] = Array.isArray(data?.content) ? data.content : [];
    const existingIds = new Set(reservations.value.map((r) => r.id));
    const newReservations = content.filter((reservation) => !existingIds.has(reservation.id));
    reservations.value.push(...newReservations);
    currentPage.value = Number(data?.page ?? nextPage);
    totalElements.value = Number(data?.totalElements ?? totalElements.value);
    hasMore.value = reservations.value.length < totalElements.value;
  } catch {
    toastStore.showToast("No fue posible cargar más reservas.", "error");
  } finally {
    loadingMore.value = false;
  }
};

const counts = computed(() => {
  const result: Record<StatusFilter, number> = {
    ALL: reservations.value.length,
    PENDING: 0,
    PAID: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  for (const r of reservations.value) {
    if (r.status in result) {
      result[r.status]++;
    }
  }
  return result;
});

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  return reservations.value.filter((r) => {
    const matchesStatus = selectedStatus.value === "ALL" || r.status === selectedStatus.value;
    const matchesSearch =
      !term ||
      r.touristName?.toLowerCase().includes(term) ||
      r.tourName?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });
});

const hasFilters = computed(() => !!search.value || selectedStatus.value !== "ALL");

const clearFilters = () => {
  search.value = "";
  selectedStatus.value = "ALL";
};

const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const toLocalDate = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatPrice = (price?: number) => priceFormatter.format(price ?? 0);

const guideEarnings = (reservation: GuideReservation) => {
  return Math.max(
    0,
    Number(reservation.basePrice ?? reservation.totalPrice ?? 0) -
      Number(reservation.commissionAmount ?? 0),
  );
};
const paidReservations = computed(() => reservations.value.filter((r) => r.status === "PAID"));
const pendingReservations = computed(() =>
  reservations.value.filter((r) => r.status === "PENDING"),
);
const paidEarnings = computed(() =>
  paidReservations.value.reduce((total, r) => total + guideEarnings(r), 0),
);
const pendingEarnings = computed(() =>
  pendingReservations.value.reduce((total, r) => total + guideEarnings(r), 0),
);
const paidCommissions = computed(() =>
  paidReservations.value.reduce((total, r) => total + Number(r.commissionAmount ?? 0), 0),
);

const formatTime = (time?: string) => (time ? time.slice(0, 5) : "--:--");
const dayOf = (date?: string) => (date ? toLocalDate(date).getDate() : "--");
const monthOf = (date?: string) =>
  date ? monthFormatter.format(toLocalDate(date)).replace(".", "") : "";
const fullDate = (date?: string) => (date ? fullDateFormatter.format(toLocalDate(date)) : "");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const totalPeople = (r: GuideReservation) => (r.adults ?? 0) + (r.children ?? 0);

const attendeesDetail = (r: GuideReservation) => {
  const parts = [plural(r.adults ?? 0, "adulto", "adultos")];

  if (r.children) {
    parts.push(plural(r.children, "niño", "niños"));
  }

  return parts.join(" y ");
};

// Inicializar el detector de desplazamiento
onMounted(() => {
  loadReservations();

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry?.isIntersecting) {
        loadMoreReservations();
      }
    },
    {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    },
  );
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>
<template>
  <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Reservas recibidas</h1>
        <p class="mt-1 text-sm text-slate-500">
          Quién reservó tus experiencias, cuándo van y cuántas personas asisten.
        </p>
      </div>
      <button
        type="button"
        :disabled="loading || loadingMore"
        class="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-50"
        @click="loadReservations"
      >
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" aria-hidden="true" />
        Actualizar
      </button>
    </header>
    <section class="mt-6">
      <h2 class="mb-3 text-sm font-semibold text-slate-900">Resumen de ganancias</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-sm text-slate-500">Ganancias de reservas pagadas</p>
          <p class="mt-2 text-2xl font-semibold text-emerald-700">
            {{ formatPrice(paidEarnings) }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-sm text-slate-500">Ganancias pendientes</p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ formatPrice(pendingEarnings) }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-sm text-slate-500">Comisiones de Localy</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            {{ formatPrice(paidCommissions) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">De reservas pagadas</p>
        </div>
      </div>
    </section>
    <dl class="mt-6 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200">
      <div class="px-4 py-4 first:pl-0">
        <dt class="text-sm text-slate-500">Total</dt>
        <dd class="mt-1 text-2xl font-semibold text-slate-900">
          {{ counts.ALL }}
        </dd>
      </div>
      <div class="px-4 py-4">
        <dt class="text-sm text-slate-500">Pendientes</dt>
        <dd class="mt-1 text-2xl font-semibold text-amber-600">
          {{ counts.PENDING }}
        </dd>
      </div>
      <div class="px-4 py-4">
        <dt class="text-sm text-slate-500">Pagadas</dt>
        <dd class="mt-1 text-2xl font-semibold text-emerald-600">
          {{ counts.PAID }}
        </dd>
      </div>
    </dl>
    <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div
        class="-mb-px flex gap-5 overflow-x-auto border-b border-slate-200"
        role="group"
        aria-label="Filtrar por estado"
      >
        <button
          v-for="option in statusFilters"
          :key="option.value"
          type="button"
          :aria-pressed="selectedStatus === option.value"
          class="whitespace-nowrap border-b-2 pb-3 text-sm transition"
          :class="
            selectedStatus === option.value
              ? 'border-teal-700 font-semibold text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          "
          @click="selectedStatus = option.value"
        >
          {{ option.label }}
          <span class="ml-1 text-slate-400">
            {{ counts[option.value] }}
          </span>
        </button>
      </div>
      <div class="relative md:w-72">
        <label for="reservation-search" class="sr-only"> Buscar reservas </label>
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="reservation-search"
          v-model="search"
          type="search"
          placeholder="Buscar turista o experiencia"
          class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </div>
    </div>
    <div v-if="loading && reservations.length === 0" class="py-20 text-center" role="status">
      <RefreshCw class="mx-auto h-6 w-6 animate-spin text-teal-700" aria-hidden="true" />
      <p class="mt-3 text-sm text-slate-500">Cargando reservas...</p>
    </div>
    <div v-else-if="filteredReservations.length === 0" class="py-20 text-center">
      <CalendarX2 class="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
      <h2 class="mt-3 font-medium text-slate-800">
        {{ reservations.length === 0 ? "Aún no tienes reservas" : "Ninguna reserva coincide" }}
      </h2>
      <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        {{
          reservations.length === 0
            ? "Cuando un turista reserve una de tus experiencias, la verás aquí."
            : "Prueba con otro nombre o cambia el estado seleccionado."
        }}
      </p>
      <button
        v-if="hasFilters"
        type="button"
        class="mt-4 text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
        @click="clearFilters"
      >
        Quitar filtros
      </button>
    </div>
    <ul v-else class="divide-y divide-slate-200 border-b border-slate-200">
      <li
        v-for="reservation in filteredReservations"
        :key="reservation.id"
        class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-x-6"
      >
        <time
          :datetime="reservation.reservationDate"
          :title="fullDate(reservation.reservationDate)"
          class="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-teal-50 text-teal-900"
        >
          <span class="text-xl font-semibold leading-none">
            {{ dayOf(reservation.reservationDate) }}
          </span>
          <span class="mt-1 text-xs capitalize leading-none">
            {{ monthOf(reservation.reservationDate) }}
          </span>
        </time>
        <div class="min-w-0">
          <h2 class="truncate font-medium text-slate-900">
            {{ reservation.tourName }}
          </h2>
          <p class="mt-0.5 truncate text-sm text-slate-500">
            Reservó {{ reservation.touristName }}
          </p>
          <p
            class="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium"
            :class="(statusMeta[reservation.status] ?? fallbackMeta).text"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="(statusMeta[reservation.status] ?? fallbackMeta).dot"
              aria-hidden="true"
            ></span>
            {{ (statusMeta[reservation.status] ?? fallbackMeta).label }}
          </p>
        </div>
        <div class="col-span-2 text-sm sm:col-span-1 sm:min-w-44">
          <p class="text-slate-800">
            {{ formatTime(reservation.startTime) }} h,
            {{ plural(totalPeople(reservation), "persona", "personas") }}
          </p>
          <p class="mt-0.5 text-slate-500">
            {{ attendeesDetail(reservation) }}
          </p>
        </div>
        <div class="col-span-2 text-sm sm:col-span-1 sm:text-right">
          <p class="font-semibold text-slate-900">
            {{ formatPrice(reservation.totalPrice) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Comisión Localy (10%):
            {{ formatPrice(reservation.commissionAmount) }}
          </p>
          <p class="mt-1 text-xs font-semibold text-emerald-700">
            Ganancia estimada:
            {{ formatPrice(guideEarnings(reservation)) }}
          </p>
        </div>
      </li>
    </ul>
    <div ref="loadMoreTrigger" class="min-h-8 py-6 text-center" aria-live="polite">
      <div v-if="loadingMore" class="flex items-center justify-center gap-2">
        <RefreshCw class="h-4 w-4 animate-spin text-teal-700" />
        <span class="text-sm text-slate-500"> Cargando más reservas... </span>
      </div>

      <p v-else-if="!hasMore && reservations.length > 0" class="text-sm text-slate-400">
        Has llegado al final de tus reservas.
      </p>
    </div>
    <p v-if="!loading && filteredReservations.length > 0" class="mt-4 text-sm text-slate-400">
      {{ plural(filteredReservations.length, "reserva", "reservas") }}
      cargadas
    </p>
  </section>
</template>
