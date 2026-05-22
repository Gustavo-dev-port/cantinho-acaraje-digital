import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("cantinho-dark-mode");

    if (savedTheme !== null) {
      return savedTheme === "true";
    }

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    localStorage.setItem("cantinho-dark-mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((currentValue) => !currentValue);
  };

  return {
    darkMode,
    toggleDarkMode,
  };
}
