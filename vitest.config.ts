import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["dotenv/config"],
    // A suíte é majoritariamente de integração contra o Supabase remoto; o
    // timeout padrão de 5s é apertado quando vários arquivos rodam em paralelo.
    testTimeout: 20000,
    // e2e/ é a suíte Playwright (executada via `npx playwright test`, não pelo Vitest).
    exclude: ["**/node_modules/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
