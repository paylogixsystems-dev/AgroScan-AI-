import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3000,
      host: true,
    },
    plugins: [
      react(),
      tailwindcss(), // ✅ REQUIRED for Tailwind v4
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    define: {
      // Optional backward-compat, but avoid using this in code
      __GEMINI_API_KEY__: JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
