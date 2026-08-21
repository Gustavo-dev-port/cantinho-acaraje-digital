-- APLICADO em 2026-08-21 — ver a migration versionada em
-- supabase/migrations/20260821053648_cardapio_digital_schema.sql (mesmo
-- conteúdo, timestampado). Este arquivo fica aqui como referência de leitura
-- rápida. Ver README.md nesta pasta pro que ainda falta (carga de dados +
-- troca da fonte de dados no frontend — passos 3 em diante).

-- 1) Campos que faltam em products pra cobrir o cardápio digital
alter table public.products
  add column if not exists description text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 0,
  add column if not exists slug text;

comment on column public.products.description is
  'Descrição do prato/bebida, exibida no cardápio digital.';
comment on column public.products.tags is
  'Selos exibidos no card do cardápio digital: Award (mais pedido), Leaf (vegano/vegetariano), Flame (picante).';
comment on column public.products.is_featured is
  'true = aparece na aba "Destaques" do cardápio digital.';
comment on column public.products.sort_order is
  'Ordem de exibição dentro da categoria no cardápio digital (menor primeiro).';
comment on column public.products.slug is
  'Id curto e estável (ex.: "ac1"), útil em URLs/analytics — não substitui o id (uuid).';

-- Unicidade do slug só entre produtos da mesma empresa (empresas diferentes
-- podem reaproveitar o mesmo slug sem conflito).
create unique index if not exists products_company_slug_key
  on public.products (company_id, slug)
  where slug is not null;

-- 2) Flag por empresa: só quem marcar isso explicitamente tem cardápio público
alter table public.companies
  add column if not exists is_menu_public boolean not null default false;

comment on column public.companies.is_menu_public is
  'true = os produtos ativos desta empresa ficam visíveis publicamente (sem login) pro cardápio digital.';

-- 3) Policy nova de leitura pública — ADITIVA, não substitui products_select.
-- Só libera leitura anônima de produtos ativos de empresas que optaram por
-- ter cardápio público. Testar com uma empresa is_menu_public=false antes
-- de considerar isso pronto: ela precisa continuar 100% invisível pro anon.
create policy products_select_public_menu
on public.products
for select
to anon
using (
  is_active = true
  and exists (
    select 1 from public.companies c
    where c.id = products.company_id
      and c.is_menu_public = true
  )
);

-- 4) Próximo passo (ainda pendente): o Cantinho do Acarajé ainda não tem
-- linha em companies neste projeto (0 linhas na tabela hoje). Quando essa
-- linha existir, habilita o cardápio público assim (troque o uuid pelo id
-- real da empresa):
--
--   update public.companies set is_menu_public = true where id = '<uuid-do-cantinho-do-acaraje>';
--
-- E os 93 itens de src/data/menuData.js são inseridos em products com esse
-- mesmo company_id — isso é carga de dados, não faz parte desta migration
-- de schema (fica num script de importação à parte quando for a hora).
