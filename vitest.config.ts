import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["dotenv/config"],
    // A suíte é majoritariamente de integração contra o Supabase remoto; o
    // timeout padrão de 5s é apertado quando vários arquivos rodam em paralelo.
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
