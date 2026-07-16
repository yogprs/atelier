<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
  user: {
    name: string;
    phone: string;
    about: string;
    avatarUrl: string;
    isOnline?: boolean;
    lastSeen?: string;
  };
}>();

const emit = defineEmits(["close"]);
</script>

<template>
  <div
    class="flex flex-col h-full bg-neutral-bg w-full max-w-md border-l border-neutral-border/50 overflow-hidden overflow-y-auto relative"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-6 px-6 py-4 bg-neutral-white sticky top-0 z-20 shadow-sm"
    >
      <button
        @click="emit('close')"
        class="p-2 -ml-2 hover:bg-neutral-border/50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
      >
        <Icon icon="carbon:close" class="text-xl" />
      </button>
      <h2 class="text-base font-medium">Contact info</h2>
    </div>

    <!-- Profile Info -->
    <div class="flex flex-col items-center py-6 px-4 mb-2 shadow-sm">
      <div
        class="w-48 h-48 rounded-full overflow-hidden mb-5 bg-neutral-bg shrink-0 group"
      >
        <img
          v-if="user.avatarUrl"
          :src="user.avatarUrl"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon icon="carbon:user-avatar-filled" class="text-7xl" />
        </div>
      </div>
      <h1 class="text-2xl font-normal mb-1 text-center">
        {{ user.name }}
      </h1>
      <p class="text-sm">{{ user.phone }}</p>

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-4 mt-6 w-full">
        <button
          class="flex flex-col items-center justify-center gap-1 hover:bg-neutral-border/50 w-20 py-2 rounded-xl transition-colors"
        >
          <Icon icon="carbon:chat" class="text-2xl mb-1" />
          <span class="text-sm">Message</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 hover:bg-neutral-border/50 w-20 py-2 rounded-xl transition-colors"
        >
          <Icon icon="carbon:phone" class="text-2xl mb-1" />
          <span class="text-sm">Audio</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 hover:bg-neutral-border/50 w-20 py-2 rounded-xl transition-colors"
        >
          <Icon icon="carbon:video" class="text-2xl mb-1" />
          <span class="text-sm">Video</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 hover:bg-neutral-border/50 w-20 py-2 rounded-xl transition-colors"
        >
          <Icon icon="carbon:search" class="text-2xl mb-1" />
          <span class="text-sm">Search</span>
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="px-6 py-4 mb-2 shadow-sm">
      <h3 class="text-sm mb-1">About</h3>
      <p class="text-base">
        {{ user.about || "Hey there! I am using WhatsApp." }}
      </p>
    </div>

    <!-- Media, Links, Docs -->
    <div
      class="px-6 py-4 mb-2 shadow-sm flex items-center justify-between cursor-pointer hover:bg-neutral-border/50 transition-colors"
    >
      <span class="text-base">Media, links, and docs</span>
      <div class="flex items-center gap-1">
        <span class="text-sm">24</span>
        <Icon icon="carbon:chevron-right" class="text-xl" />
      </div>
    </div>

    <!-- Settings -->
    <div class="flex flex-col mb-2 shadow-sm">
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-border/50 transition-colors"
      >
        <span class="text-base">Mute notifications</span>
        <div class="w-10 h-5 rounded-full flex items-center p-1 cursor-pointer">
          <div class="w-4 h-4 rounded-full shadow-sm"></div>
        </div>
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-border/50 transition-colors"
      >
        <span class="text-base">Custom notifications</span>
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-border/50 transition-colors"
      >
        <span class="text-base">Media visibility</span>
      </div>
    </div>

    <!-- Security & Privacy -->
    <div class="flex flex-col mb-2 shadow-sm">
      <div
        class="px-6 py-4 flex flex-col cursor-pointer hover:bg-neutral-border/50 transition-colors"
      >
        <div class="flex items-center gap-3 mb-1">
          <Icon icon="carbon:locked" class="text-xl" />
          <span class="text-base">Encryption</span>
        </div>
        <span class="text-sm ml-8"
          >Messages and calls are end-to-end encrypted. Tap to verify.</span
        >
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-border/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <Icon icon="carbon:time" class="text-xl" />
          <span class="text-base">Disappearing messages</span>
        </div>
        <span class="text-sm">Off</span>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="flex flex-col mb-6 shadow-sm mt-2">
      <div
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:block-out" class="text-xl" />
        <span class="text-base">Block {{ user.name }}</span>
      </div>
      <div
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:warning-alt" class="text-xl" />
        <span class="text-base">Report {{ user.name }}</span>
      </div>
    </div>
  </div>
</template>
