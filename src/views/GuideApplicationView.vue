<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useToastStore } from "@/stores/toast.ts";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

const profilePhoto = ref<File | null>(null);
const cv = ref<File | null>(null);

const phone = ref("");
const address = ref("");
const license = ref("");
const description = ref("");
const languages = ref<string[]>([]);

const toastStore = useToastStore();
const authStore = useAuthStore();

const maxFileSize = 5 * 1024 * 1024;

const isAllowedFile = (file: File, extensions: string[]) => {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return file.size <= maxFileSize && extensions.includes(extension);
};

const handlePhotoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    if (!isAllowedFile(target.files[0], [".jpg", ".jpeg", ".png", ".webp"])) {
      toastStore.showToast("La foto debe ser JPG, PNG o WEBP y pesar máximo 5 MB", "error");
      target.value = "";
      return;
    }
    profilePhoto.value = target.files[0];
  }
};

const handleCvChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    if (!isAllowedFile(target.files[0], [".pdf", ".doc", ".docx"])) {
      toastStore.showToast("El CV debe ser PDF, DOC o DOCX y pesar máximo 5 MB", "error");
      target.value = "";
      return;
    }
    cv.value = target.files[0];
  }
};

const availableLanguages = ["Español", "Inglés", "Francés", "Portugués", "Italiano"];

const toggleLanguage = (language: string) => {
  if (languages.value.includes(language)) {
    languages.value = languages.value.filter((item) => item !== language);
  } else {
    languages.value.push(language);
  }
};

async function handleApplication() {
  if (!authStore.isAuthenticated) {
    toastStore.showToast("Debes iniciar sesión con Google antes de aplicar", "error");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
    return;
  }

  if (
    !profilePhoto.value ||
    !phone.value.trim() ||
    !address.value.trim() ||
    !license.value.trim() ||
    !description.value.trim() ||
    !cv.value ||
    languages.value.length === 0
  ) {
    toastStore.showToast("Todos los campos son obligatorios", "error");
    return;
  }

  try {
    const formData = new FormData();
    const data = {
      phone: phone.value,
      address: address.value,
      license: license.value,
      description: description.value,
      languages: languages.value,
    };
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      }),
    );
    formData.append("profilePhoto", profilePhoto.value);
    formData.append("cv", cv.value);
    const response = await api.post("/guides/apply", formData);
    if (response.status !== 201) {
      throw new Error("Error al enviar la solicitud");
    }
    toastStore.showToast("Solicitud enviada con éxito", "success");
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
        typeof message === "string" ? message : "Hubo un error al enviar la solicitud",
        "error",
      );
      return;
    }

    toastStore.showToast("Hubo un error al enviar la solicitud", "error");
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-6 py-12 lg:px-8">
    <div class="mx-auto max-w-5xl text-center">
      <h2 class="text-3xl font-bold tracking-tight text-[#12886a]">Conviértete en guía local</h2>
      <p class="mt-3 text-base text-gray-500">Completa la información para enviar tu solicitud</p>
    </div>
    <div class="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-8 shadow-sm lg:p-10">
      <form @submit.prevent="handleApplication" class="space-y-10">
        <section>
          <h3 class="text-lg font-semibold text-gray-900">Información personal</h3>
          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700"> Teléfono </label>
              <input
                v-model="phone"
                type="tel"
                placeholder="Ej. 300 123 4567"
                class="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                v-model="address"
                type="text"
                placeholder="Ej. Cartagena, Bolívar"
                class="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div class="md:col-span-2">
              <label for="profilePhoto" class="block text-sm font-medium text-gray-700">
                Foto de perfil
              </label>
              <input
                @change="handlePhotoChange"
                id="profilePhoto"
                type="file"
                accept="image/*"
                class="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium hover:file:bg-gray-200"
              />
              <p class="mt-2 text-xs text-gray-500">
                Sube una foto clara que permita identificarte.
              </p>
            </div>
          </div>
        </section>
        <section class="border-t border-gray-100 pt-8">
          <h3 class="text-lg font-semibold text-gray-900">Información profesional</h3>
          <p class="mt-1 text-sm text-gray-500">Cuéntanos sobre tu experiencia como guía.</p>
          <div class="mt-6 space-y-6">
            <div>
              <label for="license" class="block text-sm font-medium text-gray-700">
                Licencia o certificación
              </label>
              <input
                v-model="license"
                type="text"
                placeholder="Número de licencia o certificación"
                class="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                v-model="description"
                rows="5"
                placeholder="Cuéntanos sobre tu experiencia, conocimientos y qué tipo de experiencias puedes ofrecer..."
                class="mt-2 block w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              ></textarea>
              <p class="mt-2 text-xs text-gray-500">
                Describe brevemente tu experiencia como guía.
              </p>
            </div>
          </div>
        </section>
        <section class="border-t border-gray-100 pt-8">
          <h3 class="text-lg font-semibold text-gray-900">Idiomas</h3>
          <p class="mt-1 text-sm text-gray-500">
            Selecciona los idiomas que puedes utilizar durante tus experiencias.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              v-for="language in availableLanguages"
              :key="language"
              type="button"
              @click="toggleLanguage(language)"
              :class="[
                'rounded-lg px-5 py-2.5 text-sm font-medium transition',
                languages.includes(language)
                  ? 'bg-[#12886a] text-white hover:bg-[#17ab85]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              {{ language }}
            </button>
          </div>
        </section>
        <section class="border-t border-gray-100 pt-8">
          <h3 class="text-lg font-semibold text-gray-900">Currículum</h3>

          <p class="mt-1 text-sm text-gray-500">
            Adjunta tu hoja de vida para que podamos revisar tu experiencia.
          </p>

          <div
            class="mt-5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-gray-400"
          >
            <p class="mt-3 text-sm font-medium text-gray-900">Sube tu currículum</p>

            <p class="mt-1 text-xs text-gray-500">PDF o DOCX · Máximo 5 MB</p>

            <label
              for="cv"
              class="mt-5 inline-flex cursor-pointer rounded-lg bg-[#12886a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Seleccionar archivo
            </label>

            <input
              @change="handleCvChange"
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              class="hidden"
            />
          </div>
        </section>
        <div
          class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-8 sm:flex-row sm:justify-end"
        >
          <button
            type="submit"
            class="rounded-lg bg-[#12886a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17ab85]"
          >
            Enviar solicitud
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
