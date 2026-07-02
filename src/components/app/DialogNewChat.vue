<script setup lang="ts">
import { computed, ref } from "vue";
import NewChat from "./NewChat.vue";
import { Icon } from "@iconify/vue";

interface Props {
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
});

const visible = defineModel<boolean>("visible", {
  default: false,
});

const viewType = ref<"direct" | "group">("direct");
// const title = ref<"New Chat" | "New Group">("New Chat");

const title = computed(() =>
  viewType.value === "direct" ? "New Chat" : "New Group",
);

const close = () => {
  visible.value = false;
  viewType.value = "direct";
};

const onBackdropClick = () => {
  if (!props.persistent) {
    close();
  }
};

const setType = (type: "direct" | "group") => {
  viewType.value = type;
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black"
        @click.self="onBackdropClick"
      >
        <div
          class="w-full max-w-lg rounded-xl bg-neutral-bg shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="$slots.header || title"
            class="flex items-center justify-between px-8 pt-4"
          >
            <slot name="header">
              <h2 class="text-lg font-semibold">
                {{ title }}
              </h2>
            </slot>

            <button
              class="p-2 hover:bg-neutral-border/50 rounded-full cursor-pointer"
              @click="close"
            >
              <span>
                <Icon icon="material-symbols:close" />
              </span>
            </button>
          </div>

          <!-- Body -->
          <!-- <div class="px-6 py-5">
            <slot />
          </div> -->
          <NewChat v-if="viewType === 'direct'" @change-type="setType" />

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex justify-end gap-2 border-t px-6 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
