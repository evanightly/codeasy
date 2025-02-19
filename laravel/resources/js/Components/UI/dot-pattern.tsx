import { useId } from 'react';

import { ny } from '@/Lib/Utils';

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    cx?: number;
    cy?: number;
    cr?: number;
    className?: string;
    [key: string]: unknown;
}
export function DotPattern({
    width = 16,
    height = 16,
    x = 0,
    y = 0,
    cx = 1,
    cy = 1,
    cr = 1,
    className,
    ...props
}: DotPatternProps) {
    const id = useId();

    return (
        <svg
            className={ny(
                'pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80',
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
                    patternContentUnits='userSpaceOnUse'
                    id={id}
                    height={height}
                >
                    <circle r={cr} id='pattern-circle' cy={cy} cx={cx} />
                </pattern>
            </defs>
            <rect width='100%' strokeWidth={0} height='100%' fill={`url(#${id})`} />
        </svg>
    );
}
