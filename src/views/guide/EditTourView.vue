<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import api from "@/api/api";
import { useToastStore } from "@/stores/toast";
import { ArrowLeft, LoaderCircle, MapPin, Plus, Trash2, Upload, X } from "lucide-vue-next";

type Schedule = {
  day: string;
  startTime: string;
};

type Feature = {
  name: string;
  included: boolean;
};

type TourData = {
  id: number;
  title: string;
  description: string;
  price: number;
  minParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  category: string;
  photos: string[];
  schedules: Schedule[];
  features: Feature[];
  meetingLocation: {
    city: string;
    meetingAddress: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const tourId = String(route.params.id);

const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");

const title = ref("");
const description = ref("");
const city = ref("");
const meetingAddress = ref("");
const price = ref<number | null>(null);
const minParticipants = ref<number | null>(null);
const maxParticipants = ref<number | null>(null);
const durationMinutes = ref<number | null>(null);
const category = ref("");

const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);

const existingPhotos = ref<string[]>([]);
type NewPhoto = {
  id: number;
  file: File;
  previewUrl: string;
};
const newPhotos = ref<NewPhoto[]>([]);
const MAX_PHOTOS = 5;
let nextPhotoId = 0;
const schedules = ref<Schedule[]>([]);
const features = ref<Feature[]>([]);

const categories = [
  { value: "HISTORICAL", label: "Historia y patrimonio" },
  { value: "GASTRONOMIC", label: "Gastronomía" },
  { value: "ISLANDS_AND_BEACHES", label: "Islas y playas" },
  { value: "CULTURAL", label: "Cultura" },
  { value: "NIGHTLIFE", label: "Vida nocturna" },
];

const days = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

async function loadTour() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await api.get<TourData>(`/tours/${tourId}`);

    title.value = data.title ?? "";
    description.value = data.description ?? "";
    city.value = data.meetingLocation?.city ?? "";
    meetingAddress.value = data.meetingLocation?.meetingAddress ?? "";

    price.value = data.price ?? null;
    minParticipants.value = data.minParticipants ?? null;
    maxParticipants.value = data.maxParticipants ?? null;
    durationMinutes.value = data.durationMinutes ?? null;
    category.value = data.category ?? "";

    latitude.value = data.meetingLocation?.latitude ?? null;
    longitude.value = data.meetingLocation?.longitude ?? null;

    existingPhotos.value = data.photos ?? [];
    schedules.value = (data.schedules ?? []).map((item) => ({
      day: item.day,
      startTime: item.startTime?.slice(0, 5) ?? "",
    }));

    features.value = (data.features ?? []).map((item) => ({
      name: item.name,
      included: item.included,
    }));
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      toast.showToast("No tienes permiso para consultar esta experiencia.", "error");
      return;
    }

    errorMessage.value = "No fue posible cargar la experiencia. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
}

function addSchedule() {
  schedules.value.push({ day: "", startTime: "" });
}

function removeSchedule(index: number) {
  schedules.value.splice(index, 1);
}

function addFeature() {
  features.value.push({ name: "", included: true });
}

function removeFeature(index: number) {
  features.value.splice(index, 1);
}

function removeExistingPhoto(index: number) {
  existingPhotos.value.splice(index, 1);
}

function handlePhotoSelection(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files ?? []);
  const availableSlots = MAX_PHOTOS - existingPhotos.value.length - newPhotos.value.length;
  const acceptedFiles = selectedFiles.filter((file) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type),
  );

  if (acceptedFiles.length !== selectedFiles.length) {
    toast.showToast("Solo se permiten fotografías JPG, PNG o WEBP.", "error");
  }
  if (acceptedFiles.length > availableSlots) {
    toast.showToast("Una experiencia puede tener máximo 5 fotografías.", "error");
  }

  newPhotos.value.push(
    ...acceptedFiles.slice(0, Math.max(availableSlots, 0)).map((file) => ({
      id: nextPhotoId++,
      file,
      previewUrl: URL.createObjectURL(file),
    })),
  );
  input.value = "";
}

function removeNewPhoto(id: number) {
  const photoIndex = newPhotos.value.findIndex((photo) => photo.id === id);
  const photo = newPhotos.value[photoIndex];
  if (!photo) return;
  URL.revokeObjectURL(photo.previewUrl);
  newPhotos.value.splice(photoIndex, 1);
}

