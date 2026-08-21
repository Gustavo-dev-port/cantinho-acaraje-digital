import { Sparkles, X, Loader2, CheckCircle2 } from "lucide-react";

const QUICK_SUGGESTIONS = [
  { emoji: "😋", label: "Me surpreenda", prompt: "Me surpreenda com algo do cardápio" },
  { emoji: "🌶️", label: "Algo picante", prompt: "Quero algo picante" },
  { emoji: "🌿", label: "Sou vegetariano", prompt: "Tem opção vegetariana ou vegana?" },
  { emoji: "🕒", label: "Horário", prompt: "Qual o horário de funcionamento?" },
];

export default function AiModal({
  darkMode,
  theme,
  aiPrompt,
  setAiPrompt,
  aiResponse,
  isAiLoading,
  responseSource,
  handleAskAI,
  setIsAiModalOpen,
}) {
  const showSuggestions = !aiPrompt && !aiResponse && !isAiLoading;

  return (
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
            aria-label="Fechar Garçom IA"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className={`text-sm mb-4 ${theme.textMuted}`}>
            Me fala como você tá se sentindo hoje que eu te recomendo o melhor
            do nosso cardápio!
          </p>

          <div className="flex flex-col gap-3">
            <textarea
              className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-orange-500 focus:outline-none transition resize-none h-24 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-gray-50 border-gray-200"
              }`}
              placeholder="Ex: Tô com uma fome monstra, mas quero algo vegetariano! Ou: Hoje o dia foi difícil, preciso de um drink forte..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              maxLength={300}
            />

            {showSuggestions && (
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => handleAskAI(suggestion.prompt)}
                    className={`text-xs font-semibold px-3 py-2 rounded-full transition ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                    }`}
                  >
                    {suggestion.emoji} {suggestion.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => handleAskAI()}
              disabled={isAiLoading || !aiPrompt.trim()}
              className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                isAiLoading || !aiPrompt.trim()
                  ? "bg-gray-300 text-gray-500"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
              }`}
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
              className={`mt-6 p-5 rounded-2xl ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-orange-50 border border-orange-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-bold flex items-center gap-2 text-orange-500">
                  <Sparkles size={16} /> A dica do Garçom:
                </h4>

                {responseSource === "faq" ? (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-green-900/40 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                    title="Resposta direto do nosso cardápio e informações oficiais"
                  >
                    <CheckCircle2 size={12} /> Resposta oficial
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                    title="Sugestão gerada por IA — confirme com a equipe se tiver dúvida"
                  >
                    <Sparkles size={12} /> Sugestão da IA
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
