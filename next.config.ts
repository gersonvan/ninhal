import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // pdf-parse/pdfjs-dist referencia DOMMatrix (API de Canvas do navegador) em
  // tempo de avaliação de módulo em sua build "browser" — sem isso, o bundler
  // do Next escolhe essa build em vez da build Node, quebrando em produção
  // (funciona localmente via tsx/vitest porque eles não empacotam o módulo).
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // O worker do pdfjs-dist (pdf.worker.mjs) é carregado dinamicamente em tempo
  // de execução (não via import estático), então o rastreamento de arquivos da
  // Vercel não o inclui automaticamente no bundle serverless — sem isso, a
  // extração do PDF do IBAMA falha em produção com "Cannot find module
  // .../pdf.worker.mjs", mesmo funcionando localmente (node_modules completo).
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
};

export default nextConfig;
