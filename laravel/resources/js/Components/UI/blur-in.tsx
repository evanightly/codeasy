'use client';
import { ny } from '@/Lib/Utils';
import { motion } from 'framer-motion';

interface BlurIntProps {
    word: string;
    className?: string;
    variant?: {
        hidden: { filter: string; opacity: number };
        visible: { filter: string; opacity: number };
    };
    duration?: number;
}
function BlurIn({ word, className, variant, duration = 1 }: BlurIntProps) {
    const defaultVariants = {
        hidden: { filter: 'blur(10px)', opacity: 0 },
        visible: { filter: 'blur(0px)', opacity: 1 },
    };
    const combinedVariants = variant || defaultVariants;

    return (
        <motion.h1
            variants={combinedVariants}
            transition={{ duration }}
            initial='hidden'
            className={ny(
                className,
                'font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem]',
            )}
            animate='visible'
        >
            {word}
        </motion.h1>
    );
}

export default BlurIn;
