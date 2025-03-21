import { ny } from '@/Lib/Utils';
import type * as React from 'react';

interface CrosshairConfig {
    topLeft?: boolean;
    topRight?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
}

interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    crosshairs?: CrosshairConfig;
    gridLines?: boolean;
    columns?: 8 | 12 | 16;
    lineVariant?: 'all' | 'vertical' | 'horizontal' | 'center' | 'none';
}

function CrosshairIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            viewBox='0 0 16 16'
            height='16'
            fill='none'
            className={className}
        >
            <path strokeWidth='1' strokeLinecap='round' stroke='currentColor' d='M8 1V15M1 8H15' />
        </svg>
    );
}

export function GridLayout({
    children,
    crosshairs,
    gridLines = true,
    columns = 16,
    lineVariant = 'all',
    className,
    ...props
}: GridLayoutProps) {
    return (
        <div
            className={ny(
                'relative grid w-full gap-0',
                gridLines && 'border border-grid-line',
                columns === 16 && 'grid-cols-grid-16',
                columns === 12 && 'grid-cols-grid-12',
                columns === 8 && 'grid-cols-grid-8',
                className,
            )}
            {...props}
        >
            {gridLines && (
                <div className='absolute inset-0 z-0'>
                    {/* Vertikale Linien */}
                    {(lineVariant === 'all' ||
                        lineVariant === 'vertical' ||
                        lineVariant === 'center') && (
                        <div className='absolute inset-0 flex justify-center'>
                            {lineVariant === 'center' ? (
                                <div className='h-full w-px border-r border-grid-line' />
                            ) : (
                                <div
                                    className={ny(
                                        'grid size-full',
                                        columns === 16 && 'grid-cols-grid-16',
                                        columns === 12 && 'grid-cols-grid-12',
                                        columns === 8 && 'grid-cols-grid-8',
                                    )}
                                >
                                    {Array.from({ length: columns }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={ny(
                                                'border-r border-grid-line',
                                                i === 0 && 'border-l',
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Horizontale Linien */}
                    {(lineVariant === 'all' || lineVariant === 'horizontal') && (
                        <div className='absolute inset-0 grid grid-rows-[repeat(16,1fr)]'>
                            {Array.from({ length: 17 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={ny(
                                        'border-t border-grid-line',
                                        i === 16 && 'border-b',
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Crosshairs */}
            {crosshairs?.topLeft && (
                <CrosshairIcon className='text-grid-line absolute -left-2 -top-2' />
            )}
            {crosshairs?.topRight && (
                <CrosshairIcon className='text-grid-line absolute -right-2 -top-2' />
            )}
            {crosshairs?.bottomLeft && (
                <CrosshairIcon className='text-grid-line absolute -bottom-2 -left-2' />
            )}
            {crosshairs?.bottomRight && (
                <CrosshairIcon className='text-grid-line absolute -bottom-2 -right-2' />
            )}

            <div className='relative z-10 col-span-full'>{children}</div>
        </div>
    );
}

export default GridLayout;
