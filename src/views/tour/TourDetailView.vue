<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import ReviewSection from "@/components/review/ReviewSection.vue";
import ReservationCard from "@/components/reservation/ReservationCard.vue";
import GuideProfileModal from "@/components/guide/GuideProfileModal.vue";
import { CalendarDays, Clock, Users, Sparkle } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";

const toastStore = useToastStore();
const currentIndex = ref(0);
const route = useRoute();
const tour = ref<any>(null);
const showGuideModal = ref(false);

const dayNames: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function formatTime(time: string) {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const period = h >= 12 ? "p. m." : "a. m.";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(minutes: number) {
  if (!minutes) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hoursText = hours === 1 ? "1 hora" : `${hours} horas`;
  if (hours === 0) return `${mins} minutos`;
  if (mins === 0) return hoursText;
  return `${hoursText} y ${mins} minutos`;
}

const photos = computed<string[]>(() => tour.value?.photos ?? []);
function next() {
  currentIndex.value = (currentIndex.value + 1) % photos.value.length;
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + photos.value.length) % photos.value.length;
}
async function getTour() {
  try {
    const id = route.params.id;
    const response = await api.get(`/tours/${id}`);
    tour.value = response.data;
  } catch (error) {
    toastStore.showToast("Error al obtener el tour", "error");
  }
}

