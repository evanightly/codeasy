import React, { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';

interface DarkModeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', prefersDarkMode);

    const applyTheme = useCallback(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }
    }, [isDarkMode]);

    useEffect(applyTheme, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = (): DarkModeContextProps => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};