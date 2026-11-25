import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Treat import errors as fatal errors
        if (warning.code === "UNRESOLVED_IMPORT" || warning.code === "MISSING_EXPORT") {
          throw new Error(`Build failed: ${warning.message}`);
        }
        warn(warning);
      },
    },
  },
});