onMounted(() => {
  getTour();
});
</script>
<template>
  <div class="min-h-screen bg-white">
    <div v-if="!tour" class="flex min-h-125px items-center justify-center">
      <p class="text-gray-500">Cargando experiencia...</p>
    </div>
    <main v-else class="mx-auto max-w-7xl px-6 py-8">
      <section class="mb-6">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {{ tour.title }}
            </h1>
            <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span class="flex items-center gap-1 font-semibold text-gray-900">
                <span class="text-yellow-500">★</span>
                {{ tour.reviewCount > 0 ? Number(tour.averageRating).toFixed(1) : "Nuevo" }}
              </span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-600">
                {{ tour.reviewCount ?? 0 }}
                {{ tour.reviewCount === 1 ? "reseña" : "reseñas" }}
              </span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-600">
                {{ tour.meetingLocation?.city || "Cartagena" }}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div
            class="group relative aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100 md:aspect-[16/9]"
          >
            <img
              v-if="photos.length"
              :key="currentIndex"
              :src="photos[currentIndex]"
              class="h-full w-full object-cover"
              alt="Experiencia"
            />
            <div v-else class="flex h-full items-center justify-center">
              <span class="text-gray-400">Sin imágenes disponibles</span>
            </div>
            <template v-if="photos.length > 1">
              <button
                type="button"
                aria-label="Foto anterior"
                class="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
                @click="prev"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
                @click="next"
              >
                →
              </button>
              <span
                class="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white"
              >
                {{ currentIndex + 1 }} / {{ photos.length }}
              </span>
              <div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                <button
                  v-for="(_, i) in photos"
                  :key="i"
                  type="button"
                  :aria-label="`Ir a la foto ${i + 1}`"
                  class="h-2 rounded-full transition-all"
                  :class="i === currentIndex ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'"
                  @click="currentIndex = i"
                />
              </div>
            </template>
          </div>
          <div class="mt-8 border-b border-gray-200">
            <nav class="flex gap-8 overflow-x-auto">
              <a
                href="#detalles"
                class="border-b-2 border-teal-600 pb-4 text-sm font-semibold text-teal-600"
              >
                Detalles
              </a>
              <a href="#incluye" class="pb-4 text-sm font-medium text-gray-600 hover:text-gray-900">
                ¿Qué incluye?
              </a>
              <a
                href="#horarios"
                class="pb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Horarios
              </a>
              <a
                href="#descripcion"
                class="pb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Descripción
              </a>
            </nav>
          </div>
          <section id="detalles" class="py-8 scroll-mt-24">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Detalles</h2>
            <div class="grid grid-cols-1 gap-y-8 sm:grid-cols-2">
              <div class="flex items-start gap-4">
                <div class="rounded-full bg-teal-50 p-3"><Clock /></div>
                <div>
                  <p class="text-sm text-gray-500">Duración</p>
                  <p class="font-medium text-gray-900">
                    {{ formatDuration(tour.durationMinutes) }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="rounded-full bg-teal-50 p-3"><Users /></div>
                <div>
                  <p class="text-sm text-gray-500">Participantes</p>
                  <p class="font-medium text-gray-900">
                    {{ tour.minParticipants }} - {{ tour.maxParticipants }} personas
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="rounded-full bg-teal-50 p-3"><Sparkle /></div>
                <div>
                  <p class="text-sm text-gray-500">Categoría</p>
                  <p class="font-medium text-gray-900">
                    {{ tour.category }}
                  </p>
                </div>
              </div>
            </div>
            <div
              v-if="tour.meetingLocation?.latitude && tour.meetingLocation?.longitude"
              class="mt-8"
            >
              <h3 class="mb-3 text-lg font-semibold text-gray-900">¿Dónde nos encontramos?</h3>
              <div class="overflow-hidden rounded-2xl border border-gray-200">
                <iframe
                  :src="`https://www.google.com/maps?q=${tour.meetingLocation.latitude},${tour.meetingLocation.longitude}&output=embed`"
                  width="100%"
                  height="350"
                  style="border: 0"
                  loading="lazy"
                  allowfullscreen
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </section>
          <!--Lo que incluye el servicio-->
          <section
            v-if="tour.features?.length"
            id="incluye"
            class="scroll-mt-24 border-t border-gray-200 py-8"
          >
            <h2 class="mb-6 text-2xl font-bold text-gray-900">¿Qué incluye?</h2>
            <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li
                v-for="feature in tour.features"
                :key="feature.name"
                class="flex items-start gap-3"
              >
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  :class="
                    feature.included ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-400'
                  "
                  :aria-label="feature.included ? 'Incluido' : 'No incluido'"
                >
                  {{ feature.included ? "✓" : "✕" }}
                </span>
                <span :class="feature.included ? 'text-gray-900' : 'text-gray-400 line-through'">
                  {{ feature.name }}
                </span>
              </li>
            </ul>
          </section>
          <!--Horarios de los servicios-->
          <section
            v-if="tour.schedules?.length"
            id="horarios"
            class="border-t border-gray-200 py-8 scroll-mt-24"
          >
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Horarios</h2>
            <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li
                v-for="schedule in tour.schedules"
                :key="`${schedule.day}-${schedule.startTime}`"
                class="flex items-center gap-4 rounded-2xl border border-gray-200 p-4"
              >
                <div class="rounded-full bg-teal-50 p-3">
                  <CalendarDays />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ dayNames[schedule.day] ?? schedule.day }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Inicia a las {{ formatTime(schedule.startTime) }}
                  </p>
                </div>
              </li>
            </ul>
          </section>
          <section id="descripcion" class="border-t border-gray-200 py-8 scroll-mt-24">
            <h2 class="mb-4 text-2xl font-bold text-gray-900">Sobre esta experiencia</h2>
            <p class="max-w-3xl leading-8 text-gray-600">
              {{ tour.description }}
            </p>
          </section>
          <section class="border-t border-gray-200 py-8">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Conoce a tu guía</h2>
            <button
              type="button"
              class="group flex w-full items-center gap-5 rounded-2xl border border-gray-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40 cursor-pointer"
              @click="showGuideModal = true"
            >
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700"
              >
                {{ tour.guideName?.charAt(0) || "G" }}
              </div>

              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">
                  {{ tour.guideName }}
                </h3>

                <div class="mt-1">
                  <Badge class="bg-teal-700"> Guía verificado </Badge>
                </div>

                <p class="mt-2 text-sm font-medium text-teal-700 group-hover:text-teal-800">
                  Conoce más sobre tu guía →
                </p>
              </div>
            </button>
          </section>
          <GuideProfileModal
            v-if="showGuideModal"
            :guide-id="tour.guideId"
            @close="showGuideModal = false"
          />
          <ReviewSection :tour-id="route.params.id as string" @created="getTour" />
        </div>
        <!-- CARD DE RESERVA -->
        <div>
          <ReservationCard v-if="tour" :price="tour.price" :schedules="tour.schedules" />
        </div>
      </section>
    </main>
  </div>
</template>
