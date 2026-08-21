import { Info } from "lucide-react";

export default function Footer({ darkMode, theme }) {
  return (
    <footer
      className={`mt-auto pb-8 pt-6 px-6 text-center border-t border-orange-500/10 ${
        darkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      <h3 className="font-black text-xl mb-2 text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-amber-500">
        Vem Curtir Essa Vibe Com a Gente!!!
      </h3>

      <p className={`text-sm mb-4 ${theme.textMuted}`}>
        Tirou foto? Marca a gente pra aparecer no nosso Insta!
      </p>

      <a
        href="https://wa.me/5511971672326"
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center justify-center gap-2 p-3 rounded-xl w-full text-sm font-semibold transition ${
          darkMode
            ? "bg-slate-900 hover:bg-slate-800"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <Info size={16} className="text-orange-500" />
        Quer comemorar niver? (11) 97167-2326
      </a>
    </footer>
  );
}
