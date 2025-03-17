'use-client';
import { Button } from '@/Components/UI/button';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    ArrowUpIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    DownloadIcon,
    FileIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Match the local pdfjs-dist version (4.8.69):
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// PDF Viewer constants
const MIN_ZOOM_LEVEL = 0.1; // 10%
const MAX_ZOOM_LEVEL = 1; // 300%
const ZOOM_STEP = 0.25; // 25% increment/decrement

interface PDFViewerProps {
    fileUrl: string;
    filename?: string;
    className?: string;
    withPagination?: boolean;
}

/**
 * PDF Viewer component
 *
 * Known issues:
 * - Rendering website laggy
 * - Interferes with DashboardSetTheme and DashboardSetLocalization components
 */
export const PDFViewer = ({
    fileUrl,
    filename,
    className = '',
    withPagination,
}: PDFViewerProps) => {
    const { t } = useLaravelReactI18n();
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [zoomLevel, setZoomLevel] = useState<number>(0.75); // 1 = 100% zoom
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        // Set initial width
        updateWidth();

        // Use ResizeObserver to detect container size changes
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShowScrollTop(container.scrollTop > 300);
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function onDocumentLoadSuccess(pdf: any) {
        setNumPages(pdf.numPages);
    }

    const handleFirstPage = () => {
        setPageNumber(1);
    };

    const handlePrevPage = () => {
        setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setPageNumber((prev) => (prev < (numPages || 1) ? prev + 1 : prev));
    };

    const handleLastPage = () => {
        setPageNumber(numPages || 1);
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM_LEVEL));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM_LEVEL));
    };

    const scrollToTop = () => {
        containerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                <div className='flex items-center gap-2'>
                    <FileIcon className='h-5 w-5 text-blue-600' />
                    <span className='font-medium text-gray-700'>
                        {filename || t('components.pdf_viewer.document')}
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    {/* Zoom controls */}
                    <div className='mr-4 flex items-center gap-1'>
                        <Button
                            variant='outline'
                            type='button'
                            size='icon'
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= MIN_ZOOM_LEVEL}
                        >
                            <ZoomOutIcon />
                        </Button>
                        <span className='w-16 text-center text-sm font-medium text-gray-700'>
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <Button
                            variant='outline'
                            type='button'
                            size='icon'
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= MAX_ZOOM_LEVEL}
                        >
                            <ZoomInIcon />
                        </Button>
                    </div>
                    <a target='_blank' rel='noopener noreferrer' href={fileUrl} download>
                        <Button variant='outline' type='button' size='icon'>
                            <DownloadIcon />
                        </Button>
                    </a>
                </div>
            </div>

            <div
                ref={containerRef}
                className='relative h-[700px] overflow-auto border border-gray-200 bg-white'
            >
                <Document
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className='absolute inset-0 flex h-[500px] items-center justify-center bg-white/80'>
                            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                        </div>
                    }
                    file={fileUrl}
                    className='flex flex-col items-center'
                >
                    {withPagination ? (
                        <Page
                            width={containerWidth * zoomLevel}
                            pageNumber={pageNumber}
                            className='max-w-full'
                        />
                    ) : (
                        [...Array(numPages)]
                            .map((_, i) => i + 1)
                            .map((page) => (
                                <div
                                    key={page}
                                    className='relative my-8 flex w-full flex-col items-center first:mt-4 last:mb-4'
                                >
                                    <div className='sticky top-0 z-10 flex w-full justify-center pb-3 pt-2'>
                                        <span className='rounded-full bg-gray-100/90 px-4 py-1 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm'>
                                            {t('components.pdf_viewer.page')} {page}
                                        </span>
                                    </div>
                                    <div className='shadow-md'>
                                        <Page
                                            width={containerWidth * zoomLevel}
                                            pageNumber={page}
                                            className='max-w-full'
                                        />
                                    </div>
                                    <div className='mt-8 w-full border-b border-gray-200'></div>
                                </div>
                            ))
                    )}
                </Document>

                {/* Return to top button - repositioned for visibility */}
                {showScrollTop && (
                    <div className='sticky bottom-24 z-40 float-right mr-6 transition-all duration-300 ease-in-out'>
                        <Button
                            type='button'
                            title={t('action.back_to_top')}
                            size='icon'
                            onClick={scrollToTop}
                            className='h-10 w-10 rounded-full shadow-lg hover:shadow-xl'
                        >
                            <ArrowUpIcon className='h-5 w-5' />
                        </Button>
                    </div>
                )}

                {withPagination && numPages && (
                    <div className='sticky bottom-0 flex items-center justify-center gap-2 border-t bg-white/90 py-3 backdrop-blur'>
                        <Button
                            variant='outline'
                            type='button'
                            size='sm'
                            onClick={handleFirstPage}
                            disabled={pageNumber <= 1}
                        >
                            <ChevronsLeftIcon className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            size='sm'
                            onClick={handlePrevPage}
                            disabled={pageNumber <= 1}
                        >
                            <ChevronLeftIcon className='h-4 w-4' />
                        </Button>
                        <span className='mx-2 text-sm font-medium'>
                            {pageNumber} / {numPages}
                        </span>
                        <Button
                            variant='outline'
                            type='button'
                            size='sm'
                            onClick={handleNextPage}
                            disabled={pageNumber >= numPages}
                        >
                            <ChevronRightIcon className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            size='sm'
                            onClick={handleLastPage}
                            disabled={pageNumber >= numPages}
                        >
                            <ChevronsRightIcon className='h-4 w-4' />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
