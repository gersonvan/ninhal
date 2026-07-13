import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Fotos de aves enviadas via Server Action (cadastro/edição) passam pelo
  // limite de corpo de requisição das Server Actions do Next, cujo padrão é
  // apenas 1 MB — bem abaixo do tamanho comum de fotos de câmera de celular,
  // causando "Body exceeded 1 MB limit" (500) em produção para fotos maiores.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
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
