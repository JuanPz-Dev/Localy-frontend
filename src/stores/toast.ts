import { ref } from "vue";
import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", () => {
  const message = ref("");
  const type = ref<"success" | "error">("success");
  const show = ref(false);

  function showToast(toastMessage: string, toastType: "success" | "error" = "success") {
    message.value = toastMessage;
    type.value = toastType;
    show.value = true;

    setTimeout(() => {
      show.value = false;
    }, 3000);
  }
  return { message, type, show, showToast };
});
