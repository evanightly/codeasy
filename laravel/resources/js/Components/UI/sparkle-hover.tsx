import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface SparkleHoverProps {
    children: ReactNode;
    className?: string;
}

export function SparkleHover({ children, className = '' }: SparkleHoverProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseLeave={() => setIsHovered(false)}
            onMouseEnter={() => setIsHovered(true)}
            className={`relative inline-block ${className}`}
        >
            {isHovered && (
                <>
                    <Sparkle top='-10px' size={10} left='10px' delay={0.1} color='#ffffff' />
                    <Sparkle top='10px' size={7} left='-15px' delay={0.2} color='#ffffff' />
                    <Sparkle size={9} right='5px' delay={0.15} color='#ffffff' bottom='-5px' />
                    <Sparkle size={6} left='10px' delay={0.25} color='#ffffff' bottom='10px' />
                </>
            )}
            {children}
        </div>
    );
}

interface SparkleProps {
    size: number;
    color: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    delay?: number;
}

function Sparkle({ size, color, top, left, right, bottom, delay = 0 }: SparkleProps) {
    return (
        <motion.div
            transition={{
                duration: 0.6,
                delay,
                ease: 'easeOut',
            }}
            style={{
                top,
                left,
                right,
                bottom,
            }}
            initial={{ opacity: 0, scale: 0 }}
            className='pointer-events-none absolute z-10'
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 90, 180],
            }}
        >
            <svg width={size} viewBox='0 0 68 68' height={size} fill='none'>
                <path
                    fillOpacity='0.8'
                    fill={color}
                    d='M26.5 4.5C26.5 3.67157 27.1716 3 28 3H40C40.8284 3 41.5 3.67157 41.5 4.5V16.5C41.5 17.3284 40.8284 18 40 18H28C27.1716 18 26.5 17.3284 26.5 16.5V4.5Z'
                />
                <path
                    fillOpacity='0.8'
                    fill={color}
                    d='M3 28C3 27.1716 3.67157 26.5 4.5 26.5H16.5C17.3284 26.5 18 27.1716 18 28V40C18 40.8284 17.3284 41.5 16.5 41.5H4.5C3.67157 41.5 3 40.8284 3 40V28Z'
                />
                <path
                    fillOpacity='0.8'
                    fill={color}
                    d='M50 28C50 27.1716 50.6716 26.5 51.5 26.5H63.5C64.3284 26.5 65 27.1716 65 28V40C65 40.8284 64.3284 41.5 63.5 41.5H51.5C50.6716 41.5 50 40.8284 50 40V28Z'
                />
                <path
                    fillOpacity='0.8'
                    fill={color}
                    d='M26.5 51.5C26.5 50.6716 27.1716 50 28 50H40C40.8284 50 41.5 50.6716 41.5 51.5V63.5C41.5 64.3284 40.8284 65 40 65H28C27.1716 65 26.5 64.3284 26.5 63.5V51.5Z'
                />
            </svg>
        </motion.div>
    );
}
