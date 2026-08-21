import { faqData, veganKeywords } from "../data/faqData";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // remove acentos
}

function hasKeyword(normalizedInput, keyword) {
  return normalizedInput.includes(normalize(keyword));
}

/**
 * Procura, entre pergunta frequentes + a pergunta dinâmica de vegano, qual
 * combina com o texto do cliente. Retorna a resposta pronta (string) ou
 * null se nada bateu o suficiente — nesse caso o chamador deve cair para a IA.
 */
export function matchFaq(userText, menuData) {
  const normalizedInput = normalize(userText);

  if (veganKeywords.some((keyword) => hasKeyword(normalizedInput, keyword))) {
    return buildVeganAnswer(menuData);
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqData) {
    const score = faq.keywords.reduce((count, keyword) => {
      return hasKeyword(normalizedInput, keyword) ? count + 1 : count;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestMatch ? bestMatch.answer : null;
}

/**
 * Monta a lista de itens veganos/vegetarianos direto do cardápio (tag
 * "Leaf"), então a resposta nunca fica desatualizada em relação ao cardápio.
 */
export function buildVeganAnswer(menuData) {
  const veganItems = Object.entries(menuData)
    .filter(([category]) => category !== "Destaques")
    .flatMap(([, items]) => items)
    .filter((item) => item.tags.includes("Leaf"));

  if (veganItems.length === 0) {
    return "No momento não temos opções vegetarianas/veganas marcadas no cardápio — pergunta pro nosso time no balcão que eles te ajudam! 🌿";
  }

  const names = veganItems.map((item) => item.name).join(", ");

  return `Temos sim! Opções vegetarianas/veganas no cardápio: ${names} 🌿 (procura o ícone da folhinha no cardápio pra identificar)`;
}
