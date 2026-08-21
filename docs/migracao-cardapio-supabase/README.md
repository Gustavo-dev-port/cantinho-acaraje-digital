# Migração do cardápio: `menuData.js` → Supabase

> **Status: passos 1 a 6 concluídos em 2026-08-21.** A empresa Cantinho do Acarajé foi criada em
> `companies` (`is_menu_public = true`), os 93 itens de `menuData.js` foram importados em
> `products`, a leitura pública anônima foi **testada de verdade** com o papel `anon` (não só
> lida em `pg_policies` — ver "O ponto que mais importa" abaixo, incluindo um bug real que essa
> checagem encontrou e corrigiu), e o frontend já busca do Supabase via
> `src/hooks/useMenuData.js`, com cache de 5 min e fallback automático pro cardápio estático se a
> rede falhar. **`menuData.js` continua no repositório de propósito** (passo 7, fallback/semente)
> — só sai depois de um período rodando estável.

## Por que migrar

Hoje o cardápio inteiro (93 itens, 8 categorias) vive hardcoded em `src/data/menuData.js`. Qualquer
ajuste de preço, item novo ou item removido exige editar código e fazer um novo deploy — o mesmo
atrito de trocar um cardápio impresso, só que trocado por atrito de programação.

O projeto Supabase já usado pelo Garçom IA (`barcontrol-dev`) tem um sistema multi-tenant chamado
BarControl, com uma tabela `products` que já é quase o mesmo formato do `menuData.js`. Ligar o
cardápio digital a essa tabela resolve o problema de raiz: editar o cardápio vira uma tela/planilha
(ou até o editor de tabelas do próprio Supabase), não mais um deploy.

## Estado atual das duas pontas

### `menuData.js` (hoje)
```js
{
  id: "ac1",              // string curta, único dentro da categoria
  name: "Acarajé no Prato",
  desc: "Bolinho cortado em pedaços, vatapá, caruru, tomate verde e camarão.",
  price: 35,
  tags: ["Award"],         // "Award" | "Leaf" | "Flame"
}
```
Organizado como um objeto `{ "Categoria": [item, item, ...] }`, mais um array separado
`featuredItemIds` pra decidir o que aparece em "Destaques".

### `products` (93 linhas do Cantinho do Acarajé já importadas)
```
id           uuid
company_id   uuid
name         text
category     text
sale_price   numeric
is_active    boolean
description  text            -- novo, aplicado
tags         text[]          -- novo, aplicado (default '{}')
is_featured  boolean         -- novo, aplicado (default false)
sort_order   integer         -- novo, aplicado (default 0)
slug         text            -- novo, aplicado
created_at   timestamptz
updated_at   timestamptz
```
RLS **já ativo**. A policy original (`products_select`) continua exigindo que quem lê seja membro
autenticado da empresa (`private.is_member_of_company(company_id)`) — isso não mudou. A policy nova
(`products_select_public_menu`) abre uma segunda porta, aditiva: leitura anônima só de produtos
`is_active = true` de empresas com `is_menu_public = true`. A empresa Cantinho do Acarajé já está
com `is_menu_public = true`, então os 93 produtos dela já são lidos publicamente hoje — só o
frontend ainda não busca de lá.

## O que foi adicionado em `products` pra cobrir o cardápio

| Campo | Tipo | Pra quê | Status |
|---|---|---|---|
| `description` | `text` | A descrição do prato (hoje `desc` no menuData.js) | ✅ Aplicado |
| `tags` | `text[]` | `{Award,Leaf,Flame}` — substitui o array de tags | ✅ Aplicado |
| `is_featured` | `boolean default false` | Substitui o `featuredItemIds` — marcar destaque direto na linha, sem lista separada pra manter sincronizada | ✅ Aplicado |
| `sort_order` | `integer` | Ordem de exibição dentro da categoria (hoje é a ordem do array em `menuData.js`) | ✅ Aplicado |
| `slug` | `text` | Um id curto e estável tipo `"ac1"`, útil em URLs/analytics — o `id` uuid já resolve unicidade, mas não é amigável | ✅ Aplicado |

