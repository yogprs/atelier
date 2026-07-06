<script setup lang="ts">
import { ref } from "vue";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps<{
  visible: boolean;
  image: string;
  imageName: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", file: File): void;
}>();

const cropper = ref<any>(null);

const zoom = ref(1);

const zoomImage = (value: number) => {
  zoom.value += value;

  if (zoom.value < 1) zoom.value = 1;
  if (zoom.value > 3) zoom.value = 3;

  cropper.value?.zoom(zoom.value);
};

const save = () => {
  const result = cropper.value?.getResult();

  if (!result?.canvas) return;

  result.canvas.toBlob(
    (blob: Blob | null) => {
      if (!blob) return;

      const file = new File(
        [blob],
        props?.imageName ? `${props?.imageName}` : "avatar.jpg",
        {
          type: "image/jpeg",
        },
      );

      emit("save", file);
    },
    "image/jpeg",
    0.95,
  );
};
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-9999 bg-black flex flex-col">
    <!-- Header -->
    <div
      class="h-16 flex items-center justify-between px-6 bg-neutral-900 text-white"
    >
      <button @click="$emit('close')">✕</button>

      <span class="font-medium"> Drag the image to adjust </span>

      <button @click="save" class="text-green-400">Upload</button>
    </div>

    <!-- Cropper -->

    <div class="flex-1 relative bg-black">
      <Cropper
        ref="cropper"
        class="h-full w-full"
        :src="image"
        image-restriction="stencil"
        :stencil-component="CircleStencil"
        :stencil-props="{
          movable: false,
          scalable: false,
          aspectRatio: 1,
        }"
      />

      <!-- Zoom -->

      <div
        class="absolute right-6 top-1/2 -translate-y-1/2 bg-black/70 rounded-lg overflow-hidden"
      >
        <button class="w-12 h-12 text-white text-xl" @click="zoomImage(0.2)">
          +
        </button>

        <button
          class="w-12 h-12 text-white text-xl border-t border-white/20"
          @click="zoomImage(-0.2)"
        >
          −
        </button>
      </div>
    </div>
  </div>
</template>
