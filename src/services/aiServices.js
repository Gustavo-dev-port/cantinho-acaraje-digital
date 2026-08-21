// A chave da Gemini NÃO fica aqui. Esta função chama a Edge Function
// "garcom-ai" do nosso projeto Supabase, que guarda a chave como Secret de
// servidor (Project Settings -> Edge Functions -> Secrets, variável
// GEMINI_API_KEY) e repassa a chamada pro Google por trás. O navegador do
// cliente só fala com o Supabase, nunca vê a chave da IA.
//
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidas no
// ambiente (arquivo .env local, ou nas variáveis de ambiente da Vercel/
// Netlify/etc.). A "anon key" do Supabase é uma chave pública por design —
// pode ficar no bundle do cliente sem problema, ao contrário da chave da IA.
export const callGeminiAPI = async (prompt, systemInstruction) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas — defina essas variáveis de ambiente para habilitar o Garçom IA."
    );
    return "Ainda tô sem acesso à cozinha aqui (falta configurar a IA) 😅 Dá uma olhada nas categorias aqui em cima que eu te ajudo assim que estiver pronto!";
  }

  const url = `${supabaseUrl}/functions/v1/garcom-ai`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return (
      data.text || "Eita, me perdi aqui nas comandas! Tenta perguntar de novo? 😅"
    );
  } catch (error) {
    console.error("Erro ao chamar o Garçom IA:", error);
    return "Putz, o sistema do bar está meio lento agora. Dá uma vista de olhos nas nossas categorias aqui em cima enquanto resolvo isto! 🍻";
  }
};
