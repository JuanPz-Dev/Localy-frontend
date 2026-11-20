<script setup lang="ts">
import api from "@/api/api";
import { ref } from "vue";
import axios from "axios";
import { MapPin, Users, DollarSign, Upload } from "lucide-vue-next";
import TourPhotoUploader from "@/components/tours/create/TourPhotoUploader.vue";
import TourScheduleEditor from "@/components/tours/create/TourScheduleEditor.vue";
import TourFeatureEditor from "@/components/tours/create/TourFeatureEditor.vue";
import TourMeetingLocation from "@/components/tours/create/TourMeetingLocation.vue";

import { useToastStore } from "@/stores/toast.ts";
import { useAuthStore } from "@/stores/auth";

const toastStore = useToastStore();
const authStore = useAuthStore();

const title = ref("");
const description = ref("");
const city = ref("");
const price = ref<number | null>(null);
const minParticipants = ref<number | null>(null);
const maxParticipants = ref<number | null>(null);
const durationMinutes = ref<number | null>(null);
const category = ref("");
const meetingAddress = ref("");

const photos = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);

function handlePreviewsChange(previews: string[]) {
  photoPreviews.value = previews;
}

const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

interface Schedule {
  day: DayOfWeek | "";
  startTime: string;
}

const schedules = ref<Schedule[]>([]);

//Caracteristicas
interface Feature {
  name: string;
  included: boolean;
}
const features = ref<Feature[]>([]);
async function createTour() {
  if (!authStore.isAuthenticated) {
    toastStore.showToast("Debes iniciar sesión con Google antes de aplicar", "error");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
    return;
  }
  if (
    !title.value.trim() ||
    !description.value.trim() ||
    !city.value.trim() ||
    !price.value ||
    !minParticipants.value ||
    !maxParticipants.value ||
    !durationMinutes.value ||
    !category.value ||
    photos.value.length === 0 ||
    schedules.value.length === 0 ||
    schedules.value.some((schedule) => !schedule.day || !schedule.startTime)
  ) {
    toastStore.showToast("Todos los campos son obligatorios", "error");
    return;
  }
  try {
    const formData = new FormData();
    const data = {
      title: title.value,
      description: description.value,
      price: price.value,
      minParticipants: minParticipants.value,
      maxParticipants: maxParticipants.value,
      durationMinutes: durationMinutes.value,
      category: category.value,

      schedules: schedules.value.map((schedule) => ({
        day: schedule.day,
        startTime: schedule.startTime,
      })),

      features: features.value.map((feature) => ({
        name: feature.name,
        included: feature.included,
      })),

      meetingLocation: {
        city: city.value,
        meetingAddress: meetingAddress.value.trim(),
        latitude: latitude.value,
        longitude: longitude.value,
      },
    };
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      }),
    );
    photos.value.forEach((photo) => {
      formData.append("photos", photo);
    });

    console.log(
      "Tamaño total de las fotografías:",
      (photos.value.reduce((total, photo) => total + photo.size, 0) / 1024 / 1024).toFixed(2),
      "MB",
    );

    console.table(
      photos.value.map((photo) => ({
        nombre: photo.name,
        tamañoMB: (photo.size / 1024 / 1024).toFixed(2),
        tipo: photo.type,
      })),
    );

    const response = await api.post("/tours/create", formData);
    toastStore.showToast("Experiencia publicada correctamente", "success");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? error.response?.data;
      if (status === 401 || status === 403) {
        toastStore.showToast("Tu sesión ya no es válida", "error");
        authStore.logout();
        return;
      }
      toastStore.showToast(
        typeof message === "string" ? message : "Hubo un error al publicar la experiencia",
        "error",
      );
      return;
    }
    toastStore.showToast("Hubo un error al publicar la experiencia", "error");
  }
}

