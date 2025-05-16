
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center w-full gap-2" onClick={() => toggleTheme()}>
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Tema Escuro</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Tema Claro</span>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