async function updateTour() {
  if (
    !title.value.trim() ||
    !description.value.trim() ||
    !city.value.trim() ||
    !meetingAddress.value.trim() ||
    price.value === null ||
    price.value <= 0 ||
    minParticipants.value === null ||
    minParticipants.value < 1 ||
    maxParticipants.value === null ||
    maxParticipants.value < minParticipants.value ||
    durationMinutes.value === null ||
    durationMinutes.value <= 0 ||
    !category.value ||
    schedules.value.length === 0 ||
    schedules.value.some((item) => !item.day || !item.startTime) ||
    features.value.some((item) => !item.name.trim())
  ) {
    toast.showToast("Revisa los campos obligatorios y los horarios.", "error");
    return;
  }

  const totalPhotos = existingPhotos.value.length + newPhotos.value.length;
  if (totalPhotos < 1) {
    toast.showToast("La experiencia debe tener al menos una fotografía.", "error");
    return;
  }
  if (totalPhotos > MAX_PHOTOS) {
    toast.showToast("Una experiencia puede tener máximo 5 fotografías.", "error");
    return;
  }

  saving.value = true;

  try {
    const request = {
      title: title.value.trim(),
      description: description.value.trim(),
      price: price.value,
      minParticipants: minParticipants.value,
      maxParticipants: maxParticipants.value,
      durationMinutes: durationMinutes.value,
      category: category.value,
      schedules: schedules.value.map((item) => ({
        day: item.day,
        startTime: item.startTime,
      })),
      features: features.value.map((item) => ({
        name: item.name.trim(),
        included: item.included,
      })),
      meetingLocation: {
        city: city.value.trim(),
        meetingAddress: meetingAddress.value.trim(),
        latitude: latitude.value,
        longitude: longitude.value,
      },
    };

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));
    newPhotos.value.forEach(({ file }) => formData.append("photos", file));
    existingPhotos.value.forEach((photo) => formData.append("existingPhotos", photo));

    await api.put(`/tours/update/${tourId}`, formData);

    toast.showToast("Experiencia actualizada correctamente.", "success");

    await router.push({ name: "my-tours" });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      toast.showToast(
        typeof message === "string"
          ? message
          : status === 401 || status === 403
            ? "No tienes permiso para editar esta experiencia."
            : "No fue posible actualizar la experiencia.",
        "error",
      );
      return;
    }

    toast.showToast("Ocurrió un error al actualizar la experiencia.", "error");
  } finally {
    saving.value = false;
  }
}

onBeforeUnmount(() => {
  newPhotos.value.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
});

onMounted(loadTour);
</script>

