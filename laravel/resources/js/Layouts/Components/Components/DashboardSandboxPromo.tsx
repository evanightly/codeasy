'use client';

import { buttonVariants } from '@/Components/UI/button';
import { Link } from '@inertiajs/react';
import { Sparkles, Terminal } from 'lucide-react';

export const DashboardSandboxPromo = () => {
    return (
        <div className='mt-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/60 p-4 shadow-md'>
            <div className='mb-3 flex items-center justify-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20'>
                    <Terminal className='h-6 w-6 text-white' />
                </div>
            </div>
            <div className='mb-3 text-center'>
                <h4 className='font-semibold text-white'>Python Sandbox</h4>
                <p className='text-xs text-blue-100'>
                    Try Python code with instant visualizations and feedback
                </p>
            </div>
            <Link
                href={route('sandbox.index')}
                className={buttonVariants({
                    size: 'sm',
                    className: 'flex w-full items-center justify-center gap-1',
                })}
            >
                <Sparkles className='h-3.5 w-3.5' />
                <span>Try Sandbox</span>
            </Link>
        </div>
    );
};
