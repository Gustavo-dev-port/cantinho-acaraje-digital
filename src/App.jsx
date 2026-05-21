import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  MapPin,
  Info,
  Flame,
  Leaf,
  Award,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";

const callGeminiAPI = async (prompt, systemInstruction) => {
  const apiKey = "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Eita, me perdi aqui nas comandas! Tenta perguntar de novo? 😅"
      );
    } catch (error) {
      if (i < 4) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
      } else {
        return "Putz, o sistema do bar tá meio lento agora. Dá uma olhada nas nossas categorias aqui em cima enquanto resolvo isso! 🍻";
      }
    }
  }
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Destaques");
  const [darkMode, setDarkMode] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const menuData = {
    Destaques: [
      {
        id: "ac1",
        name: "Acarajé no Prato",
        desc: "Bolinho cortado em pedaços, vatapá, caruru, tomate verde e camarão. A nossa estrela! 🌴",
        price: "35,00",
        tags: ["Award"],
      },
      {
        id: "p1",
        name: "Dadinho de Tapioca",
        desc: "12 Unidades perfeitas pra dividir. Acompanha geleia deliciosa.",
        price: "35,00",
        tags: ["Award", "Leaf"],
      },
      {
        id: "d1",
        name: "Moscow Mule",
        desc: "Vodka, Xarope Gengibre, Citrus, Espuma. Refrescante e altamente instagramável 📸",
        price: "30,00",
        tags: ["Award"],
      },
      {
        id: "c1",
        name: "Combo Xeque-Mate",
        desc: "Aquela lata clássica que não pode faltar na noite paulistana.",
        price: "18,00",
        tags: [],
      },
    ],
    "Acarajés & Cia": [
      {
        id: "ac2",
        name: "Acarajé Inteiro",
        desc: "Bolinho de feijão fradinho frito, vatapá, caruru, tomate verde e camarão.",
        price: "30,00",
        tags: [],
      },
      {
        id: "ac1",
        name: "Acarajé no Prato",
        desc: "Bolinho cortado em pedaços, vatapá, caruru, tomate verde e camarão.",
        price: "35,00",
        tags: ["Award"],
      },
      {
        id: "ac3",
        name: "Porção Inteira (12 Mini)",
        desc: "12 Mini Bolinhos, vatapá, caruru, tomate verde e camarão. Pra galera toda!",
        price: "65,00",
        tags: [],
      },
      {
        id: "ac4",
        name: "Meia Porção (6 Mini)",
        desc: "6 Mini Bolinhos com todos os acompanhamentos tradicionais.",
        price: "35,00",
        tags: [],
      },
      {
        id: "esc1",
        name: "Escondidinho de Carne Seca",
        desc: "Massa de Mandioca/Abóbora, Catupiry e Queijo Gratinado.",
        price: "35,00",
        tags: [],
      },
      {
        id: "esc2",
        name: "Escondidinho Frango/Carne Moída",
        desc: "Massa de Mandioca/Abóbora, Catupiry e Queijo Gratinado.",
        price: "28,00",
        tags: [],
      },
    ],
    "Pastéis & Caldos": [
      {
        id: "pst1",
        name: "Pastel de Carne Seca",
        desc: "Bem recheado e crocante.",
        price: "18,00",
        tags: [],
      },
      {
        id: "pst2",
        name: "Pastel Frango com Catupiry",
        desc: "O clássico de feira.",
        price: "15,00",
        tags: [],
      },
      {
        id: "pst3",
        name: "Pastel Carne com Queijo",
        desc: "Combinação que não tem erro.",
        price: "18,00",
        tags: [],
      },
      {
        id: "pst4",
        name: "Pastel de Pizza ou Queijo",
        desc: "Opção vegetariana delícia.",
        price: "20,00",
        tags: ["Leaf"],
      },
      {
        id: "cal1",
        name: "Caldo de Feijão / Verde",
        desc: "Tradicional ou Vegano. Perfeito pro friozinho.",
        price: "22,00",
        tags: [],
      },
      {
        id: "cal2",
        name: "Caldo de Costela com Mandioca",
        desc: "Sustança pura.",
        price: "26,00",
        tags: [],
      },
      {
        id: "cal3",
        name: "Caldo de Mocotó",
        desc: "Pra levantar defunto!",
        price: "25,00",
        tags: [],
      },
    ],
    "Pra Dividir": [
      {
        id: "porc1",
        name: "Batata Frita, Cheddar e Bacon",
        desc: "500g daquela clássica que todo mundo ama.",
        price: "45,00",
        tags: [],
      },
      {
        id: "porc2",
        name: "Carne Seca com Mandioca",
        desc: "400g de Carne e 500g de Mandioca. O match perfeito.",
        price: "65,00",
        tags: [],
      },
      {
        id: "porc3",
        name: "Frango a Passarinho (1kg)",
        desc: "Bem temperado e crocante.",
        price: "55,00",
        tags: [],
      },
      {
        id: "p1",
        name: "Dadinho de Tapioca (12 Unid.)",
        desc: "Acompanha geleia.",
        price: "35,00",
        tags: ["Leaf"],
      },
      {
        id: "porc4",
        name: "Calabresa Acebolada (500g)",
        desc: "Acompanha maionese e torradinhas.",
        price: "35,00",
        tags: [],
      },
      {
        id: "porc5",
        name: "Salgadinhos (18 Unid.)",
        desc: "Mix de queijo, coxinha, kibe e risole.",
        price: "55,00",
        tags: [],
      },
      {
        id: "porc6",
        name: "Isca de Frango Empanado (500g)",
        desc: "Crocante por fora, suculento por dentro.",
        price: "35,00",
        tags: [],
      },
      {
        id: "porc7",
        name: "Mandioca ou Batata Simples",
        desc: "500g de porção.",
        price: "35,00",
        tags: ["Leaf"],
      },
      {
        id: "porc8",
        name: "Mini Pastel (8 Unid.)",
        desc: "Carne, Frango, Pizza ou Queijo.",
        price: "35,00",
        tags: [],
      },
    ],
    "Drinks da Casa": [
      {
        id: "d2",
        name: "Aperol Spritz",
        desc: "Aperol, Espumante Prosecco, Água com Gás.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d3",
        name: "Negroni",
        desc: "Gin, Campari, Vermute. Pra quem tem atitude.",
        price: "40,00",
        tags: [],
      },
      {
        id: "d4",
        name: "Bombeirinho / Jambu",
        desc: "Cachaça de Jambu, Grenadine e Limão Tahiti. Vai tremer! ⚡",
        price: "28,00",
        tags: ["Flame"],
      },
      {
        id: "d5",
        name: "Caju Amigo",
        desc: "Vodka, Xarope Caju, Limão, Suco Caju.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d6",
        name: "Fitzgerald",
        desc: "Gin, Limão Siciliano, Angostura, Xarope.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d7",
        name: "Gin Sunshine",
        desc: "Gin, Maracujá, Manga, Mel, Tônica.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d8",
        name: "Gin Tonica Clássica",
        desc: "Tanqueray ou Bombay.",
        price: "38,00",
        tags: [],
      },
      {
        id: "d9",
        name: "Limoncello Spritz",
        desc: "Limoncello, Espumante, Água c/ Gás.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d10",
        name: "Margarita",
        desc: "Tequila, Limão Tahiti, Licor de Laranja.",
        price: "40,00",
        tags: [],
      },
      {
        id: "d1",
        name: "Moscow Mule",
        desc: "Vodka, Xarope Gengibre, Citrus, Espuma Gengibre.",
        price: "30,00",
        tags: ["Award"],
      },
      {
        id: "d11",
        name: "Penicilina",
        desc: "Whisky Bourbon, Mel, Gengibre, Limão.",
        price: "35,00",
        tags: [],
      },
      {
        id: "d12",
        name: "Sex On The Beach",
        desc: "Vodka, Licor Pêssego, Laranja, Grenadine.",
        price: "30,00",
        tags: [],
      },
    ],
    Caipirinhas: [
      {
        id: "cp1",
        name: "Caipirinha Especial Sake",
        desc: "Escolha: Frutas Vermelhas ou Tangerina com limão.",
        price: "30,00",
        tags: [],
      },
      {
        id: "cp2",
        name: "Caipirinha Especial Vodka/Cachaça",
        desc: "Nordka/Smirnoff ou Velho Barreiro/51.",
        price: "28,00",
        tags: [],
      },
      {
        id: "cp3",
        name: "Caipirinha Tradicional Sake",
        desc: "Escolha: Limão, Abacaxi, Morango, Kiwi ou Maracujá.",
        price: "25,00",
        tags: [],
      },
      {
        id: "cp4",
        name: "Caipirinha Tradicional Vodka",
        desc: "Nordka ou Smirnoff.",
        price: "22,00",
        tags: [],
      },
      {
        id: "cp5",
        name: "Caipirinha Tradicional Cachaça",
        desc: "Velho Barreiro ou 51.",
        price: "20,00",
        tags: [],
      },
    ],
    Cervejas: [
      {
        id: "bv1",
        name: "Colorado / Xeque-Mate (Lata)",
        desc: "",
        price: "18,00",
        tags: [],
      },
      {
        id: "bv2",
        name: "Baden Baden IPA ou Pilsen (600ml)",
        desc: "",
        price: "23,00",
        tags: [],
      },
      {
        id: "bv3",
        name: "Colorado Kuya / Ribeirão (600ml)",
        desc: "",
        price: "23,00",
        tags: [],
      },
      {
        id: "bv4",
        name: "Heineken / Patagonia IPA (600ml)",
        desc: "",
        price: "19,00",
        tags: [],
      },
      {
        id: "bv5",
        name: "Becks / Stella / Draft (600ml)",
        desc: "",
        price: "18,00",
        tags: [],
      },
      {
        id: "bv6",
        name: "Original / Spaten (600ml)",
        desc: "",
        price: "18,00",
        tags: [],
      },
      {
        id: "bv7",
        name: "Budweiser (600ml)",
        desc: "",
        price: "16,00",
        tags: [],
      },
      {
        id: "bv8",
        name: "Long Necks Variadas",
        desc: "Becks, Corona, Heineken, Stella, Smirnoff Ice, Skol Beats Senses.",
        price: "16,00 - 18,00",
        tags: [],
      },
    ],
    "Shots & Doses": [
      {
        id: "sh1",
        name: "Whisky Premium",
        desc: "Black Label, Jack Daniels (Trad/Fire/Honey).",
        price: "40,00 - 50,00",
        tags: [],
      },
      {
        id: "sh2",
        name: "Whisky Importado",
        desc: "Buchanan's, Red Label, Dewar's, White Horse.",
        price: "30,00 - 45,00",
        tags: [],
      },
      {
        id: "sh3",
        name: "Shot Tequila / Jägermeister / L43",
        desc: "Jose Cuervo, Jäger ou Licor 43 (50ml).",
        price: "30,00 - 40,00",
        tags: [],
      },
      {
        id: "sh4",
        name: "Shot Don Luiz / Fireball / Campari",
        desc: "Doses rápidas pra esquentar (50ml).",
        price: "25,00 - 30,00",
        tags: [],
      },
      {
        id: "sh5",
        name: "Cachaças Especiais",
        desc: "Jambu, Busca Vida, Salinas, Seleta, Boazinha.",
        price: "15,00 - 27,00",
        tags: [],
      },
      {
        id: "sh6",
        name: "Cachaças Clássicas",
        desc: "Velho Barreiro, Canelinha, Mineirinha, Cambuci.",
        price: "10,00 - 13,00",
        tags: [],
      },
      {
        id: "sh7",
        name: "Vodkas",
        desc: "Smirnoff ou Nordka (100ml).",
        price: "18,00 - 25,00",
        tags: [],
      },
    ],
    "Não Alcoólicas": [
      {
        id: "na1",
        name: "Pink Lemonade / Refresco Gengibre ou Hibisco",
        desc: "Super refrescantes e sem álcool.",
        price: "15,00 - 17,00",
        tags: [],
      },
      {
        id: "na2",
        name: "Red Bull / Monster",
        desc: "Energético lata.",
        price: "20,00 - 22,00",
        tags: [],
      },
      {
        id: "na3",
        name: "Sucos Variados",
        desc: "Abacaxi, Limão, Manga, Maracujá, Morango.",
        price: "10,00",
        tags: [],
      },
      {
        id: "na4",
        name: "Refrigerantes Lata / Água",
        desc: "Coca, Guaraná, H2O, Água com/sem gás.",
        price: "6,00 - 10,00",
        tags: [],
      },
    ],
  };

  const categories = Object.keys(menuData);

  const theme = {
    bgApp: darkMode ? "bg-slate-950" : "bg-[#faf8f5]",
    textMain: darkMode ? "text-slate-100" : "text-slate-900",
    textMuted: darkMode ? "text-slate-400" : "text-slate-500",
    cardBg: darkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-orange-100",
    accentBrand: "bg-orange-500 text-white",
    accentSecondary: "text-orange-500",
    navBg: darkMode ? "bg-slate-950/90" : "bg-[#faf8f5]/90",
    modalBg: darkMode ? "bg-slate-900" : "bg-white",
  };

  const renderTag = (tag) => {
    switch (tag) {
      case "Award":
        return <Award size={16} className="text-amber-500" />;
      case "Leaf":
        return <Leaf size={16} className="text-green-500" />;
      case "Flame":
        return <Flame size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse("");

    let simplifiedMenu = "";
    Object.keys(menuData).forEach((cat) => {
      simplifiedMenu += `\nCategoria: ${cat}\n`;
      menuData[cat].forEach((item) => {
        simplifiedMenu += `- ${item.name} (R$ ${item.price}): ${item.desc}\n`;
      });
    });

    const systemInstruction = `Você é o 'Garçom IA' super gente boa e descolado do 'Cantinho do Acarajé', um bar jovem localizado em Pinheiros, São Paulo. 
    Sua missão é ajudar clientes indecisos a escolherem o que comer e beber, cruzando o desejo deles com o nosso cardápio.
    Use um tom descontraído, inclua gírias paulistanas ou referências à cultura baiana quando fizer sentido, e seja direto (no máximo 3 ou 4 frases curtas).
    Sempre recomende itens REAIS do cardápio usando o nome exato. Recomende no máximo 2 ou 3 itens para não sobrecarregar o cliente. Use emojis.`;

    const userPrompt = `Cardápio disponível:\n${simplifiedMenu}\n\nO cliente diz: "${aiPrompt}"\n\nO que você recomenda?`;

    const response = await callGeminiAPI(userPrompt, systemInstruction);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${theme.bgApp} ${theme.textMain}`}
    >
      <div className="max-w-md mx-auto relative shadow-2xl min-h-screen flex flex-col pb-20">
        <header className="relative overflow-hidden pt-8 pb-6 px-6 flex flex-col items-center border-b border-orange-500/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent pointer-events-none"></div>

          <div className="w-full flex justify-end mb-4 relative z-10">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? "bg-slate-800 text-amber-300" : "bg-orange-100 text-orange-600"} transition`}
            >
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-lg border-4 border-white/10 relative z-10">
            <span className="text-3xl font-black text-white italic">CA</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-1 relative z-10 text-center">
            Cantinho do Acarajé
          </h1>
          <p
            className={`${theme.textMuted} text-sm font-medium mb-3 relative z-10 flex items-center gap-1`}
          >
            <MapPin size={14} /> Pinheiros, SP
          </p>

          <a
            href="https://instagram.com/acaraje.pinheiros"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50 shadow-sm"} transition z-10`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-pink-500"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
            @acarajé.pinheiros
          </a>
        </header>

        <div className="px-4 pt-4">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="w-full bg-linear-to-r from-orange-500 to-pink-500 p-4 rounded-2xl text-white font-bold shadow-lg transform transition hover:scale-[1.02] flex items-center justify-between"
          >
            <div className="flex flex-col text-left">
              <span className="text-sm opacity-90">
                Em dúvida do que pedir?
              </span>
              <span className="text-lg flex items-center gap-2">
                Chame o Garçom IA ✨
              </span>
            </div>
            <Sparkles size={28} className="animate-pulse" />
          </button>
        </div>

        <nav
          className={`sticky top-0 z-40 backdrop-blur-md border-b border-orange-500/10 mt-4 ${theme.navBg}`}
        >
          <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2 scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? theme.accentBrand + " shadow-md scale-105"
                    : `${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600"} hover:bg-orange-50 hover:text-orange-600`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{activeCategory}</h2>
            {activeCategory === "Destaques" && (
              <Flame className="text-orange-500 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {menuData[activeCategory].map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-lg ${theme.cardBg}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex gap-1">
                        {item.tags.map((tag, i) => (
                          <span key={i}>{renderTag(tag)}</span>
                        ))}
                      </div>
                    </div>
                    {item.desc && (
                      <p
                        className={`text-sm leading-snug mt-1 mb-3 ${theme.textMuted}`}
                      >
                        {item.desc}
                      </p>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-semibold opacity-70">R$</span>
                    <span className="text-xl font-black ml-1 text-orange-500">
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`mt-8 p-4 rounded-xl text-xs flex justify-center gap-4 ${darkMode ? "bg-slate-900/50" : "bg-orange-50"}`}
          >
            <span className="flex items-center gap-1 font-medium">
              <Award size={14} className="text-amber-500" /> Mais Pedido
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Leaf size={14} className="text-green-500" /> Vegano/Vegetariano
            </span>
          </div>
        </main>

        <footer
          className={`mt-auto pb-8 pt-6 px-6 text-center border-t border-orange-500/10 ${darkMode ? "bg-slate-950" : "bg-white"}`}
        >
          <h3 className="font-black text-xl mb-2 text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-amber-500">
            Vem Curtir Essa Vibe Com a Gente!!!
          </h3>
          <p className={`text-sm mb-4 ${theme.textMuted}`}>
            Tirou foto? Marca a gente pra aparecer no nosso Insta!
          </p>

          <div
            className={`inline-flex items-center justify-center gap-2 p-3 rounded-xl w-full text-sm font-semibold ${darkMode ? "bg-slate-900" : "bg-gray-100"}`}
          >
            <Info size={16} className="text-orange-500" />
            Quer comemorar niver? (11) 97167-2326
          </div>
        </footer>
      </div>

      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md ${theme.modalBg} rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10`}
          >
            <div className="bg-linear-to-r from-orange-500 to-pink-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h3 className="font-bold text-lg">Garçom IA ✨</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Me fala como você tá se sentindo hoje que eu te recomendo o
                melhor do nosso cardápio!
              </p>

              <div className="flex flex-col gap-3">
                <textarea
                  className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-orange-500 focus:outline-none transition resize-none h-24 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"}`}
                  placeholder="Ex: Tô com uma fome monstra, mas quero algo vegetariano! Ou: Hoje o dia foi difícil, preciso de um drink forte..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />

                <button
                  onClick={handleAskAI}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isAiLoading || !aiPrompt.trim() ? "bg-gray-300 text-gray-500" : "bg-orange-500 text-white hover:bg-orange-600 shadow-md"}`}
                >
                  {isAiLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isAiLoading ? "Pensando no pedido..." : "Me Surpreenda ✨"}
                </button>
              </div>

              {aiResponse && (
                <div
                  className={`mt-6 p-5 rounded-2xl ${darkMode ? "bg-slate-800 border-slate-700" : "bg-orange-50 border border-orange-100"}`}
                >
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-orange-500">
                    <Sparkles size={16} /> A dica do Garçom:
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-in-from-bottom-10 {
          0% { transform: translateY(10%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-in { animation: slide-in-from-bottom-10 0.3s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
}
