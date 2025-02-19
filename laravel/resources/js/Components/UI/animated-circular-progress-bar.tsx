import { ny } from '@/Lib/Utils';

interface Props {
    max: number;
    value: number;
    min: number;
    gaugePrimaryColor: string;
    gaugeSecondaryColor: string;
    className?: string;
}

export default function AnimatedCircularProgressBar({
    max = 100,
    min = 0,
    value = 0,
    gaugePrimaryColor,
    gaugeSecondaryColor,
    className,
}: Props) {
    const circumference = 2 * Math.PI * 45;
    const percentPx = circumference / 100;
    const currentPercent = Math.round(((value - min) / (max - min)) * 100);

    return (
        <div
            style={
                {
                    '--circle-size': '100px',
                    '--circumference': circumference,
                    '--percent-to-px': `${percentPx}px`,
                    '--gap-percent': '5',
                    '--offset-factor': '0',
                    '--transition-length': '1s',
                    '--transition-step': '200ms',
                    '--delay': '0s',
                    '--percent-to-deg': '3.6deg',
                    transform: 'translateZ(0)',
                } as React.CSSProperties
            }
            className={ny('relative size-40 text-2xl font-semibold', className)}
        >
            <svg viewBox='0 0 100 100' strokeWidth='2' fill='none' className='size-full'>
                {currentPercent <= 90 && currentPercent >= 0 && (
                    <circle
                        style={
                            {
                                stroke: gaugeSecondaryColor,
                                '--stroke-percent': 90 - currentPercent,
                                '--offset-factor-secondary': 'calc(1 - var(--offset-factor))',
                                strokeDasharray:
                                    'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
                                transform:
                                    'rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)',
                                transition: 'all var(--transition-length) ease var(--delay)',
                                transformOrigin:
                                    'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
                            } as React.CSSProperties
                        }
                        strokeWidth='10'
                        strokeLinejoin='round'
                        strokeLinecap='round'
                        strokeDashoffset='0'
                        r='45'
                        cy='50'
                        cx='50'
                        className='opacity-100'
                    />
                )}
                <circle
                    style={
                        {
                            stroke: gaugePrimaryColor,
                            '--stroke-percent': currentPercent,
                            strokeDasharray:
                                'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
                            transition:
                                'var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)',
                            transitionProperty: 'stroke-dasharray,transform',
                            transform:
                                'rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))',
                            transformOrigin:
                                'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
                        } as React.CSSProperties
                    }
                    strokeWidth='10'
                    strokeLinejoin='round'
                    strokeLinecap='round'
                    strokeDashoffset='0'
                    r='45'
                    cy='50'
                    cx='50'
                    className='opacity-100'
                />
            </svg>
            <span
                data-current-value={currentPercent}
                className='delay-[var(--delay)] duration-[var(--transition-length)] absolute inset-0 m-auto size-fit ease-linear animate-in fade-in'
            >
                {currentPercent}
            </span>
        </div>
    );
}
