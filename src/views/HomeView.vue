<script setup lang="ts">
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { Button } from "primevue";
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";
import Lenis from "lenis";

const router = useRouter();
const scrollWrapper = ref<HTMLElement | null>(null);
let lenis: Lenis;

const navigateToLogin = () => {
  router.push("/auth/login");
};

const navigateToRegister = () => {
  router.push("/auth/register");
};

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals and small groups getting started.",
    features: [
      "1-on-1 Messaging",
      "Up to 5 Group Chats",
      "30-day Message History",
      "Standard Support",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "MBG",
    price: "$9.99",
    period: "/month",
    description: "Ideal for growing teams needing advanced collaboration.",
    features: [
      "Unlimited Group Chats",
      "Unlimited Message History",
      "Voice & Video Calls",
      "Priority Email Support",
      "File Sharing up to 1GB",
    ],
    buttonText: "Upgrade to MBG",
    popular: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "/month",
    description: "For enterprises demanding maximum performance and security.",
    features: [
      "Everything in MBG",
      "AI Smart Assistant",
      "Custom Integrations",
      "24/7 Dedicated Support",
      "Unlimited File Sharing",
    ],
    buttonText: "Go Premium",
    popular: false,
  },
];

onMounted(() => {
  // Setup Lenis for smooth scrolling on the specific wrapper
  if (scrollWrapper.value) {
    lenis = new Lenis({
      wrapper: scrollWrapper.value,
      content: scrollWrapper.value.firstElementChild as HTMLElement,
      autoRaf: true,
    });
  }

  // Setup GSAP entry animations
  const tl = gsap.timeline();
  tl.from(".gsap-badge", {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
  })
    .from(
      ".gsap-title",
      { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4",
    )
    .from(
      ".gsap-desc",
      { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" },
      "-=0.6",
    )
    .from(
      ".gsap-cta",
      { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
      "-=0.4",
    )
    .from(
      ".gsap-mockup",
      { y: 50, opacity: 0, duration: 1, ease: "power4.out" },
      "-=0.6",
    );
});

onUnmounted(() => {
  if (lenis) {
    lenis.destroy();
  }
});
</script>

<template>
  <!-- Wrapper for Lenis -->
  <div
    ref="scrollWrapper"
    class="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-900 text-white selection:bg-indigo-500 selection:text-white relative"
  >
    <!-- Content container for Lenis -->
    <div class="h-full flex flex-col relative">
      <!-- Background Gradient Effects -->
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
      ></div>

      <!-- Navigation -->
      <nav
        class="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/70 border-b border-white/10 transition-all duration-300"
      >
        <div
          class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <Icon
                icon="lucide:message-square-dashed"
                class="text-white text-2xl"
              />
            </div>
            <span class="text-2xl font-bold tracking-tight">Atelier</span>
          </div>
          <div
            class="hidden md:flex items-center gap-8 font-medium text-slate-300"
          >
            <a href="#features" class="hover:text-white transition-colors"
              >Features</a
            >
            <a href="#pricing" class="hover:text-white transition-colors"
              >Pricing</a
            >
            <a href="#about" class="hover:text-white transition-colors"
              >About</a
            >
          </div>
          <div class="flex items-center gap-4">
            <Button
              label="Log in"
              variant="text"
              class="text-slate-300! hover:text-white! font-semibold!"
              @click="navigateToLogin"
            />
            <Button
              label="Sign up"
              class="bg-white! text-slate-900! border-none! font-semibold! hover:bg-slate-200! transition-colors shadow-lg px-6! rounded-full!"
              @click="navigateToRegister"
            />
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section
        class="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10 w-full"
      >
        <div
          class="gsap-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <span
            class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"
          ></span>
          <span class="text-sm font-medium text-slate-300"
            >v2.0 is now live</span
          >
        </div>

        <h1
          class="gsap-title text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400"
        >
          Communication made <br class="hidden md:block" />
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-500"
            >effortless & beautiful</span
          >
        </h1>

        <p
          class="gsap-desc text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Atelier is the modern chat application designed to bring your teams,
          friends, and communities together in one seamless, lightning-fast
          platform.
        </p>

        <div
          class="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto justify-center flex-wrap"
        >
          <Button
            label="Get Started for Free"
            class="gsap-cta bg-linear-to-r! from-indigo-500! to-purple-600! border-none! font-semibold! px-8! py-4! rounded-full! shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105 w-full sm:w-auto"
            @click="navigateToRegister"
          />
          <Button
            class="gsap-cta bg-green-600! text-white! border-none! font-semibold! px-8! py-4! rounded-full! shadow-xl shadow-green-600/20 hover:shadow-green-600/40 transition-all hover:scale-105 hover:bg-green-500! w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:android" class="text-xl" />
            <span>Download for Android</span>
          </Button>
          <a href="#pricing" class="gsap-cta w-full sm:w-auto block">
            <Button
              label="View Pricing"
              variant="outlined"
              class="text-white! border-white/20! font-semibold! px-8! py-4! rounded-full! hover:bg-white/5! transition-all w-full"
            />
          </a>
        </div>

        <!-- App Mockup Visual -->
        <div
          class="gsap-mockup mt-24 w-full max-w-5xl rounded-2xl bg-slate-800/50 p-4 border border-white/10 shadow-2xl backdrop-blur-xl relative group"
        >
          <div
            class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent z-10 rounded-2xl pointer-events-none"
          ></div>
          <div
            class="rounded-xl overflow-hidden bg-[#0F172A] border border-slate-700 flex flex-col h-100 md:h-150 relative"
          >
            <!-- Mockup Header -->
            <div
              class="h-14 border-b border-slate-700 bg-slate-800/80 flex items-center px-4 gap-4"
            >
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div
                class="mx-auto px-12 py-1.5 rounded-md bg-slate-900/50 text-xs text-slate-400 font-mono border border-slate-700/50"
              >
                atelier.my.id
              </div>
            </div>
            <!-- Mockup Body -->
            <div class="flex flex-1 overflow-hidden">
              <!-- Sidebar -->
              <div
                class="w-64 border-r border-slate-700 bg-slate-900/50 hidden sm:block p-4"
              >
                <div class="w-full h-8 bg-slate-800 rounded-md mb-6"></div>
                <div class="space-y-3">
                  <div class="w-3/4 h-4 bg-slate-800 rounded-md"></div>
                  <div class="w-1/2 h-4 bg-slate-800 rounded-md"></div>
                  <div class="w-5/6 h-4 bg-slate-800 rounded-md"></div>
                </div>
              </div>
              <!-- Chat Area -->
              <div class="flex-1 p-6 flex flex-col gap-4 relative">
                <div
                  class="self-start max-w-[80%] p-4 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-300 text-sm"
                >
                  Hey team! Just wanted to share the latest designs for the
                  landing page. 🚀
                </div>
                <div
                  class="self-end max-w-[80%] p-4 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm shadow-md"
                >
                  Looks absolutely stunning! The gradient effects are super
                  clean. Let's push this to staging today.
                </div>
                <div
                  class="self-start max-w-[80%] p-4 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-300 text-sm"
                >
                  Awesome, I'll prepare the PR.
                </div>

                <!-- Input -->
                <div
                  class="absolute bottom-6 left-6 right-6 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center px-4"
                >
                  <div class="w-full h-4 bg-slate-700/50 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section
        id="features"
        class="py-24 px-6 relative z-10 bg-slate-900/50 border-y border-white/5 w-full"
      >
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Why choose Atelier?
            </h2>
            <p class="text-slate-400 max-w-2xl mx-auto text-lg">
              Designed from the ground up to provide the fastest, most reliable,
              and aesthetically pleasing chat experience.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div
              class="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all hover:-translate-y-1"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6"
              >
                <Icon icon="lucide:zap" class="text-3xl" />
              </div>
              <h3 class="text-xl font-bold mb-3">Lightning Fast</h3>
              <p class="text-slate-400 leading-relaxed">
                Built on modern tech stack ensuring your messages are delivered
                instantly with zero lag, keeping you in the flow.
              </p>
            </div>
            <!-- Feature 2 -->
            <div
              class="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all hover:-translate-y-1"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6"
              >
                <Icon icon="lucide:shield-check" class="text-3xl" />
              </div>
              <h3 class="text-xl font-bold mb-3">Secure by Default</h3>
              <p class="text-slate-400 leading-relaxed">
                End-to-end encryption and enterprise-grade security protocols
                keep your conversations completely private.
              </p>
            </div>
            <!-- Feature 3 -->
            <div
              class="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all hover:-translate-y-1"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-6"
              >
                <Icon icon="lucide:layout" class="text-3xl" />
              </div>
              <h3 class="text-xl font-bold mb-3">Stunning Interface</h3>
              <p class="text-slate-400 leading-relaxed">
                A meticulously crafted UI with rich aesthetics, smooth
                animations, and a gorgeous dark mode that reduces eye strain.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-24 px-6 relative z-10 w-full">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p class="text-slate-400 max-w-2xl mx-auto text-lg">
              Choose the perfect plan that scales with your needs. No hidden
              fees.
            </p>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center"
          >
            <div
              v-for="plan in pricingPlans"
              :key="plan.name"
              :class="[
                'rounded-3xl p-8 relative flex flex-col h-full border transition-all duration-300 hover:-translate-y-2',
                plan.popular
                  ? 'bg-slate-800/80 border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105 z-10'
                  : 'bg-white/5 border-white/10 hover:border-white/20',
              ]"
            >
              <div
                v-if="plan.popular"
                class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Most Popular
              </div>

              <div class="mb-8">
                <h3 class="text-2xl font-bold mb-2">{{ plan.name }}</h3>
                <p class="text-slate-400 text-sm h-10">
                  {{ plan.description }}
                </p>
              </div>

              <div class="mb-8 flex items-end gap-1">
                <span class="text-5xl font-extrabold tracking-tight">{{
                  plan.price
                }}</span>
                <span class="text-slate-400 mb-1">{{ plan.period }}</span>
              </div>

              <ul class="flex flex-col gap-4 mb-10 flex-1">
                <li
                  v-for="(feature, idx) in plan.features"
                  :key="idx"
                  class="flex items-start gap-3"
                >
                  <Icon
                    icon="lucide:check-circle-2"
                    class="text-indigo-400 text-xl shrink-0 mt-0.5"
                  />
                  <span class="text-slate-300">{{ feature }}</span>
                </li>
              </ul>

              <Button
                :label="plan.buttonText"
                :class="[
                  'w-full! py-4! rounded-xl! font-bold! transition-all',
                  plan.popular
                    ? 'bg-indigo-500! text-white! border-none! hover:bg-indigo-600!'
                    : 'bg-white/10! text-white! border-none! hover:bg-white/20!',
                ]"
                @click="plan.name === 'Free' ? navigateToRegister() : null"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-24 px-6 relative z-10 w-full">
        <div
          class="max-w-5xl mx-auto rounded-3xl bg-linear-to-br from-indigo-900 to-purple-900 p-12 md:p-20 text-center border border-indigo-500/30 shadow-2xl shadow-purple-900/50 relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
          ></div>
          <h2 class="text-3xl md:text-5xl font-bold mb-6 relative z-10">
            Ready to transform your communication?
          </h2>
          <p
            class="text-indigo-200 mb-10 max-w-2xl mx-auto text-lg relative z-10"
          >
            Join thousands of teams already using Atelier to collaborate faster
            and better.
          </p>
          <Button
            label="Create your free account"
            class="bg-white! text-indigo-900! border-none! font-bold! px-10! py-5! rounded-full! shadow-xl hover:bg-slate-100! transition-all hover:scale-105 text-lg relative z-10"
            @click="navigateToRegister"
          />
        </div>
      </section>

      <!-- Footer -->
      <footer
        class="border-t border-white/10 bg-slate-950 pt-16 pb-8 px-6 relative z-10 w-full"
      >
        <div
          class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
        >
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center gap-2 mb-6">
              <div
                class="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              >
                <Icon
                  icon="lucide:message-square-dashed"
                  class="text-white text-lg"
                />
              </div>
              <span class="text-xl font-bold tracking-tight">Atelier</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-6">
              Building the future of team communication. Fast, secure, and
              beautiful.
            </p>
            <div class="flex gap-4">
              <a
                href="#"
                class="text-slate-400 hover:text-white transition-colors"
                ><Icon icon="lucide:twitter" class="text-xl"
              /></a>
              <a
                href="#"
                class="text-slate-400 hover:text-white transition-colors"
                ><Icon icon="lucide:github" class="text-xl"
              /></a>
              <a
                href="#"
                class="text-slate-400 hover:text-white transition-colors"
                ><Icon icon="lucide:linkedin" class="text-xl"
              /></a>
            </div>
          </div>

          <div>
            <h4 class="font-bold mb-6">Product</h4>
            <ul class="space-y-4 text-sm text-slate-400">
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Features</a
                >
              </li>
              <li>
                <a href="#pricing" class="hover:text-white transition-colors"
                  >Pricing</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Download</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Changelog</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-6">Company</h4>
            <ul class="space-y-4 text-sm text-slate-400">
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >About Us</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Careers</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Contact</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-6">Legal</h4>
            <ul class="space-y-4 text-sm text-slate-400">
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Terms of Service</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Cookie Policy</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div
          class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-slate-500 text-sm"
        >
          <p>&copy; 2026 Atelier, Inc. All rights reserved.</p>
          <div class="flex gap-6 mt-4 md:mt-0">
            <span>Status: All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Optional custom animations or scrollbar styling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.3);
  border-radius: 20px;
}
</style>
