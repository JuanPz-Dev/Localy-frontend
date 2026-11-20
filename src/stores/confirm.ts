import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfirmStore = defineStore("confirm", () => {
  const open = ref(false);
  const title = ref("");
  const description = ref("");
  const confirmText = ref("Confirmar");
  const cancelText = ref("Cancelar");
  let resolver: ((value: boolean) => void) | null = null;

  function ask(opts: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
  }) {
    title.value = opts.title;
    description.value = opts.description ?? "";
    confirmText.value = opts.confirmText ?? "Confirmar";
    cancelText.value = opts.cancelText ?? "Cancelar";
    open.value = true;
    return new Promise<boolean>((resolve) => (resolver = resolve));
  }

  function answer(value: boolean) {
    open.value = false;
    resolver?.(value);
    resolver = null;
  }

  return { open, title, description, confirmText, cancelText, ask, answer };
});
