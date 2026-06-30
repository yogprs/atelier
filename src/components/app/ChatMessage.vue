<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type {
  Message,
  ChatMessageProps,
  MessageType,
} from "@/types/chatMessage";
import apiClient from "@/lib/apiClient";
import type { RoomMessage } from "@/types/room";
import { formatDate, formatTime } from "@/utils/dateFormat";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/general";
import { toTitleCase } from "@/utils/stringFormat";
import { Button, Image, InputGroup, InputText, useToast } from "primevue";
import dayjs from "dayjs";
import { Icon } from "@iconify/vue";
import { useWebSocketStore } from "@/stores/websocket";

const toast = useToast();
const auth = useAuthStore();
const websocket = useWebSocketStore();

const props = defineProps<ChatMessageProps>();
const roomId = ref<string | null>();
const pageLimit = ref<number>(40);
const messages = ref<Message[]>();
const nextCursor = ref<string | null>();
const hasMore = ref<boolean>(false);
const loadingMessage = ref<boolean>(true);
const selectedMessageIds = ref<string[]>();
const scrollMessage = ref<any>(null);
const messageModel = ref<string | null>();
const lastProcessedTriggerRef = ref<number>(websocket.triggerUpdate);

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

const showingDate = (
  allTimestamp: string[],
  thisTimestamp: string,
  index: number,
) => {
  const currentDate = dayjs(thisTimestamp).format("YYYY-MM-DD");
  const previousDate =
    index > 0 ? dayjs(allTimestamp[index - 1]).format("YYYY-MM-DD") : null;
  return currentDate !== previousDate;
};

const handleSendMessage = async () => {
  if (!roomId.value) {
    await createDirectMessage(props?.idUser as string, "text");
    return;
  }
  return await handleSendMessageHaveId();
};

const scrollToDown = async () => {
  await nextTick();

  const el = scrollMessage.value;
  el.scrollTop = el.scrollHeight;
};

const createDirectMessage = async (
  userId: string,
  messageType: MessageType,
) => {
  try {
    const response = await apiClient.post<ApiResponse>("/room/direct", {
      target_user_id: userId,
      message_type: messageType,
      content: messageModel.value,
    });

    roomId.value = response.data as string;
    messageModel.value = null;
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Failed to create direct message.",
    });
  }
};

