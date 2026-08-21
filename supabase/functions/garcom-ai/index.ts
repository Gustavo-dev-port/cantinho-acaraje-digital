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

const MAX_PROMPT_LENGTH = 2000;

// Alias mantido pela Google que sempre aponta pro Flash estável mais
// recente — evita ter que trocar o nome do modelo toda vez que uma versão
// nova sai (foi exatamente isso que quebrou com "gemini-2.5-flash").
const GEMINI_MODEL = "gemini-flash-latest";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
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
    return jsonResponse({ error: "Prompt inválido ou muito longo." }, 400);
  }

  if (
    typeof systemInstruction !== "string" ||
    systemInstruction.length > MAX_PROMPT_LENGTH
  ) {
    return jsonResponse({ error: "systemInstruction inválida." }, 400);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error("Erro da API do Gemini:", geminiResponse.status, errorBody);
      return jsonResponse(
        { error: `Erro ao consultar a IA (status ${geminiResponse.status}).` },
        502
      );
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    return jsonResponse({ text });
  } catch (error) {
    console.error("Falha ao chamar a API do Gemini:", error);
    return jsonResponse({ error: "Falha ao chamar a IA." }, 502);
  }
});
