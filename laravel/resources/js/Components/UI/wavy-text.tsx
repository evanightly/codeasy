import { ny } from '@/Lib/Utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

interface WavyTextProps {
    word: string;
    className?: string;
    variant?: {
        hidden: { y: number };
        visible: { y: number };
    };
    duration?: number;
    delay?: number;
}
function WavyText({ word, className, variant, duration = 0.5, delay = 0.05 }: WavyTextProps) {
    const defaultVariants = {
        hidden: { y: 10 },
        visible: { y: -10 },
    };
    const combinedVariants = variant || defaultVariants;
    const characters = useMemo(() => word.split(''), [word]);
    return (
        <div className='flex justify-center space-x-2 overflow-hidden p-3'>
            <AnimatePresence>
                {characters.map((char, i) => (
                    <motion.h1
                        variants={combinedVariants}
                        transition={{
                            yoyo: Number.POSITIVE_INFINITY,
                            duration,
                            delay: i * delay,
                        }}
                        key={i}
                        initial='hidden'
                        exit='hidden'
                        className={ny(
                            className,
                            'font-display text-center text-4xl font-bold tracking-[-0.15em] md:text-7xl',
                        )}
                        animate='visible'
                    >
                        {char}
                    </motion.h1>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default WavyText;
