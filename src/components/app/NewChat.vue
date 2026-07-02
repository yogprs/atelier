<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/general";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import { Form } from "@primevue/forms";
import { Button, Image, InputGroup, InputText } from "primevue";
import { computed, onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "change-type", title: "direct" | "group"): void;
}>();

const searchModel = ref<string>();
const users = ref<User[]>();

const groupedUsers = computed(() => {
  if (!users.value) return {};

  const sorted = [...users.value].sort((a, b) =>
    a.username.localeCompare(b.username),
  );

  return sorted.reduce(
    (groups, user) => {
      const letter = user.username.charAt(0).toUpperCase();

      if (!groups[letter]) {
        groups[letter] = [];
      }

      groups[letter].push(user);

      return groups;
    },
    {} as Record<string, User[]>,
  );
});

const handleNewGroup = () => {
  emit("change-type", "group");
};

const getUsers = async () => {
  try {
    const response = await apiClient.get<ApiResponse<User[]>>("/users/");

    users.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getUsers();
});
</script>

<template>
  <div class="px-6 py-5">
    <Form @submit="console.log('masuk')" class="h-12.5 px-2">
      <InputGroup
        class="bg-neutral-inputBg! border border-neutral-300 text-neutral-400! rounded-xl h-12 overflow-hidden px-2 items-center shadow"
      >
        <Button unstyled class="flex gap-4 p-2 my-1 items-center rounded-xl">
          <template #icon>
            <span>
              <Icon icon="material-symbols:search" class="size-6" />
            </span>
          </template>
        </Button>

        <InputText
          v-model="searchModel"
          name="search"
          type="text"
          fluid
          placeholder="Search Contacts..."
          size="small"
          class="flex-1 bg-transparent border-0 shadow-none text-black/70! placeholder:text-black/50!"
          :pt="{
            root: {
              class:
                '!bg-transparent !border-0 !shadow-none focus:!ring-0 px-3',
            },
          }"
        />
      </InputGroup>
    </Form>

    <div class="px-2">
      <Button
        @click="handleNewGroup"
        unstyled
        class="w-full bg-neutral-inputBg border border-neutral-300 hover:bg-neutral-border/50 hover:border-secondary-light shadow transition-all duration-500 cursor-pointer rounded-xl my-4"
      >
        <div class="relative flex flex-row gap-2 items-center py-2 px-4">
          <div
            class="size-10 relative rounded-full bg-primary-lighter text-white"
          >
            <div class="p-2">
              <Icon icon="ion:people" class="size-6" />
            </div>
            <div
              class="absolute right-0 bottom-0 w-3 h-3 bg-primary-lighter rounded-lg flex justify-center items-center outline-2 outline-neutral-border"
            >
              <Icon icon="material-symbols:add" class="size-3" />
            </div>
          </div>
          <span class="text-sm font-medium">New Group</span>
        </div>
      </Button>
    </div>

    <div class="px-2 overflow-hidden">
      <div
        class="scroll-user bg-neutral-inputBg shadow border border-neutral-300 rounded-xl mb-4 h-fit max-h-72 overflow-y-auto"
      >
        <div v-for="(group, letter) in groupedUsers" :key="letter">
          <!-- Header Huruf -->
          <div
            class="sticky top-0 z-10 bg-neutral-inputBg px-4 py-2 text-xs font-semibold text-neutral-500"
          >
            {{ letter }}
          </div>

          <!-- User -->
          <div v-for="user in group" :key="user.id">
            <Button
              unstyled
              class="w-full hover:bg-neutral-border/50 transition-colors cursor-pointer"
            >
              <div
                class="relative flex items-center gap-3 px-4 py-3 border-b border-neutral-300"
              >
                <div
                  class="size-10 rounded-full bg-primary-lighter text-white flex items-center justify-center overflow-hidden"
                >
                  <!-- <Icon icon="ion:people" class="size-6" /> -->
                  <Image :src="user.avatar" :alt="`avatar-${user.username}`" />
                </div>

                <div class="flex flex-col items-start min-w-0">
                  <p class="text-sm font-medium truncate">
                    {{ user.username }}
                  </p>
                  <p class="text-xs truncate">{{ user.email }}</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-user::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-user::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-user::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroll-user::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
