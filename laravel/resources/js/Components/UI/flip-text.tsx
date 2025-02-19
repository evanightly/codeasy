'use client';

import { ny } from '@/Lib/Utils';
import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';

interface SlightFlipProps {
    word: string;
    duration?: number;
    delayMultiple?: number;
    framerProps?: Variants;
    className?: string;
}

export default function SlightFlip({
    word,
    duration = 0.5,
    delayMultiple = 0.08,
    framerProps = {
        hidden: { rotateX: -90, opacity: 0 },
        visible: { rotateX: 0, opacity: 1 },
    },
    className,
}: SlightFlipProps) {
    return (
        <div className='flex justify-center space-x-2'>
            <AnimatePresence mode='wait'>
                {word.split('').map((char, i) => (
                    <motion.span
                        variants={framerProps}
                        transition={{ duration, delay: i * delayMultiple }}
                        key={i}
                        initial='hidden'
                        exit='hidden'
                        className={ny('origin-center drop-shadow-sm', className)}
                        animate='visible'
                    >
                        {char}
                    </motion.span>
                ))}
            </AnimatePresence>
        </div>
    );
}
