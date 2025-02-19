import { ny } from '@/Lib/Utils';

interface Props {
    max: number;
    value: number;
    min: number;
    gaugePrimaryColor: string;
    gaugeSecondaryColor: string;
    className?: string;
}

export default function GaugeCircle({
    max = 100,
    min = 0,
    value = 0,
    gaugePrimaryColor,
    gaugeSecondaryColor,
    className,
}: Props) {
    const circumference = 2 * Math.PI * 45;
    const percentPx = circumference / 100;
    const currentPercent = ((value - min) / (max - min)) * 100;

    return (
        <div
            style={
                {
                    '--circle-size': '100px',
                    '--circumference': `${circumference}px`,
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
                        style={{
                            stroke: gaugeSecondaryColor,
                            strokeDasharray: `${(90 - currentPercent) * percentPx}px ${circumference}px`,
                            transform: `rotate(calc(1turn - 90deg - (5 * 3.6deg * (1 - 0)))) scaleY(-1)`,
                            transition: 'all 1s ease 0s',
                            transformOrigin: '50px 50px',
                        }}
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
                    style={{
                        stroke: gaugePrimaryColor,
                        strokeDasharray: `${currentPercent * percentPx}px ${circumference}px`,
                        transition: '1s ease 0s, stroke 1s ease 0s',
                        transitionProperty: 'stroke-dasharray,transform',
                        transform: 'rotate(calc(-90deg + 5 * 0 * 3.6deg))',
                        transformOrigin: '50px 50px',
                    }}
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
                style={{
                    animationDelay: '0s',
                    transitionDuration: '1s',
                }}
                className='absolute inset-0 m-auto size-fit animate-in fade-in'
            >
                {Math.round(currentPercent)}
            </span>
        </div>
    );
}
