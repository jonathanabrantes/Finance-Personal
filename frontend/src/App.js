import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BankTransactions from './components/BankTransactions';
import Investments from './components/Investments';
import Settings from './components/Settings';
import './App.css';

// Componente do Theme Switcher
const ThemeSwitcher = () => {
  const { 
    theme, 
    themeVariant, 
    toggleTheme, 
    toggleThemeVariant, 
    resetTheme,
    syncWithSystem
  } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-controls">
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
        </button>
        
        <button 
          className="theme-variant-toggle"
          onClick={toggleThemeVariant}
          title="Alternar variante de tema"
        >
          {themeVariant === 'default' && '🎨 Padrão'}
          {themeVariant === 'high-contrast' && '⚫ Alto Contraste'}
          {themeVariant === 'colorblind-friendly' && '🌈 Daltonismo'}
          {themeVariant === 'retro' && '🕹️ Retro'}
        </button>
        
        <button 
          className="theme-variant-toggle"
          onClick={syncWithSystem}
          title="Sincronizar com sistema"
        >
          🔄 Sistema
        </button>
        
        <button 
          className="theme-variant-toggle"
          onClick={resetTheme}
          title="Resetar tema"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

// Componente principal da aplicação
const AppContent = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <ThemeSwitcher />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<BankTransactions />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

// App principal com providers
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
