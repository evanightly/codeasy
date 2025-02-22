import { Theme, THEMES } from '@/Support/Constants/themes';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';

interface ThemeContextProps {
    isDarkMode: boolean;
    currentTheme: Theme;
    availableThemes: Theme[];
    toggleDarkMode: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', prefersDarkMode);
    const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>(
        'currentTheme',
        THEMES.find((theme) => theme.is_active) || THEMES[0],
    );

    const applyTheme = useCallback(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        const colors = isDarkMode ? currentTheme?.dark_colors : currentTheme?.light_colors;
        root.classList.add(isDarkMode ? 'dark' : 'light');

        if (colors) {
            Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value ?? '');
            });
        }
    }, [isDarkMode, currentTheme]);

    useEffect(applyTheme, [isDarkMode, currentTheme]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
    const setTheme = (theme: Theme) => setCurrentTheme(theme);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                currentTheme,
                availableThemes: THEMES,
                toggleDarkMode,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const DarkModeProvider = ThemeProvider;

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const useDarkMode = (): Pick<ThemeContextProps, 'isDarkMode' | 'toggleDarkMode'> => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a ThemeProvider');
    }
    return {
        isDarkMode: context.isDarkMode,
        toggleDarkMode: context.toggleDarkMode,
    };
};
