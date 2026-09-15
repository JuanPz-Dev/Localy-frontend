<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Users,
  DollarSign,
} from "lucide-vue-next";
import { useToastStore } from "@/stores/toast.ts";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

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

//Las fotos del servicio
const photos = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);

//Gestion de las fotos
const handlePhotos = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;
  const selectedFiles = Array.from(input.files);
  const availableSlots = 5 - photos.value.length;
  const filesToAdd = selectedFiles.slice(0, availableSlots);
  filesToAdd.forEach((file) => {
    photos.value.push(file);
    photoPreviews.value.push(URL.createObjectURL(file));
  });
  input.value = "";
};

const removePhoto = (index: number) => {
  URL.revokeObjectURL(photoPreviews.value[index] ?? "");

  photos.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

//horarios
type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
interface Schedule {
  day: DayOfWeek | "";
  startTime: string;
}
const schedules = ref<Schedule[]>([]);
const days = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Vierne" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];
const addSchedule = () => {
  schedules.value.push({
    day: "",
    startTime: "",
  });
};
const removeSchedule = (index: number) => {
  schedules.value.splice(index, 1);
};
//Caracteristicas
interface Feature {
  name: string;
  included: boolean;
}
const features = ref<Feature[]>([]);
const newFeature = ref("");
const addFeature = () => {
  const name = newFeature.value.trim();
  if (!name) return;
  features.value.push({ name, included: true });
  newFeature.value = "";
};

const removeFeature = (index: number) => {
  features.value.splice(index, 1);
};

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
    !meetingAddress.value.trim() ||
    photos.value.length === 0 ||
    schedules.value.length === 0
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
      meetingLocation: {
        city: city.value,
        meetingAddress: meetingAddress.value.trim(),
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
</script>
<template>
  <div class="min-h-screen bg-[#f7f7f7] text-gray-900">
    <header class="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div class="hidden items-center gap-2 sm:flex">
          <div class="h-2 w-2 rounded-full bg-gray-900"></div>
          <span class="text-sm font-medium text-gray-500"> Crear experiencia </span>
        </div>
      </div>
    </header>
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

                <!-- CIUDAD + CATEGORIA -->
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
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div class="border-b border-gray-100 px-6 py-6 sm:px-8">
                <div class="flex items-start justify-between gap-5">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-950">Fotos de la experiencia</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-500">
                      Una buena fotografía ayuda a que los viajeros imaginen la experiencia.
                    </p>
                  </div>
                  <div
                    class="hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 sm:block"
                  >
                    {{ photos.length }}/5 fotos
                  </div>
                </div>
              </div>

              <div class="p-6 sm:p-8">
                <!-- SIN FOTOS -->
                <label
                  v-if="photos.length === 0"
                  class="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center transition hover:border-gray-400 hover:bg-gray-100"
                >
                  <div
                    class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105"
                  >
                    <Upload :size="25" class="text-gray-700" />
                  </div>

                  <p class="text-sm font-semibold text-gray-900">Sube fotos de tu experiencia</p>

                  <p class="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                    Muestra los lugares, actividades o momentos que vivirán los viajeros.
                  </p>

                  <span
                    class="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-gray-800"
                  >
                    Seleccionar fotos
                  </span>

                  <span class="mt-3 text-xs text-gray-400"> PNG, JPG o WEBP · Máximo 5 fotos </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="handlePhotos"
                  />
                </label>
                <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div
                    v-for="(preview, index) in photoPreviews"
                    :key="preview"
                    :class="[
                      'group relative overflow-hidden rounded-2xl bg-gray-100',
                      index === 0 ? 'col-span-2 aspect-[2/1] sm:col-span-2' : 'aspect-square',
                    ]"
                  >
                    <img
                      :src="preview"
                      alt="Vista previa"
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100"
                    ></div>

                    <div
                      v-if="index === 0"
                      class="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm"
                    >
                      Foto principal
                    </div>

                    <button
                      type="button"
                      @click="removePhoto(index)"
                      class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 opacity-0 shadow-sm transition hover:bg-white hover:text-red-600 group-hover:opacity-100"
                    >
                      <X :size="17" />
                    </button>
                  </div>
                  <label
                    v-if="photos.length < 5"
                    class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-gray-400 hover:bg-gray-100"
                  >
                    <div
                      class="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
                    >
                      <Plus :size="21" class="text-gray-600" />
                    </div>

                    <span class="mt-3 text-xs font-semibold text-gray-600"> Agregar foto </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      class="hidden"
                      @change="handlePhotos"
                    />
                  </label>
                </div>
              </div>
            </section>
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
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div class="border-b border-gray-100 px-6 py-6 sm:px-8">
                <h2 class="text-lg font-semibold text-gray-950">Detalles del encuentro</h2>

                <p class="mt-1 text-sm text-gray-500">
                  Ayuda a los viajeros a saber cuánto dura y dónde comienza.
                </p>
              </div>

              <div class="grid gap-6 px-6 py-7 sm:px-8 md:grid-cols-2">
                <!-- DURACION -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800"> Duración </label>

                  <div class="relative">
                    <Clock
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      v-model.number="durationMinutes"
                      class="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-[15px] outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
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
                <div>
                  <label class="mb-2 block text-sm font-semibold text-gray-800">
                    Lugar de encuentro
                  </label>
                  <div class="relative">
                    <MapPin
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      v-model="meetingAddress"
                      type="text"
                      placeholder="Ej. Torre del Reloj"
                      class="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-[15px] outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>
                </div>
              </div>
            </section>
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div
                class="flex flex-col justify-between gap-4 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:px-8"
              >
                <div>
                  <h2 class="text-lg font-semibold text-gray-950">Horarios disponibles</h2>
                  <p class="mt-1 text-sm text-gray-500">
                    Indica cuándo puedes realizar esta experiencia.
                  </p>
                </div>
                <button
                  type="button"
                  @click="addSchedule"
                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <Plus :size="17" />
                  Agregar horario
                </button>
              </div>
              <div class="px-6 py-7 sm:px-8">
                <div
                  v-if="schedules.length === 0"
                  class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center"
                >
                  <Clock :size="28" class="mx-auto mb-3 text-gray-400" />
                  <p class="text-sm font-medium text-gray-700">Aún no has agregado horarios</p>
                  <p class="mt-1 text-xs text-gray-400">Agrega al menos un día y una hora.</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="(schedule, index) in schedules"
                    :key="index"
                    class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center"
                  >
                    <div class="flex-1">
                      <select
                        v-model="schedule.day"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                      >
                        <option value="" disabled>Selecciona un día</option>
                        <option v-for="day in days" :key="day.value" :value="day.value">
                          {{ day.label }}
                        </option>
                      </select>
                    </div>
                    <input
                      v-model="schedule.startTime"
                      type="time"
                      class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    />
                    <button
                      type="button"
                      @click="removeSchedule(index)"
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <section
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div class="border-b border-gray-100 px-6 py-6 sm:px-8">
                <h2 class="text-lg font-semibold text-gray-950">¿Qué incluye?</h2>
                <p class="mt-1 text-sm text-gray-500">
                  Añade los servicios, actividades o elementos incluidos.
                </p>
              </div>
              <div class="px-6 py-7 sm:px-8">
                <div class="flex flex-col gap-3 sm:flex-row">
                  <input
                    v-model="newFeature"
                    type="text"
                    placeholder="Ej. Guía profesional"
                    class="flex-1 rounded-2xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
                    @keyup.enter.prevent="addFeature"
                  />
                  <button
                    type="button"
                    @click="addFeature"
                    class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    <Plus :size="18" />
                    Agregar
                  </button>
                </div>
                <div v-if="features.length" class="mt-5 grid gap-2 sm:grid-cols-2">
                  <div
                    v-for="(feature, index) in features"
                    :key="index"
                    class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
                      >
                        ✓
                      </div>
                      <span class="text-sm font-medium text-gray-700">
                        {{ feature.name }}
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="removeFeature(index)"
                      class="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
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