function handleLocationSelected(location: {
  meetingAddress: string;
  latitude: number;
  longitude: number;
}) {
  meetingAddress.value = location.meetingAddress;
  latitude.value = location.latitude;
  longitude.value = location.longitude;
}
</script>
<template>
  <div class="min-h-screen bg-[#f7f7f7] text-gray-900">
    <main class="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <div class="mb-10 max-w-3xl">
        <h1 class="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
          Crea una experiencia
          <span class="text-gray-400">que los viajeros recuerden.</span>
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-gray-500">
          Presenta tu experiencia, define sus detalles y permite que viajeros descubran Cartagena de
          una forma auténtica.
        </p>
      </div>
      <form @submit.prevent="createTour">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="space-y-7">
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div class="border-b border-gray-100 px-6 py-6 sm:px-8">
                <div class="flex items-start gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100"
                  >
                    <MapPin :size="20" class="text-gray-700" />
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-950">
                      Información de tu experiencia
                    </h2>
                    <p class="mt-1 text-sm leading-6 text-gray-500">
                      Empieza con la información que verán los viajeros.
                    </p>
                  </div>
                </div>
              </div>
              <div class="space-y-6 px-6 py-7 sm:px-8">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800">
                    Nombre de la experiencia
                  </label>
                  <input
                    v-model="title"
                    type="text"
                    maxlength="100"
                    placeholder="Ej. Cartagena al atardecer: historia y cultura"
                    class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                  />
                  <p class="mt-2 text-xs text-gray-400">
                    Elige un nombre claro, atractivo y fácil de recordar.
                  </p>
                </div>
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <label class="block text-sm font-semibold text-gray-800">
                      Describe tu experiencia
                    </label>
                    <span class="text-xs text-gray-400"> {{ description.length }}/1000 </span>
                  </div>
                  <textarea
                    v-model="description"
                    rows="6"
                    maxlength="1000"
                    placeholder="Cuenta qué harán los viajeros, qué lugares conocerán y qué hace especial esta experiencia..."
                    class="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] leading-6 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                  />
                  <p class="mt-2 text-xs text-gray-400">
                    Evita descripciones genéricas. Cuenta qué hace diferente tu experiencia.
                  </p>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-semibold text-gray-800"> Ciudad </label>

                    <div class="relative">
                      <MapPin
                        :size="18"
                        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        v-model="city"
                        type="text"
                        placeholder="Cartagena"
                        class="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-[15px] outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-semibold text-gray-800">
                      Categoría
                    </label>

                    <select
                      v-model="category"
                      class="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      <option value="HISTORICAL">Historia y patrimonio</option>
                      <option value="GASTRONOMIC">Gastronomía</option>
                      <option value="ISLANDS_AND_BEACHES">Islas y playas</option>
                      <option value="CULTURAL">Cultura</option>
                      <option value="NIGHTLIFE">Vida nocturna</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
            <TourPhotoUploader v-model:photos="photos" @previews-change="handlePreviewsChange" />
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div class="border-b border-gray-100 px-6 py-6 sm:px-8">
                <h2 class="text-lg font-semibold text-gray-950">Precio y capacidad</h2>
                <p class="mt-1 text-sm text-gray-500">
                  Define cuánto cuesta y cuántos viajeros puedes recibir.
                </p>
              </div>

              <div class="grid gap-5 px-6 py-7 sm:grid-cols-3 sm:px-8">
                <!-- PRECIO -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800">
                    Precio por persona
                  </label>

                  <div class="relative">
                    <DollarSign
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      v-model.number="price"
                      type="number"
                      min="1"
                      placeholder="50.000"
                      class="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-[15px] outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>

                  <p class="mt-2 text-xs text-gray-400">COP</p>
                </div>

                <!-- MINIMO -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800"> Mínimo </label>

                  <div class="relative">
                    <Users
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      v-model.number="minParticipants"
                      type="number"
                      min="1"
                      placeholder="2"
                      class="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-[15px] outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>

                  <p class="mt-2 text-xs text-gray-400">Viajeros mínimos</p>
                </div>

                <!-- MAXIMO -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800"> Máximo </label>

                  <div class="relative">
                    <Users
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      v-model.number="maxParticipants"
                      type="number"
                      min="1"
                      placeholder="10"
                      class="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-[15px] outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>

                  <p class="mt-2 text-xs text-gray-400">Capacidad máxima</p>
                </div>
              </div>
            </section>
            <TourMeetingLocation
              v-model:duration-minutes="durationMinutes"
              @location-selected="handleLocationSelected"
            />
            <TourScheduleEditor v-model="schedules" />
            <TourFeatureEditor v-model="features" />
          </div>
          <aside class="hidden lg:block">
            <div class="sticky top-24 space-y-5">
              <div
                class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
              >
                <div
                  class="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-100"
                >
                  <img
                    v-if="photoPreviews.length"
                    :src="photoPreviews[0]"
                    alt="Vista previa de experiencia"
                    class="h-full w-full object-cover"
                  />

                  <div v-else class="text-center">
                    <div
                      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Upload :size="20" class="text-gray-500" />
                    </div>

                    <p class="mt-3 text-xs font-medium text-gray-500">Vista previa</p>
                  </div>

                  <div
                    v-if="photoPreviews.length"
                    class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-12"
                  >
                    <p class="text-xs font-medium text-white/80">Tu experiencia</p>

                    <h3 class="mt-1 line-clamp-2 text-lg font-semibold text-white">
                      {{ title || "Nombre de tu experiencia" }}
                    </h3>
                  </div>
                </div>

                <div class="p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-xs font-medium text-gray-400">
                        {{ city || "Cartagena" }}
                      </p>

                      <p class="mt-1 text-sm font-semibold text-gray-900">
                        {{ category || "Categoría" }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-gray-950">
                        {{ price ? `$${price.toLocaleString("es-CO")}` : "$0" }}
                      </p>
                      <p class="text-[11px] text-gray-400">por persona</p>
                    </div>
                  </div>
                  <div class="mt-4 grid grid-cols-2 divide-x rounded-xl bg-gray-50 py-3">
                    <div class="text-center">
                      <p class="text-xs text-gray-400">Duración</p>
                      <p class="mt-1 text-xs font-semibold text-gray-700">
                        {{ durationMinutes ? `${durationMinutes / 60} h` : "—" }}
                      </p>
                    </div>
                    <div class="text-center">
                      <p class="text-xs text-gray-400">Capacidad</p>
                      <p class="mt-1 text-xs font-semibold text-gray-700">
                        {{ maxParticipants ? `${maxParticipants} personas` : "—" }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <div
          class="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-7 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900">¿Todo listo?</p>
            <p class="mt-1 text-xs text-gray-500">
              Revisa la información antes de publicar tu experiencia.
            </p>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="$router.back()"
              class="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Publicar experiencia
            </button>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>