Migration aplicada: [`schema-proposto.sql`](./schema-proposto.sql), versionada em
[`../../supabase/migrations/20260821053648_cardapio_digital_schema.sql`](../../supabase/migrations/20260821053648_cardapio_digital_schema.sql).

## O ponto que mais importa: a policy de leitura pública

`products` é uma tabela **multi-tenant** — pode ter (ou vir a ter) produtos de mais de uma empresa
usando o mesmo BarControl. O erro fácil de cometer aqui é criar uma policy do tipo
`"anon pode ler onde is_active = true"` — isso deixaria **qualquer empresa** que use o BarControl
com o cardápio dela exposto publicamente, não só o Cantinho do Acarajé.

A policy certa precisa amarrar duas coisas: `is_active = true` **e** uma marcação explícita de que
aquela empresa aceitou ter cardápio público. Sugestão: uma coluna nova `companies.is_menu_public
boolean default false`, e a policy de leitura anônima checando as duas condições:

```sql
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
```

Isso é **aditivo** — o Postgres combina policies permissivas com OU, então essa nova policy não
substitui `products_select` (que continua valendo pra usuários autenticados do BarControl); ela só
abre uma segunda porta, estreita, só pra leitura pública de quem marcou `is_menu_public = true`.

### O bug que só apareceu testando de verdade (não só lendo a policy)

A versão acima é a policy *final*, já corrigida. A primeira versão aplicada (idêntica em texto,
confirmada certinha via `pg_policies`) **não funcionava na prática** — testar com `SET LOCAL ROLE
anon` revelou dois problemas, nessa ordem:

1. **`permission denied for function is_member_of_company`.** O Postgres combina as duas policies
   de `products` (`products_select` e `products_select_public_menu`) com OR — e pra isso ele
   precisa de permissão pra *avaliar* a função usada por QUALQUER policy aplicável ao papel, mesmo
   a que não vai decidir o resultado. O papel `anon` não tinha `EXECUTE` em
   `private.is_member_of_company`, então toda leitura pública falhava, mesmo de produtos que
   deveriam estar visíveis. Corrigido com um `GRANT EXECUTE` — seguro, porque a função sempre
   retorna `false` pro `anon` (não é `SECURITY DEFINER`, e `auth.uid()` é `null` pra quem não está
   autenticado).
2. **0 produtos visíveis mesmo depois do GRANT.** A policy consulta `companies` num
   `EXISTS(...)` — mas `companies` também tem RLS ativo, e a única policy de leitura lá exige ser
   membro autenticado. Então o `anon` não conseguia nem ler a linha da empresa pra checar
   `is_menu_public`, e o `EXISTS` sempre dava falso. Corrigido trocando o `EXISTS` direto por uma
   função `SECURITY DEFINER` estreita (`private.is_company_menu_public(company_id)`) que só
   responde verdadeiro/falso, sem expor CNPJ, razão social ou qualquer outra coluna de `companies`
   pro `anon`.

Migrations dessas duas correções:
[`20260821062614_grant_anon_execute_is_member_of_company.sql`](../../supabase/migrations/20260821062614_grant_anon_execute_is_member_of_company.sql) e
[`20260821063925_fix_public_menu_policy_via_security_definer.sql`](../../supabase/migrations/20260821063925_fix_public_menu_policy_via_security_definer.sql).

Depois da correção, testado de novo com `SET LOCAL ROLE anon` dentro de uma transação com
`ROLLBACK` (nada persistido): os 93 produtos do Cantinho do Acarajé ficam visíveis, uma empresa
fake com `is_menu_public = false` continua 100% invisível, e a leitura direta de `companies`
continua bloqueada pro `anon` (CNPJ e razão social não vazam).

**Lição pra próxima vez:** confirmar o texto de uma policy em `pg_policies` não é suficiente —
policies aditivas em tabelas com RLS em cascata (aqui, `products` → `companies`) só se provam
corretas testando com o papel de verdade.

