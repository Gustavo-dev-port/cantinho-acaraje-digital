import { Award, Leaf, Flame } from "lucide-react";

export default function MenuLegend({ darkMode }) {
  return (
    <div
      className={`mt-8 p-4 rounded-xl text-xs flex flex-wrap justify-center gap-4 ${
        darkMode ? "bg-slate-900/50" : "bg-orange-50"
      }`}
    >
      <span className="flex items-center gap-1 font-medium">
        <Award size={14} className="text-amber-500" /> Mais Pedido
      </span>

      <span className="flex items-center gap-1 font-medium">
        <Leaf size={14} className="text-green-500" /> Vegano/Vegetariano
      </span>

      <span className="flex items-center gap-1 font-medium">
        <Flame size={14} className="text-red-500" /> Picante
      </span>
    </div>
  );
}
