import { ny } from '@/Lib/Utils';

export default function OrbitingCircles({
    className,
    children,
    reverse,
    duration = 20,
    delay = 10,
    radius = 50,
    path = true,
}: {
    className?: string;
    children?: React.ReactNode;
    reverse?: boolean;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
}) {
    return (
        <>
            {path && (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    version='1.1'
                    className='pointer-events-none absolute inset-0 size-full'
                >
                    <circle
                        strokeDasharray='4 4'
                        r={radius}
                        fill='none'
                        cy='50%'
                        cx='50%'
                        className='stroke-black/10 stroke-1 dark:stroke-white/10'
                    />
                </svg>
            )}

            <div
                style={
                    {
                        '--duration': duration,
                        '--radius': radius,
                        '--delay': -delay,
                    } as React.CSSProperties
                }
                className={ny(
                    'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10',
                    { '[animation-direction:reverse]': reverse },
                    className,
                )}
            >
                {children}
            </div>
        </>
    );
}
