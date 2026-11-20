<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import api from "@/api/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Nivel = "ALTA" | "MEDIA" | "BAJA";

interface Tour {
  id: number;
  title: string;
  category?: string;
  price?: number;
}

interface Prediccion {
  nivel_demanda: Nivel;
  experimental: boolean;
  advertencia: string;
  probabilidades_modelo: Record<string, number>;
}

interface PrediccionLote {
  tourId: number;
  prediccion: Prediccion;
}

interface TourCatalogo {
  id: number | string;
  title?: string | null;
  name?: string | null;
  category?: string | null;
  price?: number | string | null;
}

interface Fila {
  tour: Tour;
  prediccion: Prediccion | null;
  confianza: number;
}

const niveles: Nivel[] = ["ALTA", "MEDIA", "BAJA"];

const etiqueta: Record<Nivel, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

const color: Record<Nivel, string> = {
  ALTA: "#16a34a",
  MEDIA: "#d97706",
  BAJA: "#64748b",
};

const textoColor: Record<Nivel, string> = {
  ALTA: "text-green-700",
  MEDIA: "text-amber-700",
  BAJA: "text-slate-600",
};

const categorias: Record<string, string> = {
  HISTORICAL: "Histórico",
  GASTRONOMIC: "Gastronómico",
  CULTURAL: "Cultural",
  ISLANDS_AND_BEACHES: "Islas y playas",
  NIGHTLIFE: "Vida nocturna",
};

const filas = ref<Fila[]>([]);
const seleccionadaId = ref<number | null>(null);
const busqueda = ref("");
const filtro = ref<Nivel | null>(null);

const cargando = ref(false);
const consultando = ref(false);
const errorCatalogo = ref("");
const errorPrediccion = ref("");

const nombreCategoria = (c?: string) => (c ? (categorias[c] ?? c) : "Sin categoría");

const porcentaje = (v: number) => `${(v * 100).toFixed(1)}%`;

const precio = (p?: number) =>
  p == null
    ? "Precio no disponible"
    : new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(p);

const mayorProbabilidad = (p: Prediccion | null) =>
  p ? Math.max(0, ...Object.values(p.probabilidades_modelo ?? {})) : 0;

// Conteo de experiencias por nivel de demanda.
const conteo = computed(() => {
  const total = { ALTA: 0, MEDIA: 0, BAJA: 0 };

  for (const f of filas.value) {
    if (f.prediccion) {
      total[f.prediccion.nivel_demanda]++;
    }
  }

  return total;
});

// Opciones de los filtros superiores.
const opcionesFiltro = computed(() => [
  {
    valor: null,
    texto: "Todas",
    total: filas.value.length,
  },
  ...niveles.map((n) => ({
    valor: n,
    texto: etiqueta[n],
    total: conteo.value[n],
  })),
]);

// Filtrado y ordenamiento de la tabla.
const filasVisibles = computed(() => {
  const term = busqueda.value.trim().toLocaleLowerCase();

  const rango = (f: Fila) => (f.prediccion ? niveles.indexOf(f.prediccion.nivel_demanda) : 3);

  return filas.value
    .filter((f) => !filtro.value || f.prediccion?.nivel_demanda === filtro.value)
    .filter(
      (f) =>
        !term ||
        `${f.tour.title} ${nombreCategoria(f.tour.category)}`.toLocaleLowerCase().includes(term),
    )
    .sort((a, b) => rango(a) - rango(b) || b.confianza - a.confianza);
});

// Experiencia seleccionada.
const seleccionada = computed(
  () => filas.value.find((f) => f.tour.id === seleccionadaId.value) ?? null,
);

const prediccion = computed(() => seleccionada.value?.prediccion ?? null);

// Probabilidades de la experiencia seleccionada.
const probabilidades = computed(() =>
  niveles.map((n) => ({
    nivel: n,
    valor: prediccion.value?.probabilidades_modelo?.[n] ?? 0,
  })),
);

// Categorías que tienen experiencias con predicción.
const categoriasGrafica = computed(() => {
  const presentes = filas.value
    .filter((f) => f.prediccion)
    .map((f) => nombreCategoria(f.tour.category));

  return [...new Set(presentes)];
});

// Datos de la gráfica: cantidad de experiencias
// de cada categoría clasificadas en Alta, Media y Baja.
const datosCategorias = computed(() => ({
  labels: categoriasGrafica.value,

  datasets: niveles.map((nivel) => ({
    label: etiqueta[nivel],

    data: categoriasGrafica.value.map(
      (categoria) =>
        filas.value.filter(
          (f) =>
            f.prediccion?.nivel_demanda === nivel && nombreCategoria(f.tour.category) === categoria,
        ).length,
    ),

    backgroundColor: color[nivel],
    borderRadius: 4,
    maxBarThickness: 32,
  })),
}));

