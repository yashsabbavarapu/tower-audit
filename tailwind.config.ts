import type { Config } from "tailwindcss";

/**
 * The theme is *replaced*, not extended: only Tower tokens exist, so a stray
 * `bg-blue-500` or `shadow-lg` simply does not compile into anything.
 * Every value points at a CSS variable in styles/tokens.css.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ink: {
        950: "var(--ink-950)",
        900: "var(--ink-900)",
        800: "var(--ink-800)",
      },
      line: "var(--line)",
      paper: "var(--paper)",
      muted: "var(--muted)",
      faint: "var(--faint)",
      amber: {
        DEFAULT: "var(--amber)",
        hover: "var(--amber-hover)",
        dim: "var(--amber-dim)",
      },
      sage: { DEFAULT: "var(--sage)", dim: "var(--sage-dim)" },
      signal: { DEFAULT: "var(--signal)", dim: "var(--signal-dim)" },
      scrim: "var(--scrim)",
    },
    fontFamily: {
      display: ["var(--font-display)", "system-ui", "sans-serif"],
      body: ["var(--font-body)", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "ui-monospace", "monospace"],
    },
    // Spec scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64
    fontSize: {
      12: ["12px", { lineHeight: "16px" }],
      14: ["14px", { lineHeight: "20px" }],
      16: ["16px", { lineHeight: "24px" }],
      20: ["20px", { lineHeight: "28px" }],
      24: ["24px", { lineHeight: "30px" }],
      32: ["32px", { lineHeight: "36px" }],
      48: ["48px", { lineHeight: "52px" }],
      64: ["64px", { lineHeight: "64px" }],
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    letterSpacing: {
      normal: "0",
      display: "-0.02em",
      eyebrow: "0.08em",
    },
    borderRadius: {
      none: "0",
      card: "var(--radius-card)",
      control: "var(--radius-control)",
      chip: "var(--radius-chip)",
    },
    borderWidth: {
      0: "0",
      DEFAULT: "var(--hairline)",
    },
    boxShadow: { none: "none" },
    extend: {
      maxWidth: { column: "var(--column-max)" },
      maxHeight: { drawer: "var(--drawer-max-h)" },
      outlineWidth: { focus: "var(--focus-ring)" },
      outlineOffset: { focus: "var(--focus-ring)" },
      opacity: { disabled: "var(--opacity-disabled)" },
      scale: { press: "var(--press-scale)" },
      transitionDuration: {
        micro: "var(--dur-micro)",
        press: "var(--dur-press)",
        drawer: "var(--dur-drawer)",
        dial: "var(--dur-dial)",
      },
      transitionTimingFunction: { out: "var(--ease-out)" },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "var(--pulse-low)" },
          "50%": { opacity: "var(--pulse-high)" },
        },
      },
      animation: {
        pulse: "pulse var(--dur-pulse) ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
