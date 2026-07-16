<script setup lang="ts">
import { reactive, ref } from "vue";
import ImageCropper from "./ImageCropper.vue";
import { Icon } from "@iconify/vue";
import { Button, InputText, Message, ToggleSwitch } from "primevue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import type { BodyCreateGroup } from "@/types/room.ts";
import apiClient from "@/lib/apiClient.ts";
import type { ApiResponse } from "@/types/general.ts";
import { useRoomStore } from "@/stores/room.ts";

const emit = defineEmits<{
  (e: "visible", visible: boolean): void;
}>();

const roomStore = useRoomStore();

const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<string | null>();
const selectedFile = ref<File | null>(null);
const showCropper = ref<boolean>(false);
const cropImage = ref<string>("");
const initialValues = reactive({
  nameGroup: "",
  aboutGroup: "",
  isPrivate: false,
});

const resolver = ref(
  zodResolver(
    z.object({
      nameGroup: z.string().min(1, {
        message: "Group Name is Required.",
      }),
      aboutGroup: z.string().optional(),
      isPrivate: z.boolean(),
    }),
  ),
);

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  selectedFile.value = input.files[0];

  // console.log("selected", selectedFile.value.name);

  cropImage.value = URL.createObjectURL(selectedFile.value);

  showCropper.value = true;
};

const uploadAvatar = async (file: File) => {
  try {
    console.log(file);
  } catch (error) {
    console.error(error);
  }
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  let body: BodyCreateGroup = {
    name: values?.nameGroup,
    room_type: "group",
    is_private: values?.isPrivate,
    members: roomStore.selectedMembers ?? [],
  };

  if (values?.aboutGroup) {
    body.description = values?.aboutGroup;
  }

  await createGroup(body);
};

const createGroup = async (body: BodyCreateGroup): Promise<void> => {
  try {
    const response = await apiClient.post<ApiResponse>("/room/", body);

    roomStore.setSelectedRoom({
      id: response.data as string,
      targetUserId: null,
      roomType: "group",
    });

    roomStore.setUpdated(true, "create");

    emit("visible", false);
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="px-6 p-2">
    <Form
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col items-center py-6 px-4 mb-2"
    >
      <div
        @click="openFilePicker"
        class="w-48 h-48 rounded-full overflow-hidden mb-5 bg-neutral-border shrink-0 relative group cursor-pointer"
      >
        <img
          v-if="previewImage"
          :src="previewImage"
          alt="Group Avatar"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon icon="carbon:group" class="text-7xl" />
        </div>
        <div
          class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all"
        >
          <div class="flex flex-col items-center text-white">
            <Icon icon="carbon:camera" class="text-xl mb-1" />
            <span class="text-xs">{{
              `${selectedFile ? "Change" : "Add"} group avatar`
            }}</span>
          </div>
        </div>
        <!-- Hidden Input -->
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
      </div>

      <div class="flex flex-col w-full gap-3">
        <div class="w-full">
          <InputText
            name="nameGroup"
            type="text"
            placeholder="Group name"
            class="flex-1 bg-transparent border-0 shadow-none! text-black/70! placeholder:text-black/50!"
            size="small"
            fluid
            :pt="{
              root: {
                class:
                  'bg-neutral-bg! border-t-transparent! rounded-none! border-x-transparent! border-b! border-b-neutral-300! text-black/70! placeholder:text-black/50! ',
              },
            }"
          />
          <!-- {{ $form.nameGroup }} -->
          <Message
            v-if="$form.nameGroup?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.nameGroup.error?.message }}</Message
          >
        </div>

        <div class="w-full">
          <InputText
            name="aboutGroup"
            type="text"
            placeholder="Group Description"
            class="flex-1 bg-transparent border-0 shadow-none! text-black/70! placeholder:text-black/50!"
            size="small"
            fluid
            :pt="{
              root: {
                class:
                  'bg-neutral-bg! border-t-transparent! rounded-none! border-x-transparent! border-b! border-b-neutral-300! text-black/70! placeholder:text-black/50! ',
              },
            }"
          />
        </div>
      </div>

      <div class="flex w-full pt-4">
        <label class="text-black font-medium text-sm" for="isPrivate"
          >Private:</label
        >
        <ToggleSwitch
          input-id="isPrivate"
          name="isPrivate"
          :pt="{ root: 'scale-75 origin-right' }"
        />
      </div>

      <div class="w-full flex justify-end pt-2">
        <Button
          type="submit"
          unstyled
          class="flex gap-4 p-2 my-1 items-center rounded-xl cursor-pointer"
        >
          <template #default>
            <div class="flex gap-2">
              <span>Create Group</span>
              <span>
                <Icon icon="material-symbols:check" class="size-6" />
              </span>
            </div>
          </template>
        </Button>
      </div>
    </Form>
  </div>

  <ImageCropper
    :visible="showCropper"
    :image="cropImage"
    :image-name="selectedFile?.name ?? ''"
    @close="showCropper = false"
    @save="uploadAvatar"
  />
</template>

<style scoped></style>
