-- Cardápio digital: campos novos em products/companies + policy de leitura
-- pública. Aplicada em 2026-08-21. Ver docs/migracao-cardapio-supabase/
-- nesta mesma pasta pro contexto completo e pros próximos passos (carga de
-- dados + troca da fonte de dados no frontend, ainda pendentes).

-- 1) Campos que faltavam em products pra cobrir o cardápio digital
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
-- ter cardápio público.
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

-- 4) O Cantinho do Acarajé ainda NÃO tem uma linha em companies neste
-- projeto (0 linhas na tabela) — habilitar is_menu_public e importar os 93
-- itens de src/data/menuData.js fica pra quando essa linha existir. Ver
-- docs/migracao-cardapio-supabase/README.md, passos 3 em diante.
