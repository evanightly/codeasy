'use client';

import { ny } from '@/Lib/Utils';
import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';

interface GradualSpacingProps {
    text: string;
    duration?: number;
    delayMultiple?: number;
    framerProps?: Variants;
    className?: string;
}

export default function GradualSpacing({
    text,
    duration = 0.5,
    delayMultiple = 0.04,
    framerProps = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    },
    className,
}: GradualSpacingProps) {
    return (
        <div className='flex justify-center space-x-1'>
            <AnimatePresence>
                {text.split('').map((char, i) => (
                    <motion.h1
                        variants={framerProps}
                        transition={{ duration, delay: i * delayMultiple }}
                        key={i}
                        initial='hidden'
                        exit='hidden'
                        className={ny('drop-shadow-sm', className)}
                        animate='visible'
                    >
                        {char === ' ' ? <span>&nbsp;</span> : char}
                    </motion.h1>
                ))}
            </AnimatePresence>
        </div>
    );
}
