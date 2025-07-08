import { Theme, THEMES } from '@/Support/Constants/themes';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';

interface ThemeContextProps {
    isDarkMode: boolean;
    currentTheme: Theme;
    availableThemes: Theme[];
    toggleDarkMode: (origin?: { x: number; y: number }) => void;
    setTheme: (theme: Theme, origin?: { x: number; y: number }) => void;
    toggleDarkModeWithoutTransition: () => void;
    setThemeWithoutTransition: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', prefersDarkMode);
    const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>(
        'currentTheme',
        THEMES.find((theme) => theme.is_active) || THEMES[0],
    );

    // Add transition lock to prevent race conditions
    const isTransitioning = useRef(false);

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

    // Manual wave transition for browsers without View Transitions API
    const createManualWaveTransition = useCallback(
        (callback: () => void, _origin: { x: number; y: number }) => {
            // Clean up any existing wave elements
            const existingWaves = document.querySelectorAll('.theme-wave-overlay');
            existingWaves.forEach((wave) => wave.remove());

            // Create horizontal wave element for right-to-left effect
            const wave = document.createElement('div');
            wave.className = 'theme-wave-overlay theme-wave-horizontal';
            wave.setAttribute('data-testid', 'theme-wave-transition');

            // Create a horizontal sweeping wave
            wave.style.cssText = `
            position: fixed;
            top: 0;
            right: 100%;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(90deg, 
                transparent 0%, 
                hsl(var(--background)) 50%, 
                hsl(var(--background)) 100%
            );
            transform: translateX(0);
            transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 9999;
            will-change: transform;
            mask: linear-gradient(90deg, 
                transparent 0%, 
                black 20%, 
                black 80%, 
                transparent 100%
            );
        `;

            document.body.appendChild(wave);

            // Trigger the animation - wave moves from right to left
            requestAnimationFrame(() => {
                wave.style.transform = 'translateX(100vw)';
            });

            // Execute callback after a short delay to ensure wave starts
            setTimeout(() => {
                callback();
            }, 100);

            // Clean up after animation
            setTimeout(() => {
                wave.remove();
            }, 700);
        },
        [],
    );

    // Wave transition utility function
    const startWaveTransition = useCallback(
        (callback: () => void, origin?: { x: number; y: number }) => {
            // Prevent multiple transitions from running simultaneously
            if (isTransitioning.current) {
                console.log('Transition already in progress, skipping...');
                return;
            }

            isTransitioning.current = true;

            // Set default origin to center if not provided
            const finalOrigin = origin || {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            };

            // Check if View Transitions API is supported
            if ('startViewTransition' in document) {
                const waveX = `50%`;
                const waveY = `50%`;
                // Set CSS custom properties and direction for the animation
                document.documentElement.style.setProperty('--wave-x', waveX);
                document.documentElement.style.setProperty('--wave-y', waveY);

                document.documentElement.setAttribute('data-wave-direction', 'horizontal');

                document
                    .startViewTransition(() => {
                        callback();
                    })
                    .finished.then(() => {
                        // Clean up after transition
                        document.documentElement.removeAttribute('data-wave-direction');
                        isTransitioning.current = false;
                    });
            } else {
                // Fallback to manual wave animation
                createManualWaveTransition(callback, finalOrigin);
                // Reset transition flag after fallback animation
                setTimeout(() => {
                    isTransitioning.current = false;
                }, 800); // Slightly longer than the animation duration
            }
        },
        [createManualWaveTransition],
    );

    // Theme functions with wave transitions
    const toggleDarkMode = useCallback(
        (origin?: { x: number; y: number }) => {
            startWaveTransition(() => {
                setIsDarkMode((prev) => !prev);
            }, origin);
        },
        [startWaveTransition, setIsDarkMode],
    );

    const setTheme = useCallback(
        (theme: Theme, origin?: { x: number; y: number }) => {
            startWaveTransition(() => {
                setCurrentTheme(theme);
            }, origin);
        },
        [startWaveTransition, setCurrentTheme],
    );

    // Non-animated versions for backwards compatibility
    const toggleDarkModeWithoutTransition = useCallback(() => {
        setIsDarkMode((prev) => !prev);
    }, [setIsDarkMode]);

    const setThemeWithoutTransition = useCallback(
        (theme: Theme) => {
            setCurrentTheme(theme);
        },
        [setCurrentTheme],
    );

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                currentTheme,
                availableThemes: THEMES,
                toggleDarkMode,
                setTheme,
                toggleDarkModeWithoutTransition,
                setThemeWithoutTransition,
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
