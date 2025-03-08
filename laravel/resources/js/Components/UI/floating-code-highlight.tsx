import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingCodeHighlightProps {
    className?: string;
}

export function FloatingCodeHighlight({ className = '' }: FloatingCodeHighlightProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Generate random position on mount
        setPosition({
            x: Math.random() * 40 - 20,
            y: Math.random() * 40 - 20,
        });
    }, []);

    return (
        <motion.div
            transition={{
                duration: 8,
                ease: 'easeInOut',
                repeat: Infinity,
            }}
            className={`pointer-events-none z-0 opacity-30 ${className}`}
            animate={{
                x: [position.x - 10, position.x + 10, position.x - 10],
                y: [position.y - 10, position.y + 10, position.y - 10],
            }}
        >
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='140'
                viewBox='0 0 140 140'
                height='140'
                fill='none'
            >
                <g opacity='0.6'>
                    <rect
                        y='10'
                        x='10'
                        width='120'
                        rx='2'
                        height='15'
                        fill='currentColor'
                        className='text-primary/30'
                    />
                    <rect
                        y='35'
                        x='20'
                        width='80'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/20'
                    />
                    <rect
                        y='50'
                        x='20'
                        width='100'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/15'
                    />
                    <rect
                        y='65'
                        x='20'
                        width='60'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/10'
                    />
                    <rect
                        y='80'
                        x='30'
                        width='70'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/20'
                    />
                    <rect
                        y='95'
                        x='30'
                        width='50'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/15'
                    />
                    <rect
                        y='110'
                        x='30'
                        width='90'
                        rx='2'
                        height='8'
                        fill='currentColor'
                        className='text-primary/10'
                    />
                </g>
            </svg>
        </motion.div>
    );
}
