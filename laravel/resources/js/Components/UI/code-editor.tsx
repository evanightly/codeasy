'use client';

import { ny } from '@/Lib/Utils';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // You can choose a different theme
import { useEffect, useState } from 'react';

interface CodeEditorProps {
    code: string;
    language?: string;
    typingSpeed?: number;
    className?: string;
    lineNumbers?: boolean;
    animate?: boolean;
}

export function CodeEditor({
    code,
    language = 'python',
    typingSpeed = 30,
    className,
    lineNumbers = true,
    animate = true,
}: CodeEditorProps) {
    const [displayedCode, setDisplayedCode] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(!animate);

    // Typing animation effect
    useEffect(() => {
        if (!animate) {
            setDisplayedCode(code);
            setIsTypingComplete(true);
            return;
        }

        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedCode(code.substring(0, i));
            i++;

            if (i > code.length) {
                clearInterval(intervalId);
                setIsTypingComplete(true);
            }
        }, typingSpeed);

        return () => clearInterval(intervalId);
    }, [code, animate, typingSpeed]);

    // Apply syntax highlighting after the code changes
    useEffect(() => {
        if (displayedCode) {
            Prism.highlightAll();
        }
    }, [displayedCode, isTypingComplete]);

    // Handle line numbers
    const codeLines = displayedCode.split('\n');
    const lineNumbersArray = Array.from({ length: codeLines.length }, (_, i) => i + 1);

    return (
        <div className={ny('relative font-mono text-sm', className)}>
            <pre
                className={ny(
                    'm-0 overflow-x-auto rounded-md p-0',
                    lineNumbers ? 'pl-12' : '',
                    'relative',
                )}
            >
                {/* Line numbers */}
                {lineNumbers && (
                    <div className='absolute bottom-0 left-0 top-0 w-8 select-none border-r border-gray-700/30 bg-gray-800/20 px-2 py-4 text-right text-gray-500'>
                        {lineNumbersArray.map((number) => (
                            <div key={number} className='leading-5'>
                                {number}
                            </div>
                        ))}
                    </div>
                )}

                {/* Code with syntax highlighting */}
                <code className={`language-${language} block py-4 leading-5`}>
                    {displayedCode || ' '}
                </code>
            </pre>

            {/* Optional cursor - improve positioning */}
            {!isTypingComplete && (
                <span
                    style={{
                        top: `${Math.floor(codeLines.length - 1) * 20 + 16}px`,
                        left: `${(codeLines[codeLines.length - 1]?.length || 0) * 7.8 + (lineNumbers ? 50 : 10)}px`,
                    }}
                    className='animate-blink absolute inline-block h-5 w-1 bg-primary/70'
                ></span>
            )}
        </div>
    );
}

export default CodeEditor;
