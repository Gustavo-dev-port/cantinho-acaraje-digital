# Cantinho do Acarajé — Cardápio Digital

Cardápio digital do bar **Cantinho do Acarajé** (Pinheiros, São Paulo): uma SPA mobile-first que
substitui o cardápio físico, com um assistente de IA ("Garçom IA") que responde dúvidas dos
clientes e sugere itens do cardápio.

## Funcionalidades

- **Cardápio completo** — 93 itens em 9 categorias (Acarajés & Cia, Pastéis & Caldos, Pra
  Dividir, Drinks da Casa, Não Alcoólicas e mais), com aba "Destaques". Vem do Supabase, com
  fallback automático pro cardápio embutido no bundle se a rede falhar (ver Arquitetura).
- **Selos** — Mais pedido, Vegano/vegetariano e Picante, direto no card de cada item.
- **Modo claro/escuro**, com preferência salva no navegador.
- **Garçom IA** — botão flutuante que abre um chat simples. Perguntas frequentes (horário,
  formas de pagamento, delivery/reserva, história do acarajé) são respondidas na hora, sem
  chamar IA nenhuma; qualquer outra pergunta ("me surpreenda com algo picante", "tenho fome
  de um drink forte") vai pro Gemini, que responde com base no cardápio real.
- Sugestões rápidas (chips) no chat pra reduzir o "medo da página em branco".

## Arquitetura

```
Navegador (React + Vite)
   │
   ├─ Cardápio (src/hooks/useMenuData.js) ── tabela "products" (Supabase, leitura pública)
   │    - cache local de 5 min, e cardápio embutido no bundle como fallback
   │      instantâneo se a rede falhar ou a config do Supabase não existir
   │
   ├─ FAQ local (src/utils/faqMatcher.js) — perguntas comuns, resposta instantânea, sem rede
   │
   └─ Edge Function "garcom-ai" (Supabase) ── Gemini API
        - a chave do Gemini nunca chega no navegador, fica só nos Secrets da função
        - rate limit por IP (6 pedidos/min, 60/dia)
        - instrução de segurança fixa no servidor: a IA nunca inventa preço nem promete
          desconto — sempre usa o valor real do cardápio enviado no prompt
```

O frontend é uma SPA estática (React 19 + Vite + Tailwind CSS 4), sem servidor próprio. O backend
é só o projeto Supabase (`barcontrol-dev`) — a Edge Function `garcom-ai` e a leitura pública do
cardápio (tabela `products`, filtrada por `company_id`). Esse mesmo projeto Supabase também roda
o sistema de gestão do bar (BarControl) — são sistemas separados compartilhando o mesmo projeto,
com Row Level Security isolando os dados de cada um (ver
[`docs/migracao-cardapio-supabase/`](./docs/migracao-cardapio-supabase/) pra como isso foi
desenhado e testado).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev
```

### Variáveis de ambiente (`.env.local`)

| Variável | O que é |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase — pública por design, não é segredo |
| `VITE_SUPABASE_COMPANY_ID` | id da linha do Cantinho do Acarajé em `companies` — filtra quais produtos o cardápio busca |

Se alguma dessas três faltar, o app não quebra: ele simplesmente usa o cardápio estático embutido
em `src/data/menuData.js`, sem tentar rede nenhuma.

A chave do Gemini **não** é uma variável de ambiente do frontend — ela fica só nos Secrets da
Edge Function `garcom-ai`, no painel do Supabase (Project Settings → Edge Functions → Secrets,
variável `GEMINI_API_KEY`). Isso é proposital: qualquer variável com prefixo `VITE_` vai parar
no bundle JS que roda no navegador de qualquer visitante, então uma chave de API paga não pode
ter esse prefixo nem estar no frontend de forma alguma.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento (Vite) |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente pra conferir |
| `npm run lint` | Roda o ESLint |

## Deploy da Edge Function

O código-fonte da função vive em `supabase/functions/garcom-ai/index.ts` (versionado no
repositório). Pra publicar uma alteração nela no Supabase, use o MCP/CLI do Supabase
(`deploy_edge_function` ou `supabase functions deploy garcom-ai`) — o deploy da função é
separado do deploy do frontend.

## Segurança

- **Chave do Gemini nunca no cliente** — ver seção de variáveis de ambiente acima.
- **Rate limiting** na Edge Function (6 req/min e 60 req/dia por IP), guardado em Postgres, pra
  não deixar a função pública virar um jeito de qualquer um estourar a cota/custo do Gemini.
- **Defesa contra manipulação de preço via prompt** — a instrução de sistema que define as
  regras da IA (nunca inventar preço, nunca prometer desconto, sempre citar o valor real do
  cardápio) é fixada no servidor (Edge Function) e não pode ser sobrescrita por nada que o
  usuário digite no chat.
- **RLS (Row Level Security)** ativo em todas as tabelas do Supabase usadas por este projeto;
  qualquer policy de leitura pública nova (como a do cardápio público, ver seção abaixo) é
  aditiva e escopada por empresa — nunca expõe dados de outros tenants do BarControl.

## Próximas atualizações

### Cardápio no Supabase (concluído — período de transição)

O cardápio (93 itens) migrou de `src/data/menuData.js` pra uma tabela no Supabase — editar um
preço ou item agora pode virar uma tela/planilha, sem precisar mudar código nem fazer deploy.

- **Schema, RLS, dados e frontend já migrados** (2026-08-21): colunas novas em `products`,
  `companies.is_menu_public`, a empresa Cantinho do Acarajé criada, os 93 itens importados, e o
  app buscando de lá via `src/hooks/useMenuData.js` — com cache de 5 min e fallback automático
  pro cardápio estático embutido se a rede ou o Supabase falharem. A leitura pública foi testada
  de verdade com o papel `anon` (não só o texto da policy) — esse teste revelou e corrigiu um bug
  real (a policy original não deixava ninguém ler nada, nem os produtos que deveriam ser
  públicos). Ver migrations em [`supabase/migrations/`](./supabase/migrations/) (arquivos com
  prefixo `20260821`).
- **`src/data/menuData.js` continua no repositório de propósito** — é o fallback offline/erro e a
  semente original dos dados. Só remover depois de um período rodando estável com a fonte nova.
- Plano completo, passo a passo, com a justificativa de cada decisão de segurança (incluindo o
  bug encontrado e corrigido):
  [`docs/migracao-cardapio-supabase/README.md`](./docs/migracao-cardapio-supabase/README.md).

### Roadmap de UI/UX

Auditoria de usabilidade e ideias de evolução/escala do projeto (curto, médio e longo prazo):
[Roadmap Acarajé Digital](https://claude.ai/code/artifact/1b34bd0c-2952-428e-ab9e-cbbd62b487ea).

Itens de "Agora" (quick wins) já aplicados: sugestões rápidas no chat da IA, distinção visual
entre resposta oficial (FAQ) e sugestão da IA, legenda de "Picante", e sombra de scroll nas
categorias pra indicar que dá pra rolar pros lados.
