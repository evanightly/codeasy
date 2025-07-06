'use client';

import React, { useEffect, useState } from 'react';

interface ThemeWaveTransitionProps {
    isTransitioning: boolean;
    transitionOrigin?: { x: number; y: number };
    duration?: number;
    direction?: 'radial' | 'horizontal' | 'vertical';
}

export const ThemeWaveTransition: React.FC<ThemeWaveTransitionProps> = ({
    isTransitioning,
    transitionOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    duration = 600,
    direction = 'horizontal',
}) => {
    const [_isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isTransitioning) {
            setIsVisible(true);

            // Clean up any existing wave elements
            const existingWaves = document.querySelectorAll('.theme-wave-overlay');
            existingWaves.forEach((wave) => wave.remove());

            if (direction === 'horizontal') {
                // Create horizontal wave effect (right to left)
                createHorizontalWave(transitionOrigin, duration);
            } else if (direction === 'vertical') {
                // Create vertical wave effect (top to bottom)
                createVerticalWave(transitionOrigin, duration);
            } else {
                // Create radial wave effect (default circular)
                createRadialWave(transitionOrigin, duration);
            }

            // Clean up after animation
            const cleanup = setTimeout(() => {
                setIsVisible(false);
            }, duration);

            return () => {
                clearTimeout(cleanup);
            };
        }
    }, [isTransitioning, transitionOrigin.x, transitionOrigin.y, duration, direction]);

    const createHorizontalWave = (origin: { x: number; y: number }, animationDuration: number) => {
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
            transition: transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
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

        // Clean up after animation
        setTimeout(() => {
            wave.remove();
        }, animationDuration + 100);
    };

    const createVerticalWave = (origin: { x: number; y: number }, animationDuration: number) => {
        const wave = document.createElement('div');
        wave.className = 'theme-wave-overlay theme-wave-vertical';
        wave.setAttribute('data-testid', 'theme-wave-transition');

        // Create a vertical sweeping wave
        wave.style.cssText = `
            position: fixed;
            top: -100vh;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(180deg, 
                transparent 0%, 
                hsl(var(--background)) 50%, 
                hsl(var(--background)) 100%
            );
            transform: translateY(0);
            transition: transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 9999;
            will-change: transform;
            mask: linear-gradient(180deg, 
                transparent 0%, 
                black 20%, 
                black 80%, 
                transparent 100%
            );
        `;

        document.body.appendChild(wave);

        // Trigger the animation - wave moves from top to bottom
        requestAnimationFrame(() => {
            wave.style.transform = 'translateY(200vh)';
        });

        // Clean up after animation
        setTimeout(() => {
            wave.remove();
        }, animationDuration + 100);
    };

    const createRadialWave = (origin: { x: number; y: number }, animationDuration: number) => {
        const wave = document.createElement('div');
        wave.className = 'theme-wave-overlay theme-wave-radial';
        wave.setAttribute('data-testid', 'theme-wave-transition');

        // Calculate the maximum radius needed to cover the entire screen + extra for large screens
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Get the maximum distance from origin to any corner of the screen
        const distances = [
            Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y, 2)), // Top-left corner
            Math.sqrt(Math.pow(screenWidth - origin.x, 2) + Math.pow(origin.y, 2)), // Top-right corner
            Math.sqrt(Math.pow(origin.x, 2) + Math.pow(screenHeight - origin.y, 2)), // Bottom-left corner
            Math.sqrt(Math.pow(screenWidth - origin.x, 2) + Math.pow(screenHeight - origin.y, 2)), // Bottom-right corner
        ];

        const maxDistance = Math.max(...distances);

        // Add significant extra margin for large screens and smooth coverage
        // Scale factor increases with screen size for better coverage on ultrawide/4K displays
        const baseSize = Math.max(screenWidth, screenHeight);
        const scaleFactor = Math.max(3.5, baseSize / 800); // Minimum 3.5x, increases for larger screens
        const finalSize = maxDistance * scaleFactor;

        // Position and style the wave
        wave.style.cssText = `
            position: fixed;
            top: ${origin.y}px;
            left: ${origin.x}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, hsl(var(--background)) 0%, hsl(var(--background)) 100%);
            transform: translate(-50%, -50%);
            transition: width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), height ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 9999;
            will-change: width, height;
        `;

        document.body.appendChild(wave);

        // Trigger the animation
        requestAnimationFrame(() => {
            wave.style.width = `${finalSize}px`;
            wave.style.height = `${finalSize}px`;
        });

        // Clean up after animation
        setTimeout(() => {
            wave.remove();
        }, animationDuration + 100);
    };

    // Accessibility: Respect user's motion preferences
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion && isTransitioning) {
            // Skip animation and clean up immediately for users who prefer reduced motion
            setTimeout(() => setIsVisible(false), 50);
        }
    }, [isTransitioning]);

    return null; // This component doesn't render anything visible in the React tree
};

