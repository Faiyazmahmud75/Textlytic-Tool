import React from 'react';

const LogoIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 6C9 5, 15 5, 17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-dark dark:text-primary"/>
        <path d="M12 5.5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"/>
        <path d="M9 19V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-dark dark:text-primary"/>
        <path d="M15 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80 dark:text-primary/80"/>
    </svg>
);

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-1 select-none">
        <LogoIcon />
        <h1 className="text-4xl font-dancing-script mt-1">
            <span className="text-light-text dark:text-dark-text">Text</span>
            <span 
                className="bg-gradient-to-r from-primary to-cyan-400 dark:from-primary dark:to-cyan-400 bg-clip-text text-transparent"
            >
                lytic
            </span>
        </h1>
    </div>
  );
};

export default Logo;