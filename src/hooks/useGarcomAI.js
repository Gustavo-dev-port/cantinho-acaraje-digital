import { useEffect, useState } from "react";
import { callGeminiAPI } from "../services/aiServices";
import { matchFaq } from "../utils/faqMatcher";

export function useGarcomAI(menuData) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const loadingMessages = [
    "A pensar no pedido...",
    "A ler o cardápio...",
    "A falar com o barman...",
    "A preparar o acarajé...",
    "A procurar a melhor opção...",
    "Quase lá...",
  ];
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isAiLoading) return undefined;

    let i = 0;

    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 1500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiLoading]);

  const buildSimplifiedMenu = () => {
    let simplifiedMenu = "";

    Object.keys(menuData).forEach((cat) => {
      simplifiedMenu += `\nCategoria: ${cat}\n`;

      menuData[cat].forEach((item) => {
        simplifiedMenu += `- ${item.name} (R$ ${item.price}): ${item.desc}\n`;
      });
    });

    return simplifiedMenu;
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiResponse("");

    // 1) Perguntas comuns (horário, pagamento, vegano, história...) são
    // respondidas na hora, sem gastar chamada de IA nem depender do Gemini.
    const faqAnswer = matchFaq(aiPrompt, menuData);

    if (faqAnswer) {
      setAiResponse(faqAnswer);
      return;
    }

    // 2) Perguntas mais abertas (recomendações, "o que eu peço") vão pra IA.
    setIsAiLoading(true);
    setLoadingText(loadingMessages[0]);

    const simplifiedMenu = buildSimplifiedMenu();

    const systemInstruction = `Você é o 'Garçom IA' super gente boa e descolado do 'Cantinho do Acarajé', um bar jovem localizado em Pinheiros, São Paulo. 
    Sua missão é ajudar clientes indecisos a escolherem o que comer e beber, cruzando o desejo deles com o nosso cardápio.
    Use um tom descontraído, inclua gírias paulistanas ou referências à cultura baiana quando fizer sentido, e seja direto (no máximo 3 ou 4 frases curtas).
    Sempre recomende itens REAIS do cardápio usando o nome exato. Recomende no máximo 2 ou 3 itens para não sobrecarregar o cliente. Use emojis.`;

    const userPrompt = `Cardápio disponível:\n${simplifiedMenu}\n\nO cliente diz: "${aiPrompt}"\n\nO que você recomenda?`;

    const response = await callGeminiAPI(userPrompt, systemInstruction);

    setAiResponse(response);
    setIsAiLoading(false);
  };

  return {
    aiPrompt,
    setAiPrompt,
    aiResponse,
    isAiLoading,
    loadingText,
    handleAskAI,
  };
}