## Passos sugeridos (nessa ordem, cada um só depois de validar o anterior)

1. ✅ **Migration de schema** — adicionar as colunas que faltam em `products` e a coluna
   `companies.is_menu_public`, com `default false` (nada muda pra ninguém até ser ligado
   manualmente). **Aplicado em 2026-08-21.**
2. ✅ **Migration de RLS** — criar a policy `products_select_public_menu` acima. **Aplicado
   junto no mesmo passo 1** (confirmado via `pg_policies` que o texto da policy está exatamente
   como o esperado). Vale ainda testar na prática com uma empresa `is_menu_public = false` real
   antes de ligar qualquer coisa em produção.
3. ✅ **Popular os dados** — os 93 itens de `menuData.js` foram importados em `products` (script em
   [`scripts/importar-cardapio.sql`](./scripts/importar-cardapio.sql), idempotente via
   `ON CONFLICT (company_id, slug)` — seguro reexecutar se `menuData.js` mudar antes do passo 4).
   Empresa Cantinho do Acarajé criada em `companies` com `is_menu_public = true`. **Aplicado e
   testado em 2026-08-21.**
4. ✅ **Trocar a camada de dados no frontend** — `src/data/menuData.js` deixou de ser importado
   direto em `App.jsx`; o novo hook `src/hooks/useMenuData.js` busca do Supabase (`select`
   filtrado por `company_id`, ordenado por `category, sort_order`) e monta a mesma estrutura
   `{categoria: [...]}` que os componentes já esperavam — `MenuSection`, `MenuCard`, etc. não
   precisaram mudar. **Aplicado em 2026-08-21.**
5. ✅/🔄 **Estados novos que não existiam antes** — implementado de um jeito um pouco diferente do
   que este passo originalmente sugeria (skeleton/spinner bloqueante): como o app sempre tem
   conteúdo pra mostrar na hora (cache ou o cardápio estático embutido), `useMenuData()` não
   bloqueia a tela com um loading — mostra o que já tem e atualiza em segundo plano. O estado de
   erro existe (`refreshError`), mas só aparece como um aviso pequeno e não-alarmante ("Exibindo
   o cardápio salvo — não foi possível buscar a versão mais recente agora"), porque o app nunca
   fica de fato sem cardápio pra mostrar.
6. ✅ **Cache client-side** — `localStorage` com TTL de 5 minutos, implementado dentro do próprio
   `useMenuData.js` (mesma chave/lógica que decide os estados do passo 5).
7. ✅ **Período de transição** — `menuData.js` continua no repositório, agora como fallback
   automático (ver passo 5) e semente original dos dados. Remover só depois de um período rodando
   estável.
8. ✅ **Onde a IA busca o cardápio** — nada mudou em `useGarcomAI.js`; `App.jsx` já passa
   `menuWithFeatured` (agora vindo do Supabase) pra ele do mesmo jeito que passava o `menuData`
   estático antes — a lógica da IA não precisou saber de onde os dados vieram.

## Riscos e coisas pra não esquecer

- **RLS é o risco real aqui.** Uma policy pública mal escrita em uma tabela multi-tenant vaza dados
  de outras empresas. Testar explicitamente com uma segunda empresa fake com `is_menu_public =
  false` antes de considerar a migration pronta.
- **`sale_price` é `numeric`, sem moeda/formatação** — o `formatCurrency()` que já existe no
  frontend continua funcionando igual, só troca de onde o número vem.
- **93 itens não é volume que precise de paginação** — um único `select` sem paginação resolve;
  não vale complicar com isso agora.
- **Nada de escrever a chave de serviço no frontend.** A leitura pública do cardápio usa a
  `anon key` (já pública por design, é a mesma usada pelo `aiServices.js`) — nunca a service role.
- **A tabela `products` também é usada pelo BarControl "de verdade"** (controle de estoque,
  fichas técnicas). Qualquer migration aqui deve ser testada numa branch/preview do Supabase antes
  de aplicar em produção, pra não arriscar o sistema de gestão do bar por causa do cardápio digital.
