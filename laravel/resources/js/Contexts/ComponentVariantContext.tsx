'use client';

// This implementation provides several benefits:

// Centralized variant management through context
// Per-component variant support (components can specify which variants they support)
// Fallback to default variant when a component doesn't support the selected variant
// Easy to add new variants and components
// Type-safe variant names
// To use it in a component, you would:

// Add your component to the components array in ComponentVariantContext
// Use the useComponentVariant hook to get the current variant
// Apply the appropriate styles based on the variant
// Remember to:

// Add the component to the components array with its supported variants
// Create variant-specific styles in your components
// Use the getVariantForComponent function to get the appropriate variant for each component
// Always provide a 'default' variant as fallback
// This approach allows for flexible component styling while maintaining a consistent API and fallback behavior.

import * as React from 'react';

type ComponentVariant = 'default' | 'windui';

interface VariantComponent {
    name: string;
    supportedVariants: ComponentVariant[];
}

interface ComponentVariantContextType {
    currentVariant: ComponentVariant;
    availableVariants: ComponentVariant[];
    components: VariantComponent[];
    setVariant: (variant: ComponentVariant) => void;
    getVariantForComponent: (componentName: string) => ComponentVariant;
}

const ComponentVariantContext = React.createContext<ComponentVariantContextType | undefined>(
    undefined,
);

const STORAGE_KEY = 'ui-component-variant';

function getStoredVariant(): ComponentVariant {
    if (typeof window === 'undefined') return 'default';
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored && (stored === 'default' || stored === 'windui') ? stored : 'default';
    } catch (e) {
        return 'default';
    }
}

export const components: VariantComponent[] = [
    {
        name: 'button',
        supportedVariants: ['default', 'windui'],
    },
    {
        name: 'sidebar',
        supportedVariants: ['default', 'windui'],
    },
    // Add more components here
];

export function ComponentVariantProvider({ children }: { children: React.ReactNode }) {
    const [currentVariant, setCurrentVariant] = React.useState<ComponentVariant>(() =>
        getStoredVariant(),
    );

    const setVariant = React.useCallback((variant: ComponentVariant) => {
        setCurrentVariant(variant);
        try {
            localStorage.setItem(STORAGE_KEY, variant);
        } catch (e) {
            console.warn('Failed to save component variant preference:', e);
        }
    }, []);

    const contextValue = React.useMemo(() => {
        return {
            currentVariant,
            availableVariants: ['default', 'windui'] as ComponentVariant[],
            components,
            setVariant,
            getVariantForComponent: (componentName: string) => {
                const component = components.find((c) => c.name === componentName);
                if (!component) return 'default';
                return component.supportedVariants.includes(currentVariant)
                    ? currentVariant
                    : 'default';
            },
        };
    }, [currentVariant, setVariant]);

    return (
        <ComponentVariantContext.Provider value={contextValue}>
            {children}
        </ComponentVariantContext.Provider>
    );
}

export function useComponentVariant() {
    const context = React.useContext(ComponentVariantContext);
    if (context === undefined) {
        throw new Error('useComponentVariant must be used within a ComponentVariantProvider');
    }
    return context;
}
