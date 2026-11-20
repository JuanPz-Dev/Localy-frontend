<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { X } from "lucide-vue-next";
import api from "@/api/api";
import type { PaymentMethod, PaymentResponse, Reservation } from "@/types/reservation";
import { formatCurrency } from "@/utils/format";
import { errorMessage } from "@/utils/errors";

type CardField = "cardNumber" | "cardholder" | "expiry" | "securityCode";

const props = defineProps<{ reservation: Reservation | null }>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "paid"): void;
}>();

const paymentMethods: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "CREDIT_CARD", label: "Crédito", description: "Tarjeta de crédito" },
  { value: "DEBIT_CARD", label: "Débito", description: "Tarjeta de débito" },
];

const dialog = ref<HTMLDialogElement | null>(null);
const cardNumberInput = ref<HTMLInputElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const selectedPaymentMethod = ref<PaymentMethod>("CREDIT_CARD");
const processing = ref(false);
const paymentError = ref("");
const cardNumber = ref("");
const cardholder = ref("");
const expiry = ref("");
const securityCode = ref("");

const cardErrors = ref<Record<CardField, string>>({
  cardNumber: "",
  cardholder: "",
  expiry: "",
  securityCode: "",
});

watch(
  () => props.reservation,
  async (reservation) => {
    const el = dialog.value;
    if (!el) return;

    if (reservation) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      resetForm();

      if (!el.open) el.showModal();

      document.body.classList.add("overflow-hidden");

      await nextTick();
      cardNumberInput.value?.focus();
    } else if (el.open) {
      el.close();
    }
  },
);

function requestClose() {
  if (processing.value) return;
  dialog.value?.close();
}

function onNativeCancel(event: Event) {
  event.preventDefault();
  requestClose();
}

function onNativeClose() {
  document.body.classList.remove("overflow-hidden");
  resetForm();
  emit("close");

  void nextTick(() => previouslyFocused?.focus());
  previouslyFocused = null;
}

/* ---------- formulario ---------- */

function clearCardFields() {
  cardNumber.value = "";
  cardholder.value = "";
  expiry.value = "";
  securityCode.value = "";

  cardErrors.value = {
    cardNumber: "",
    cardholder: "",
    expiry: "",
    securityCode: "",
  };
}

function resetForm() {
  clearCardFields();
  selectedPaymentMethod.value = "CREDIT_CARD";
  paymentError.value = "";
}

function formatCardNumberInput(event: Event) {
  const input = event.target as HTMLInputElement;

  cardNumber.value = (
    input.value
      .replace(/\D/g, "")
      .slice(0, 16)
      .match(/.{1,4}/g) ?? []
  ).join(" ");

  cardErrors.value.cardNumber = "";
}

function formatExpiryInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, "").slice(0, 4);

  expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

  cardErrors.value.expiry = "";
}

function clearCardError(field: CardField) {
  cardErrors.value[field] = "";
}

function validateCardForm(): boolean {
  const digits = cardNumber.value.replace(/\D/g, "");
  const [monthText, yearText] = expiry.value.split("/");

  const month = Number(monthText);
  const year = Number(yearText);

  const now = new Date();
  const currentYear = now.getFullYear() % 100;

  const errors: Record<CardField, string> = {
    cardNumber: digits.length === 16 ? "" : "Ingresa los 16 dígitos de la tarjeta.",

    cardholder: cardholder.value.trim().length >= 2 ? "" : "Ingresa el nombre del titular.",

    expiry: "",

    securityCode: /^\d{3,4}$/.test(securityCode.value)
      ? ""
      : "Ingresa un código de seguridad válido.",
  };

  if (!/^\d{2}\/\d{2}$/.test(expiry.value) || month < 1 || month > 12) {
    errors.expiry = "Ingresa una fecha válida en formato MM/AA.";
  } else if (year < currentYear || (year === currentYear && month < now.getMonth() + 1)) {
    errors.expiry = "La fecha debe ser actual o futura.";
  }

  cardErrors.value = errors;

  return Object.values(errors).every((error) => error === "");
}

