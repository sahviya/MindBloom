import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"), // Project root is client folder
  resolve: {
    alias: {
      // Base src folder alias
      "@": path.resolve(__dirname, "client/src"),

      // Components folder
      "@components": path.resolve(__dirname, "client/src/components"),

      // UI components
      "@ui": path.resolve(__dirname, "client/src/components/ui"),

      // Shared utilities or constants
      "@shared": path.resolve(__dirname, "client/src/shared"),

      // Assets (images, icons, etc.)
      "@assets": path.resolve(__dirname, "client/src/attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
