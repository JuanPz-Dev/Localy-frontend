<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import api from "@/api/api";
import { useToastStore } from "@/stores/toast";
import ReservationCard from "@/components/reservation/MyReservationCard.vue";
import PaymentDialog from "@/components/reservation/PaymentDialog.vue";
import type { PageResult, Reservation } from "@/types/reservation";
import { errorMessage } from "@/utils/errors";
import { useConfirmStore } from "@/stores/confirm";

const confirmStore = useConfirmStore();
const toastStore = useToastStore();

const reservations = ref<Reservation[]>([]);
const page = ref(0);
const pageSize = 10;
const totalElements = ref(0);
const loading = ref(true);
const loadError = ref(false);
const busyReservationId = ref<number | null>(null);
const reservationToPay = ref<Reservation | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / pageSize)));
const actionsDisabled = computed(() => busyReservationId.value !== null || loading.value);

async function loadReservations(showErrorToast = true): Promise<boolean> {
  loading.value = true;
  loadError.value = false;
  try {
    const response = await api.get<PageResult<Reservation>>("/reservations/my", {
      params: { page: page.value, size: pageSize },
    });
    reservations.value = response.data.content;
    totalElements.value = response.data.totalElements;
    return true;
  } catch (error) {
    loadError.value = true;
    if (showErrorToast) {
      toastStore.showToast(errorMessage(error, "No se pudieron cargar tus reservas"), "error");
    }
    return false;
  } finally {
    loading.value = false;
  }
}

async function changePage(nextPage: number) {
  if (nextPage < 0 || nextPage >= totalPages.value || loading.value) return;
  page.value = nextPage;
  await loadReservations();
}

function openPayment(reservation: Reservation) {
  if (reservation.status !== "PENDING" || busyReservationId.value !== null) return;
  reservationToPay.value = reservation;
}

async function onPaid() {
  reservationToPay.value = null;
  toastStore.showToast("Pago simulado confirmado", "success");
  const refreshed = await loadReservations(false);
  if (!refreshed) {
    toastStore.showToast(
      "El pago fue confirmado, pero no se pudo actualizar la reserva. Intenta recargar.",
      "error",
    );
  }
}
async function cancelReservation(reservation: Reservation) {
  const ok = await confirmStore.ask({
    title: "¿Cancelar esta reserva?",
    description: "Esta acción no se puede deshacer.",
    confirmText: "Sí, cancelar",
    cancelText: "Mantener reserva",
  });
  if (!ok) return;
  if (reservation.status !== "PENDING" || busyReservationId.value !== null) return;

  busyReservationId.value = reservation.id;
  try {
    const response = await api.patch<Reservation>(`/reservations/${reservation.id}/cancel`);
    reservations.value = reservations.value.map((item) =>
      item.id === reservation.id ? response.data : item,
    );
    toastStore.showToast("Reserva cancelada", "success");
  } catch (error) {
    toastStore.showToast(errorMessage(error, "No se pudo cancelar la reserva"), "error");
  } finally {
    busyReservationId.value = null;
  }
}

onMounted(loadReservations);
</script>
<template>
  <section class="min-h-screen bg-white px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <header class="mb-8">
        <h2 class="mt-1 text-3xl font-bold text-slate-900">Mis reservas</h2>
        <p class="mt-2 text-slate-600">Consulta tus experiencias y el estado de tus reservas.</p>
      </header>
      <div
        v-if="loading && reservations.length === 0 && !loadError"
        class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600"
      >
        Cargando tus reservas...
      </div>
      <div
        v-else-if="loadError"
        class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        role="alert"
      >
        <p class="font-medium text-red-800">No fue posible cargar tus reservas.</p>
        <button
          type="button"
          class="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          @click="loadReservations()"
        >
          Reintentar
        </button>
      </div>
      <div
        v-else-if="reservations.length === 0"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center"
      >
        <h2 class="text-lg font-semibold text-slate-900">Aún no tienes reservas</h2>
        <p class="mt-2 text-sm text-slate-600">Cuando reserves una experiencia, aparecerá aquí.</p>
        <RouterLink
          to="/"
          class="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Explorar experiencias
        </RouterLink>
      </div>
      <div v-else class="space-y-5">
        <div
          class="space-y-5 transition-opacity"
          :class="{ 'pointer-events-none opacity-60': loading }"
          :aria-busy="loading"
        >
          <ReservationCard
            v-for="reservation in reservations"
            :key="reservation.id"
            :reservation="reservation"
            :disabled="actionsDisabled"
            @pay="openPayment"
            @cancel="cancelReservation"
          />
        </div>

        <nav
          v-if="totalPages > 1"
          class="flex items-center justify-between pt-2"
          aria-label="Paginación de reservas"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 disabled:opacity-40"
            :disabled="page === 0 || loading"
            @click="changePage(page - 1)"
          >
            Anterior
          </button>
          <span class="text-sm text-slate-600">Página {{ page + 1 }} de {{ totalPages }}</span>
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 disabled:opacity-40"
            :disabled="page + 1 >= totalPages || loading"
            @click="changePage(page + 1)"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>

    <PaymentDialog
      :reservation="reservationToPay"
      @close="reservationToPay = null"
      @paid="onPaid"
    />
  </section>
</template>
