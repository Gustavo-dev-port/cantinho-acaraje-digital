import { useEffect, useState, useCallback, useRef } from "react";
import { menuData as staticMenuData, featuredItemIds as staticFeaturedItemIds } from "../data/menuData";

// Ordem de exibição das categorias — mesma ordem que existia em
// src/data/menuData.js (a ordem de um objeto vindo de um `select` no
// Supabase não é garantida por categoria, então precisamos fixar isso aqui).
const CATEGORY_ORDER = [
  "Acarajés & Cia",
  "Pastéis & Caldos",
  "Pra Dividir",
  "Drinks da Casa",
  "Caipirinhas",
  "Cervejas",
  "Shots",
  "Doses",
  "Não Alcoólicas",
];

const CACHE_KEY = "cantinho-menu-cache-v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos — cardápio muda pouco, e isso
// evita bater no Supabase toda vez que alguém abre o app (ex.: várias
// pessoas na mesma mesa abrindo o link em sequência).

function readCache(companyId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (parsed.companyId !== companyId) return null;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    if (!parsed.payload?.menuData || !parsed.payload?.featuredItemIds) {
      return null;
    }

    return parsed.payload;
  } catch {
    // localStorage indisponível ou cache corrompido — segue sem cache.
    return null;
  }
}

function writeCache(companyId, payload) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ companyId, savedAt: Date.now(), payload }),
    );
  } catch {
    // localStorage indisponível (modo privado, cota cheia etc.) — segue
    // funcionando, só sem cache local.
  }
}

// Converte as linhas cruas de `products` (formato da tabela) pro formato
// que os componentes já esperam (formato de src/data/menuData.js), sem
// precisar mudar MenuSection, MenuCard, etc.
function transformRows(rows) {
  const byCategory = {};
  const featuredItemIds = [];

  rows.forEach((row) => {
    const item = {
      id: row.slug || row.id,
      name: row.name,
      desc: row.description || "",
      price: Number(row.sale_price),
      tags: Array.isArray(row.tags) ? row.tags : [],
    };

    if (!byCategory[row.category]) byCategory[row.category] = [];
    byCategory[row.category].push(item);

    if (row.is_featured) featuredItemIds.push(item.id);
  });

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((cat) => byCategory[cat]),
    ...Object.keys(byCategory).filter((cat) => !CATEGORY_ORDER.includes(cat)),
  ];

  const menuData = {};
  orderedCategories.forEach((cat) => {
    menuData[cat] = byCategory[cat];
  });

  return { menuData, featuredItemIds };
}

/**
 * Busca o cardápio no Supabase (tabela `products`, leitura pública anônima
 * — ver docs/migracao-cardapio-supabase/). Sempre tem conteúdo pra mostrar
 * na hora, sem tela de carregamento bloqueante:
 *
 *   1. Se tiver cache válido (< 5 min) no navegador, usa ele de cara.
 *   2. Senão, usa o cardápio estático embutido no bundle (src/data/menuData.js)
 *      — nunca falha, é só um arquivo JS.
 *   3. Em paralelo (ou na sequência, se caiu no passo 2), busca a versão
 *      mais atual no Supabase e atualiza o conteúdo/cache quando chegar.
 *   4. Se a busca falhar (rede ruim, Supabase fora do ar), o que já estava
 *      na tela continua — só marca `refreshError` pra quem quiser avisar
 *      o usuário que pode não estar 100% atualizado.
 *
 * Se as variáveis de ambiente do Supabase não estiverem configuradas, usa
 * só o cardápio estático, sem tentar rede nenhuma (mesmo comportamento de
 * antes desta migração).
 */
export function useMenuData() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const companyId = import.meta.env.VITE_SUPABASE_COMPANY_ID;
  const supabaseConfigured = Boolean(
    supabaseUrl && supabaseAnonKey && companyId,
  );

  const [state, setState] = useState(() => {
    if (!supabaseConfigured) {
      return {
        menuData: staticMenuData,
        featuredItemIds: staticFeaturedItemIds,
        isRefreshing: false,
        refreshError: null,
        source: "static",
      };
    }

    const cached = readCache(companyId);

    return {
      menuData: cached ? cached.menuData : staticMenuData,
      featuredItemIds: cached ? cached.featuredItemIds : staticFeaturedItemIds,
      isRefreshing: true,
      refreshError: null,
      source: cached ? "cache" : "static",
    };
  });

  // Evita setState depois de desmontar (ex.: hot reload em dev).
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) return;

    try {
      const url =
        `${supabaseUrl}/rest/v1/products` +
        `?select=id,name,description,sale_price,tags,category,sort_order,is_featured,slug` +
        `&company_id=eq.${companyId}` +
        `&is_active=eq.true` +
        `&order=category.asc,sort_order.asc`;

      const response = await fetch(url, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase respondeu ${response.status}`);
      }

      const rows = await response.json();

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Cardápio veio vazio do Supabase");
      }

      const payload = transformRows(rows);

      writeCache(companyId, payload);

      if (!mountedRef.current) return;

      setState({
        ...payload,
        isRefreshing: false,
        refreshError: null,
        source: "network",
      });
    } catch (err) {
      if (!mountedRef.current) return;

      // Não derruba o que já está na tela (cache ou estático) — só avisa
      // que a atualização falhou, pra quem quiser mostrar isso ao usuário.
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        refreshError: err.message,
      }));
    }
  }, [supabaseConfigured, supabaseUrl, supabaseAnonKey, companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return state;
}
