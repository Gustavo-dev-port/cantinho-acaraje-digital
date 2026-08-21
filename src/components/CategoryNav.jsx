// Truque clássico de "sombra de scroll": duas camadas de cor sólida que
// rolam junto com o conteúdo (escondem o próprio fade quando não há mais
// nada pra rolar naquela direção) mais duas sombras fixas nas bordas.
// Sem JS, sem listener de scroll — só CSS.
function scrollFadeStyle(baseColor) {
  return {
    backgroundImage: `linear-gradient(to right, ${baseColor} 30%, rgba(0,0,0,0)), linear-gradient(to left, ${baseColor} 30%, rgba(0,0,0,0)), radial-gradient(farthest-side at 0 50%, rgba(0,0,0,0.2), rgba(0,0,0,0)), radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.2), rgba(0,0,0,0))`,
    backgroundPosition: "left, right, left, right",
    backgroundRepeat: "no-repeat",
    backgroundColor: baseColor,
    backgroundSize: "24px 100%, 24px 100%, 10px 100%, 10px 100%",
    backgroundAttachment: "local, local, scroll, scroll",
  };
}

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
      <div
        role="tablist"
        aria-label="Categorias do cardápio"
        className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2 scroll-smooth"
        style={scrollFadeStyle(darkMode ? "#020617" : "#faf8f5")}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
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
