'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';

interface AnimatedSubscribeButtonProps {
    buttonColor: string;
    buttonTextColor?: string;
    subscribeStatus: boolean;
    initialText: React.ReactElement | string;
    changeText: React.ReactElement | string;
}

export const AnimatedSubscribeButton: React.FC<AnimatedSubscribeButtonProps> = ({
    buttonColor,
    subscribeStatus,
    buttonTextColor,
    changeText,
    initialText,
}) => {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);

    return (
        <AnimatePresence mode='wait'>
            {isSubscribed ? (
                <motion.button
                    onClick={() => setIsSubscribed(false)}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className='relative flex h-[46px] w-[200px] items-center justify-center overflow-hidden rounded-md bg-white p-[10px] outline outline-1 outline-black'
                    animate={{ opacity: 1 }}
                >
                    <motion.span
                        style={{ color: buttonColor }}
                        key='action'
                        initial={{ y: -50 }}
                        className='relative block size-full font-semibold'
                        animate={{ y: 0 }}
                    >
                        {changeText}
                    </motion.span>
                </motion.button>
            ) : (
                <motion.button
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    onClick={() => setIsSubscribed(true)}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className='relative flex w-[200px] cursor-pointer items-center justify-center rounded-md border-none p-[10px]'
                    animate={{ opacity: 1 }}
                >
                    <motion.span
                        key='reaction'
                        initial={{ x: 0 }}
                        exit={{ x: 50, transition: { duration: 0.1 } }}
                        className='relative block font-semibold'
                    >
                        {initialText}
                    </motion.span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
