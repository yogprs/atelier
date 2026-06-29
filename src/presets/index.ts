import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

export default definePreset(Aura, {
  semantic: {
    primary: {
      50: "color-mix(in srgb, var(--color-primary-base) 5%, white)",
      100: "color-mix(in srgb, var(--color-primary-base) 10%, white)",
      200: "color-mix(in srgb, var(--color-primary-base) 20%, white)",
      300: "color-mix(in srgb, var(--color-primary-base) 35%, white)",
      400: "color-mix(in srgb, var(--color-primary-base) 60%, white)",
      500: "var(--color-primary-base)",
      600: "var(--color-primary-light)",
      700: "var(--color-primary-lighter)",
      800: "color-mix(in srgb, var(--color-primary-base) 85%, black)",
      900: "color-mix(in srgb, var(--color-primary-base) 70%, black)",
      950: "color-mix(in srgb, var(--color-primary-base) 50%, black)",
    },

    surface: {
      0: "var(--color-neutral-white)",
      50: "var(--color-neutral-bg)",
      100: "var(--color-neutral-bg)",
      200: "var(--color-neutral-border)",
      300: "var(--color-neutral-border)",
      400: "var(--color-neutral-textMuted)",
      500: "var(--color-neutral-textMuted)",
      600: "var(--color-secondary-light)",
      700: "var(--color-secondary-base)",
      800: "var(--color-neutral-textMain)",
      900: "var(--color-neutral-textMain)",
      950: "color-mix(in srgb, var(--color-neutral-textMain) 80%, black)",
    },

    colorScheme: {
      light: {
        primary: {
          color: "var(--color-primary-base)",
          contrastColor: "var(--color-neutral-white)",
          hoverColor: "var(--color-primary-light)",
          activeColor: "var(--color-primary-lighter)",
        },

        highlight: {
          background:
            "color-mix(in srgb, var(--color-primary-base) 12%, white)",
          color: "var(--color-primary-base)",
        },

        content: {
          background: "var(--color-neutral-white)",
          color: "var(--color-neutral-textMain)",
        },

        formField: {
          background: "var(--color-neutral-inputBg)",
          borderColor: "var(--color-neutral-border)",
          color: "var(--color-neutral-textMain)",
          placeholderColor: "var(--color-neutral-textMuted)",
        },
      },

      dark: {
        primary: {
          color: "var(--color-primary-lighter)",
          contrastColor: "var(--color-neutral-white)",
          hoverColor: "var(--color-primary-light)",
          activeColor: "var(--color-primary-base)",
        },
      },
    },
  },
});
