import { AnimatedGridPattern } from '@/Components/UI/animated-grid-pattern';
import { Badge } from '@/Components/UI/badge';
import { buttonVariants } from '@/Components/UI/button';
import { Card, CardContent } from '@/Components/UI/card';
import { FloatingCodeHighlight } from '@/Components/UI/floating-code-highlight'; // New
import { Meteors } from '@/Components/UI/meteors';
import Particles from '@/Components/UI/particles';
import { Separator } from '@/Components/UI/separator';
import { SparkleHover } from '@/Components/UI/sparkle-hover'; // New
import WordRotate from '@/Components/UI/word-rotate';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react'; // Added useRef, useState, useEffect

export default function Welcome({
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    // For better accessibility and performance
    const prefersReducedMotion = useReducedMotion();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const heroRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage().props;

    // Parallax effect for hero elements
    const codeOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const heroTextY = useTransform(scrollYProgress, [0, 0.7], [0, -50]);

    // Handle mobile menu toggle
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Close mobile menu when navigation happens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleImageError = () => {
        document.getElementById('screenshot-container')?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document.getElementById('docs-card-content')?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    // Cognitive levels data for visualization
    const cognitiveLevels = [
        { name: 'Remembering', score: 85, color: 'bg-red-500' },
        { name: 'Understanding', score: 78, color: 'bg-orange-500' },
        { name: 'Applying', score: 65, color: 'bg-yellow-500' },
        { name: 'Analyzing', score: 52, color: 'bg-green-500' },
        { name: 'Evaluating', score: 41, color: 'bg-blue-500' },
        { name: 'Creating', score: 28, color: 'bg-purple-500' },
    ];

    // Python code for demonstration
    const pythonCode = `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load student data
student_data = pd.read_csv('student_interactions.csv')

# Extract features from student code submissions
features = extract_code_features(student_data.code)

# Extract existing cognitive level labels for training
cognitive_levels = student_data.cognitive_level

# Split data for training and testing
X_train, X_test, y_train, y_test = train_test_split(
    features, cognitive_levels, test_size=0.2, random_state=42
)

# Train cognitive level classifier
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Predict cognitive levels
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"Model accuracy: {accuracy:.2f}")
print("Cognitive level distribution:")
print(cognitive_levels.value_counts())`;

    return (
        <div className='scroll-smooth'>
            <Head title='Welcome'>
                <meta
                    name='description'
                    content='Codeasy adalah platform pembelajaran Python untuk Data Science dengan analisis kognitif otomatis berdasarkan Taksonomi Bloom.'
                />
                <meta
                    property='og:title'
                    content='Codeasy - Pembelajaran Python dan Data Science'
                />
                <meta
                    property='og:description'
                    content='Platform pembelajaran interaktif dengan autograding dan analisis kognitif otomatis.'
                />
                <meta property='og:type' content='website' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            </Head>

            {/* Modern Navbar with Gradient Logo */}
            <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-shrink-0 items-center space-x-3'>
                        <Link
                            href='/'
                            className='flex items-center space-x-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                        >
                            <SparkleHover>
                                <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent'>
                                    Codeasy
                                </span>
                            </SparkleHover>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className='hidden space-x-6 md:flex md:items-center'>
                        <a
                            href='#features'
                            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                        >
                            Features
                        </a>
                        <a
                            href='#how-it-works'
                            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                        >
                            How it Works
                        </a>
                        <a
                            href='#testimonials'
                            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                        >
                            Testimonials
                        </a>
                        {auth?.user?.username ? (
                            <Link
                                href={route('dashboard.index')}
                                className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className={buttonVariants({
                                        className:
                                            'border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
                                    })}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className='inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary md:hidden'
                        aria-label='Toggle Navigation'
                        aria-expanded={isMenuOpen}
                        aria-controls='mobile-menu'
                    >
                        <svg
                            viewBox='0 0 24 24'
                            className={`h-6 w-6 fill-current transition-transform ${isMenuOpen ? 'rotate-90' : ''}`}
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    stroke='currentColor'
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            ) : (
                                <path d='M4 5h16M4 12h16M4 19h16' />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        id='mobile-menu'
                        exit={{ height: 0, opacity: 0 }}
                        className='border-t border-border/40 md:hidden'
                        animate={{ height: 'auto', opacity: 1 }}
                    >
                        <div className='space-y-1 px-4 py-4'>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                href='#features'
                                className='block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted'
                            >
                                Features
                            </Link>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                href='#how-it-works'
                                className='block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted'
                            >
                                How it Works
                            </Link>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                href='#testimonials'
                                className='block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted'
                            >
                                Testimonials
                            </Link>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                href={route('login')}
                                className='block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted'
                            >
                                Login
                            </Link>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                href={route('register')}
                                className='mt-2 block rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-center font-medium text-white'
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Hero Section with Python Code and Meteors Effect */}
            <section
                ref={heroRef}
                className='relative overflow-hidden bg-gradient-to-b from-background via-background to-background/90 pb-24 pt-16 md:pt-24'
            >
                <div className='absolute inset-0 z-0'>
                    {!prefersReducedMotion && (
                        <>
                            <Meteors number={20} />
                            <Particles size={2} quantity={100} className='absolute inset-0 z-0' />
                        </>
                    )}
                </div>

                <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    {/* Hero Text */}
                    <motion.div
                        style={{ y: prefersReducedMotion ? 0 : heroTextY }}
                        className='mb-10 text-center'
                    >
                        <Badge
                            variant='outline'
                            className='mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary'
                        >
                            Powered by Machine Learning
                        </Badge>
                        <motion.h1
                            transition={{ duration: 0.7 }}
                            initial={{ opacity: 0, y: 20 }}
                            className='mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Sistem Pembelajaran{' '}
                            <span className='relative inline-block'>
                                <WordRotate
                                    words={[
                                        'Data Science',
                                        'Data Analytics',
                                        'Business Intelligence',
                                    ]}
                                    className='text-primary'
                                />
                                <span className='absolute -bottom-2 left-0 h-1 w-full rounded-full bg-primary/50'></span>
                            </span>
                        </motion.h1>
                        <motion.p
                            transition={{ duration: 0.7, delay: 0.2 }}
                            initial={{ opacity: 0, y: 20 }}
                            className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground'
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Tingkatkan pemahaman Anda dalam pemrograman Python untuk Data Science
                            dengan sistem autograding dan analisis kognitif otomatis berdasarkan
                            Taksonomi Bloom.
                        </motion.p>
                    </motion.div>

                    {/* Code Demo & Cognitive Analysis */}
                    <motion.div
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ opacity: prefersReducedMotion ? 1 : codeOpacity }}
                        initial={{ opacity: 0, y: 30 }}
                        className='mx-auto max-w-4xl'
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Code Editor - Custom implementation with Tailwind styling */}
                        <div className='relative overflow-hidden rounded-lg border bg-card shadow-xl'>
                            {/* Floating elements for visual interest */}
                            <FloatingCodeHighlight className='absolute -right-20 -top-20 opacity-20' />
                            <FloatingCodeHighlight className='absolute -bottom-20 -left-20 opacity-20' />

                            {/* Editor header */}
                            <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2'>
                                <div className='flex items-center'>
                                    <div className='flex space-x-2'>
                                        <div className='h-3 w-3 rounded-full bg-red-500'></div>
                                        <div className='h-3 w-3 rounded-full bg-yellow-500'></div>
                                        <div className='h-3 w-3 rounded-full bg-green-500'></div>
                                    </div>
                                    <div className='ml-4 text-sm font-medium'>
                                        cognitive_analysis.py
                                    </div>
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                    Python • Machine Learning
                                </div>
                            </div>

                            {/* Custom Code Display with Tailwind Styling */}
                            <div className='overflow-x-auto bg-[#282c34] p-4'>
                                <pre className='font-mono text-sm leading-relaxed'>
                                    {/* Line numbers column */}
                                    <div className='flex'>
                                        {/* Line numbers */}
                                        <div className='mr-4 select-none text-right text-gray-500'>
                                            {Array.from({ length: 25 }, (_, i) => (
                                                <div key={i} className='leading-6'>
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Code content */}
                                        <div className='flex-1 text-gray-300'>
                                            {/* Imports */}
                                            <div>
                                                <span className='text-purple-400'>import </span>
                                                <span className='text-yellow-300'>pandas </span>
                                                <span className='text-purple-400'>as </span>
                                                <span className='text-green-400'>pd</span>
                                                <Badge
                                                    variant='outline'
                                                    title='Remembering'
                                                    className='ml-3 bg-red-500/10 text-xs text-red-400'
                                                >
                                                    R
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className='text-purple-400'>import </span>
                                                <span className='text-yellow-300'>numpy </span>
                                                <span className='text-purple-400'>as </span>
                                                <span className='text-green-400'>np</span>
                                            </div>
                                            <div>
                                                <span className='text-purple-400'>from </span>
                                                <span className='text-yellow-300'>
                                                    sklearn.model_selection{' '}
                                                </span>
                                                <span className='text-purple-400'>import </span>
                                                <span className='text-green-400'>
                                                    train_test_split
                                                </span>
                                            </div>
                                            <div>
                                                <span className='text-purple-400'>from </span>
                                                <span className='text-yellow-300'>
                                                    sklearn.ensemble{' '}
                                                </span>
                                                <span className='text-purple-400'>import </span>
                                                <span className='text-green-400'>
                                                    RandomForestClassifier
                                                </span>
                                            </div>
                                            <div>
                                                <span className='text-purple-400'>from </span>
                                                <span className='text-yellow-300'>
                                                    sklearn.metrics{' '}
                                                </span>
                                                <span className='text-purple-400'>import </span>
                                                <span className='text-green-400'>
                                                    accuracy_score
                                                </span>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Load student data
                                                </span>
                                                <Badge
                                                    variant='outline'
                                                    title='Understanding'
                                                    className='ml-3 bg-orange-500/10 text-xs text-orange-400'
                                                >
                                                    U
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>
                                                    student_data{' '}
                                                </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-green-400'>pd</span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-blue-300'>read_csv</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-amber-200'>
                                                    'student_interactions.csv'
                                                </span>
                                                <span className='text-gray-300'>)</span>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Extract features from student code submissions
                                                </span>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>features </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-blue-300'>
                                                    extract_code_features
                                                </span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-yellow-300'>
                                                    student_data
                                                </span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-yellow-300'>code</span>
                                                <span className='text-gray-300'>)</span>
                                                <Badge
                                                    variant='outline'
                                                    title='Applying'
                                                    className='ml-3 bg-yellow-500/10 text-xs text-yellow-500'
                                                >
                                                    A
                                                </Badge>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Extract existing cognitive level labels for
                                                    training
                                                </span>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>
                                                    cognitive_levels{' '}
                                                </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-yellow-300'>
                                                    student_data
                                                </span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-yellow-300'>
                                                    cognitive_level
                                                </span>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Split data for training and testing
                                                </span>
                                                <Badge
                                                    variant='outline'
                                                    title='Analyzing'
                                                    className='ml-3 bg-green-500/10 text-xs text-green-400'
                                                >
                                                    An
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>X_train</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>X_test</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>y_train</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>y_test </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-blue-300'>
                                                    train_test_split
                                                </span>
                                                <span className='text-gray-300'>(</span>
                                            </div>
                                            <div className='pl-4'>
                                                <span className='text-yellow-300'>features</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>
                                                    cognitive_levels
                                                </span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-blue-300'>test_size</span>
                                                <span className='text-blue-400'>=</span>
                                                <span className='text-purple-400'>0.2</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-blue-300'>random_state</span>
                                                <span className='text-blue-400'>=</span>
                                                <span className='text-purple-400'>42</span>
                                            </div>
                                            <div>
                                                <span className='text-gray-300'>)</span>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Train cognitive level classifier
                                                </span>
                                                <Badge
                                                    variant='outline'
                                                    title='Evaluating'
                                                    className='ml-3 bg-blue-500/10 text-xs text-blue-400'
                                                >
                                                    E
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>model </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-blue-300'>
                                                    RandomForestClassifier
                                                </span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-blue-300'>n_estimators</span>
                                                <span className='text-blue-400'>=</span>
                                                <span className='text-purple-400'>100</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>model</span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-blue-300'>fit</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-yellow-300'>X_train</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>y_train</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>

                                            {/* Comments */}
                                            <div className='mt-3'>
                                                <span className='text-gray-500'>
                                                    # Predict cognitive levels
                                                </span>
                                                <Badge
                                                    variant='outline'
                                                    title='Creating'
                                                    className='ml-3 bg-purple-500/10 text-xs text-purple-400'
                                                >
                                                    C
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>
                                                    predictions{' '}
                                                </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-yellow-300'>model</span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-blue-300'>predict</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-yellow-300'>X_test</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>
                                            <div>
                                                <span className='text-yellow-300'>accuracy </span>
                                                <span className='text-blue-400'>= </span>
                                                <span className='text-blue-300'>
                                                    accuracy_score
                                                </span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-yellow-300'>y_test</span>
                                                <span className='text-gray-300'>, </span>
                                                <span className='text-yellow-300'>predictions</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>

                                            <div className='mt-3'>
                                                <span className='text-blue-300'>print</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-amber-200'>
                                                    f"Model accuracy: {'{'}
                                                </span>
                                                <span className='text-yellow-300'>accuracy</span>
                                                <span className='text-amber-200'>:.2f{'}'}"</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>
                                            <div>
                                                <span className='text-blue-300'>print</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-amber-200'>
                                                    "Cognitive level distribution:"
                                                </span>
                                                <span className='text-gray-300'>)</span>
                                            </div>
                                            <div>
                                                <span className='text-blue-300'>print</span>
                                                <span className='text-gray-300'>(</span>
                                                <span className='text-yellow-300'>
                                                    cognitive_levels
                                                </span>
                                                <span className='text-gray-300'>.</span>
                                                <span className='text-blue-300'>value_counts</span>
                                                <span className='text-gray-300'>()</span>
                                                <span className='text-gray-300'>)</span>
                                            </div>
                                        </div>
                                    </div>
                                </pre>
                            </div>

                            {/* Legend for cognitive levels */}
                            <div className='border-t bg-muted/30 p-4'>
                                <div className='mb-2 flex items-center justify-between'>
                                    <h3 className='text-sm font-semibold'>
                                        Cognitive Level Analysis
                                    </h3>
                                    <Badge variant='secondary' className='text-xs'>
                                        Auto-generated
                                    </Badge>
                                </div>

                                <div className='flex flex-wrap gap-3 text-xs'>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-red-500/10 text-red-400'
                                        >
                                            R
                                        </Badge>
                                        <span>Remembering</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-orange-500/10 text-orange-400'
                                        >
                                            U
                                        </Badge>
                                        <span>Understanding</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-yellow-500/10 text-yellow-500'
                                        >
                                            A
                                        </Badge>
                                        <span>Applying</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-green-500/10 text-green-400'
                                        >
                                            An
                                        </Badge>
                                        <span>Analyzing</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-blue-500/10 text-blue-400'
                                        >
                                            E
                                        </Badge>
                                        <span>Evaluating</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Badge
                                            variant='outline'
                                            className='bg-purple-500/10 text-purple-400'
                                        >
                                            C
                                        </Badge>
                                        <span>Creating</span>
                                    </div>
                                </div>

                                <div className='mt-4 text-sm text-muted-foreground'>
                                    Hasil analisis: Siswa memiliki pemahaman yang baik pada level{' '}
                                    <span className='font-medium text-foreground'>Remembering</span>{' '}
                                    dan{' '}
                                    <span className='font-medium text-foreground'>
                                        Understanding
                                    </span>
                                    , namun perlu pengembangan lebih lanjut pada level{' '}
                                    <span className='font-medium text-foreground'>Creating</span>.
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Call to action */}
                    <div className='mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row'>
                        <Link
                            href={route('register')}
                            className={buttonVariants({
                                size: 'lg',
                                className:
                                    'border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
                            })}
                        >
                            Mulai Sekarang
                        </Link>
                        <Link
                            href={route('sandbox.index')}
                            className={buttonVariants({
                                variant: 'outline',
                                size: 'lg',
                            })}
                        >
                            Coba Sandbox Dulu
                        </Link>
                    </div>
                </div>

                {/* Curved bottom edge */}
                <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background to-transparent'></div>
            </section>

            {/* Feature Highlights Section */}
            <section id='features' className='relative bg-background py-24'>
                <div className='absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/90 to-background'></div>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-16 text-center'>
                        <Badge
                            variant='outline'
                            className='mb-3 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Platform Highlights
                        </Badge>
                        <h2 className='mb-4 text-3xl font-bold text-foreground sm:text-4xl'>
                            Kenapa <span className='text-primary'>Codeasy</span>?
                        </h2>
                        <p className='mx-auto max-w-2xl text-muted-foreground'>
                            Platform kami menggunakan teknologi canggih untuk memberikan pengalaman
                            belajar yang lebih efektif dan terukur.
                        </p>
                    </div>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                        <div className='group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg'>
                            <div className='absolute right-4 top-4 opacity-20 transition-opacity group-hover:opacity-100'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='32'
                                    viewBox='0 0 24 24'
                                    height='32'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M4 7H20M4 12H12M4 17H20'
                                    />
                                </svg>
                            </div>
                            <div className='mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    viewBox='0 0 24 24'
                                    height='24'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M4 7H20M4 12H12M4 17H20'
                                    />
                                </svg>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold'>Autograding Realtime</h3>
                            <p className='text-muted-foreground'>
                                Dapatkan umpan balik instan ketika Anda menuliskan kode Python untuk
                                Data Science. Perbaiki kesalahan dan tingkatkan pemahaman Anda
                                secara langsung.
                            </p>
                        </div>
                        <div className='group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg'>
                            <div className='absolute right-4 top-4 opacity-20 transition-opacity group-hover:opacity-100'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='32'
                                    viewBox='0 0 24 24'
                                    height='32'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M9 1L3 5V19L9 23M9 1L15 5M9 1V23M15 5L21 1V19L15 23M15 5V23M15 23L9 19'
                                    />
                                </svg>
                            </div>
                            <div className='mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    viewBox='0 0 24 24'
                                    height='24'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M9 1L3 5V19L9 23M9 1L15 5M9 1V23M15 5L21 1V19L15 23M15 5V23M15 23L9 19'
                                    />
                                </svg>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold'>
                                Analisis Pemahaman Kognitif
                            </h3>
                            <p className='text-muted-foreground'>
                                Klasifikasi otomatis berdasarkan Taksonomi Bloom untuk mengukur
                                tingkat kognitif Anda pada enam level pemahaman yang berbeda.
                            </p>
                        </div>
                        <div className='group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg'>
                            <div className='absolute right-4 top-4 opacity-20 transition-opacity group-hover:opacity-100'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='32'
                                    viewBox='0 0 24 24'
                                    height='32'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M5 3L19 12L5 21V3Z'
                                    />
                                </svg>
                            </div>
                            <div className='mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    viewBox='0 0 24 24'
                                    height='24'
                                    fill='none'
                                >
                                    <path
                                        strokeWidth='2'
                                        strokeLinejoin='round'
                                        strokeLinecap='round'
                                        stroke='currentColor'
                                        d='M5 3L19 12L5 21V3Z'
                                    />
                                </svg>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold'>Kurikulum Berbasis SKKNI</h3>
                            <p className='text-muted-foreground'>
                                Materi dan modul disusun sesuai Standar Kompetensi Kerja Nasional
                                Indonesia dengan fokus pada kebutuhan industri terkini.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - with connected vertical line */}
            <section id='how-it-works' className='relative overflow-hidden bg-muted/30 py-24'>
                <div className='absolute inset-0 z-0'>
                    <div className='absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl filter'></div>
                    <div className='absolute bottom-12 left-12 h-48 w-48 rounded-full bg-secondary/10 blur-3xl filter'></div>
                </div>

                <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-16 text-center'>
                        <Badge
                            variant='outline'
                            className='mb-3 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Learning Journey
                        </Badge>
                        <h2 className='mb-4 text-3xl font-bold text-foreground sm:text-4xl'>
                            Bagaimana Codeasy Bekerja?
                        </h2>
                        <p className='mx-auto max-w-2xl text-muted-foreground'>
                            Proses pembelajaran yang terstruktur dan interaktif untuk memaksimalkan
                            pemahaman Anda
                        </p>
                    </div>

                    {/* Modified steps with continuous vertical line */}
                    <div className='relative'>
                        {/* Continuous vertical line */}
                        <div className='absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-muted md:left-1/2'></div>

                        <div className='space-y-24'>
                            {[
                                {
                                    title: 'Pilih Materi',
                                    description:
                                        'Pilih kursus atau modul pembelajaran sesuai dengan kebutuhan dan tingkat kemampuan Anda.',
                                    icon: (
                                        <svg
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            fill='none'
                                            className='h-6 w-6'
                                        >
                                            <path
                                                strokeWidth={2}
                                                strokeLinejoin='round'
                                                strokeLinecap='round'
                                                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                                            />
                                        </svg>
                                    ),
                                },
                                {
                                    title: 'Belajar Konsep',
                                    description:
                                        'Pelajari konsep dasar melalui materi yang disajikan dengan cara yang mudah dipahami dan interaktif.',
                                    icon: (
                                        <svg
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            fill='none'
                                            className='h-6 w-6'
                                        >
                                            <path
                                                strokeWidth={2}
                                                strokeLinejoin='round'
                                                strokeLinecap='round'
                                                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                                            />
                                        </svg>
                                    ),
                                },
                                {
                                    title: 'Latihan Koding',
                                    description:
                                        'Praktekkan pengetahuan Anda dengan soal-soal latihan yang dianalisis secara realtime dengan feedback langsung.',
                                    icon: (
                                        <svg
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            fill='none'
                                            className='h-6 w-6'
                                        >
                                            <path
                                                strokeWidth={2}
                                                strokeLinejoin='round'
                                                strokeLinecap='round'
                                                d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
                                            />
                                        </svg>
                                    ),
                                },
                                {
                                    title: 'Analisis Kognitif',
                                    description:
                                        'Dapatkan laporan detail tentang tingkat pemahaman Anda berdasarkan Taksonomi Bloom dengan visualisasi interaktif.',
                                    icon: (
                                        <svg
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            fill='none'
                                            className='h-6 w-6'
                                        >
                                            <path
                                                strokeWidth={2}
                                                strokeLinejoin='round'
                                                strokeLinecap='round'
                                                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                            />
                                        </svg>
                                    ),
                                },
                            ].map((step, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} relative items-center`}
                                >
                                    <div className='p-6 md:w-1/2'>
                                        <motion.div
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '-100px' }}
                                            transition={{ duration: 0.5 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            className='relative rounded-xl border bg-card p-6 shadow-md'
                                        >
                                            <div className='mb-4 flex items-center'>
                                                <div className='mr-4 rounded-lg bg-primary p-3 text-primary-foreground'>
                                                    {step.icon}
                                                </div>
                                                <h3 className='text-xl font-bold'>{step.title}</h3>
                                            </div>
                                            <p className='text-muted-foreground'>
                                                {step.description}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Step number circle positioned on the vertical line */}
                                    <div className='absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:w-12 md:translate-x-0'>
                                        <div className='flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary font-bold text-primary-foreground'>
                                            {i + 1}
                                        </div>
                                    </div>

                                    <div className='md:w-1/2 md:p-6'></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className='bg-background py-20'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-16 text-center'>
                        <Badge
                            variant='outline'
                            className='mb-3 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Platform Impact
                        </Badge>
                        <h2 className='mb-4 text-3xl font-bold text-foreground sm:text-4xl'>
                            Menciptakan Talenta Data Science Berkualitas
                        </h2>
                        <p className='mx-auto max-w-2xl text-muted-foreground'>
                            Bergabung dengan ribuan pelajar dari berbagai institusi pendidikan di
                            Indonesia
                        </p>
                    </div>

                    <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
                        {[
                            { number: '10,000+', label: 'Pelajar Aktif' },
                            { number: '150+', label: 'Institusi Pendidikan' },
                            { number: '95%', label: 'Tingkat Kelulusan' },
                            { number: '86%', label: 'Alumni Terserap Industri' },
                        ].map((stat, i) => (
                            <motion.div
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex flex-col items-center rounded-xl border bg-card p-6'
                            >
                                <div className='mb-2 text-4xl font-bold text-primary'>
                                    {stat.number}
                                </div>
                                <div className='text-sm text-muted-foreground'>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id='testimonials' className='relative py-24'>
                <AnimatedGridPattern className='absolute inset-0 z-0' />
                <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-16 text-center'>
                        <Badge
                            variant='outline'
                            className='mb-3 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Testimonials
                        </Badge>
                        <h2 className='mb-4 text-3xl font-bold text-foreground sm:text-4xl'>
                            Yang Dikatakan Oleh Pengguna Kami
                        </h2>
                        <p className='mx-auto max-w-2xl text-muted-foreground'>
                            Apa yang dikatakan siswa dan guru tentang pengalaman belajar dengan
                            platform Codeasy
                        </p>
                    </div>

                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {[
                            {
                                name: 'Budi Santoso',
                                role: 'Student, Universitas Indonesia',
                                image: '/images/avatars/avatar-1.jpg',
                                quote: 'Platform yang sangat membantu proses belajar saya. Dengan feedback realtime yang diberikan, saya dapat memahami kesalahan koding saya dengan cepat.',
                            },
                            {
                                name: 'Siti Rahayu',
                                role: 'Data Science Instructor',
                                image: '/images/avatars/avatar-2.jpg',
                                quote: 'Sebagai instruktur, saya sangat terbantu dengan fitur analisis kognitif yang memungkinkan saya memantau perkembangan siswa dengan lebih detail.',
                            },
                            {
                                name: 'Ahmad Fauzi',
                                role: 'Student, Institut Teknologi Bandung',
                                image: '/images/avatars/avatar-3.jpg',
                                quote: 'Interface yang intuitif dan materi yang terstruktur dengan baik membuat proses belajar Data Science menjadi jauh lebih menyenangkan.',
                            },
                        ].map((testimonial, i) => (
                            <motion.div
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                            >
                                <Card className='h-full overflow-hidden'>
                                    <CardContent className='p-6'>
                                        <div className='mb-4 flex items-center'>
                                            <div className='mr-4 h-12 w-12 rounded-full bg-muted'></div>
                                            <div>
                                                <h4 className='font-semibold'>
                                                    {testimonial.name}
                                                </h4>
                                                <p className='text-sm text-muted-foreground'>
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='italic text-muted-foreground'>
                                            "{testimonial.quote}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className='bg-muted/30 py-16'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-10 text-center'>
                        <Badge
                            variant='outline'
                            className='mb-3 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Our Partners
                        </Badge>
                        <h2 className='mb-4 text-2xl font-bold text-foreground'>
                            Dipercaya oleh institusi terkemuka
                        </h2>
                    </div>

                    <div className='flex flex-wrap items-center justify-center gap-8 md:gap-12'>
                        {[1, 2, 3, 4, 5].map((partner) => (
                            <div
                                key={partner}
                                className='flex h-12 w-32 items-center justify-center rounded bg-muted/50'
                            >
                                <span className='text-xs text-muted-foreground'>Partner Logo</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className='relative overflow-hidden bg-background py-24'>
                <div className='absolute inset-0 z-0'>
                    <Particles size={2} quantity={50} className='absolute inset-0' />
                </div>

                <div className='relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        initial={{ opacity: 0, y: 20 }}
                    >
                        <Badge
                            variant='outline'
                            className='mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-primary'
                        >
                            Start Learning Today
                        </Badge>
                        <h2 className='mb-6 text-4xl font-extrabold text-foreground sm:text-5xl'>
                            Siap Menjadi <span className='text-primary'>Data Scientist</span>{' '}
                            Handal?
                        </h2>
                        <p className='mx-auto mb-10 max-w-2xl text-lg text-muted-foreground'>
                            Bergabunglah dengan ribuan siswa lain yang telah merasakan kemudahan
                            belajar Python untuk Data Science menggunakan platform{' '}
                            <span className='font-bold'>Codeasy</span>.
                        </p>

                        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                            <Link
                                href={route('register')}
                                className={buttonVariants({
                                    size: 'lg',
                                    className:
                                        'w-full border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-white sm:w-auto',
                                })}
                            >
                                Daftar Sekarang
                            </Link>
                            <Link
                                href='#features'
                                className={buttonVariants({
                                    variant: 'outline',
                                    size: 'lg',
                                    className: 'w-full sm:w-auto',
                                })}
                            >
                                Pelajari Lebih Lanjut
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className='border-t bg-muted py-12'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent'>
                                    Codeasy
                                </span>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Platform pembelajaran Python dan Data Science berbasis analisis
                                kognitif.
                            </p>
                        </div>

                        <div>
                            <h4 className='mb-4 text-sm font-semibold'>Platform</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Courses
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className='mb-4 text-sm font-semibold'>Company</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Careers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className='mb-4 text-sm font-semibold'>Legal</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='#'
                                        className='text-muted-foreground hover:text-foreground'
                                    >
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <p className='text-sm text-muted-foreground'>
                            &copy; {new Date().getFullYear()} Codeasy. All rights reserved.
                        </p>
                        <div className='mt-4 flex items-center space-x-4 md:mt-0'>
                            <Link href='#' className='text-muted-foreground hover:text-foreground'>
                                <svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
                                    <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'></path>
                                </svg>
                            </Link>
                            <Link href='#' className='text-muted-foreground hover:text-foreground'>
                                <svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
                                    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'></path>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
