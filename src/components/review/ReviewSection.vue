<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToastStore } from "@/stores/toast";
import api from "@/api/api";

const props = defineProps<{ tourId: string | number }>();
const emit = defineEmits<{ (e: "created"): void }>();

const toastStore = useToastStore();

const reviews = ref<any[]>([]);
const rating = ref(0);
const hoverRating = ref(0);
const comment = ref("");
const sending = ref(false);

async function getReviews() {
  try {
    const response = await api.get(`/reviews/tour/${props.tourId}`);
    reviews.value = response.data.content ?? response.data;
  } catch (error) {
    toastStore.showToast("Error al cargar las reseñas", "error");
  }
}

async function submitReview() {
  if (rating.value === 0) {
    toastStore.showToast("Selecciona una calificación", "error");
    return;
  }
  sending.value = true;
  try {
    await api.post(`/reviews/tour/${props.tourId}`, {
      rating: rating.value,
      comment: comment.value,
    });
    toastStore.showToast("Reseña publicada", "success");
    rating.value = 0;
    comment.value = "";
    await getReviews();
    emit("created"); // para que el padre recargue promedio y conteo
  } catch (error) {
    toastStore.showToast("No se pudo publicar la reseña", "error");
  } finally {
    sending.value = false;
  }
}

onMounted(getReviews);
</script>

<template>
  <section id="resenas" class="border-t border-gray-200 py-8">
    <h2 class="mb-6 text-2xl font-bold text-gray-900">Reseñas</h2>
    <div class="mb-8 rounded-2xl border border-gray-200 p-5">
      <p class="mb-2 text-sm font-medium text-gray-700">Tu calificación</p>
      <div class="mb-4 flex gap-1" @mouseleave="hoverRating = 0">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="text-3xl leading-none transition"
          :class="star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-300'"
          @mouseenter="hoverRating = star"
          @click="rating = star"
        >
          ★
        </button>
      </div>
      <textarea
        v-model="comment"
        rows="3"
        maxlength="500"
        placeholder="Cuéntanos cómo fue tu experiencia..."
        class="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-teal-600 resize-none"
      />
      <button
        type="button"
        :disabled="sending"
        class="mt-3 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
        @click="submitReview"
      >
        {{ sending ? "Publicando..." : "Publicar reseña" }}
      </button>
    </div>
    <p v-if="!reviews.length" class="text-gray-500">Aún no hay reseñas. ¡Sé el primero!</p>

    <ul v-else class="space-y-6">
      <li v-for="review in reviews" :key="review.id" class="flex gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700"
        >
          {{ review.userName?.charAt(0) || "U" }}
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ review.userName }}</p>
          <p class="text-sm text-yellow-500">
            {{ "★".repeat(review.rating)
            }}<span class="text-gray-300">{{ "★".repeat(5 - review.rating) }}</span>
          </p>
          <p class="mt-1 text-gray-600">{{ review.comment }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
