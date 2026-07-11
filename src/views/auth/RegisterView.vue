<script setup lang="ts">
import { Form, type FormSubmitEvent } from "@primevue/forms";
import {
  Button,
  Card,
  Divider,
  InputGroup,
  InputGroupAddon,
  InputText,
  Message,
  Password,
  useToast,
} from "primevue";
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import { Icon } from "@iconify/vue";
import { handleAuthWithProvider } from "@/services/oauth/oauthService";
import apiClient from "@/lib/apiClient";
import type { BodyRegister, RegisterResponse } from "@/types/auth";
import { useRouter } from "vue-router";

const toast = useToast();
const router = useRouter();

const initialValues = reactive({
  username: "",
  email: "",
  password: "",
});

const resolver = ref(
  zodResolver(
    z.object({
      username: z
        .string()
        .min(3, { message: "Minimum 3 characters." })
        .max(50, { message: "Maximum 50 characters." }),
      email: z
        .email({
          error: "Invalid email address",
        })
        .min(1, {
          message: "Email is required.",
        }),
      password: z
        .string()
        .min(8, { message: "Minimum 8 characters." })
        .max(30, { message: "Maximum 30 characters." }),
    }),
  ),
);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  await handleRegister(values as BodyRegister);
};

const handleRegister = async (values: BodyRegister) => {
  try {
    await apiClient.post<RegisterResponse>("/users/register", values);

    toast.add({
      severity: "success",
      summary: "Registration successful",
      detail: "Your account has been created successfully. Please login.",
      life: 3000,
    });

    router.replace("/auth/login");
  } catch (e: any) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: e?.message ?? "Unknown Error",
      life: 3000,
    });
  }
};

const loginGithub = (): void => {
  handleAuthWithProvider("github");
};

const loginGoogle = (): void => {
  handleAuthWithProvider("google");
};
</script>

<template>
  <div class="w-full h-full overflow-y-auto">
    <div class="w-full grow flex items-center justify-center py-12">
      <Card
        :pt="{
          root: {
            class:
              'relative !w-full !max-w-[440px] !bg-neutral-white !rounded-xl border-neutral-border border',
          },
        }"
      >
        <template #content>
          <div class="w-full h-full pt-8 px-8">
            <div class="w-full flex flex-col gap-2 justify-center items-center">
              <h1 class="text-2xl font-bold text-black">Create an Account</h1>
              <span class="text-sm font-normal text-black"
                >Sign up for Atelier App.</span
              >
            </div>
            <div class="py-2">
              <Form
                v-slot="$form"
                :initialValues
                :resolver
                @submit="onFormSubmit"
                class="flex flex-col gap-4 w-full"
              >
                <div class="flex flex-col gap-1">
                  <label class="text-black font-medium text-sm" for="username"
                    >Username</label
                  >
                  <InputGroup>
                    <InputGroupAddon
                      :pt="{
                        root: {
                          class: 'bg-neutral-inputBg! text-[#767586]!',
                        },
                      }"
                    >
                      <Icon icon="ic:outline-person" />
                    </InputGroupAddon>
                    <InputText
                      name="username"
                      type="text"
                      placeholder="Username"
                      autocomplete="username"
                      size="small"
                      fluid
                      :pt="{
                        root: {
                          class:
                            'bg-neutral-inputBg! text-black! disabled:bg-secondary-light! disabled:border-neutral-border!',
                        },
                      }"
                    />
                  </InputGroup>
                  <Message
                    v-if="$form.username?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.username.error?.message }}</Message
                  >
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-black font-medium text-sm" for="email"
                    >Email</label
                  >
                  <InputGroup>
                    <InputGroupAddon
                      :pt="{
                        root: {
                          class: 'bg-neutral-inputBg! text-[#767586]!',
                        },
                      }"
                    >
                      <Icon icon="ic:outline-email" />
                    </InputGroupAddon>
                    <InputText
                      name="email"
                      type="email"
                      placeholder="name@gmail.com"
                      autocomplete="email"
                      size="small"
                      fluid
                      :pt="{
                        root: {
                          class:
                            'bg-neutral-inputBg! text-black! disabled:bg-secondary-light! disabled:border-neutral-border!',
                        },
                      }"
                    />
                  </InputGroup>
                  <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.email.error?.message }}</Message
                  >
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-black font-medium text-sm" for="password"
                    >Password</label
                  >
                  <InputGroup>
                    <InputGroupAddon
                      :pt="{
                        root: {
                          class: 'bg-neutral-inputBg! text-[#767586]!',
                        },
                      }"
                    >
                      <Icon icon="ic:outline-lock" />
                    </InputGroupAddon>
                    <Password
                      name="password"
                      placeholder="********"
                      :feedback="false"
                      size="small"
                      fluid
                      toggleMask
                      :pt="{
                        pcInputText: {
                          root: {
                            class:
                              'bg-neutral-inputBg! text-black! disabled:bg-secondary-light! disabled:border-neutral-border!',
                          },
                        },
                      }"
                    />
                  </InputGroup>
                  <template v-if="$form.password?.invalid">
                    <Message
                      v-for="(error, index) of $form.password.errors"
                      :key="index"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ error.message }}</Message
                    >
                  </template>
                </div>
                <Button
                  type="submit"
                  severity="secondary"
                  label="Sign Up"
                  class="rounded-lg!"
                />
                <div class="flex justify-center items-center mt-1">
                  <span class="text-sm font-medium text-black"
                    >Already have an account?</span
                  >
                  <Button
                    label="Login"
                    variant="text"
                    class="p-0! ml-1! active:bg-transparent! text-sm! font-bold! text-black! hover:underline!"
                    size="small"
                    @click="router.push('/auth/login')"
                  />
                </div>
              </Form>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex flex-col gap-2 w-full px-8 pb-8">
            <Divider
              align="center"
              type="solid"
              class="custom-divider"
              :pt="{
                content: {
                  class: 'bg-white! text-black! text-sm! font-medium!',
                },
              }"
            >
              <span>OR CONTINUE WITH</span>
            </Divider>

            <Button
              @click="loginGoogle"
              label="Sign up with Google"
              variant="outlined"
              severity="contrast"
              :pt="{
                root: {
                  class: 'text-black! hover:text-white!',
                },
              }"
            >
              <template #icon>
                <Icon icon="mdi:google" />
              </template>
            </Button>

            <Button
              @click="loginGithub"
              label="Sign up with Github"
              variant="outlined"
              severity="contrast"
              :pt="{
                root: {
                  class: 'text-black! hover:text-white!',
                },
              }"
            >
              <template #icon>
                <Icon icon="mdi:github" />
              </template>
            </Button>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.custom-divider::before {
  border-block-start: 1px solid #c7c4d7 !important;
}
</style>