<template>
  <main class="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <button
        type="button"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-teal-800"
        @click="router.push({ name: 'my-tours' })"
      >
        <ArrowLeft :size="18" />
        Volver a mis servicios
      </button>
      <div class="mb-8">
        <h1 class="mt-1 text-3xl font-bold tracking-tight">Editar experiencia</h1>
        <p class="mt-2 text-sm text-gray-500">Actualiza la información que verán los viajeros.</p>
      </div>
      <div
        v-if="loading"
        class="flex justify-center rounded-2xl border border-gray-200 bg-white py-20"
      >
        <LoaderCircle class="animate-spin text-teal-700" :size="32" />
      </div>
      <div v-else-if="errorMessage" class="rounded-2xl border border-red-200 bg-white p-6">
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
          @click="loadTour"
        >
          Intentar nuevamente
        </button>
      </div>
      <form v-else @submit.prevent="updateTour" class="space-y-6">
        <section class="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 class="text-lg font-semibold">Información general</h2>
          <div>
            <label class="mb-2 block text-sm font-medium">Nombre</label>
            <input
              v-model="title"
              required
              maxlength="100"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Descripción</label>
            <textarea
              v-model="description"
              required
              maxlength="1000"
              rows="5"
              class="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
            />
            <p class="mt-1 text-right text-xs text-gray-400">{{ description.length }}/1000</p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium">Categoría</label>
              <select
                v-model="category"
                required
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-teal-700"
              >
                <option value="" disabled>Selecciona una categoría</option>
                <option v-for="item in categories" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium">Ciudad</label>
              <input
                v-model="city"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </section>

        <section class="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 class="text-lg font-semibold">Precio y capacidad</h2>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium">Precio por persona (COP)</label>
              <input
                v-model.number="price"
                type="number"
                min="1"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Duración (minutos)</label>
              <input
                v-model.number="durationMinutes"
                type="number"
                min="1"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Participantes mínimos</label>
              <input
                v-model.number="minParticipants"
                type="number"
                min="1"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Participantes máximos</label>
              <input
                v-model.number="maxParticipants"
                type="number"
                min="1"
                required
                class="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Horarios</h2>
              <p class="mt-1 text-sm text-gray-500">Días y horas disponibles.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              @click="addSchedule"
            >
              <Plus :size="16" />
              Añadir
            </button>
          </div>

          <div
            v-for="(schedule, index) in schedules"
            :key="index"
            class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <select
              v-model="schedule.day"
              required
              class="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              <option value="" disabled>Selecciona el día</option>
              <option v-for="day in days" :key="day.value" :value="day.value">
                {{ day.label }}
              </option>
            </select>

            <input
              v-model="schedule.startTime"
              type="time"
              required
              class="min-w-0 rounded-xl border border-gray-200 px-3 py-3"
            />

            <button
              type="button"
              aria-label="Eliminar horario"
              class="flex items-center justify-center rounded-xl border border-red-100 px-3 text-red-600 hover:bg-red-50"
              @click="removeSchedule(index)"
            >
              <Trash2 :size="17" />
            </button>
          </div>

          <p v-if="schedules.length === 0" class="text-sm text-amber-700">
            Añade al menos un horario para continuar.
          </p>
        </section>

        <section class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Características</h2>
              <p class="mt-1 text-sm text-gray-500">Qué incluye la experiencia.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              @click="addFeature"
            >
              <Plus :size="16" />
              Añadir
            </button>
          </div>

          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex flex-wrap items-center gap-3"
          >
            <input
              v-model="feature.name"
              required
              placeholder="Ej. Entrada al museo"
              class="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3"
            />

            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input v-model="feature.included" type="checkbox" class="accent-teal-700" />
              Incluido
            </label>

            <button
              type="button"
              aria-label="Eliminar característica"
              class="rounded-xl border border-red-100 p-3 text-red-600 hover:bg-red-50"
              @click="removeFeature(index)"
            >
              <Trash2 :size="17" />
            </button>
          </div>
        </section>
        <section class="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Fotografías</h2>
              <p class="mt-1 text-sm text-gray-500">
                Conserva, elimina o agrega imágenes. Puedes tener hasta 5.
              </p>
            </div>
            <span
              class="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600"
            >
              {{ existingPhotos.length + newPhotos.length }}/{{ MAX_PHOTOS }}
            </span>
          </div>

          <div
            v-if="existingPhotos.length || newPhotos.length"
            class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <div
              v-for="(photo, index) in existingPhotos"
              :key="photo"
              class="group relative overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                :src="photo"
                :alt="`Fotografía conservada ${index + 1}`"
                class="aspect-square w-full object-cover"
              />
              <button
                type="button"
                :aria-label="`Eliminar fotografía actual ${index + 1}`"
                class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm hover:bg-red-50"
                @click="removeExistingPhoto(index)"
              >
                <X :size="17" />
              </button>
            </div>

            <div
              v-for="photo in newPhotos"
              :key="photo.id"
              class="group relative overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                :src="photo.previewUrl"
                :alt="`Fotografía nueva ${photo.id + 1}`"
                class="aspect-square w-full object-cover"
              />
              <span
                class="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-blue-800"
              >
                Se agregará
              </span>
              <button
                type="button"
                :aria-label="`Quitar fotografía nueva ${photo.id + 1}`"
                class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm hover:bg-red-50"
                @click="removeNewPhoto(photo.id)"
              >
                <X :size="17" />
              </button>
            </div>

            <label
              v-if="existingPhotos.length + newPhotos.length < MAX_PHOTOS"
              class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-teal-700 hover:bg-teal-50/40"
            >
              <Upload :size="22" class="text-teal-800" />
              <span class="mt-2 text-xs font-medium text-gray-600">Agregar fotografía</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="sr-only"
                @change="handlePhotoSelection"
              />
            </label>
          </div>
          <div v-else class="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <p class="text-sm text-gray-500">Aún no hay fotografías. Agrega al menos una.</p>
            <label
              class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Upload :size="17" />
              Seleccionar fotografías
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="sr-only"
                @change="handlePhotoSelection"
              />
            </label>
          </div>
        </section>

        <div class="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
            :disabled="saving"
            @click="router.push({ name: 'my-tours' })"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LoaderCircle v-if="saving" :size="18" class="animate-spin" />
            {{ saving ? "Guardando cambios..." : "Guardar cambios" }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
