'use client';

import { ny } from '@/Lib/Utils';
import { motion } from 'framer-motion';

interface LetterPullupProps {
    className?: string;
    words: string;
    delay?: number;
}

export default function LetterPullup({ className, words, delay }: LetterPullupProps) {
    const letters = words.split('');

    const pullupVariant = {
        initial: { y: 100, opacity: 0 },
        animate: (i: any) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * (delay || 0.05), // By default, delay each letter's animation by 0.05 seconds
            },
        }),
    };

    return (
        <div className='flex justify-center'>
            {letters.map((letter, i) => (
                <motion.h1
                    variants={pullupVariant}
                    key={i}
                    initial='initial'
                    custom={i}
                    className={ny(
                        'font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-4xl md:leading-[5rem]',
                        className,
                    )}
                    animate='animate'
                >
                    {letter === ' ' ? <span>&nbsp;</span> : letter}
                </motion.h1>
            ))}
        </div>
    );
}
