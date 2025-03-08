'use client';

import { ny } from '@/Lib/Utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WordRotateProps {
    words: string[];
    className?: string;
    interval?: number;
}

const WordRotate = ({ words, className, interval = 3000 }: WordRotateProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (words.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, interval);

        return () => clearInterval(timer);
    }, [words, interval]);

    return (
        <span className={ny('relative inline-block', className)}>
            <AnimatePresence mode='wait'>
                <motion.span
                    transition={{ duration: 0.5 }}
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    exit={{ opacity: 0, y: -20 }}
                    className='inline-block'
                    animate={{ opacity: 1, y: 0 }}
                >
                    {words[currentIndex]}
                </motion.span>
            </AnimatePresence>
            {/* Remove the underline from here - it will be managed by the parent */}
        </span>
    );
};

export default WordRotate;
