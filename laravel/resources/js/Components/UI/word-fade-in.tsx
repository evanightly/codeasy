'use client';

import { ny } from '@/Lib/Utils';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';

interface WordFadeInProps {
    words: string;
    className?: string;
    delay?: number;
    variants?: Variants;
}

export default function WordFadeIn({
    words,
    delay = 0.15,
    variants = {
        hidden: { opacity: 0 },
        visible: (i: any) => ({
            y: 0,
            opacity: 1,
            transition: { delay: i * delay },
        }),
    },
    className,
}: WordFadeInProps) {
    const _words = words.split(' ');

    return (
        <motion.h1
            variants={variants}
            initial='hidden'
            className={ny(
                'font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]',
                className,
            )}
            animate='visible'
        >
            {_words.map((word, i) => (
                <motion.span variants={variants} key={word} custom={i}>
                    {word}{' '}
                </motion.span>
            ))}
        </motion.h1>
    );
}
