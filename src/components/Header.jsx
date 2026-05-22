import { Moon, Sun, MapPin } from "lucide-react";
import logo from "../assets/logo.webp";

export default function Header({ darkMode, toggleDarkMode, theme }) {
  return (
    <header className="relative overflow-hidden pt-8 pb-6 px-6 flex flex-col items-center border-b border-orange-500/20">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full flex justify-end mb-4 relative z-10">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            darkMode
              ? "bg-slate-800 text-amber-300"
              : "bg-orange-100 text-orange-600"
          } transition`}
          aria-label="Alternar modo claro e escuro"
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-lg border-4 border-white/10 relative z-10">
        <img
          src={logo}
          alt="Logo Cantinho do Acarajé"
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
          decoding="async"
          width={96}
          height={96}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none"; // Esconde a img quebrada, mostra o gradiente
          }}
        />
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
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
          darkMode
            ? "bg-slate-800 hover:bg-slate-700"
            : "bg-white hover:bg-gray-50 shadow-sm"
        } transition z-10`}
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
  );
}
