import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { ny } from '@/Lib/Utils';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    showSteps?: 'none' | 'half' | 'full';
    formatLabel?: (value: number) => string;
    formatLabelSide?: string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
    ({ className, showSteps = 'none', formatLabel, formatLabelSide = 'top', ...props }, ref) => {
        const {
            min = 0,
            max = 100,
            step = 1,
            orientation = 'horizontal',
            value,
            defaultValue,
            onValueChange,
        } = props;
        const [hoveredThumbIndex, setHoveredThumbIndex] = React.useState<boolean>(false);
        const numberOfSteps = Math.floor((max - min) / step);
        const stepLines = Array.from({ length: numberOfSteps }, (_, index) => index * step + min);

        const initialValue = Array.isArray(value)
            ? value
            : Array.isArray(defaultValue)
              ? defaultValue
              : [min, max];
        const [localValues, setLocalValues] = React.useState<number[]>(initialValue);

        React.useEffect(() => {
            if (!isEqual(value, localValues))
                setLocalValues(
                    Array.isArray(value)
                        ? value
                        : Array.isArray(defaultValue)
                          ? defaultValue
                          : [min, max],
                );
        }, [min, max, value]);

        const handleValueChange = (newValues: number[]) => {
            setLocalValues(newValues);
            if (onValueChange) onValueChange(newValues);
        };

        function isEqual(array1: number[] | undefined, array2: number[] | undefined) {
            array1 = array1 ?? [];
            array2 = array2 ?? [];

            if (array1.length !== array2.length) return false;

            for (let i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i]) return false;
            }

            return true;
        }

        return (
            <SliderPrimitive.Root
                value={localValues}
                step={step}
                ref={ref}
                onValueChange={(value) => handleValueChange(value)}
                min={min}
                max={max}
                className={ny(
                    'relative flex cursor-pointer touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    orientation === 'horizontal' ? 'w-full items-center' : 'h-full justify-center',
                    className,
                )}
                {...props}
                onFocus={() => setHoveredThumbIndex(true)}
                onBlur={() => setHoveredThumbIndex(false)}
            >
                <SliderPrimitive.Track
                    className={ny(
                        'relative grow overflow-hidden rounded-full bg-primary/20',
                        orientation === 'horizontal' ? 'h-1.5 w-full' : 'h-full w-1.5',
                    )}
                >
                    <SliderPrimitive.Range
                        className={ny(
                            'absolute bg-primary',
                            orientation === 'horizontal' ? 'h-full' : 'w-full',
                        )}
                    />
                    {showSteps !== undefined &&
                        showSteps !== 'none' &&
                        stepLines.map((value, index) => {
                            if (value === min || value === max) return null;

                            const positionPercentage = ((value - min) / (max - min)) * 100;
                            const adjustedPosition = 50 + (positionPercentage - 50) * 0.96;
                            return (
                                <div
                                    style={{
                                        [orientation === 'vertical' ? 'bottom' : 'left']:
                                            `${adjustedPosition}%`,
                                    }}
                                    key={index}
                                    className={ny(
                                        {
                                            'h-2 w-0.5': orientation !== 'vertical',
                                            'h-0.5 w-2': orientation === 'vertical',
                                        },
                                        'absolute bg-muted-foreground',
                                        {
                                            'left-1':
                                                orientation === 'vertical' && showSteps === 'half',
                                            'top-1':
                                                orientation !== 'vertical' && showSteps === 'half',
                                            'left-0':
                                                orientation === 'vertical' && showSteps === 'full',
                                            'top-0':
                                                orientation !== 'vertical' && showSteps === 'full',
                                            '-translate-x-1/2': orientation !== 'vertical',
                                            '-translate-y-1/2': orientation === 'vertical',
                                        },
                                    )}
                                />
                            );
                        })}
                </SliderPrimitive.Track>
                {localValues.map((numberStep, index) => (
                    <SliderPrimitive.Thumb
                        key={index}
                        className={ny(
                            'block size-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        )}
                    >
                        {hoveredThumbIndex && formatLabel && (
                            <div
                                className={ny(
                                    {
                                        'bottom-8 left-1/2 -translate-x-1/2':
                                            formatLabelSide === 'top',
                                    },
                                    {
                                        'left-1/2 top-8 -translate-x-1/2':
                                            formatLabelSide === 'bottom',
                                    },
                                    {
                                        'right-8 -translate-y-1/4': formatLabelSide === 'left',
                                    },
                                    {
                                        'left-8 -translate-y-1/4': formatLabelSide === 'right',
                                    },
                                    'absolute z-30 w-max items-center justify-items-center rounded-md border bg-popover px-2 py-1 text-center text-popover-foreground shadow-sm',
                                )}
                            >
                                {formatLabel(numberStep)}
                            </div>
                        )}
                    </SliderPrimitive.Thumb>
                ))}
            </SliderPrimitive.Root>
        );
    },
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