// Enhanced CSS-only wave transition styles with directional waves
export const ThemeWaveTransitionStyles = () => {
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.id = 'theme-wave-transition-styles';
        styleElement.textContent = `
            @supports (view-transition-name: root) {
                /* Use View Transitions API when supported */
                ::view-transition-old(root),
                ::view-transition-new(root) {
                    animation-duration: 0.6s;
                    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Horizontal wave transition (right to left) */
                [data-wave-direction="horizontal"] ::view-transition-old(root) {
                    clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%);
                    animation-name: wave-exit-horizontal;
                }
                
                [data-wave-direction="horizontal"] ::view-transition-new(root) {
                    clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%);
                    animation-name: wave-enter-horizontal;
                }
                
                /* Vertical wave transition (top to bottom) */
                [data-wave-direction="vertical"] ::view-transition-old(root) {
                    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
                    animation-name: wave-exit-vertical;
                }
                
                [data-wave-direction="vertical"] ::view-transition-new(root) {
                    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
                    animation-name: wave-enter-vertical;
                }
                
                /* Radial wave transition (default) */
                ::view-transition-old(root) {
                    clip-path: circle(100% at var(--wave-x, 50%) var(--wave-y, 50%));
                }
                
                ::view-transition-new(root) {
                    clip-path: circle(0% at var(--wave-x, 50%) var(--wave-y, 50%));
                    animation-name: wave-expand;
                }
                
                @keyframes wave-expand {
                    to {
                        clip-path: circle(100% at var(--wave-x, 50%) var(--wave-y, 50%));
                    }
                }
                
                @keyframes wave-exit-horizontal {
                    to {
                        clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%);
                    }
                }
                
                @keyframes wave-enter-horizontal {
                    to {
                        clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%);
                    }
                }
                
                @keyframes wave-exit-vertical {
                    to {
                        clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
                    }
                }
                
                @keyframes wave-enter-vertical {
                    to {
                        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
                    }
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .theme-wave-overlay {
                    transition: none !important;
                    animation: none !important;
                }
                
                ::view-transition-old(root),
                ::view-transition-new(root) {
                    animation-duration: 0.1s !important;
                }
            }

            /* Theme transition container enhancement */
            .theme-transition-container {
                view-transition-name: root;
            }
            
            /* Enhanced wave overlay styles */
            .theme-wave-horizontal {
                filter: blur(0.5px);
                opacity: 0.95;
            }
            
            .theme-wave-vertical {
                filter: blur(0.5px);
                opacity: 0.95;
            }
            
            .theme-wave-radial {
                filter: blur(0.25px);
                opacity: 0.98;
            }
        `;

        if (!document.getElementById('theme-wave-transition-styles')) {
            document.head.appendChild(styleElement);
        }

        return () => {
            const existingStyle = document.getElementById('theme-wave-transition-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    return null;
};

// Hook for enhanced theme transitions with directional wave effects
export const useThemeWaveTransition = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionOrigin, setTransitionOrigin] = useState({ x: 0, y: 0 });

    const startTransition = (
        callback: () => void,
        origin?: { x: number; y: number },
        direction: 'radial' | 'horizontal' | 'vertical' = 'horizontal',
    ) => {
        // Set the origin point (default to center if not provided)
        const finalOrigin = origin || {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        setTransitionOrigin(finalOrigin);

        // Check if View Transitions API is supported
        if ('startViewTransition' in document) {
            // Set CSS custom properties and direction for the animation
            document.documentElement.style.setProperty(
                '--wave-x',
                `${(finalOrigin.x / window.innerWidth) * 100}%`,
            );
            document.documentElement.style.setProperty(
                '--wave-y',
                `${(finalOrigin.y / window.innerHeight) * 100}%`,
            );
            document.documentElement.setAttribute('data-wave-direction', direction);

            // @ts-ignore - View Transitions API might not be in TypeScript definitions yet
            document
                .startViewTransition(() => {
                    callback();
                })
                .finished.then(() => {
                    // Clean up after transition
                    document.documentElement.removeAttribute('data-wave-direction');
                });
        } else {
            // Fallback to manual wave animation
            setIsTransitioning(true);

            // Add a small delay to ensure the wave starts before theme change
            setTimeout(() => {
                callback();
                setTimeout(() => setIsTransitioning(false), 600);
            }, 100);
        }
    };

    return {
        startTransition,
        isTransitioning,
        transitionOrigin,
    };
};

export default ThemeWaveTransition;
