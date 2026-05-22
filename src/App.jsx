import React, { useState } from "react";

import { menuData, featuredItemIds } from "./data/menuData";
import { getItemsByIds, validateUniqueMenuIds } from "./utils/menuUtils";
import { getTheme } from "./styles/theme";

import { useGarcomAI } from "./hooks/useGarcomAI";
import { useDarkMode } from "./hooks/useDarkMode";

import Header from "./components/Header";
import AiButton from "./components/AiButton";
import CategoryNav from "./components/CategoryNav";
import MenuSection from "./components/MenuSection";
import Footer from "./components/Footer";
import AiModal from "./components/AiModal";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Destaques");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();

  const menuWithFeatured = {
    ...menuData,
    Destaques: getItemsByIds(menuData, featuredItemIds),
  };
  const duplicatedMenuIds = validateUniqueMenuIds(menuData);

  if (duplicatedMenuIds.length > 0) {
    console.warn("IDs duplicados encontrados no cardápio:", duplicatedMenuIds);
  }
  const categories = Object.keys(menuWithFeatured);
  const theme = getTheme(darkMode);

  const { aiPrompt, setAiPrompt, aiResponse, isAiLoading, handleAskAI } =
    useGarcomAI(menuWithFeatured);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${theme.bgApp} ${theme.textMain}`}
    >
      <div className="max-w-md mx-auto relative shadow-2xl min-h-screen flex flex-col pb-20">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          theme={theme}
        />

        <AiButton onClick={() => setIsAiModalOpen(true)} />

        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          darkMode={darkMode}
          theme={theme}
        />

        <MenuSection
          activeCategory={activeCategory}
          menuData={menuWithFeatured}
          theme={theme}
          darkMode={darkMode}
        />

        <Footer darkMode={darkMode} theme={theme} />
      </div>

      {isAiModalOpen && (
        <AiModal
          darkMode={darkMode}
          theme={theme}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          aiResponse={aiResponse}
          isAiLoading={isAiLoading}
          handleAskAI={handleAskAI}
          setIsAiModalOpen={setIsAiModalOpen}
        />
      )}
    </div>
  );
}
