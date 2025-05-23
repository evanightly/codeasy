'use client';

import { motion } from 'motion/react';
import { type ComponentPropsWithoutRef, useEffect, useId, useRef, useState } from 'react';

import { ny } from '@/Lib/Utils';

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<'svg'> {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    strokeDasharray?: any;
    numSquares?: number;
    maxOpacity?: number;
    duration?: number;
    repeatDelay?: number;
}

export function AnimatedGridPattern({
    width = 40,
    height = 40,
    x = -1,
    y = -1,
    strokeDasharray = 0,
    numSquares = 50,
    className,
    maxOpacity = 0.5,
    duration = 4,
    repeatDelay = 0.5,
    ...props
}: AnimatedGridPatternProps) {
    const id = useId();
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [squares, setSquares] = useState(() => generateSquares(numSquares));

    function getPos() {
        return [
            Math.floor((Math.random() * dimensions.width) / width),
            Math.floor((Math.random() * dimensions.height) / height),
        ];
    }

    // Adjust the generateSquares function to return objects with an id, x, and y
    function generateSquares(count: number) {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            pos: getPos(),
        }));
    }

    // Function to update a single square's position
    const updateSquarePosition = (id: number) => {
        setSquares((currentSquares) =>
            currentSquares.map((sq) =>
                sq.id === id
                    ? {
                          ...sq,
                          pos: getPos(),
                      }
                    : sq,
            ),
        );
    };

    // Update squares to animate in
    useEffect(() => {
        if (dimensions.width && dimensions.height) {
            setSquares(generateSquares(numSquares));
        }
    }, [dimensions, numSquares]);

    // Resize observer to update container dimensions
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [containerRef]);

    return (
        <svg
            ref={containerRef}
            className={ny(
                'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
                className,
            )}
            aria-hidden='true'
            {...props}
        >
            <defs>
                <pattern
                    y={y}
                    x={x}
                    width={width}
                    patternUnits='userSpaceOnUse'
                    id={id}
                    height={height}
                >
                    <path
                        strokeDasharray={strokeDasharray}
                        fill='none'
                        d={`M.5 ${height}V.5H${width}`}
                    />
                </pattern>
            </defs>
            <rect width='100%' height='100%' fill={`url(#${id})`} />
            <svg y={y} x={x} className='overflow-visible'>
                {squares.map(({ pos: [x, y], id }, index) => (
                    <motion.rect
                        y={y * height + 1}
                        x={x * width + 1}
                        width={width - 1}
                        transition={{
                            duration,
                            repeat: 1,
                            delay: index * 0.1,
                            repeatType: 'reverse',
                        }}
                        strokeWidth='0'
                        onAnimationComplete={() => updateSquarePosition(id)}
                        key={`${x}-${y}-${index}`}
                        initial={{ opacity: 0 }}
                        height={height - 1}
                        fill='currentColor'
                        animate={{ opacity: maxOpacity }}
                    />
                ))}
            </svg>
        </svg>
    );
}
