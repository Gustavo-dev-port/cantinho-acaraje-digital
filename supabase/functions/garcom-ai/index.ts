import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Proxy seguro para a API do Gemini.
// A chave (GEMINI_API_KEY) fica só aqui no servidor, como Secret do
// projeto Supabase — nunca é enviada ao navegador do cliente.
// Configure em: Project Settings -> Edge Functions -> Secrets.
//
// Deploy manual (se não usar CI): supabase functions deploy garcom-ai

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// O prompt inclui o cardápio inteiro simplificado (hoje ~6.300 caracteres
// com 93 itens) + a pergunta do cliente. Limite generoso pra sobrar espaço
// conforme o cardápio crescer, mas ainda protegendo contra abuso.
const MAX_PROMPT_LENGTH = 20000;
const MAX_SYSTEM_INSTRUCTION_LENGTH = 4000;

// Aliases mantidos pela Google que sempre apontam pro Flash estável mais
// recente — evita ter que trocar o nome do modelo toda vez que uma versão
// nova sai (foi exatamente isso que quebrou com "gemini-2.5-flash").
// Em caso de sobrecarga (503 "high demand", comum em modelo popular),
// caímos pro Flash-Lite como reserva, com uma pequena pausa antes.
const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-flash-lite-latest";
const RETRY_DELAY_MS = 700;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  model: string,
  apiKey: string,
  payload: unknown
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");

  if (!apiKey) {
    console.error("GEMINI_API_KEY não configurada nos Secrets da função.");
    return jsonResponse(
      { error: "IA temporariamente indisponível (chave não configurada)." },
      500
    );
  }

  let body: { prompt?: string; systemInstruction?: string };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON inválido no corpo da requisição." }, 400);
  }

  const { prompt, systemInstruction } = body;

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > MAX_PROMPT_LENGTH
  ) {
    console.error("Prompt inválido ou muito longo:", prompt?.length);
    return jsonResponse({ error: "Prompt inválido ou muito longo." }, 400);
  }

  if (
    typeof systemInstruction !== "string" ||
    systemInstruction.length > MAX_SYSTEM_INSTRUCTION_LENGTH
  ) {
    console.error(
      "systemInstruction inválida ou muito longa:",
      systemInstruction?.length
    );
    return jsonResponse({ error: "systemInstruction inválida." }, 400);
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const primaryResponse = await callGemini(PRIMARY_MODEL, apiKey, payload);

    if (primaryResponse.ok) {
      const data = await primaryResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      return jsonResponse({ text });
    }

    const primaryStatus = primaryResponse.status;
    console.error(
      `Erro da API do Gemini (${PRIMARY_MODEL}):`,
      primaryStatus,
      await primaryResponse.text()
    );

    // Só vale tentar o modelo reserva em erro de sobrecarga/transitório
    // (503). Erro de autenticação, cota ou requisição inválida não melhora
    // trocando de modelo.
    if (primaryStatus !== 503) {
      return jsonResponse(
        { error: `Erro ao consultar a IA (status ${primaryStatus}).` },
        502
      );
    }

    await sleep(RETRY_DELAY_MS);

    const fallbackResponse = await callGemini(FALLBACK_MODEL, apiKey, payload);

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      return jsonResponse({ text });
    }

    console.error(
      `Erro da API do Gemini (${FALLBACK_MODEL}):`,
      fallbackResponse.status,
      await fallbackResponse.text()
    );

    return jsonResponse(
      { error: `Erro ao consultar a IA (status ${fallbackResponse.status}).` },
      502
    );
  } catch (error) {
    console.error("Falha ao chamar a API do Gemini:", error);
    return jsonResponse({ error: "Falha ao chamar a IA." }, 502);
  }
});
