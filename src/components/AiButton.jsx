import { Sparkles } from "lucide-react";

export default function AiButton({ onClick }) {
  return (
    <div className="px-4 pt-4">
      <button
        onClick={onClick}
        className="w-full bg-linear-to-r from-orange-500 to-pink-500 p-4 rounded-2xl text-white font-bold shadow-lg transform transition hover:scale-[1.02] flex items-center justify-between"
      >
        <div className="flex flex-col text-left">
          <span className="text-sm opacity-90">Em dúvida do que pedir?</span>

          <span className="text-lg flex items-center gap-2">
            Chame o Garçom IA ✨
          </span>
        </div>

        <Sparkles size={28} className="animate-pulse" />
      </button>
    </div>
  );
}
