import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { Wrench } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './UI/button';

export const CustomTanstackQueryDevtools = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [panelHeight, setPanelHeight] = useState(50); // Height as percentage
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // Setup drag handlers
    const handleDragStart = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            isDraggingRef.current = true;
            startYRef.current = e.clientY;
            startHeightRef.current = panelHeight;
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection during drag

            // Add event listeners for drag and release
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        },
        [panelHeight],
    );

    // Handle drag movement
    const handleDragMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        // Calculate how far the mouse has moved
        const deltaY = startYRef.current - e.clientY;

        // Calculate new height as a percentage (moving up increases height)
        const newHeight = Math.min(
            90,
            Math.max(20, startHeightRef.current + (deltaY / window.innerHeight) * 100),
        );

        setPanelHeight(newHeight);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Clean up event listeners
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    }, [handleDragMove]);

    // Clean up event listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [handleDragMove, handleDragEnd]);

    return (
        <>
            <Button size='icon' onClick={() => setIsOpen(!isOpen)}>
                <Wrench />
            </Button>
            {isOpen && (
                <>
                    <div
                        style={{
                            bottom: `${panelHeight}%`,
                        }}
                        onMouseDown={handleDragStart}
                        className='fixed left-0 right-0 z-[10000] flex h-3 cursor-ns-resize items-center justify-center border-t-primary bg-background transition-colors hover:bg-primary/10'
                    >
                        <div className='h-1 w-10 rounded-full bg-primary' />
                    </div>
                    <ReactQueryDevtoolsPanel
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            right: 0,
                            width: '100%',
                            height: `${panelHeight}%`,
                            zIndex: 9999,
                        }}
                        onClose={() => setIsOpen(false)}
                    />
                </>
            )}
        </>
    );
};
