export const callGeminiAPI = async (prompt, systemInstruction) => {
  const apiKey = ""; // A chave é fornecida pelo ambiente
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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
    return "Putz, o sistema do bar está meio lento agora. Dá uma vista de olhos nas nossas categorias aqui em cima enquanto resolvo isto! 🍻";
  }
};
