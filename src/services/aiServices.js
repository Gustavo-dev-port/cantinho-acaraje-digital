// ATENÇÃO — leia antes de mexer aqui:
// Esta chamada é feita direto do navegador (client-side). Qualquer valor
// colocado em VITE_GEMINI_API_KEY vai parar, em texto puro, dentro do
// bundle JS público — qualquer visitante pode abrir o DevTools e extrair
// a chave para usar por conta própria. O jeito correto é ter um backend
// (ex.: uma Edge Function do Supabase) que guarda a chave como segredo de
// servidor e o cliente chama esse backend, nunca a Gemini diretamente.
// A troca abaixo só destrava a funcionalidade — não resolve essa exposição.
export const callGeminiAPI = async (prompt, systemInstruction) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      "VITE_GEMINI_API_KEY não configurada — defina essa variável de ambiente para habilitar o Garçom IA."
    );
    return "Ainda tô sem acesso à cozinha aqui (falta configurar a IA) 😅 Dá uma olhada nas categorias aqui em cima que eu te ajudo assim que estiver pronto!";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Eita, me perdi aqui nas comandas! Tenta perguntar de novo? 😅"
    );
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    return "Putz, o sistema do bar está meio lento agora. Dá uma vista de olhos nas nossas categorias aqui em cima enquanto resolvo isto! 🍻";
  }
};
