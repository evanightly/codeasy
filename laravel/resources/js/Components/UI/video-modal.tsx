'use client';

import { ny } from '@/Lib/Utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

const VideoModal = DialogPrimitive.Root;

const VideoModalTrigger = DialogPrimitive.Trigger;

const VideoModalPortal = DialogPrimitive.Portal;

const VideoModalClose = DialogPrimitive.Close;

const VideoModalOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={ny(
            'fixed inset-0 z-50 backdrop-blur-xl data-[state=closed]:animate-modal-fade-out data-[state=open]:animate-modal-fade-in',
            className,
        )}
        {...props}
    />
));
VideoModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const VideoModalContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <VideoModalPortal>
        <VideoModalOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={ny(
                'fixed left-1/2 top-1/2 z-50 flex h-screen w-screen -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3',
                'transition-all data-[state=closed]:animate-modal-fade-out data-[state=open]:animate-modal-fade-in data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%]',
                className,
            )}
            {...props}
        >
            <div className='relative mx-auto flex size-full items-center justify-center rounded-2xl border border-gray-950/[.1] bg-gray-50/[.2] dark:border-gray-50/[.1] dark:bg-gray-950/[.5]'>
                {/* Mobile close button */}
                <CloseIcon isMobile />

                <div className='flex h-4/5 w-full max-w-5xl gap-6'>
                    {/* Desktop close button */}
                    <CloseIcon />
                    <div className='flex w-full flex-col max-lg:p-4 max-lg:text-center'>
                        {children}
                    </div>
                </div>
            </div>
        </DialogPrimitive.Content>
    </VideoModalPortal>
));

VideoModalContent.displayName = DialogPrimitive.Content.displayName;

const VideoModalTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={ny('mb-4 text-4xl font-bold text-gray-950 dark:text-gray-50', className)}
        {...props}
    />
));
VideoModalTitle.displayName = DialogPrimitive.Title.displayName;

const VideoModalDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={ny('mb-6 text-xl text-gray-950/80 dark:text-gray-50/70', className)}
        {...props}
    />
));
VideoModalDescription.displayName = DialogPrimitive.Description.displayName;

const VideoPreview = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={ny(
                'absolute inset-0 z-10 transition-opacity duration-500 group-[.playing]:pointer-events-none group-[.playing]:opacity-0',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    ),
);
VideoPreview.displayName = 'VideoPreview';

const VideoPlayButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={ny(
                'absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 group-[.playing]:pointer-events-none group-[.playing]:opacity-0',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    ),
);
VideoPlayButton.displayName = 'VideoPlayButton';

const VideoPlayer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const [isPlaying, setIsPlaying] = React.useState(false);

        return (
            <div
                ref={ref}
                onClick={() => setIsPlaying(true)}
                className={ny(
                    'group relative aspect-video max-w-4xl overflow-hidden rounded-xl border border-gray-950/[.1] object-cover dark:border-gray-50/[.1]',
                    isPlaying && 'playing',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    },
);
VideoPlayer.displayName = 'VideoPlayer';

const VideoModalVideo = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={ny(
                'aspect-video max-w-4xl overflow-hidden rounded-xl border border-gray-950/[.1] object-cover shadow-xl dark:border-gray-50/[.1]',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    ),
);
VideoModalVideo.displayName = 'VideoModalVideo';

const CloseIcon = React.forwardRef<
    React.ElementRef<typeof VideoModalClose>,
    React.ComponentPropsWithoutRef<typeof VideoModalClose> & {
        isMobile?: boolean;
    }
>(({ className, isMobile = false, ...props }, ref) => (
    <VideoModalClose
        ref={ref}
        className={ny(
            'rounded-full border border-gray-950/[.1] bg-gray-950/[.01] p-2 transition duration-300 hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
            isMobile ? 'absolute right-4 top-4 lg:hidden' : 'hidden self-start lg:block',
            className,
        )}
        {...props}
    >
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='12'
            viewBox='0 0 12 12'
            height='12'
            fill='none'
        >
            <path
                strokeWidth='1.5'
                strokeLinejoin='round'
                strokeLinecap='round'
                d='M1 1L11 11M11 1L1 11'
                className='stroke-current'
            ></path>
        </svg>
        <span className='sr-only'>Close</span>
    </VideoModalClose>
));

CloseIcon.displayName = 'CloseIcon';

export {
    VideoModal,
    VideoModalContent,
    VideoModalDescription,
    VideoModalTitle,
    VideoModalTrigger,
    VideoModalVideo,
    VideoPlayButton,
    VideoPlayer,
    VideoPreview,
};
