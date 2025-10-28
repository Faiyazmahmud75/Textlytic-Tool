
import React, { useState, useEffect, useCallback } from 'react';
import { Tool } from './types';
import TextFormatter from './components/TextFormatter';
import ArticleWordCounter from './components/ArticleWordCounter';
import { DocumentTextIcon, GlobeAltIcon, MoonIcon, SunIcon } from './components/Icons';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Formatter);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const Header = () => (
    <header className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm w-full py-3 border-b border-gray-200/80 dark:border-gray-700/80 transition-colors duration-500">
      <div className="flex justify-center items-center">
        <Logo />
      </div>
      <button
        onClick={toggleTheme}
        className="absolute top-1/2 -translate-y-1/2 right-6 w-24 h-10 rounded-full p-1 flex items-center transition-all duration-500 focus:outline-none bg-gray-200 dark:bg-[#2C3038] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#24272e,inset_-4px_-4px_8px_#343942]"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Text: LIGHT MODE */}
        <div
            aria-hidden={theme !== 'light'}
            className={`absolute right-5 flex flex-col items-center leading-none text-[10px] font-bold text-gray-600 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
            <span>LIGHT</span>
            <span>MODE</span>
        </div>
        
        {/* Text: DARK MODE */}
        <div
            aria-hidden={theme !== 'dark'}
            className={`absolute left-5 flex flex-col items-center leading-none text-[10px] font-bold text-gray-400 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
            <span>DARK</span>
            <span>MODE</span>
        </div>

        {/* Sliding Thumb */}
        <div
            className={`absolute w-8 h-8 bg-gray-200 dark:bg-gray-500 rounded-full flex items-center justify-center transform transition-all duration-500 ease-in-out shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#24272e,-4px_-4px_8px_#343942] ${
            theme === 'light' ? 'translate-x-0' : 'translate-x-[56px]'
            }`}
        >
            <SunIcon className={`absolute w-5 h-5 text-gray-700 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            <MoonIcon className={`absolute w-5 h-5 text-gray-300 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`} />
        </div>
      </button>
    </header>
  );

  const Tabs = () => (
    <div className="flex justify-center bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg p-1 w-full max-w-md mx-auto mb-8 shadow-md dark:shadow-lg dark:shadow-black/20">
      <TabButton
        label="Text Formatter"
        icon={<DocumentTextIcon />}
        isActive={activeTool === Tool.Formatter}
        onClick={() => setActiveTool(Tool.Formatter)}
      />
      <TabButton
        label="Article Word Counter"
        icon={<GlobeAltIcon />}
        isActive={activeTool === Tool.Counter}
        onClick={() => setActiveTool(Tool.Counter)}
      />
    </div>
  );

  const TabButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold transition-all duration-300 focus:outline-none rounded-md ${
        isActive
          ? 'text-primary-dark dark:text-primary bg-light-card dark:bg-dark-card shadow-sm'
          : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const Footer = () => (
    <footer className="text-center py-5 mt-auto text-sm text-light-muted dark:text-dark-muted bg-light-card dark:bg-dark-card w-full transition-colors duration-500">
      © {new Date().getFullYear()} <a href="#" className="font-medium text-primary hover:underline">Textlytic</a> • Made with ❣️ by 
      <a href="https://github.com/Faiyazmahmud75" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline"> Faiyaz</a> • Powered by <a href="https://zhrdigital.com" target="_blank" className="font-medium text-primary hover:underline">ZHR Digital</a>
    </footer>
  );

  return (
    <div className="flex flex-col items-center min-h-screen font-sans text-light-text dark:text-dark-text transition-colors duration-500">
      <Header />
      <main className="w-full max-w-3xl mx-auto p-4 md:p-8 flex-grow">
        <div className="bg-light-card dark:bg-dark-card p-6 md:p-8 rounded-2xl shadow-lg transition-colors duration-500">
          <Tabs />
          <div key={activeTool} className="animate-fade-in-up">
            {activeTool === Tool.Formatter ? <TextFormatter /> : <ArticleWordCounter />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;