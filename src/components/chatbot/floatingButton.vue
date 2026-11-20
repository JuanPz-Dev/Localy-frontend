<script setup lang="ts">
import { MessageCircle, X } from "lucide-vue-next";
import { ref, nextTick } from "vue";
import { marked } from "marked";
import api from "@/api/api";
import DOMPurify from "dompurify";

function renderMessage(text: string): string {
  const html = marked.parse(text, { async: false });
  return DOMPurify.sanitize(html);
}

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

interface ChatResponse {
  response: string;
}

const isOpen = ref(false);
const inputMessage = ref("");
const isLoading = ref(false);

const messages = ref<ChatMessage[]>([
  {
    role: "assistant",
    text: "¡Hola! Soy el asistente de Localy. ¿Buscas una experiencia turística en Cartagena?",
  },
]);

const messagesContainer = ref<HTMLElement | null>(null);

async function scrollToBottom() {
  await nextTick();

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function sendMessage() {
  const message = inputMessage.value.trim();

  if (!message || isLoading.value) return;

  messages.value.push({
    role: "user",
    text: message,
  });

  inputMessage.value = "";
  isLoading.value = true;

  await scrollToBottom();

  try {
    const { data } = await api.post<ChatResponse>("/chat", {
      message,
    });

    messages.value.push({
      role: "assistant",
      text: data.response,
    });
  } catch (error) {
    console.error("Error al consultar el chatbot:", error);

    messages.value.push({
      role: "assistant",
      text: "No pude responder en este momento. Intenta nuevamente.",
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
}
</script>
<template>
  <div class="fixed bottom-6 right-6 z-50">
    <div
      v-if="isOpen"
      class="absolute bottom-16 right-0 mb-3 flex w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-96"
    >
      <div class="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <MessageCircle :size="20" />
          </div>
          <div>
            <p class="text-sm font-semibold">Asistente Localy</p>
            <p class="text-xs text-gray-300">¿En qué podemos ayudarte?</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Cerrar asistente"
          class="rounded-full p-1 transition hover:bg-white/10"
          @click="isOpen = false"
        >
          <X :size="18" />
        </button>
      </div>
      <div ref="messagesContainer" class="flex h-72 flex-col gap-3 overflow-y-auto p-4">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="max-w-[90%] wrap-break-word rounded-2xl px-4 py-3 text-sm"
          :class="
            message.role === 'user'
              ? 'self-end whitespace-pre-wrap rounded-tr-sm bg-gray-900 text-white'
              : 'self-start rounded-tl-sm bg-gray-100 text-gray-700'
          "
        >
          <div
            v-if="message.role === 'assistant'"
            class="chat-markdown"
            v-html="renderMessage(message.text)"
          ></div>

          <span v-else>{{ message.text }}</span>
        </div>
        <div
          v-if="isLoading"
          class="self-start rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          Localy está escribiendo...
        </div>
      </div>
      <div class="border-t border-gray-100 p-3">
        <form class="flex items-center gap-2" @submit.prevent="sendMessage">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Escribe tu pregunta..."
            autocomplete="off"
            :disabled="isLoading"
            class="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            :disabled="isLoading || !inputMessage.trim()"
            class="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            →
          </button>
        </form>
      </div>
    </div>
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
      :aria-label="isOpen ? 'Cerrar asistente' : 'Abrir asistente'"
    >
      <X v-if="isOpen" :size="24" />
      <MessageCircle v-else :size="25" />
    </button>
  </div>
</template>

<style scoped>
.chat-markdown :deep(p) {
  margin: 0 0 0.65rem;
  line-height: 1.6;
}
.chat-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.chat-markdown :deep(strong) {
  font-weight: 700;
}
.chat-markdown :deep(h1),
.chat-markdown :deep(h2),
.chat-markdown :deep(h3) {
  margin: 0.85rem 0 0.4rem;
  font-weight: 700;
  line-height: 1.4;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  margin: 0.5rem 0 0.75rem;
  padding-left: 1.25rem;
}
.chat-markdown :deep(ul) {
  list-style: disc;
}
.chat-markdown :deep(ol) {
  list-style: decimal;
}
.chat-markdown :deep(li) {
  margin-bottom: 0.35rem;
  line-height: 1.5;
}
.chat-markdown :deep(hr) {
  margin: 0.75rem 0;
  border-color: #d1d5db;
}
</style>
