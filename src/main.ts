import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/css/styles.css";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";
import router from "./router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import AppPreset from "./presets";
import Tooltip from "primevue/tooltip";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ToastService);
app.use(PrimeVue, {
  theme: {
    preset: AppPreset,
  },
});
app.directive("tooltip", Tooltip);
app.use(router);
// Initialize auth store (restore session from stored tokens)
const authStore = useAuthStore();
authStore.init();
app.mount("#app");
