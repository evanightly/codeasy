import { ny } from '@/Lib/Utils';
import { motion } from 'motion/react';
import type React from 'react';
import { type HTMLAttributes, useCallback, useMemo } from 'react';

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    perspective?: number;
    beamsPerSide?: number;
    beamSize?: number;
    beamDelayMax?: number;
    beamDelayMin?: number;
    beamDuration?: number;
    gridColor?: string;
}

const Beam = ({
    width,
    x,
    delay,
    duration,
}: {
    width: string | number;
    x: string | number;
    delay: number;
    duration: number;
}) => {
    const hue = Math.floor(Math.random() * 360);
    const ar = Math.floor(Math.random() * 10) + 1;

    return (
        <motion.div
            transition={{
                duration,
                delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
            }}
            style={
                {
                    '--x': `${x}`,
                    '--width': `${width}`,
                    '--aspect-ratio': `${ar}`,
                    '--background': `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
                } as React.CSSProperties
            }
            initial={{ y: '100cqmax', x: '-50%' }}
            className={`absolute left-[var(--x)] top-0 [aspect-ratio:1/var(--aspect-ratio)] [background:var(--background)] [width:var(--width)]`}
            animate={{ y: '-100%', x: '-50%' }}
        />
    );
};

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
    children,
    perspective = 100,
    className,
    beamsPerSide = 3,
    beamSize = 5,
    beamDelayMax = 3,
    beamDelayMin = 0,
    beamDuration = 3,
    gridColor = 'hsl(var(--border))',
    ...props
}) => {
    const generateBeams = useCallback(() => {
        const beams = [];
        const cellsPerSide = Math.floor(100 / beamSize);
        const step = cellsPerSide / beamsPerSide;

        for (let i = 0; i < beamsPerSide; i++) {
            const x = Math.floor(i * step);
            const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
            beams.push({ x, delay });
        }
        return beams;
    }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

    const topBeams = useMemo(() => generateBeams(), [generateBeams]);
    const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
    const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
    const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

    return (
        <div className={ny('relative rounded border p-20', className)} {...props}>
            <div
                style={
                    {
                        '--perspective': `${perspective}px`,
                        '--grid-color': gridColor,
                        '--beam-size': `${beamSize}%`,
                    } as React.CSSProperties
                }
                className={
                    'pointer-events-none absolute left-0 top-0 size-full overflow-hidden [clip-path:inset(0)] [container-type:size] [perspective:var(--perspective)] [transform-style:preserve-3d]'
                }
            >
                {/* top side */}
                <div className='absolute [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform-style:preserve-3d] [transform:rotateX(-90deg)] [width:100cqi]'>
                    {topBeams.map((beam, index) => (
                        <Beam
                            x={`${beam.x * beamSize}%`}
                            width={`${beamSize}%`}
                            key={`top-${index}`}
                            duration={beamDuration}
                            delay={beam.delay}
                        />
                    ))}
                </div>
                {/* bottom side */}
                <div className='absolute top-full [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform-style:preserve-3d] [transform:rotateX(-90deg)] [width:100cqi]'>
                    {bottomBeams.map((beam, index) => (
                        <Beam
                            x={`${beam.x * beamSize}%`}
                            width={`${beamSize}%`}
                            key={`bottom-${index}`}
                            duration={beamDuration}
                            delay={beam.delay}
                        />
                    ))}
                </div>
                {/* left side */}
                <div className='absolute left-0 top-0 [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:0%_0%] [transform-style:preserve-3d] [transform:rotate(90deg)_rotateX(-90deg)] [width:100cqh]'>
                    {leftBeams.map((beam, index) => (
                        <Beam
                            x={`${beam.x * beamSize}%`}
                            width={`${beamSize}%`}
                            key={`left-${index}`}
                            duration={beamDuration}
                            delay={beam.delay}
                        />
                    ))}
                </div>
                {/* right side */}
                <div className='absolute right-0 top-0 [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:100%_0%] [transform-style:preserve-3d] [transform:rotate(-90deg)_rotateX(-90deg)] [width:100cqh]'>
                    {rightBeams.map((beam, index) => (
                        <Beam
                            x={`${beam.x * beamSize}%`}
                            width={`${beamSize}%`}
                            key={`right-${index}`}
                            duration={beamDuration}
                            delay={beam.delay}
                        />
                    ))}
                </div>
            </div>
            <div className='relative'>{children}</div>
        </div>
    );
};
