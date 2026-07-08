<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/general";
import type { RoomDetail, RoomMember } from "@/types/room";
import { Icon } from "@iconify/vue";
import { Form } from "@primevue/forms";
import { Button, Image, InputGroup, InputText } from "primevue";
import { computed, ref, Teleport, Transition, watch } from "vue";

interface Props {
  roomId: string;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
});

const visible = defineModel<boolean>("visible", {
  default: false,
});

const groupDetail = ref<RoomDetail>();
const searchModel = ref<string>();

const groupedUsers = computed(() => {
  if (!groupDetail.value?.members) return {};

  const sorted = [...groupDetail.value?.members].sort((a, b) =>
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
    {} as Record<string, RoomMember[]>,
  );
});

const close = () => {
  visible.value = false;
};

const onBackdropClick = () => {
  if (!props.persistent) {
    close();
  }
};

const getRoomDetail = async () => {
  if (!props.roomId) return;
  try {
    const response = await apiClient.get<ApiResponse<RoomDetail>>(
      `/room/${props.roomId}`,
    );

    groupDetail.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

watch(
  () => visible.value,
  () => {
    if (!visible.value) return;

    getRoomDetail();
  },
  {
    immediate: true,
  },
);
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
          <div class="flex items-center px-8 pt-4">
            <button
              class="p-2 hover:bg-neutral-border/50 rounded-full cursor-pointer"
              @click="close"
            >
              <span>
                <Icon icon="material-symbols:close" />
              </span>
            </button>

            <div class="flex items-center justify-between p-4">
              <h2 class="text-lg font-semibold">Search members</h2>
            </div>
          </div>

          <div class="pt-5">
            <Form @submit="console.log('masuk')" class="h-12.5 px-8">
              <InputGroup
                class="bg-neutral-inputBg! border border-neutral-300 text-neutral-400! rounded-xl h-12 overflow-hidden px-2 items-center shadow"
              >
                <Button
                  unstyled
                  class="flex gap-4 p-2 my-1 items-center rounded-xl"
                >
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
          </div>
          <div class="overflow-hidden pt-5 rounded-b-xl">
            <div
              class="scroll-user bg-neutral-inputBg h-fit max-h-112 overflow-y-auto"
            >
              <div
                v-for="(members, letter) in groupedUsers"
                :key="letter"
                class="px-8"
              >
                <div class="px-4 py-2 text-sm font-semibold text-neutral-500">
                  {{ letter }}
                </div>

                <div v-for="member in members" :key="member.user_id">
                  <Button
                    unstyled
                    class="w-full rounded-xl hover:bg-neutral-border/50 transition-colors cursor-pointer"
                  >
                    <div class="relative flex items-center gap-3 px-4 py-3">
                      <div
                        class="size-10 rounded-full bg-primary-lighter text-white flex items-center justify-center overflow-hidden"
                      >
                        <!-- <Icon icon="ion:people" class="size-6" /> -->
                        <Image
                          :src="member.avatar_url"
                          :alt="`avatar-${member.username}`"
                        />
                      </div>

                      <div class="flex flex-col items-start min-w-0">
                        <p class="text-sm font-medium truncate">
                          {{ member.username }}
                        </p>
                        <p class="text-xs truncate">{{ member.email }}</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
