-- Habilita Row-Level Security em todas as tabelas do schema public, sem
-- nenhuma policy — nega por padrão o acesso via API REST/JS do Supabase
-- (papéis "anon" e "authenticated"), que hoje têm GRANT total (SELECT,
-- INSERT, UPDATE, DELETE, TRUNCATE) nessas tabelas e não passam pelo
-- isolamento por tenant, que existe apenas na camada do Prisma
-- (lib/tenant/). Sem RLS, qualquer pessoa com a chave anônima pública do
-- projeto (embutida no bundle do site) conseguia ler e apagar dados de
-- qualquer criador direto pela API REST do Supabase.
--
-- Não afeta a aplicação: a conexão do Prisma usa o papel "postgres", que
-- tem o atributo BYPASSRLS e portanto ignora RLS normalmente.
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Especie" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ave" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ninhada" ENABLE ROW LEVEL SECURITY;
