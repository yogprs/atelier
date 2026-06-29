<script setup lang="ts">
import type {
  ChatHeaderProps,
  RoomDetailHeader,
  UserDetailHeader,
} from "@/types/chatMessage";
import type { RoomMember } from "@/types/room";
import { Icon } from "@iconify/vue";
import { Button, Image } from "primevue";
import { ref, watch } from "vue";

const props = defineProps<ChatHeaderProps>();

let timer: ReturnType<typeof setTimeout>;

const showPreviewText = ref<boolean>(true);

const membersFormat = (members: RoomMember[]) => {
  return members?.map((member) => member?.username).join(", ");
};

watch(
  () => props.data,
  () => {
    showPreviewText.value = true;

    clearTimeout(timer);

    timer = setTimeout(() => {
      showPreviewText.value = false;
    }, 3000);
  },
  { immediate: true },
);
</script>

<template>
  <div class="w-full bg-bg-neutral-bg shadow-sm">
    <div class="flex items-center gap-2 px-4 py-2 w-full overflow-hidden">
      <div class="flex w-full gap-2 overflow-hidden cursor-pointer">
        <div
          v-tooltip.bottom="{
            value: `${(props.data as RoomDetailHeader)?.room_type ? 'Group' : 'Profile'} details`,
            pt: {
              root: {
                class: 'mx-10!',
              },
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          class="size-12 shrink-0"
        >
          <div
            class="size-12 overflow-hidden rounded-full border-2 border-slate-200"
          >
            <Image
              v-if="props.data?.avatar"
              :src="props.data?.avatar"
              :alt="`avatar-${(props.data as RoomDetailHeader)?.name ?? (props.data as UserDetailHeader)?.username}`"
              class="size-12 object-cover"
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col justify-center min-w-0">
          <h1 class="text-lg font-medium truncate">
            {{
              (props.data as RoomDetailHeader)?.name ??
              (props.data as UserDetailHeader)?.username
            }}
          </h1>

          <p v-if="showPreviewText" class="text-sm truncate">
            {{
              `Click here for ${(props.data as RoomDetailHeader)?.room_type ? "group" : "contact"} info`
            }}
          </p>

          <p
            v-if="!showPreviewText && (props.data as RoomDetailHeader)?.members"
            class="text-sm truncate"
          >
            {{ membersFormat((props.data as RoomDetailHeader)?.members) }}
          </p>
        </div>
      </div>

      <div class="flex gap-1 shrink-0">
        <Button
          v-tooltip.bottom="{
            value: 'Search',
            pt: {
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          unstyled
          class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
        >
          <template #icon>
            <Icon
              icon="material-symbols:search"
              class="size-6 text-primary-base"
            />
          </template>
        </Button>
        <Button
          v-tooltip.bottom="{
            value: 'Menu',
            pt: {
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          unstyled
          class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
        >
          <template #icon>
            <Icon
              icon="material-symbols:more-vert"
              class="size-6 text-primary-base"
            />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
