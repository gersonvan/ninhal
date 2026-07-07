/**
 * pdfjs-dist (usado por pdf-parse) espera as APIs de Canvas do navegador
 * (DOMMatrix, ImageData, Path2D) para o pipeline de renderização — mesmo
 * quando só extraímos texto/tabela, sem renderizar nada visualmente. Sua
 * build Node tenta fazer polyfill automaticamente via `@napi-rs/canvas`
 * (dependência opcional, binário nativo), mas o binário para a plataforma do
 * ambiente serverless (Linux) não é resolvido de forma confiável a partir do
 * lockfile gerado localmente (macOS) — resultando em `DOMMatrix is not
 * defined` só em produção, nunca localmente. Como não renderizamos páginas
 * (só texto/tabela via getText()/getTable()), um polyfill puro em JavaScript
 * é suficiente; evita depender de um binário nativo específico de plataforma.
 */
import DOMMatrixPolyfill from "dommatrix";

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrixPolyfill;
}

if (typeof globalThis.ImageData === "undefined") {
  class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? data.length / (4 * width);
    }
  }
  // @ts-expect-error - polyfill mínimo, não implementa a interface completa do DOM
  globalThis.ImageData = ImageDataPolyfill;
}

if (typeof globalThis.Path2D === "undefined") {
  class Path2DPolyfill {
    // Nenhum método real necessário — apenas evita ReferenceError caso
    // algum caminho de código da biblioteca instancie a classe.
  }
  // @ts-expect-error - polyfill mínimo, não implementa a interface completa do DOM
  globalThis.Path2D = Path2DPolyfill;
}
