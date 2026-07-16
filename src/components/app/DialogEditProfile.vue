<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { Dialog, Button, InputText, Textarea } from "primevue";
import { Icon } from "@iconify/vue";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/general";
import type { User } from "@/types/user";

const visible = defineModel<boolean>("visible", {
  default: false,
});

const emit = defineEmits(["profileUpdated"]);

const auth = useAuthStore();
const isLoading = ref(false);
const userProfile = ref<Partial<User>>({});

const form = ref({
  username: "",
  about: "",
});

const fileInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

const getProfile = async () => {
  if (!auth.session?.user?.user_id) return;
  try {
    const response = await apiClient.get<ApiResponse<User>>(
      `/users/${auth.session?.user?.user_id}`,
    );
    userProfile.value = response.data as User;
    form.value.username = response.data?.username || "";
    form.value.about = response.data?.about || "";
    avatarPreview.value = response.data?.avatar || null;
  } catch (error) {
    console.error(error);
  }
};

watch(visible, (newVal) => {
  if (newVal) {
    avatarFile.value = null;
    getProfile();
  }
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  isLoading.value = true;
  try {
    // 1. Update text profile
    const profilePayload: { username?: string; about?: string } = {};
    if (form.value.username !== userProfile.value.username) {
      profilePayload.username = form.value.username;
    }
    if (form.value.about !== userProfile.value.about) {
      profilePayload.about = form.value.about;
    }

    if (Object.keys(profilePayload).length > 0) {
      await apiClient.patch("/users/avatar", profilePayload);
    }

    // 2. Update avatar if a new file is selected
    if (avatarFile.value) {
      const formData = new FormData();
      formData.append("avatar", avatarFile.value);
      await apiClient.patch("/users/avatar", formData);
    }

    await getProfile();
    emit("profileUpdated");
    visible.value = false;
  } catch (error) {
    console.error("Failed to update profile", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getProfile();
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Profile"
    :style="{ width: '400px' }"
    :pt="{
      root: 'bg-white/90! rounded-2xl! shadow-2xl! border border-neutral-100! text-black!',
      header: 'px-6 pt-6 pb-4 border-b border-neutral-100!',
      content: 'px-6 py-4',
      footer: 'px-6 pb-6 pt-2',
    }"
  >
    <div class="flex flex-col gap-6">
      <!-- Avatar Section -->
      <div class="flex flex-col items-center gap-3 mt-2">
        <div
          class="relative w-28 h-28 rounded-full overflow-hidden border-4 border-neutral-50 shadow-sm group cursor-pointer hover:border-primary-100 transition-colors duration-300"
          @click="triggerFileInput"
        >
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-neutral-100 flex items-center justify-center"
          >
            <Icon icon="lucide:user" class="size-12 text-neutral-400" />
          </div>

          <!-- Hover Overlay -->
          <div
            class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]"
          >
            <Icon icon="lucide:camera" class="size-6 text-white mb-1" />
            <span class="text-white text-xs font-medium">Change</span>
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
        <p class="text-xs text-neutral-400">Allowed formats: JPG, PNG, GIF</p>
      </div>

      <!-- Form Section -->
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="username" class="text-sm font-medium text-neutral-700"
            >Username</label
          >
          <InputText
            id="username"
            v-model="form.username"
            placeholder="Enter username"
            class="w-full p-2.5 rounded-lg border-neutral-200 focus:border-primary-base focus:ring-1 focus:ring-primary-base transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="about" class="text-sm font-medium text-neutral-700"
            >About</label
          >
          <Textarea
            id="about"
            v-model="form.about"
            rows="4"
            placeholder="Tell us about yourself"
            class="w-full p-2.5 rounded-lg border-neutral-200 focus:border-primary-base focus:ring-1 focus:ring-primary-base transition-all resize-none"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button
          label="Cancel"
          text
          class="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-4 py-2 rounded-lg font-medium transition-colors"
          @click="visible = false"
        />
        <Button
          label="Save Changes"
          :loading="isLoading"
          class="bg-primary-base text-white hover:bg-primary-600 px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
          @click="saveProfile"
        />
      </div>
    </template>
  </Dialog>
</template>