// Configuración visual de la gráfica.
const opcionesCategorias: ChartOptions<"bar"> = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },

    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x} experiencias`,
      },
    },
  },

  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0, stepSize: 1 },
      title: { display: true, text: "Cantidad de experiencias" },
    },
    y: {
      grid: { display: false },
    },
  },
};

// Experiencias con mayor probabilidad de demanda alta.
const ranking = computed(() =>
  filas.value
    .filter((f) => f.prediccion)
    .map((f) => ({
      fila: f,
      valor: f.prediccion?.probabilidades_modelo?.ALTA ?? 0,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8),
);

// Obtener todas las experiencias del catálogo.
async function traerCatalogo(): Promise<TourCatalogo[]> {
  const size = 100;
  let page = 0;
  let items: TourCatalogo[] = [];
  let total = Infinity;

  while (items.length < total) {
    const { data } = await api.get("/tours", {
      params: { page, size },
    });

    const lista: TourCatalogo[] = Array.isArray(data) ? data : (data?.content ?? []);

    items = items.concat(lista);

    total = Array.isArray(data) ? lista.length : (data?.totalElements ?? lista.length);

    if (lista.length === 0) break;

    page++;
  }

  return items;
}

// Consultar predicciones por lote.
async function traerPredicciones(tours: Tour[]): Promise<Fila[]> {
  try {
    const { data } = await api.get<PrediccionLote[]>("/api/predictions/demand/batch");

    const prediccionesPorId = new Map(data.map((p) => [p.tourId, p.prediccion]));

    return tours.map((tour) => {
      const prediccion = prediccionesPorId.get(tour.id) ?? null;

      return {
        tour,
        prediccion,
        confianza: mayorProbabilidad(prediccion),
      };
    });
  } catch (error: unknown) {
    console.error("Error al consultar las predicciones por lote:", error);

    return tours.map((tour) => ({
      tour,
      prediccion: null,
      confianza: 0,
    }));
  }
}

// Cargar catálogo y predicciones.
async function cargar() {
  cargando.value = true;
  errorCatalogo.value = "";

  try {
    const tours: Tour[] = (await traerCatalogo())
      .map((item) => ({
        id: Number(item.id),
        title: item.title ?? item.name ?? "Experiencia sin nombre",
        category: item.category ?? "",
        price: item.price == null ? undefined : Number(item.price),
      }))
      .filter((t) => Number.isFinite(t.id) && t.id > 0);

    if (tours.length === 0) {
      errorCatalogo.value = "El catálogo no tiene experiencias para mostrar.";
      return;
    }

    filas.value = await traerPredicciones(tours);
  } catch (err: unknown) {
    console.error("Error al cargar la analítica:", err);

    errorCatalogo.value = "No se pudieron cargar las experiencias.";
  } finally {
    cargando.value = false;
  }
}

// Reintentar la predicción individual si no llegó por lote.
async function reintentar(fila: Fila) {
  consultando.value = true;
  errorPrediccion.value = "";

  try {
    const { data } = await api.get<Prediccion>(`/api/predictions/demand/${fila.tour.id}`);

    fila.prediccion = data;
    fila.confianza = mayorProbabilidad(data);
  } catch (err: unknown) {
    console.error("Error al consultar la predicción:", err);

    errorPrediccion.value = "No se pudo consultar la predicción de esta experiencia.";
  } finally {
    consultando.value = false;
  }
}

// Seleccionar una experiencia de la tabla.
async function seleccionar(fila: Fila) {
  seleccionadaId.value = fila.tour.id;
  errorPrediccion.value = "";

  if (!fila.prediccion) {
    await reintentar(fila);
  }

  await nextTick();

  if (!window.matchMedia("(min-width: 1024px)").matches) {
    document.getElementById("detalle")?.scrollIntoView({ behavior: "smooth" });
  }
}

onMounted(cargar);
</script>

<template>
  <main class="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
    <p class="text-sm text-gray-500">Demanda que el modelo estima para la semana siguiente.</p>

    <p
      v-if="errorCatalogo"
      class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorCatalogo }}
    </p>

    <template v-else>
      <!-- Filtros y búsqueda -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-1">
          <button
            v-for="op in opcionesFiltro"
            :key="op.texto"
            type="button"
            @click="filtro = op.valor"
            :class="[
              'rounded-md px-3 py-1.5 text-sm transition',
              filtro === op.valor ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
          >
            {{ op.texto }}

            <span :class="filtro === op.valor ? 'text-indigo-200' : 'text-gray-400'">
              {{ op.total }}
            </span>
          </button>
        </div>

        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar experiencia"
          aria-label="Buscar experiencia"
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 sm:ml-auto sm:w-64"
        />
      </div>

      <!-- Tabla y detalle -->
      <div class="grid items-start gap-6 lg:grid-cols-3">
        <!-- Tabla de experiencias -->
        <div
          class="max-h-[36rem] overflow-auto rounded-lg border border-gray-200 bg-white lg:col-span-2"
        >
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th class="px-4 py-2.5 font-medium">Experiencia</th>

                <th class="px-4 py-2.5 font-medium">Categoría</th>

                <th class="px-4 py-2.5 font-medium">Demanda</th>

                <th class="px-4 py-2.5 text-right font-medium">Confianza</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="cargando">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                  Consultando el modelo...
                </td>
              </tr>

              <tr v-else-if="filasVisibles.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                  No hay experiencias que coincidan.
                </td>
              </tr>

              <tr
                v-for="fila in filasVisibles"
                :key="fila.tour.id"
                tabindex="0"
                @click="seleccionar(fila)"
                @keydown.enter="seleccionar(fila)"
                :class="[
                  'cursor-pointer border-t border-gray-100',
                  seleccionadaId === fila.tour.id ? 'bg-indigo-50' : 'hover:bg-gray-50',
                ]"
              >
                <td class="px-4 py-2.5 text-gray-900">
                  {{ fila.tour.title }}
                </td>

                <td class="px-4 py-2.5 text-gray-500">
                  {{ nombreCategoria(fila.tour.category) }}
                </td>

                <td
                  :class="[
                    'px-4 py-2.5 font-medium',
                    fila.prediccion ? textoColor[fila.prediccion.nivel_demanda] : 'text-gray-400',
                  ]"
                >
                  {{ fila.prediccion ? etiqueta[fila.prediccion.nivel_demanda] : "Sin dato" }}
                </td>

                <td class="px-4 py-2.5 text-right tabular-nums text-gray-500">
                  {{ fila.prediccion ? porcentaje(fila.confianza) : "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Panel de detalle -->
        <aside id="detalle" class="rounded-lg border border-gray-200 bg-white">
          <div class="p-5">
            <p v-if="!seleccionada" class="text-sm text-gray-500">
              Elige una experiencia de la tabla para ver el detalle.
            </p>

            <template v-else>
              <h2 class="font-semibold text-gray-900">
                {{ seleccionada.tour.title }}
              </h2>
              <p class="mt-0.5 text-sm text-gray-500">
                {{ nombreCategoria(seleccionada.tour.category) }}
                ·
                {{ precio(seleccionada.tour.price) }}
              </p>
              <p v-if="consultando" class="mt-4 text-sm text-gray-500">Consultando el modelo...</p>
              <p v-else-if="errorPrediccion" class="mt-4 text-sm text-red-600">
                {{ errorPrediccion }}
              </p>
              <template v-else-if="prediccion">
                <p class="mt-5 text-sm text-gray-500">Próxima semana</p>
                <p :class="['text-2xl font-semibold', textoColor[prediccion.nivel_demanda]]">
                  Demanda
                  {{ etiqueta[prediccion.nivel_demanda].toLowerCase() }}
                </p>
                <div class="mt-5 space-y-4">
                  <div v-for="p in probabilidades" :key="p.nivel" class="space-y-1.5">
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-gray-700">
                        {{ etiqueta[p.nivel] }}
                      </span>

                      <span class="tabular-nums text-gray-900">
                        {{ porcentaje(p.valor) }}
                      </span>
                    </div>
                    <div class="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        class="h-full rounded-full transition-all"
                        :style="{
                          width: `${p.valor * 100}%`,
                          backgroundColor: color[p.nivel],
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
                <p
                  v-if="prediccion.advertencia"
                  class="mt-4 border-l-2 border-amber-400 pl-3 text-sm text-gray-600"
                >
                  {{ prediccion.advertencia }}
                </p>
              </template>
            </template>
          </div>
          <div v-if="!cargando && ranking.length" class="border-t border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-900">Más probables de tener demanda alta</h2>

            <ul class="mt-3 space-y-3">
              <li v-for="item in ranking" :key="item.fila.tour.id">
                <button
                  type="button"
                  class="block w-full text-left"
                  @click="seleccionar(item.fila)"
                >
                  <span class="flex items-baseline justify-between gap-3 text-sm">
                    <span class="truncate text-gray-700">
                      {{ item.fila.tour.title }}
                    </span>

                    <span class="tabular-nums text-gray-500">
                      {{ porcentaje(item.valor) }}
                    </span>
                  </span>
                  <span class="mt-1 block h-1.5 rounded-full bg-gray-100">
                    <span
                      class="block h-full rounded-full bg-green-600"
                      :style="{
                        width: `${item.valor * 100}%`,
                      }"
                    ></span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </div>
      <section class="rounded-lg border border-gray-200 bg-white p-5">
        <div class="mb-5">
          <h2 class="font-semibold text-gray-900">Distribución de demanda por categoría</h2>
          <p class="mt-1 text-sm text-gray-500">
            Cantidad de experiencias clasificadas en cada nivel de demanda.
          </p>
        </div>
        <div v-if="!filas.some((f) => f.prediccion)" class="py-8 text-center text-sm text-gray-500">
          No hay predicciones disponibles para generar la gráfica.
        </div>
        <div v-else class="h-80">
          <Bar :data="datosCategorias" :options="opcionesCategorias" />
        </div>
        <p class="mt-3 text-xs text-gray-400">
          Los resultados corresponden a las estimaciones experimentales del modelo para la próxima
          semana.
        </p>
      </section>
    </template>
  </main>
</template>
