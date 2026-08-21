# Migração do cardápio: `menuData.js` → Supabase

> **Status: schema aplicado em 2026-08-21 (passos 1 e 2 abaixo).** As colunas novas em
> `products`, a coluna `companies.is_menu_public` e a policy `products_select_public_menu` já
> existem no banco — ver a migration em
> [`../../supabase/migrations/20260821053648_cardapio_digital_schema.sql`](../../supabase/migrations/20260821053648_cardapio_digital_schema.sql).
> **Os passos 3 em diante (carga dos 93 itens, troca da fonte de dados no frontend) ainda não
> foram feitos** — o Cantinho do Acarajé ainda não tem uma linha em `companies` neste projeto
> Supabase (0 linhas na tabela hoje), então `is_menu_public` continua `false` pra todo mundo e
> nenhum produto é lido publicamente ainda. Nada mudou pro usuário final até aqui.

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

### `products` (tabela já existente no Supabase, hoje vazia pra este uso — 0 linhas do Cantinho)
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
(`products_select_public_menu`, já aplicada) abre uma segunda porta, aditiva: leitura anônima só de
produtos `is_active = true` de empresas com `is_menu_public = true`. Como nenhuma empresa tem
`is_menu_public = true` ainda, na prática ninguém lê nada publicamente até esse próximo passo.

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

## Passos sugeridos (nessa ordem, cada um só depois de validar o anterior)

1. ✅ **Migration de schema** — adicionar as colunas que faltam em `products` e a coluna
   `companies.is_menu_public`, com `default false` (nada muda pra ninguém até ser ligado
   manualmente). **Aplicado em 2026-08-21.**
2. ✅ **Migration de RLS** — criar a policy `products_select_public_menu` acima. **Aplicado
   junto no mesmo passo 1** (confirmado via `pg_policies` que o texto da policy está exatamente
   como o esperado). Vale ainda testar na prática com uma empresa `is_menu_public = false` real
   antes de ligar qualquer coisa em produção.
3. **Popular os dados** *(pendente — bloqueado: `companies` não tem nenhuma linha do Cantinho do
   Acarajé neste projeto ainda)* — importar os 93 itens de `menuData.js` pra `products` (script de
   importação único, não uma migration — dados, não schema). Definir o `company_id` do Cantinho do
   Acarajé e marcar `is_menu_public = true` só nessa empresa.
4. **Trocar a camada de dados no frontend** — `src/data/menuData.js` deixa de ser importado
   diretamente; um novo hook (ex.: `useMenuData()`) busca do Supabase (`select` filtrado por
   `company_id`, ordenado por `category, sort_order`) e monta a mesma estrutura `{categoria: [...]}`
   que os componentes já esperam — assim `MenuSection`, `MenuCard`, etc. não precisam mudar.
5. **Estados novos que não existiam antes** — como agora é uma chamada de rede em vez de um import
   estático, o app precisa de estado de carregamento (skeleton ou spinner) e de erro (ex.: "não
   consegui carregar o cardápio agora, tenta recarregar") — hoje isso nunca falha porque é só um
   arquivo JS embutido no bundle.
6. **Cache client-side** — vale cachear a resposta (ex.: `localStorage` com um TTL curto, tipo 5
   minutos) pra não bater no Supabase toda vez que alguém abrir o cardápio, e pro app continuar
   funcionando numa conexão ruim dentro do bar.
7. **Período de transição** — manter `menuData.js` no repositório como fallback (ou só pra
   referência/seed) até o time confirmar que o fluxo novo está estável; só remover depois.
8. **Onde a IA busca o cardápio** — o `useGarcomAI.js` também monta o prompt a partir do
   `menuData`; ele recebe os dados como prop de `App.jsx`, então continua funcionando sozinho
   assim que `App.jsx` passar a fonte de dados nova pra ele — não precisa duplicar a lógica.

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