/* ---------- pago ---------- */

async function submit() {
  const reservation = props.reservation;

  if (!reservation || reservation.status !== "PENDING" || processing.value) {
    return;
  }

  if (!validateCardForm()) return;

  paymentError.value = "";
  processing.value = true;

  try {
    const response = await api.post<PaymentResponse>(`/payments/reservation/${reservation.id}`, {
      paymentMethod: selectedPaymentMethod.value,
    });

    if (response.data.paymentStatus !== "PAID") {
      throw new Error("El servidor no confirmó el pago.");
    }

    emit("paid");
  } catch (error) {
    paymentError.value = errorMessage(error, "No se pudo procesar el pago.");
  } finally {
    processing.value = false;
    clearCardFields();
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl bg-transparent p-0 text-left text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    aria-labelledby="payment-dialog-title"
    aria-describedby="payment-dialog-description"
    @click.self="requestClose"
    @cancel="onNativeCancel"
    @close="onNativeClose"
  >
    <div class="flex max-h-[92dvh] flex-col rounded-3xl bg-white">
      <!-- Cabecera -->
      <header
        class="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-8"
      >
        <div>
          <h2 id="payment-dialog-title" class="text-2xl font-bold tracking-tight">
            Completa tu pago
          </h2>

          <p id="payment-dialog-description" class="mt-1 text-sm text-slate-600">
            Confirma los datos de tu reserva para continuar.
          </p>
        </div>

        <button
          type="button"
          class="ml-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Cerrar ventana de pago"
          :disabled="processing"
          @click="requestClose"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </header>

      <!-- Contenido -->
      <div v-if="reservation" class="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-8">
        <!-- Resumen de reserva -->
        <section class="rounded-2xl bg-slate-50 p-4 sm:p-5" aria-label="Resumen de reserva">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Experiencia
              </p>

              <p class="mt-1 truncate font-semibold text-slate-900">
                {{ reservation.tourName || "Experiencia turística" }}
              </p>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total a pagar
              </p>

              <p class="mt-1 text-xl font-bold text-slate-900">
                {{ formatCurrency(reservation.totalPrice) }}
              </p>
            </div>
          </div>
        </section>

        <!-- Métodos de pago -->
        <fieldset>
          <legend class="mb-3 text-sm font-semibold text-slate-900">Método de pago</legend>

          <div class="grid grid-cols-2 gap-3">
            <label v-for="method in paymentMethods" :key="method.value" class="cursor-pointer">
              <input
                v-model="selectedPaymentMethod"
                class="peer sr-only"
                type="radio"
                name="payment-method"
                :value="method.value"
                :disabled="processing"
                @change="clearCardFields"
              />

              <span
                class="flex min-h-20 flex-col justify-center rounded-xl border border-slate-200 px-3 py-3 text-center transition peer-checked:border-[#075E59] peer-checked:bg-[#075E59]/5 peer-checked:text-[#075E59] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#075E59]"
              >
                <span class="text-sm font-semibold">
                  {{ method.label }}
                </span>

                <span class="mt-1 text-xs text-slate-500">
                  {{ method.description }}
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <!-- Formulario de tarjeta -->
        <form id="payment-form" novalidate @submit.prevent="submit">
          <div class="space-y-4">
            <!-- Número de tarjeta -->
            <div>
              <label for="demo-card-number" class="mb-1.5 block text-sm font-medium text-slate-700">
                Número de tarjeta
              </label>

              <input
                id="demo-card-number"
                ref="cardNumberInput"
                :value="cardNumber"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                maxlength="19"
                placeholder="0000 0000 0000 0000"
                :aria-invalid="Boolean(cardErrors.cardNumber)"
                :aria-describedby="cardErrors.cardNumber ? 'demo-card-number-error' : undefined"
                :class="[
                  'w-full rounded-xl border bg-white px-4 py-3 font-mono tracking-wider outline-none transition focus:ring-2',
                  cardErrors.cardNumber
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-300 focus:border-[#075E59] focus:ring-[#075E59]/10',
                ]"
                :disabled="processing"
                @input="formatCardNumberInput"
              />

              <p
                v-if="cardErrors.cardNumber"
                id="demo-card-number-error"
                class="mt-1 text-xs text-red-700"
                role="alert"
              >
                {{ cardErrors.cardNumber }}
              </p>
            </div>

            <!-- Titular -->
            <div>
              <label for="demo-cardholder" class="mb-1.5 block text-sm font-medium text-slate-700">
                Titular de la tarjeta
              </label>

              <input
                id="demo-cardholder"
                v-model="cardholder"
                type="text"
                autocomplete="off"
                maxlength="80"
                placeholder="NOMBRE DEL TITULAR"
                :aria-invalid="Boolean(cardErrors.cardholder)"
                :aria-describedby="cardErrors.cardholder ? 'demo-cardholder-error' : undefined"
                :class="[
                  'w-full rounded-xl border bg-white px-4 py-3 uppercase outline-none transition focus:ring-2',
                  cardErrors.cardholder
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-300 focus:border-[#075E59] focus:ring-[#075E59]/10',
                ]"
                :disabled="processing"
                @input="clearCardError('cardholder')"
              />

              <p
                v-if="cardErrors.cardholder"
                id="demo-cardholder-error"
                class="mt-1 text-xs text-red-700"
                role="alert"
              >
                {{ cardErrors.cardholder }}
              </p>
            </div>

            <!-- Vencimiento y CVV -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="demo-expiry" class="mb-1.5 block text-sm font-medium text-slate-700">
                  Vencimiento
                </label>

                <input
                  id="demo-expiry"
                  :value="expiry"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="5"
                  placeholder="MM/AA"
                  :aria-invalid="Boolean(cardErrors.expiry)"
                  :aria-describedby="cardErrors.expiry ? 'demo-expiry-error' : undefined"
                  :class="[
                    'w-full rounded-xl border bg-white px-4 py-3 font-mono outline-none transition focus:ring-2',
                    cardErrors.expiry
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-[#075E59] focus:ring-[#075E59]/10',
                  ]"
                  :disabled="processing"
                  @input="formatExpiryInput"
                />

                <p
                  v-if="cardErrors.expiry"
                  id="demo-expiry-error"
                  class="mt-1 text-xs text-red-700"
                  role="alert"
                >
                  {{ cardErrors.expiry }}
                </p>
              </div>

              <div>
                <label
                  for="demo-security-code"
                  class="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Código de seguridad
                </label>

                <input
                  id="demo-security-code"
                  v-model="securityCode"
                  type="password"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="4"
                  placeholder="•••"
                  :aria-invalid="Boolean(cardErrors.securityCode)"
                  :aria-describedby="
                    cardErrors.securityCode ? 'demo-security-code-error' : undefined
                  "
                  :class="[
                    'w-full rounded-xl border bg-white px-4 py-3 font-mono outline-none transition focus:ring-2',
                    cardErrors.securityCode
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-[#075E59] focus:ring-[#075E59]/10',
                  ]"
                  :disabled="processing"
                  @input="clearCardError('securityCode')"
                />

                <p
                  v-if="cardErrors.securityCode"
                  id="demo-security-code-error"
                  class="mt-1 text-xs text-red-700"
                  role="alert"
                >
                  {{ cardErrors.securityCode }}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Pie -->
      <footer class="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-8">
        <div
          v-if="paymentError"
          class="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
          aria-live="assertive"
        >
          {{ paymentError }}
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="processing"
            @click="requestClose"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="payment-form"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075E59] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064c48] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="processing || reservation?.status !== 'PENDING'"
          >
            <span
              v-if="processing"
              class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            ></span>
            {{
              processing
                ? "Procesando pago..."
                : `Pagar ${formatCurrency(reservation?.totalPrice ?? 0)}`
            }}
          </button>
        </div>
      </footer>
    </div>
  </dialog>
</template>
