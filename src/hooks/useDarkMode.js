import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("cantinho-dark-mode");

      if (savedTheme !== null) {
        return savedTheme === "true";
      }
    } catch {
      // localStorage indisponível (modo privado, política do navegador, etc.)
    }

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    try {
      localStorage.setItem("cantinho-dark-mode", String(darkMode));
    } catch {
      // localStorage indisponível — a preferência simplesmente não persiste
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((currentValue) => !currentValue);
  };

  return {
    darkMode,
    toggleDarkMode,
  };
}
