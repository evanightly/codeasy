import { useId } from 'react';

import { ny } from '@/Lib/Utils';

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    squares?: Array<[x: number, y: number]>;
    strokeDasharray?: string;
    className?: string;
    [key: string]: unknown;
}

export function GridPattern({
    width = 40,
    height = 40,
    x = -1,
    y = -1,
    strokeDasharray = '0',
    squares,
    className,
    ...props
}: GridPatternProps) {
    const id = useId();

    return (
        <svg
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
            <rect width='100%' strokeWidth={0} height='100%' fill={`url(#${id})`} />
            {squares && (
                <svg y={y} x={x} className='overflow-visible'>
                    {squares.map(([x, y]) => (
                        <rect
                            y={y * height + 1}
                            x={x * width + 1}
                            width={width - 1}
                            strokeWidth='0'
                            key={`${x}-${y}`}
                            height={height - 1}
                        />
                    ))}
                </svg>
            )}
        </svg>
    );
}
