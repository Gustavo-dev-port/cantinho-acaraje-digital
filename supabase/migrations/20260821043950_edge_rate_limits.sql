-- Rate limiting genérico por bucket (ex.: IP do cliente), usado pela
-- Edge Function garcom-ai pra impedir abuso do proxy da IA (Gemini cobra
-- por uso, e o endpoint é público). Só o service_role acessa isso; não é
-- dado de domínio do BarControl, então fica fora do multi-tenant normal.

create table if not exists public.edge_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (bucket_key, window_start)
);

comment on table public.edge_rate_limits is
  'Contadores de requisição por janela de tempo, usados por Edge Functions para limitar abuso (ex.: garcom-ai). Não é dado de domínio do BarControl.';

alter table public.edge_rate_limits enable row level security;
-- Nenhuma policy: anon/authenticated não têm acesso nenhum a esta tabela.
-- Só o service_role (que ignora RLS) lê/escreve aqui, via a função abaixo.

create or replace function public.rate_limit_hit(
  p_bucket text,
  p_window_seconds integer,
  p_max_requests integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.edge_rate_limits (bucket_key, window_start, request_count)
  values (p_bucket, v_window, 1)
  on conflict (bucket_key, window_start)
  do update set request_count = edge_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

comment on function public.rate_limit_hit(text, integer, integer) is
  'Incrementa o contador do bucket na janela atual e retorna true se ainda dentro do limite. Usado pelas Edge Functions via service_role.';

revoke all on function public.rate_limit_hit(text, integer, integer) from public;
revoke all on function public.rate_limit_hit(text, integer, integer) from anon;
revoke all on function public.rate_limit_hit(text, integer, integer) from authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- Limpeza leve: apaga janelas de mais de 2 dias sempre que a função roda
-- (chance baixa, só pra não deixar a tabela crescer pra sempre sem precisar
-- de um cron job dedicado nesse volume de uso).
create or replace function public.rate_limit_cleanup_opportunistic()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.edge_rate_limits where window_start < now() - interval '2 days';
$$;

revoke all on function public.rate_limit_cleanup_opportunistic() from public;
revoke all on function public.rate_limit_cleanup_opportunistic() from anon;
revoke all on function public.rate_limit_cleanup_opportunistic() from authenticated;
grant execute on function public.rate_limit_cleanup_opportunistic() to service_role;
