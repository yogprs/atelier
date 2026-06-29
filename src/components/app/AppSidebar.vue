<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Button } from "primevue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const currentRoute = computed(() => route.path);

const menus = [
  {
    name: "Chats",
    icon: "ic:outline-chat",
    iconActive: "ic:baseline-chat",
    path: "/app/chats",
  },
  {
    name: "Calls",
    icon: "material-symbols:call-outline",
    iconActive: "material-symbols:call",
    path: "/app/calls",
  },
];
</script>

<template>
  <nav class="w-full max-w-20 h-full text-black bg-neutral-white shadow-xl">
    <div class="flex flex-col gap-2 p-4">
      <div :key="index" v-for="(menu, index) in menus">
        <Button
          unstyled
          v-tooltip.right="{
            value: menu.name,
            pt: {
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          :class="`flex items-center justify-center p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 group hover:bg-[#F0F2FF] ${currentRoute.includes(menu.path) ? 'bg-[#F0F2FF]' : ''}`"
        >
          <template #icon>
            <div class="p-1">
              <Icon
                :icon="
                  currentRoute.includes(menu.path) ? menu.iconActive : menu.icon
                "
                :class="`size-6 group-hover:text-primary-base ${
                  currentRoute.includes(menu.path)
                    ? 'text-primary-base'
                    : 'text-neutral-textMuted'
                }`"
              />
            </div>
          </template>
        </Button>
      </div>
    </div>
  </nav>
</template>
