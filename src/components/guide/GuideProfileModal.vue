<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import api from "@/api/api";
import { useToastStore } from "@/stores/toast";
import {
  X,
  ShieldCheck,
  Languages,
  Star,
  Clock,
  UserRound,
  Phone,
  MessageCircle,
} from "lucide-vue-next";

interface GuideProfile {
  id: number;
  profilePhoto: string | null;
  name: string;
  lastName: string;
  languages: string[];
  guideAvailability: string;
  guideStatus: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  averageRating: number | null;
  reviewCount: number | null;
}

const props = defineProps<{
  guideId: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const toastStore = useToastStore();
const guide = ref<GuideProfile | null>(null);
const loading = ref(true);
const loadError = ref(false);
const imageError = ref(false);

const fullName = computed(() => `${guide.value?.name ?? ""} ${guide.value?.lastName ?? ""}`.trim());

const initials = computed(() =>
  fullName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase(),
);

const isVerified = computed(() => guide.value?.guideStatus === "CORFIRMED");
const availabilityLabel = computed(() => {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
  };

  return labels[guide.value?.guideAvailability ?? ""] ?? "Disponibilidad no especificada";
});

async function getGuideProfile() {
  loading.value = true;
  loadError.value = false;
  imageError.value = false;

  try {
    const response = await api.get<GuideProfile>(`/guides/${props.guideId}`);
    guide.value = response.data;
  } catch {
    loadError.value = true;
    toastStore.showToast("No se pudo cargar el perfil del guía", "error");
  } finally {
    loading.value = false;
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

function contactGuide() {
  const phone = guide.value?.phone?.replace(/\D/g, "");
  if (!phone) {
    toastStore.showToast("El guía no tiene un teléfono registrado", "error");
    return;
  }
  const whatsappNumber = phone.startsWith("57") ? phone : `57${phone}`;
  window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer");
}

onMounted(() => {
  window.addEventListener("keydown", handleEscape);
  getGuideProfile();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
});
</script>
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      @click.self="emit('close')"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-profile-title"
        class="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          aria-label="Cerrar perfil"
          class="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900 sm:right-5 sm:top-5"
          @click="emit('close')"
        >
          <X :size="21" />
        </button>
        <div v-if="loading" class="px-6 py-20 text-center sm:px-10">
          <div
            class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#2196F3]"
          />
          <p class="mt-5 text-sm text-gray-500">Cargando perfil del guía...</p>
        </div>
        <div v-else-if="loadError" class="px-6 py-16 text-center sm:px-10">
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#2196F3]"
          >
            <UserRound :size="30" />
          </div>
          <h3 class="mt-5 text-lg font-semibold text-gray-900">No pudimos cargar el perfil</h3>
          <p class="mt-2 text-sm text-gray-500">Comprueba tu conexión e inténtalo nuevamente.</p>
          <button
            type="button"
            class="mt-6 rounded-xl bg-[#2196F3] px-6 py-3 font-semibold text-white transition hover:bg-[#1E88E6]"
            @click="getGuideProfile"
          >
            Reintentar
          </button>
        </div>
        <div v-else-if="guide" class="max-h-[88vh] overflow-y-auto">
          <div class="px-5 pb-6 pt-9 sm:px-10 sm:pb-8 sm:pt-10">
            <div class="flex flex-col items-center text-center">
              <div
                class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md ring-1 ring-gray-200 sm:h-32 sm:w-32"
              >
                <img
                  v-if="guide.profilePhoto && !imageError"
                  :src="guide.profilePhoto"
                  :alt="`Foto de ${fullName}`"
                  class="h-full w-full object-cover object-center"
                  @error="imageError = true"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-gray-100 text-3xl font-semibold text-gray-500"
                >
                  <span v-if="initials">{{ initials }}</span>
                  <UserRound v-else :size="42" />
                </div>
              </div>
              <h2
                id="guide-profile-title"
                class="mt-5 max-w-full break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
              >
                {{ fullName }}
              </h2>
              <div
                v-if="isVerified"
                class="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1.5 text-sm font-medium text-teal-700"
              >
                <ShieldCheck :size="17" />
                Guía verificado
              </div>
              <div class="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
                <template v-if="(guide.reviewCount ?? 0) > 0">
                  <Star :size="18" class="fill-amber-400 text-amber-400" />
                  <span class="font-semibold text-gray-900">
                    {{ Number(guide.averageRating ?? 0).toFixed(1) }}
                  </span>
                  <span class="text-gray-500">
                    · {{ guide.reviewCount }}
                    {{ guide.reviewCount === 1 ? "reseña" : "reseñas" }}
                  </span>
                </template>
                <span v-else class="text-gray-500"> Aún no tiene reseñas </span>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-100" />
          <div class="space-y-7 px-5 py-7 sm:space-y-8 sm:px-10 sm:py-8">
            <section>
              <h3 class="text-lg font-bold text-gray-900">Sobre mí</h3>
              <p class="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {{ guide.description || "Este guía aún no ha agregado una descripción." }}
              </p>
            </section>
            <section class="rounded-2xl border border-gray-200 p-4 sm:p-5">
              <div class="flex items-start gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2196F3]"
                >
                  <Languages :size="22" />
                </div>
                <div class="min-w-0 flex-1 py-0.5">
                  <h3 class="font-semibold text-gray-900">Idiomas</h3>
                  <p class="mt-1 text-sm text-gray-500">Idiomas en los que puede acompañarte</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="language in guide.languages ?? []"
                      :key="language"
                      class="rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700"
                    >
                      {{ language }}
                    </span>
                    <span v-if="!guide.languages?.length" class="text-sm text-gray-500">
                      No especificados
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section class="rounded-2xl border border-gray-200 p-4 sm:p-5">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2196F3]"
                  >
                    <Clock :size="21" />
                  </div>
                  <div class="min-w-0 pt-0.5">
                    <h3 class="font-semibold text-gray-900">Disponibilidad</h3>
                    <p class="mt-2 text-sm leading-6 text-gray-600">
                      {{ availabilityLabel }}
                    </p>
                  </div>
                </div>
              </section>
              <section class="rounded-2xl border border-gray-200 p-4 sm:p-5">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2196F3]"
                  >
                    <Phone :size="21" />
                  </div>
                  <div class="min-w-0 flex-1 pt-0.5">
                    <h3 class="font-semibold text-gray-900">Contacto</h3>
                    <p class="mt-2 break-words text-sm leading-6 text-gray-600">
                      +57 {{ guide.phone || "Teléfono no disponible" }}
                    </p>
                    <button
                      v-if="guide.phone"
                      type="button"
                      class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E88E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2196F3] focus-visible:ring-offset-2"
                      @click="contactGuide"
                    >
                      <MessageCircle :size="18" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
