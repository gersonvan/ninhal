---
stage: 2
task: 6
agent: fullstack-agent
status: Success
log_path: ".apm/memory/fase2-stage-02/task-02-06.log.md"
important_findings: true
compatibility_issues: true
---

Confirmada a causa raiz do truncamento: a perda de caracteres acontece na geração do PDF (`@react-pdf/renderer` corta texto sem espaço que excede a largura da célula), não na extração — dados irrecuperáveis do lado do `pdf-parse`. Implementada detecção heurística (`pareceTruncada`): qualquer anilha sem espaço com 20+ caracteres é reportada em `linhasComErro` para revisão manual em vez de aceita silenciosamente. Todos os casos de 20/21/23/25/30 caracteres confirmados via teste. Important Finding + Compatibility Concern: o limiar de 20 é específico da largura de coluna da fixture de teste — pode precisar de ajuste ao validar contra o layout real do documento do IBAMA (ver Task Log).
