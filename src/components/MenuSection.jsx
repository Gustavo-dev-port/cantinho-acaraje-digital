import { Flame } from "lucide-react";
import MenuCard from "./MenuCard";
import MenuLegend from "./MenuLegends";

export default function MenuSection({
  activeCategory,
  menuData,
  theme,
  darkMode,
}) {
  return (
    <main className="flex-1 px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">{activeCategory}</h2>

        {activeCategory === "Destaques" && (
          <Flame className="text-orange-500 animate-pulse" />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {menuData[activeCategory].map((item) => (
          <MenuCard key={item.id} item={item} theme={theme} />
        ))}
      </div>

      <MenuLegend darkMode={darkMode} />
    </main>
  );
}
