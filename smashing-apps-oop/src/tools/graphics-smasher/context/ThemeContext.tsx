import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to dark mode for Graphics Smasher (Photoshop-like)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('graphics-smasher-theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  useEffect(() => {
    localStorage.setItem('graphics-smasher-theme', isDark ? 'dark' : 'light');
    
    // Apply theme class to the graphics smasher container
    const container = document.querySelector('.graphics-smasher-container');
    if (container) {
      if (isDark) {
        container.classList.add('dark-theme');
        container.classList.remove('light-theme');
      } else {
        container.classList.add('light-theme');
        container.classList.remove('dark-theme');
      }
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

