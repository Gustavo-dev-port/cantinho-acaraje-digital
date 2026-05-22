import { Award, Leaf, Flame } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

export default function MenuCard({ item, theme }) {
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

  return (
    <div
      className={`p-4 rounded-2xl border transition-all hover:shadow-lg ${theme.cardBg}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg leading-tight">{item.name}</h3>

            <div className="flex gap-1">
              {item.tags.map((tag, i) => (
                <span key={i}>{renderTag(tag)}</span>
              ))}
            </div>
          </div>

          {item.desc && (
            <p className={`text-sm leading-snug mt-1 mb-3 ${theme.textMuted}`}>
              {item.desc}
            </p>
          )}
        </div>

        <div className="text-right whitespace-nowrap">
          <span className="text-xs font-semibold opacity-70">R$</span>
          <span className="text-xl font-black ml-1 text-orange-500">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
