import vue from "@vitejs/plugin-vue";
import { join } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            ["md-circular-progress", "md-outlined-text-field", "md-filled-button", "md-select-option", "md-outlined-select", "md-filter-chip", "md-chip-set", "md-linear-progress"].includes(tag),
        },
      },
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": join(__dirname, "client"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
