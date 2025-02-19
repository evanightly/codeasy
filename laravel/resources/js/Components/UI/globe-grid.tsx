'use client';

import { ny } from '@/Lib/Utils';
import type * as React from 'react';

interface GlobeGridProps {
    fullGlobe?: boolean;
    className?: string;
}

export function GlobeGrid({ fullGlobe = false, className }: GlobeGridProps) {
    return (
        <div
            className={ny(
                'relative flex min-h-[350px] w-full items-center justify-center overflow-hidden',
                className,
            )}
        >
            <section
                style={
                    {
                        '--sm-grid-columns': '6',
                        '--md-grid-columns': '6',
                        '--sm-grid-rows': fullGlobe ? '12' : '6',
                        '--md-grid-rows': fullGlobe ? '12' : '6',
                        '--grid-columns': 'var(--sm-grid-columns)',
                        '--grid-rows': 'var(--sm-grid-rows)',
                        aspectRatio: fullGlobe ? '1/1' : '2/1',
                    } as React.CSSProperties
                }
                className='relative w-full max-w-[600px]'
            >
                <style jsx>
                    {`
                        @media (min-width: 768px) {
                            section {
                                --grid-columns: var(--md-grid-columns);
                                --grid-rows: var(--md-grid-rows);
                            }
                        }
                    `}
                </style>
                <div className='absolute left-0 top-0 z-[5] ml-[-0.5px] w-full md:left-1/2 md:top-1/2 md:h-[200%] md:-translate-x-1/2 md:-translate-y-1/2'>
                    <svg
                        width='100%'
                        viewBox={fullGlobe ? '-1 -1 802 802' : '-1 -151 802 602'}
                        style={{
                            transform: fullGlobe
                                ? 'translateY(0px) scale(1.002)'
                                : 'translateY(-12.5%) scale(1.002)',
                        }}
                        height='100%'
                        className='[--guide-color:theme(colors.border/50%)]'
                        aria-hidden='true'
                    >
                        <defs>
                            <clipPath id='half-globe-clip'>
                                <rect y='-151' x='-1' width='802' height='551' />
                            </clipPath>
                        </defs>

                        <g
                            data-testid='globe-wireframe'
                            clipPath={fullGlobe ? 'none' : 'url(#half-globe-clip)'}
                        >
                            <circle r='400' fill='var(--ds-background-200)' cy='400' cx='400' />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 800 A -400 400 0 0 0 400 0'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 800 A -266.667 400 0 0 0 400 0'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 800 A -133.333 400 0 0 0 400 0'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 800 A 0 400 0 0 0 400 0'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 0 A 133.333 400 0 0 0 400 800'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 0 A 266.667 400 0 0 0 400 800'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M 400 0 A 400 400 0 0 0 400 800'
                            />

                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M178.892,66.667 h442.217'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M101.858,133.333 h596.285'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M53.59,200 h692.82'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M22.876,266.667 h754.247'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M5.595,333.333 h788.811'
                            />
                            <path
                                vectorEffect='non-scaling-stroke'
                                strokeWidth='1'
                                stroke='url(#globe-gradient)'
                                fill='none'
                                d='M0,400 h800'
                            />
                            {fullGlobe && (
                                <>
                                    <path
                                        vectorEffect='non-scaling-stroke'
                                        strokeWidth='1'
                                        stroke='url(#globe-gradient)'
                                        fill='none'
                                        d='M5.595,466.667 h788.811'
                                    />
                                    <path
                                        vectorEffect='non-scaling-stroke'
                                        strokeWidth='1'
                                        stroke='url(#globe-gradient)'
                                        fill='none'
                                        d='M22.876,533.333 h754.247'
                                    />
                                    <path
                                        vectorEffect='non-scaling-stroke'
                                        strokeWidth='1'
                                        stroke='url(#globe-gradient)'
                                        fill='none'
                                        d='M53.59,600 h692.82'
                                    />
                                    <path
                                        vectorEffect='non-scaling-stroke'
                                        strokeWidth='1'
                                        stroke='url(#globe-gradient)'
                                        fill='none'
                                        d='M101.858,666.667 h596.285'
                                    />
                                    <path
                                        vectorEffect='non-scaling-stroke'
                                        strokeWidth='1'
                                        stroke='url(#globe-gradient)'
                                        fill='none'
                                        d='M178.892,733.333 h442.217'
                                    />
                                </>
                            )}
                        </g>

                        {/* Original animated paths */}
                        <g id='animated-paths'>
                            {/* First animated path */}
                            <g
                                opacity='1'
                                id='lllldll31'
                                className='[--normal-color:var(--line-color-1)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#lllldll31-gradient)'
                                    fill='none'
                                    d='M794.405,333.333 h-131.468M662.937,333.333 h-131.468M531.468,333.333 h-131.468M400,333.333 h-131.468M 268.532 333.333 A -133.333 400 0 0 0 266.667 400M266.667,400 h-133.333M133.333,400 h-133.333'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                        id='opacity-lllldll31'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='lllldll31-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='794.405;794.405;662.937;531.468;400;268.532;266.667;133.333;0;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cx-lllldll31'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='333.333;333.333;333.333;333.333;333.333;333.333;400;400;400;400;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cy-lllldll31'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;100;100;100;100;100;100;100;100;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='r-lllldll31'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>

                            {/* Second animated path */}
                            <g
                                opacity='1'
                                id='llullldl34'
                                className='[--normal-color:var(--line-color-2)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#llullldl34-gradient)'
                                    fill='none'
                                    d='M698.142,133.333 h-99.381M598.762,133.333 h-99.381M 499.381 133.333 A 133.333 400 0 0 0 473.703 66.667M473.703,66.667 h-73.703M400,66.667 h-73.703M326.297,66.667 h-73.703M 252.594 66.667 A -266.667 400 0 0 0 201.238 133.333M201.238,133.333 h-99.381'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                        id='opacity-llullldl34'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='llullldl34-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='698.142;698.142;598.762;499.381;473.703;400;326.297;252.594;201.238;101.858;101.858;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cx-llullldl34'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='133.333;133.333;133.333;133.333;66.667;66.667;66.667;66.667;133.333;133.333;133.333;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cy-llullldl34'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;50;50;50;50;50;50;50;50;50;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='r-llullldl34'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>

                            {/* Third animated path */}
                            <g
                                opacity='1'
                                id='llldlll35'
                                className='[--normal-color:var(--line-color-1)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#llldlll35-gradient)'
                                    fill='none'
                                    d='M621.108,66.667 h-73.703M547.406,66.667 h-73.703M473.703,66.667 h-73.703M 400 133.333 A 0 400 0 0 0 400 66.667M400,133.333 h-99.381M300.619,133.333 h-99.381M201.238,133.333 h-99.381'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                        id='opacity-llldlll35'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='llldlll35-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='621.108;621.108;547.406;473.703;400;400;300.619;201.238;101.858;101.858;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cx-llldlll35'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='66.667;66.667;66.667;66.667;66.667;133.333;133.333;133.333;133.333;133.333;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cy-llldlll35'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;66.667;66.667;66.667;66.667;66.667;66.667;66.667;66.667;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='r-llldlll35'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>

                            {/* Fourth animated path */}
                            <g
                                opacity='1'
                                id='llddllll33'
                                className='[--normal-color:var(--line-color-3)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#llddllll33-gradient)'
                                    fill='none'
                                    d='M746.41,200 h-115.47M630.94,200 h-115.47M 525.708 266.667 A 133.333 400 0 0 0 515.47 200M 531.468 333.333 A 133.333 400 0 0 0 525.708 266.667M531.468,333.333 h-131.468M400,333.333 h-131.468M268.532,333.333 h-131.468M137.063,333.333 h-131.468'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                        id='opacity-llddllll33'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='llddllll33-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='746.41;746.41;630.94;515.47;525.708;531.468;400;268.532;137.063;5.595;5.595;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cx-llddllll33'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='200;200;200;200;266.667;333.333;333.333;333.333;333.333;333.333;333.333;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cy-llddllll33'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;100;100;100;100;100;100;100;100;100;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='r-llddllll33'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>

                            {/* Fifth animated path */}
                            <g
                                opacity='1'
                                id='lllddlll34'
                                className='[--normal-color:var(--line-color-2)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#lllddlll34-gradient)'
                                    fill='none'
                                    d='M698.142,133.333 h-99.381M598.762,133.333 h-99.381M499.381,133.333 h-99.381M 400 200 A 0 400 0 0 0 400 133.333M 400 266.667 A 0 400 0 0 0 400 200M400,266.667 h-125.708M274.292,266.667 h-125.708M148.584,266.667 h-125.708'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                        id='opacity-lllddlll34'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='lllddlll34-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='698.142;698.142;598.762;499.381;400;400;400;274.292;148.584;22.876;22.876;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cx-lllddlll34'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='133.333;133.333;133.333;133.333;133.333;200;266.667;266.667;266.667;266.667;266.667;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='cy-lllddlll34'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;66.667;66.667;66.667;66.667;66.667;66.667;66.667;66.667;66.667;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.082;0.164;0.245;0.327;0.409;0.491;0.573;0.655;0.736;0.818;1'
                                            id='r-lllddlll34'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>

                            {/* Sixth animated path */}
                            <g
                                opacity='1'
                                id='llullll32'
                                className='[--normal-color:var(--line-color-3)]'
                            >
                                <path
                                    vectorEffect='non-scaling-stroke'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='url(#llullll32-gradient)'
                                    fill='none'
                                    d='M777.124,266.667 h-125.708M651.416,266.667 h-125.708M 525.708 266.667 A 133.333 400 0 0 0 515.47 200M515.47,200 h-115.47M400,200 h-115.47M284.53,200 h-115.47M169.06,200 h-115.47'
                                >
                                    <animate
                                        values='0;1;1;1;1;1;1;1;1;0;0'
                                        repeatCount='indefinite'
                                        keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                        id='opacity-llullll32'
                                        dur='5.5s'
                                        attributeName='opacity'
                                    />
                                </path>
                                <defs>
                                    <radialGradient
                                        r='0'
                                        id='llullll32-gradient'
                                        gradientUnits='userSpaceOnUse'
                                        cy='100'
                                        cx='100'
                                        className='[--color:var(--normal-color)]'
                                    >
                                        <stop stopColor='var(--color)' offset='0' />
                                        <stop stopColor='var(--color)' offset='0.4' />
                                        <stop stopOpacity='0' stopColor='var(--color)' offset='1' />
                                        <animate
                                            values='777.124;777.124;651.416;525.708;515.47;400;284.53;169.06;53.59;53.59;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cx-llullll32'
                                            dur='5.5s'
                                            attributeName='cx'
                                        />
                                        <animate
                                            values='266.667;266.667;266.667;266.667;200;200;200;200;200;200;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='cy-llullll32'
                                            dur='5.5s'
                                            attributeName='cy'
                                        />
                                        <animate
                                            values='0;50;50;50;50;50;50;50;50;0;0'
                                            repeatCount='indefinite'
                                            keyTimes='0;0.091;0.182;0.273;0.364;0.455;0.545;0.636;0.727;0.818;1'
                                            id='r-llullll32'
                                            dur='5.5s'
                                            attributeName='r'
                                        />
                                    </radialGradient>
                                </defs>
                            </g>
                        </g>

                        {/* Mirrored paths for full globe */}
                        {fullGlobe && (
                            <g
                                transform='translate(0,800) scale(1,-1)'
                                className='opacity-50' // Optional: slightly reduce opacity of bottom paths
                            >
                                <use href='#animated-paths' />
                            </g>
                        )}

                        <defs>
                            <linearGradient
                                y2='400'
                                y1='0'
                                x2='0'
                                x1='0'
                                id='globe-gradient'
                                gradientUnits='userSpaceOnUse'
                            >
                                <stop stopColor='var(--guide-color)' offset='0%' />
                                <stop stopColor='var(--guide-color)' offset='100%' />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </section>
        </div>
    );
}

export default GlobeGrid;
