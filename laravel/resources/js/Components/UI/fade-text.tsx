'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FadeTextProps {
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
    framerProps?: Variants;
    text: string;
}

export function FadeText({
    direction = 'up',
    className,
    framerProps = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { type: 'spring' } },
    },
    text,
}: FadeTextProps) {
    const directionOffset = useMemo(() => {
        const map = { up: 10, down: -10, left: -10, right: 10 };
        return map[direction];
    }, [direction]);

    const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';

    const FADE_ANIMATION_VARIANTS = useMemo(() => {
        const { hidden, show, ...rest } = framerProps as {
            [name: string]: { [name: string]: number; opacity: number };
        };

        return {
            ...rest,
            hidden: {
                ...(hidden ?? {}),
                opacity: hidden?.opacity ?? 0,
                [axis]: hidden?.[axis] ?? directionOffset,
            },
            show: {
                ...(show ?? {}),
                opacity: show?.opacity ?? 1,
                [axis]: show?.[axis] ?? 0,
            },
        };
    }, [directionOffset, axis, framerProps]);

    return (
        <motion.div
            viewport={{ once: true }}
            variants={FADE_ANIMATION_VARIANTS}
            initial='hidden'
            animate='show'
        >
            <motion.span className={className}>{text}</motion.span>
        </motion.div>
    );
}
