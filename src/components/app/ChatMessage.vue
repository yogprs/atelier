<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { Message, ChatMessageProps } from "@/types/chatMessage";
import apiClient from "@/lib/apiClient";
import type { RoomMessage } from "@/types/room";
import { formatDate, formatTime } from "@/utils/dateFormat";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/general";
import { toTitleCase } from "@/utils/stringFormat";

const auth = useAuthStore();

const props = defineProps<ChatMessageProps>();
const roomId = ref<string | null>();
const pageLimit = ref<number>(40);
const messages = ref<Message[]>();
const nextCursor = ref<string | null>();
const hasMore = ref<boolean>(false);
const loadingMessage = ref<boolean>(true);
const selectedMessageIds = ref<string[]>();
const scrollMessage = ref<any>(null);

// const handleScroll = (event: any) => {
//   const el = event.target;

//   console.log("scrollTop:", el.scrollTop);
//   console.log("scrollHeight:", el.scrollHeight);
//   console.log("clientHeight:", el.clientHeight);
// };

const toggleMessageSelection = (messageId: string) => {
  selectedMessageIds.value = selectedMessageIds.value?.includes(messageId)
    ? selectedMessageIds.value.filter((id) => id !== messageId)
    : [...(selectedMessageIds.value ?? []), messageId];
};

const scrollToDown = async () => {
  await nextTick();

  const el = scrollMessage.value;
  el.scrollTop = el.scrollHeight;
};

const fetchMessage = async (addtionalParams?: string) => {
  if (!roomId.value) return;
  loadingMessage.value = true;
  try {
    const endpoint = `/message/${roomId.value}?limit=${pageLimit.value}${addtionalParams ? addtionalParams : ""}`;
    const response = await apiClient.get<ApiResponse<RoomMessage>>(endpoint);
    nextCursor.value = response?.data?.next_cursor;
    hasMore.value = response?.data?.has_more ?? false;
    messages.value = response?.data?.messages?.reverse();

    scrollToDown();
  } catch (error) {
    console.error(error);
  } finally {
    loadingMessage.value = false;
  }
};

watch(
  () => props?.idRoom,
  () => {
    if (props?.idRoom !== roomId.value) {
      roomId.value = props.idRoom;
      fetchMessage();
    }
  },
  {
    immediate: true,
  },
);

// watch(
//   [hasMore.value, nextCursor.value, roomId.value],
//   () => {
//     fetchMessage(`&limit=${pageLimit.value}`);
//   },
//   {
//     immediate: true,
//   },
// );

// onMounted(() => {
//   scrollMessage.value?.addEventListener("scroll", handleScroll);
// });

// onUnmounted(() => {
//   scrollMessage.value?.removeEventListener("scroll", handleScroll);
// });
</script>

<template>
  <div class="w-full h-full pb-32">
    <div
      ref="scrollMessage"
      class="flex-1 w-full h-full overflow-y-auto scroll-message pb-2"
    >
      <div :key="message?.id" v-for="message in messages" class="px-4 pt-4">
        <!-- Date Separator -->
        <div class="w-full flex flex-col items-center my-3">
          <div
            class="px-3 py-1 rounded-full bg-[#ffffff14] border border-neutral-300"
          >
            <div class="flex items-center justify-center">
              <span class="text-[10px] font-semibold text-neutral-textMuted">
                {{ toTitleCase(formatDate(message?.timestamp, false)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- System Message -->
        <div
          v-if="message?.message_type === 'system'"
          class="w-full flex items-center my-2"
        >
          <span class="text-xs font-medium">
            {{ message?.content }}
          </span>
        </div>

        <!-- Message Chat -->
        <div
          :class="`w-full flex flex-col transition-all duration-300 ${selectedMessageIds?.includes(message?.id) ? 'bg-[#2563eb26]' : ''} ${message?.sender_id === auth?.user?.user_id ? 'items-end' : 'items-start'}`"
        >
          <!-- @click="toggleMessageSelection(message?.id)" -->
          <div
            @contextmenu.prevent="toggleMessageSelection(message?.id)"
            :class="`max-w-[80%] min-w-30 px-3 pt-1 pb-2 rounded-2xl cursor-pointer border border-neutral-300 shadow-sm ${message?.sender_id === auth?.user?.user_id ? 'bg-primary-lighter rounded-br-sm text-white' : 'bg-neutral-white rounded-bl-sm text-black'}`"
          >
            <div v-if="message?.sender_id !== auth?.user?.user_id" class="">
              <span class="text-xs font-semibold text-neutral-textMain">
                {{ message?.sender_name }}
              </span>
            </div>

            <div>
              <span
                :class="`text-xs ${message?.sender_id === auth?.user?.user_id ? 'text-white' : 'text-primary-base'}`"
              >
                {{ message?.content }}
              </span>
              <div class="flex flex-col items-end mt-px">
                <span
                  :class="`text-[10px] ${message?.sender_id === auth?.user?.user_id ? 'text-[#ffffff99]' : 'text-neutral-textMuted'}`"
                >
                  {{ formatTime(message?.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-message::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-message::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-message::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroll-message::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
