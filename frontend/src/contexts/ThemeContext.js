import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark'; // Tema escuro como padrão
  });

  const [themeVariant, setThemeVariant] = useState(() => {
    // Verificar se há variante de tema salva
    const savedVariant = localStorage.getItem('themeVariant');
    return savedVariant || 'default';
  });

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-variant', themeVariant);
    localStorage.setItem('theme', theme);
    localStorage.setItem('themeVariant', themeVariant);
    
    // Adicionar classe ao body para transições suaves
    document.body.classList.add('theme-transition');
    
    // Remover classe após transição
    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme, themeVariant]);

  // Função para alternar entre temas claro/escuro
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Função para definir tema específico
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Função para alternar variante de tema
  const toggleThemeVariant = () => {
    setThemeVariant(prevVariant => {
      const variants = ['default', 'high-contrast', 'colorblind-friendly'];
      const currentIndex = variants.indexOf(prevVariant);
      const nextIndex = (currentIndex + 1) % variants.length;
      return variants[nextIndex];
    });
  };

  // Função para definir variante específica
  const setSpecificVariant = (variant) => {
    setThemeVariant(variant);
  };

  // Função para resetar para tema padrão
  const resetTheme = () => {
    setTheme('dark');
    setThemeVariant('default');
  };

  // Função para obter informações do tema atual
  const getThemeInfo = () => {
    const themeNames = {
      light: 'Claro',
      dark: 'Escuro'
    };
    
    const variantNames = {
      default: 'Padrão',
      'high-contrast': 'Alto Contraste',
      'colorblind-friendly': 'Amigável ao Daltonismo'
    };

    return {
      theme: themeNames[theme] || theme,
      variant: variantNames[themeVariant] || themeVariant,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      hasVariant: themeVariant !== 'default'
    };
  };

  // Função para verificar se o sistema prefere tema escuro
  const prefersDarkMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Função para sincronizar com preferência do sistema
  const syncWithSystem = () => {
    const systemPrefersDark = prefersDarkMode();
    setTheme(systemPrefersDark ? 'dark' : 'light');
  };

  // Listener para mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem('theme') === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const value = {
    theme,
    themeVariant,
    toggleTheme,
    setSpecificTheme,
    toggleThemeVariant,
    setSpecificVariant,
    resetTheme,
    getThemeInfo,
    syncWithSystem,
    prefersDarkMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
