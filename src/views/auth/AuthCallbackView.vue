<script setup lang="ts">
import {
  exchangeOAuthCode,
  oauthErrorFrom,
  oauthErrorMessage,
} from "@/services/oauth/oauthService";
import { useAuthStore } from "@/stores/auth";
import { useWebSocketStore } from "@/stores/websocket";
import { Icon } from "@iconify/vue";
import { Button, ProgressSpinner } from "primevue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();
const websocket = useWebSocketStore();

const status = ref<"processing" | "error">("processing");
const errorMessage = ref("");

let handled = false;

/** Drop the one-time code (or tokens) from the address bar and history. */
const clearCallbackParams = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const fail = (code: string | null, message?: string | null) => {
  status.value = "error";
  errorMessage.value = oauthErrorMessage(code, message);
};

const finishSignIn = async (token: string, refreshToken?: string) => {
  await auth.login(token, refreshToken);
  websocket.connect();
  await router.replace("/app/chats");
};

onMounted(async () => {
  if (handled) return;
  handled = true;

  const params = new URLSearchParams(window.location.search);
  const error = params.get("error")?.trim() || null;
  const errorDetail = params.get("message");
  const code = params.get("code")?.trim() || null;
  const inlineToken = params.get("token")?.trim() || null;
  const inlineRefreshToken = params.get("refresh_token");

  // `redirect` is a mobile route (for example /(tabs)/chats). The web callback
  // intentionally ignores it and always continues to /app/chats.

  // The callback URL can contain a single-use credential or a mobile redirect
  // hint. Strip everything before waiting on the network so nothing stays in
  // browser history.
  clearCallbackParams();

  if (error) {
    fail(error, errorDetail);
    return;
  }

  // Backend fallback when code handoff is unavailable (inline mode).
  if (inlineToken) {
    try {
      await finishSignIn(inlineToken, inlineRefreshToken ?? undefined);
    } catch {
      fail(
        "exchange_failed",
        "Sign-in completed, but the session could not be started. Please try again.",
      );
    }
    return;
  }

  if (!code) {
    fail("missing_code");
    return;
  }

  try {
    const session = await exchangeOAuthCode(code);

    if (!session?.token || !session?.refresh_token) {
      fail("exchange_failed");
      return;
    }

    await finishSignIn(session.token, session.refresh_token);
  } catch (err) {
    const parsed = oauthErrorFrom(err);
    fail(parsed.code, parsed.message);
  }
});
</script>

<template>
  <div class="w-full min-h-screen flex items-center justify-center px-6">
    <div
      class="w-full max-w-md bg-neutral-white border border-neutral-border rounded-2xl shadow-xl p-8 flex flex-col items-center text-center gap-5"
    >
      <template v-if="status === 'processing'">
        <ProgressSpinner
          aria-label="Signing in"
          stroke-width="12"
          animation-duration=".6s"
          style="width: 48px; height: 48px"
          :pt="{
            circle: { class: 'stroke-primary-base!' },
            circleTrack: { style: { stroke: 'var(--color-neutral-border)' } },
          }"
        />
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold text-primary-base">
            Signing you in
          </h1>
          <p class="text-sm text-neutral-textMuted">
            Finishing authentication with your provider.
          </p>
        </div>
      </template>

      <template v-else>
        <div
          class="size-14 rounded-full bg-red-50 text-error flex items-center justify-center"
        >
          <Icon icon="material-symbols:error-outline" class="size-8" />
        </div>
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold text-primary-base">
            Sign-in failed
          </h1>
          <p class="text-sm text-neutral-textMuted">{{ errorMessage }}</p>
        </div>
        <Button
          label="Back to login"
          class="w-full bg-primary! border-primary! hover:bg-primary-light!"
          @click="router.replace('/auth/login')"
        />
      </template>
    </div>
  </div>
</template>
