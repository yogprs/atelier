<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/general";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import { Button, Image } from "primevue";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const auth = useAuthStore();

const profile = ref<User>();
const currentRoute = computed(() => route.path);

const getProfile = async () => {
  const response = await apiClient.get<ApiResponse<User>>(
    `/users/${auth.session?.user?.user_id}`,
  );

  profile.value = response.data;
};

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

onMounted(() => {
  getProfile();
});
</script>

<template>
  <nav class="w-full max-w-20 h-full text-black bg-neutral-white shadow-xl">
    <div class="flex flex-col justify-between h-full items-center">
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
                    currentRoute.includes(menu.path)
                      ? menu.iconActive
                      : menu.icon
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
      <div class="py-2">
        <Button
          unstyled
          v-tooltip.right="{
            value: 'You',
            pt: {
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          :class="`flex items-center justify-center p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 group hover:bg-[#F0F2FF] overflow-hidden`"
        >
          <div class="overflow-hidden rounded-full size-8">
            <Image
              :src="profile?.avatar"
              :alt="`profile-${profile?.username}`"
              class="w-full h-full object-cover rounded-full"
            />
          </div>
        </Button>
      </div>
    </div>
  </nav>
</template>
