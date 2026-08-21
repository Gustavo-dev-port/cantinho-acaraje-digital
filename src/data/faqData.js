// Perguntas frequentes com resposta pronta e instantânea (sem custo, sem IA).
// Cada item tem: id, keywords (palavras que disparam a resposta) e answer.
// A busca em faqMatcher.js ignora acentos/maiúsculas, então escreva as
// keywords sempre em minúsculo e sem acento.

// Palavras que disparam a resposta dinâmica de vegano/vegetariano
// (a resposta em si é montada em faqMatcher.js a partir do cardápio real).
export const veganKeywords = [
  "vegano",
  "vegana",
  "veganos",
  "veganas",
  "vegetariano",
  "vegetariana",
  "vegetarianos",
  "vegetarianas",
  "sem carne",
];

export const faqData = [
  {
    id: "horario",
    keywords: [
      "horario",
      "hora",
      "horas",
      "funciona",
      "funcionamento",
      "abre",
      "abrem",
      "fecha",
      "fecham",
      "aberto",
      "aberta",
    ],
    answer:
      "Nosso horário é: terça a quinta das 16h à 00h, sexta das 15h à 01h, e sábado e domingo das 14h à 01h. Segunda a gente descansa 😴",
  },
  {
    id: "pagamento",
    keywords: [
      "pagamento",
      "pagar",
      "cartao",
      "cartão",
      "credito",
      "crédito",
      "debito",
      "débito",
      "pix",
      "dinheiro",
      "voucher",
      "vouchers",
    ],
    answer:
      "Aceitamos Pix, cartão de crédito, cartão de débito, dinheiro e vouchers 💳",
  },
  {
    id: "delivery",
    keywords: [
      "delivery",
      "entrega",
      "entregar",
      "ifood",
      "leva em casa",
      "buscar em casa",
    ],
    answer:
      "Por enquanto não trabalhamos com delivery — é só vir curtir com a gente por aqui! 🍻",
  },
  {
    id: "reserva",
    keywords: [
      "reserva",
      "reservar",
      "reservado",
      "mesa",
      "galera",
      "grupo",
      "aniversario",
      "aniversário",
      "niver",
    ],
    answer:
      "Não precisa reservar pra vir, é só chegar! Mas se você tá organizando uma galera maior, vale muito a pena reservar — quem reserva ainda ganha um presentinho especial da casa 🎁",
  },
  {
    id: "acaraje-historia",
    keywords: [
      "historia",
      "história",
      "origem",
      "de onde vem",
      "acaraje",
      "acarajé",
    ],
    answer:
      "O acarajé é um bolinho frito no azeite de dendê, feito com massa de feijão-fradinho, cebola e sal. Veio pro Brasil trazido por pessoas escravizadas da África Ocidental e virou símbolo da Bahia, onde ganhou o recheio de vatapá, caruru e camarão. Além de comida de rua, tem um significado religioso profundo no candomblé, sendo oferecido a orixás como Iansã e Xangô 🙏",
  },
  {
    id: "vatapa-caruru",
    keywords: ["vatapa", "vatapá", "caruru", "recheio", "acompanhamento"],
    answer:
      "O vatapá é feito com peixe ou camarão, farinha (de mandioca, fubá ou pão), leite de coco, castanha-de-caju e azeite de dendê, numa pasta cremosa. Já o caruru leva quiabo, camarão, azeite de dendê, cebola e também castanha-de-caju ou amendoim torrado. Os dois são a alma do nosso acarajé! 🌶️",
  },
];
