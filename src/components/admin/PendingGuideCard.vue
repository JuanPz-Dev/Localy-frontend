<script setup lang="ts">
import { Check, FileUser, X } from "lucide-vue-next";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Badge } from "@/components/ui/badge";
import type { PendingGuide } from "@/types/admin";

const props = defineProps<{
  guides: PendingGuide[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  busy?: boolean;
}>();

const emit = defineEmits<{
  approve: [id: number];
  reject: [id: number];
  loadMore: [];
}>();

const scrollContainer = ref<HTMLDivElement | null>(null);
const loadMoreTarget = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | undefined;

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
};

const initials = (guide: PendingGuide) =>
  `${guide.name.charAt(0)}${guide.lastName.charAt(0)}`.toUpperCase();

function viewCv(cv: string) {
  if (!cv) {
    alert("Este guía no tiene un CV cargado.");
    return;
  }
  window.open(cv, "_blank", "noopener,noreferrer");
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && props.hasMore && !props.loading) {
        emit("loadMore");
      }
    },
    { root: scrollContainer.value, rootMargin: "0px 0px 120px 0px" },
  );
});

watch(
  () => props.guides.length,
  async () => {
    await nextTick();
    if (loadMoreTarget.value) observer?.observe(loadMoreTarget.value);
  },
  { flush: "post" },
);

onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <header class="mb-4 flex items-start justify-between">
      <div>
        <p class="text-sm text-slate-500">Validación de guías</p>
        <h3 class="text-xl font-semibold text-slate-900">Solicitudes pendientes</h3>
      </div>
      <Badge class="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">
        {{ total }} pendientes
      </Badge>
    </header>
    <div ref="scrollContainer" class="h-90 overflow-y-auto">
      <div
        v-if="!guides.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"
      >
        <p class="text-lg font-semibold text-slate-700">No hay guías pendientes</p>
        <p class="mt-2 text-sm text-slate-500">Todo está actualizado en este momento.</p>
      </div>
      <div v-else class="space-y-4 pr-3">
        <article
          v-for="guide in guides"
          :key="guide.id"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-sm font-semibold text-blue-700"
              >
                {{ initials(guide) }}
              </div>
              <div>
                <p class="text-base font-semibold text-slate-900">
                  {{ guide.name }} {{ guide.lastName }}
                </p>
              </div>
            </div>
            <Badge class="border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100">
              {{ statusLabels[guide.guideStatus] ?? guide.guideStatus }}
            </Badge>
          </div>
          <div class="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <p>
              <span class="font-medium text-slate-700">Teléfono:</span>
              {{ guide.phone || "No disponible" }}
            </p>
            <p>
              <span class="font-medium text-slate-700">Dirección:</span>
              {{ guide.address || "No disponible" }}
            </p>
          </div>
          <p class="mt-3 text-sm text-slate-600">
            <span class="font-medium text-slate-700">Descripción:</span>
            {{ guide.description || "Sin descripción disponible" }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="language in guide.languages"
              :key="language"
              class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {{ language }}
            </span>
          </div>
          <footer class="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              :disabled="!guide.cv"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click="viewCv(guide.cv)"
            >
              <FileUser class="h-4 w-4" />
              CV
            </button>
            <button
              type="button"
              :disabled="busy"
              class="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              @click="emit('reject', guide.id)"
            >
              <X class="h-4 w-4" />
              Rechazar
            </button>
            <button
              type="button"
              :disabled="busy"
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              @click="emit('approve', guide.id)"
            >
              <Check class="h-4 w-4" />
              Aprobar
            </button>
          </footer>
        </article>
        <div ref="loadMoreTarget" class="py-2 text-center text-sm text-slate-500">
          <span v-if="loading">Cargando más solicitudes...</span>
          <span v-else-if="!hasMore">Mostrando {{ guides.length }} de {{ total }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