const handleSendMessageHaveId = async () => {
  const hasText = messageModel.value && messageModel.value?.trim().length > 0;

  if (!hasText) return;

  const now = new Date().toISOString();

  const payload = {
    type: "message_group",
    room_id: roomId.value as string,
    data: {
      room_id: roomId.value,
      content: messageModel.value,
      message_type: "text",
      sender_name: auth.session?.user?.username,
    },
  };

  websocket.send(payload);

  const newMessage: Message = {
    id: `temp-${Date.now()}`,
    room_id: roomId.value as string,
    sender_id: auth.session?.user?.user_id || "",
    sender_name: auth.session?.user?.username || "",
    content: messageModel.value as string,
    message_type: "text",
    timestamp: now,
  };

  messages.value = [...messages.value!, newMessage];

  messageModel.value = null;
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

watch(
  () => websocket.triggerUpdate,
  () => {
    if (websocket.triggerUpdate === lastProcessedTriggerRef.value) return;

    lastProcessedTriggerRef.value = websocket.triggerUpdate;

    const msg = websocket.lastMessage;

    if (!msg) return;

    if (msg.type === "error" || msg.type === "error") {
      toast.add({
        severity: "error",
        summary: msg.body ?? "Something went wrong.",
      });

      websocket.setLastMessage(null);

      return;
    }

    if (msg.type === "upload_batch_status") {
      const data = msg.data ?? {};
      const status: string = data.status ?? "unknown";
      const totalFiles: number = data.total_files ?? 0;
      const successCount: number = data.success_count ?? 0;
      const failedCount: number = data.failed_count ?? 0;

      let toastSeverity:
        | "error"
        | "success"
        | "info"
        | "warn"
        | "secondary"
        | "contrast" = "info";

      let detail = "";

      if (status === "success") {
        toastSeverity = "success";
        detail = `${successCount}/${totalFiles} file(s) uploaded successfully`;
      } else if (status === "failed") {
        toastSeverity = "error";
        detail = `Upload failed — ${failedCount}/${totalFiles} file(s) failed`;
      } else if (status === "partial_failed") {
        toastSeverity = "error";
        detail = `${successCount}/${totalFiles} uploaded, ${failedCount} failed`;
      } else {
        detail = `Upload status: ${status}`;
      }

      toast.add({
        severity: toastSeverity,
        summary: "Upload Status",
        detail: detail,
        life: toastSeverity === "error" ? 5000 : 3000,
      });

      websocket.setLastMessage(null);

      return;
    }

    const isChatMessage =
      msg.room_id === roomId.value &&
      (msg.type === "text" ||
        msg.type === "image" ||
        msg.type === "file" ||
        msg.type === "message");

    if (isChatMessage) {
      const resolvedType =
        msg.type === "image" ? "image" : msg.type === "file" ? "file" : "text";

      const incomingMessage: Message = {
        id: msg.message_id || `ws-${Date.now()}`,
        room_id: msg.room_id,
        sender_id: msg.sender_id || "",
        sender_name: msg.sender_name || "",
        content: msg.body || "",
        message_type: resolvedType,
        timestamp: new Date(msg.timestamp || Date.now()).toISOString(),
      };

      const existingIndex = (messages.value as Message[]).findIndex(
        (m) =>
          m.id === incomingMessage.id ||
          (m.id.startsWith("temp-") &&
            !m.id.startsWith("temp-image-") &&
            !m.id.startsWith("temp-file-") &&
            m.content === incomingMessage.content &&
            m.sender_name === incomingMessage.sender_name &&
            m.room_id === incomingMessage.room_id) ||
          (m.id.startsWith("temp-image-") &&
            m.sender_name === incomingMessage.sender_name &&
            m.room_id === incomingMessage.room_id) ||
          (m.id.startsWith("temp-file-") &&
            m.sender_name === incomingMessage.sender_name &&
            m.room_id === incomingMessage.room_id),
      );

      if (existingIndex !== -1) {
        const updatedMessages = [...(messages.value ?? [])];
        updatedMessages[existingIndex] = incomingMessage;
        messages.value = updatedMessages;
      } else {
        messages.value = [...(messages.value ?? []), incomingMessage];
      }
    }
    websocket.setLastMessage(null);
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
  <div class="w-full h-full pb-30">
    <div
      ref="scrollMessage"
      class="flex-1 w-full h-full overflow-y-auto scroll-message pb-2"
    >
      <div
        :key="message?.id"
        v-for="(message, index) in messages"
        class="px-4 pt-4"
      >
        <!-- Date Separator -->
        <div
          v-if="
            showingDate(
              messages?.map((val) => val?.timestamp) as string[],
              message?.timestamp,
              index,
            )
          "
          class="w-full flex flex-col items-center my-3"
        >
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
          class="w-full flex items-center justify-center my-2"
        >
          <p class="text-xs font-medium">
            {{ message?.content }}
          </p>
        </div>

        <!-- Message Chat -->
        <div
          :class="`w-full flex flex-col transition-all duration-300 ${selectedMessageIds?.includes(message?.id) ? 'bg-[#2563eb26]' : ''} ${message?.sender_id === auth?.user?.user_id ? 'items-end' : 'items-start'}`"
        >
          <!-- @click="toggleMessageSelection(message?.id)" -->
          <div
            v-if="message?.message_type === 'file'"
            @contextmenu.prevent="toggleMessageSelection(message?.id)"
            :class="`max-w-[80%] min-w-30 px-3 pt-1 pb-2 rounded-2xl cursor-pointer border border-neutral-300 shadow-sm ${message?.sender_id === auth?.user?.user_id ? 'bg-primary-lighter rounded-br-sm text-white' : 'bg-neutral-white rounded-bl-sm text-black'}`"
          >
            <div v-if="message?.sender_id !== auth?.user?.user_id">
              <span class="text-xs font-semibold text-neutral-textMain">
                {{ message?.sender_name }}
              </span>
            </div>

            <div>
              <!-- Content File -->
              <span
                :class="`text-xs ${message?.sender_id === auth?.user?.user_id ? 'text-white' : 'text-primary-base'}`"
              >
                {{ message?.content?.replace("📎 ", "") || "File" }}
              </span>
            </div>
          </div>
          <div
            v-else-if="
              message?.message_type === 'image' && message?.attachments
            "
            @contextmenu.prevent="toggleMessageSelection(message?.id)"
            :class="`max-w-[80%] min-w-30 px-3 pt-1 pb-2 rounded-2xl cursor-pointer border border-neutral-300 shadow-sm ${message?.sender_id === auth?.user?.user_id ? 'bg-primary-lighter rounded-br-sm text-white' : 'bg-neutral-white rounded-bl-sm text-black'}`"
          >
            <div v-if="message?.sender_id !== auth?.user?.user_id">
              <span class="text-xs font-semibold text-neutral-textMain">
                {{ message?.sender_name }}
              </span>
            </div>

            <div>
              <!-- Content Image -->
              <div
                :class="`${message?.attachments?.length > 1 ? 'grid grid-cols-2' : 'grid grid-cols-1'} gap-1 rounded-xl overflow-hidden pt-2 relative`"
              >
                <div
                  v-if="message?.attachments?.length > 0"
                  v-for="(image, index) in message?.attachments?.slice(0, 4)"
                  :key="index"
                  :class="`${message?.attachments?.length > 1 ? 'w-25! h-25! rounded-lg!' : 'w-45! h-45! rounded-xl!'}`"
                >
                  <Image
                    :src="image"
                    :alt="image"
                    preview
                    :pt="{
                      root: {
                        class: 'w-full h-full',
                      },
                      image: {
                        class: 'w-full h-full object-cover',
                      },
                    }"
                  />
                </div>
                <div
                  v-if="message?.attachments?.length > 4"
                  class="absolute right-0 bottom-0 w-25 h-25 rounded-lg flex flex-col justify-center items-center bg-[#00000080]"
                >
                  <span class="text-sm font-semibold text-white">
                    + {{ message?.attachments?.length - 4 }}
                  </span>
                </div>
              </div>
              <!-- Content Message -->
              <p
                v-if="message?.content"
                :class="`text-xs ${message?.sender_id === auth?.user?.user_id ? 'text-white' : 'text-primary-base'}`"
              >
                {{ message?.content }}
              </p>
              <div class="flex flex-col items-end mt-px">
                <span
                  :class="`text-[10px] ${message?.sender_id === auth?.user?.user_id ? 'text-[#ffffff99]' : 'text-neutral-textMuted'}`"
                >
                  {{ formatTime(message?.timestamp) }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-else-if="message?.content && message?.message_type !== 'system'"
            @contextmenu.prevent="toggleMessageSelection(message?.id)"
            :class="`max-w-[80%] min-w-30 px-3 pt-1 pb-2 rounded-2xl cursor-pointer border border-neutral-300 shadow-sm ${message?.sender_id === auth?.user?.user_id ? 'bg-primary-lighter rounded-br-sm text-white' : 'bg-neutral-white rounded-bl-sm text-black'}`"
          >
            <div v-if="message?.sender_id !== auth?.user?.user_id">
              <span class="text-xs font-semibold text-neutral-textMain">
                {{ message?.sender_name }}
              </span>
            </div>
            <!-- Content Message -->
            <p
              :class="`text-xs ${message?.sender_id === auth?.user?.user_id ? 'text-white pt-2' : 'text-primary-base'}`"
            >
              {{ message?.content }}
            </p>
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
    <div class="w-full h-full bg-transparent">
      <div class="h-12.5 px-4">
        <InputGroup
          class="bg-neutral-inputBg! border border-neutral-300 text-neutral-400! rounded-full h-12 overflow-hidden px-2 items-center"
        >
          <Button
            v-tooltip.top="{
              value: 'Attach',
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
            class="flex gap-4 p-2 my-1 items-center rounded-full cursor-pointer transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <span>
                <Icon icon="material-symbols:add" class="size-6" />
              </span>
            </template>
          </Button>

          <Button
            v-tooltip.top="{
              value: 'Emojis, GIFs, Stickers',
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
            class="flex gap-4 p-2 my-1 items-center rounded-full cursor-pointer transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <span>
                <Icon icon="material-symbols:sticker-outline" class="size-6" />
              </span>
            </template>
          </Button>
          <InputText
            v-model="messageModel"
            placeholder="Type a message"
            class="flex-1 bg-transparent border-0 shadow-none text-black/70! placeholder:text-black/50!"
            :pt="{
              root: {
                class:
                  '!bg-transparent !border-0 !shadow-none focus:!ring-0 px-3',
              },
            }"
          />

          <Button
            @click="handleSendMessage"
            v-tooltip.top="{
              value: 'Send',
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
            class="flex gap-4 p-2 my-1 items-center rounded-full cursor-pointer transition-all duration-500 bg-primary-lighter hover:bg-primary-lighter/80"
          >
            <template #icon>
              <span>
                <Icon icon="material-symbols:send" class="size-6 text-white" />
              </span>
            </template>
          </Button>
        </InputGroup>
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
