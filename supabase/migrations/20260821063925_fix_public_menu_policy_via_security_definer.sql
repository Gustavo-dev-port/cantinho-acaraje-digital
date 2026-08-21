-- A policy products_select_public_menu original consultava public.companies
-- diretamente num EXISTS(...). Como companies também tem RLS ativo e só
-- tem policy de leitura pra membro autenticado, o anon nunca conseguia
-- ler a linha da empresa pra checar is_menu_public — o EXISTS sempre
-- avaliava falso e nenhum produto aparecia, nem os que deveriam ser
-- públicos. Descoberto testando a policy de verdade com o papel anon
-- (não só lendo o texto da policy em pg_policies).
--
-- Fix: uma função SECURITY DEFINER estreita que só responde
-- verdadeiro/falso pra "essa empresa tem cardápio público?", sem expor
-- nenhuma outra coluna de companies (cnpj, razão social, endereço etc.)
-- pro papel anon.
create function private.is_company_menu_public(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.companies c
    where c.id = target_company_id
      and c.is_menu_public = true
  );
$$;

revoke all on function private.is_company_menu_public(uuid) from public;
grant execute on function private.is_company_menu_public(uuid) to anon, authenticated;

drop policy products_select_public_menu on public.products;

create policy products_select_public_menu
on public.products
for select
to anon
using (
  is_active = true
  and private.is_company_menu_public(company_id)
);
