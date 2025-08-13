import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [themeVariant, setThemeVariant] = useState('default');

  // Carregar tema salvo no localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedVariant = localStorage.getItem('themeVariant') || 'default';
    setTheme(savedTheme);
    setThemeVariant(savedVariant);
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-variant', themeVariant);
    
    // Adicionar classe para transições suaves
    document.body.classList.add('theme-transition');
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('themeVariant', themeVariant);
    
    // Remover classe após transição
    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme, themeVariant]);

  // Alternar entre tema claro e escuro
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Definir tema específico
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Alternar variante de tema
  const toggleThemeVariant = () => {
    const variants = ['default', 'high-contrast', 'colorblind-friendly', 'retro'];
    setThemeVariant(prevVariant => {
      const currentIndex = variants.indexOf(prevVariant);
      const nextIndex = (currentIndex + 1) % variants.length;
      return variants[nextIndex];
    });
  };

  // Definir variante específica
  const setSpecificVariant = (variant) => {
    setThemeVariant(variant);
  };

  // Resetar para tema padrão
  const resetTheme = () => {
    setTheme('dark');
    setThemeVariant('default');
  };

  // Sincronizar com preferência do sistema
  const syncWithSystem = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Verificar se o sistema prefere tema escuro
  const prefersDarkMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Obter informações do tema atual
  const getThemeInfo = () => {
    return {
      currentTheme: theme,
      currentVariant: themeVariant,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      hasVariant: themeVariant !== 'default'
    };
  };

  const value = {
    theme,
    themeVariant,
    toggleTheme,
    setSpecificTheme,
    toggleThemeVariant,
    setSpecificVariant,
    resetTheme,
    syncWithSystem,
    prefersDarkMode,
    getThemeInfo
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
