<script setup lang="ts">
import { Compass, CreditCard, ArrowUpRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
defineProps<{
  reservation: Reservation;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: "pay", reservation: Reservation): void;
  (e: "cancel", reservation: Reservation): void;
}>();
const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};
const statusClasses: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
};
</script>
<template>
  <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div
      class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 items-center gap-4">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
          role="img"
          aria-label="Imagen de experiencia no disponible"
        >
          <Compass :size="28" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <h2 class="min-w-0">
            {{ reservation.tourName || "Experiencia turística" }}
          </h2>
          <p v-if="reservation.guideName" class="mt-1 text-sm text-slate-600">
            Guía: {{ reservation.guideName }}
          </p>
        </div>
      </div>
      <span
        class="w-fit rounded-full px-3 py-1 text-sm font-medium"
        :class="statusClasses[reservation.status]"
      >
        {{ statusLabels[reservation.status] ?? reservation.status }}
      </span>
    </div>
    <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</p>
        <p class="mt-1 text-sm font-medium text-slate-900">
          {{ formatDate(reservation.reservationDate) }}
        </p>
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Hora</p>
        <p class="mt-1 text-sm font-medium text-slate-900">
          {{ formatTime(reservation.startTime) }}
        </p>
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Participantes</p>
        <p class="mt-1 text-sm font-medium text-slate-900">
          {{ reservation.adults ?? 0 }} adultos · {{ reservation.children ?? 0 }} niños
        </p>
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Total a pagar</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatCurrency(reservation.totalPrice) }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Precio final de la experiencia</p>
      </div>
    </div>
    <div v-if="reservation.tourId" class="flex justify-end border-t border-slate-100 px-5 py-3">
      <RouterLink
        :to="`/tours/${reservation.tourId}`"
        class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Ver experiencia
        <ArrowUpRight :size="17" aria-hidden="true" />
      </RouterLink>
    </div>
    <div
      v-if="reservation.status === 'PENDING'"
      class="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 p-5"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-[#00a3e0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled"
        @click="emit('pay', reservation)"
      >
        <CreditCard :size="17" aria-hidden="true" />
        Pagar reserva
      </button>
      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled"
        @click="emit('cancel', reservation)"
      >
        Cancelar reserva
      </button>
    </div>
  </article>
</template>
