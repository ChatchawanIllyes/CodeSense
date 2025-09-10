import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('high-contrast');
    if (savedTheme) {
      setIsHighContrast(savedTheme === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply high contrast styles to document
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.style.cssText = `
        --background: #000000;
        --foreground: #ffffff;
        --card: #000000;
        --card-foreground: #ffffff;
        --primary: #ffffff;
        --primary-foreground: #000000;
        --secondary: #333333;
        --secondary-foreground: #ffffff;
        --muted: #1a1a1a;
        --muted-foreground: #cccccc;
        --accent: #444444;
        --accent-foreground: #ffffff;
        --border: #ffffff;
        --input: #1a1a1a;
        --input-background: #1a1a1a;
      `;
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.style.cssText = '';
    }
    
    // Save theme preference
    localStorage.setItem('high-contrast', isHighContrast.toString());
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  return (
    <ThemeContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}