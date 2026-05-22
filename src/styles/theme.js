export const getTheme = (darkMode) => {
  return {
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
};
