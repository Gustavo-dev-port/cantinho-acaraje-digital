export default function CategoryNav({
  categories,
  activeCategory,
  setActiveCategory,
  darkMode,
  theme,
}) {
  return (
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
                : `${
                    darkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-white text-slate-600"
                  } hover:bg-orange-50 hover:text-orange-600`
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
}
