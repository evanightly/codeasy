'use-client';
import { Button } from '@/Components/UI/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/UI/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { ny } from '@/Lib/Utils';
import { learningMaterialServiceHook } from '@/Services/learningMaterialServiceHook';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    AlertCircleIcon,
    ArrowUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    DownloadIcon,
    FileIcon,
    FileLock,
    MaximizeIcon,
    PercentIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker - use local worker first, fallback to CDN if there are MIME type issues
// MIME types are now properly set in nginx config
try {
    // Try to use local worker file first
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
    ).toString();
} catch (error) {
    // Fallback to CDN in case of issues
    console.warn('Failed to load local PDF.js worker, falling back to CDN', error);
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

// PDF Viewer constants
const MIN_ZOOM_LEVEL = 0.1; // 10%
const MAX_ZOOM_LEVEL = 3; // 300%
const ZOOM_STEP = 0.25; // 25% increment/decrement

interface PDFViewerEnhancedProps {
    /** Additional CSS classes */
    className?: string;
    /** Filename for display and download */
    filename?: string;
    /** File path for base64 conversion (relative to storage) */
    filePath?: string;
    /** File URL for direct PDF access */
    fileUrl?: string;
    /** Custom title to override the default title header */
    title?: string;
    /** Force use of base64 conversion to prevent IDM interference */
    useBase64?: boolean;
    /** Enable pagination mode (single page view) */
    withPagination?: boolean;
}

/**
 * Enhanced PDF Viewer component with base64 support
 *
 * This component can work in two modes:
 * 1. Direct URL mode (original behavior) - uses fileUrl prop
 * 2. Base64 mode (enhanced) - uses filePath prop to fetch base64 data
 *
 * Base64 mode prevents Internet Download Manager (IDM) from intercepting PDF downloads
 * by serving the PDF as base64 data instead of a direct file URL.
 *
 * Known issues:
 * - Rendering website laggy
 * - Interferes with DashboardSetTheme and DashboardSetLocalization components
 */
export const PDFViewerEnhanced = ({
    className = '',
    filename,
    filePath,
    fileUrl,
    title,
    useBase64 = true,
    withPagination,
}: PDFViewerEnhancedProps) => {
    const { t } = useLaravelReactI18n();
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [containerWidth, setContainerWidth] = useState<number>(800); // Default to 800px initially
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
    const [pdfSource, setPdfSource] = useState<string>('');
    const [zoomPresetsOpen, setZoomPresetsOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Persistent zoom level with local storage - directly use useLocalStorage for zoom
    const [zoomLevel, setZoomLevel] = useLocalStorage<number>(
        'workspace-pdf-viewer-zoom-level',
        1.0,
    );

    // Zoom presets
    const zoomPresets = [
        { value: 0.25, label: '25%' },
        { value: 0.5, label: '50%' },
        { value: 0.75, label: '75%' },
        { value: 1.0, label: '100%' },
        { value: 1.25, label: '125%' },
        { value: 1.5, label: '150%' },
        { value: 2.0, label: '200%' },
        { value: 3.0, label: '300%' },
    ];

    // Fetch PDF as base64 if filePath is provided and useBase64 is true
    const {
        data: base64Data,
        isLoading: isLoadingBase64,
        error: base64Error,
        isError: hasBase64Error,
    } = learningMaterialServiceHook.useGetPdfAsBase64(filePath && useBase64 ? filePath : '');

    // Set PDF source based on available data
    useEffect(() => {
        if (useBase64 && filePath) {
            // When using base64 mode, only set source when data is available
            if (base64Data?.data) {
                setPdfSource(base64Data.data);
            } else if (hasBase64Error) {
                // Check if the error response contains a fallback URL
                let fallbackUrl = fileUrl;

                // Try to extract fallback URL from error response
                try {
                    const errorData =
                        (base64Error as any)?.response?.data ||
                        (base64Error as any)?.data ||
                        base64Error;
                    if (errorData?.fallback_url) {
                        fallbackUrl = errorData.fallback_url;
                    }
                } catch (_e) {
                    // Ignore error parsing, use default fallback
                }

                if (fallbackUrl) {
                    // Use fallback URL if available
                    setPdfSource(fallbackUrl);
                } else {
                    // No fallback available
                    setPdfSource('');
                }
            } else {
                // Don't set source while loading base64 to prevent IDM trigger
                setPdfSource('');
            }
        } else if (fileUrl) {
            // Direct URL mode (useBase64 is false or no filePath)
            setPdfSource(fileUrl);
        } else {
            setPdfSource('');
        }
    }, [base64Data, fileUrl, filePath, useBase64, hasBase64Error, base64Error]);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                const newWidth = containerRef.current.clientWidth;
                // Ensure minimum width and account for padding/margins
                // Use a reasonable default if container width is not available yet
                setContainerWidth(newWidth > 100 ? newWidth - 60 : 800); // Account for padding and margins
            }
        };

        // Set initial width with a small delay to ensure container is rendered
        const timeoutId = setTimeout(updateWidth, 100);

        // Use ResizeObserver to detect container size changes
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        return () => {
            clearTimeout(timeoutId);
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
        const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM_LEVEL);
        setZoomLevel(newZoom);
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM_LEVEL);
        setZoomLevel(newZoom);
    };

    const handleZoomPreset = (level: number) => {
        setZoomLevel(level);
        setZoomPresetsOpen(false);
    };

    const handleFitToWidth = () => {
        // Calculate zoom level to fit width (with some padding)
        const fitLevel = (containerWidth - 40) / 600; // Assuming standard PDF width of ~600px
        const newZoom = Math.max(Math.min(fitLevel, MAX_ZOOM_LEVEL), MIN_ZOOM_LEVEL);
        setZoomLevel(newZoom);
        setZoomPresetsOpen(false);
    };

    const scrollToTop = () => {
        containerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleDownload = () => {
        if (useBase64 && base64Data?.data) {
            // Download from base64 data
            const link = document.createElement('a');
            link.href = base64Data.data;
            link.download = filename || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (fileUrl) {
            // Fallback to direct URL download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = filename || 'document.pdf';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Show loading state
    if (useBase64 && filePath && isLoadingBase64) {
        return (
            <div className={`flex flex-col ${className}`}>
                <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                    <div className='flex items-center gap-2'>
                        <FileIcon className='h-5 w-5 text-blue-600' />
                        <span className='font-medium text-gray-700'>
                            {title || filename || t('components.pdf_viewer.document')}
                        </span>
                    </div>
                </div>
                <div className='relative h-[700px] overflow-auto border border-gray-200 bg-white'>
                    <div className='absolute inset-0 flex h-full items-center justify-center bg-white/80'>
                        <div className='flex flex-col items-center gap-3'>
                            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                            <span className='text-sm text-gray-600'>
                                {t('components.pdf_viewer.loading_secure')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (useBase64 && filePath && hasBase64Error) {
        // Extract error details for better user experience
        let errorMessage = t('components.pdf_viewer.error_loading');
        let errorDetails = base64Error?.message || t('components.pdf_viewer.error_generic');
        let isLargeFile = false;
        let fileSize = '';

        try {
            const errorData =
                (base64Error as any)?.response?.data || (base64Error as any)?.data || base64Error;

            if (errorData?.reason === 'file_too_large') {
                isLargeFile = true;
                errorMessage = t('components.pdf_viewer.file_too_large');
                fileSize = errorData.file_size_mb ? `${errorData.file_size_mb}MB` : '';
            } else if (errorData?.reason === 'insufficient_memory') {
                errorMessage = t('components.pdf_viewer.insufficient_memory');
                fileSize = errorData.file_size_mb ? `${errorData.file_size_mb}MB` : '';
            }

            if (errorData?.message) {
                errorDetails = errorData.message;
            }
        } catch (_e) {
            // Use default error messages
        }

        return (
            <div className={`flex flex-col ${className}`}>
                <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                    <div className='flex items-center gap-2'>
                        <FileIcon className='h-5 w-5 text-orange-600' />
                        <span className='font-medium text-gray-700'>
                            {title || filename || t('components.pdf_viewer.document')}
                        </span>
                        {fileSize && (
                            <span className='rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700'>
                                {fileSize}
                            </span>
                        )}
                    </div>
                </div>
                <div className='relative h-[700px] overflow-auto border border-gray-200 bg-white'>
                    <div className='absolute inset-0 flex h-full items-center justify-center bg-white/80'>
                        <div className='flex max-w-md flex-col items-center gap-3 text-center'>
                            {isLargeFile ? (
                                <FileIcon className='h-12 w-12 text-orange-500' />
                            ) : (
                                <AlertCircleIcon className='h-12 w-12 text-red-500' />
                            )}
                            <span
                                className={`text-sm font-medium ${isLargeFile ? 'text-orange-600' : 'text-red-600'}`}
                            >
                                {errorMessage}
                            </span>
                            <span className='text-xs text-gray-500'>{errorDetails}</span>
                            {isLargeFile && (
                                <div className='mt-2 rounded-lg bg-orange-50 p-3 text-xs text-orange-700'>
                                    <p className='mb-1 font-medium'>
                                        {t('components.pdf_viewer.large_file_notice')}
                                    </p>
                                    <p>{t('components.pdf_viewer.large_file_explanation')}</p>
                                </div>
                            )}
                            {pdfSource && (
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => window.open(pdfSource, '_blank')}
                                    className='mt-2'
                                >
                                    {t('components.pdf_viewer.view_document')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render if no PDF source is available (but distinguish from loading state)
    if (!pdfSource) {
        // If we're using base64 mode and still loading, show the loading state instead
        if (useBase64 && filePath && isLoadingBase64) {
            return (
                <div className={`flex flex-col ${className}`}>
                    <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                        <div className='flex items-center gap-2'>
                            <FileIcon className='h-5 w-5 text-blue-600' />
                            <span className='font-medium text-gray-700'>
                                {title || filename || t('components.pdf_viewer.document')}
                            </span>
                        </div>
                    </div>
                    <div className='relative h-[700px] overflow-auto border border-gray-200 bg-white'>
                        <div className='absolute inset-0 flex h-full items-center justify-center bg-white/80'>
                            <div className='flex flex-col items-center gap-3'>
                                <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                                <span className='text-sm text-gray-600'>
                                    {t('components.pdf_viewer.loading_secure')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // True "no source" state
        return (
            <div className={`flex flex-col ${className}`}>
                <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                    <div className='flex items-center gap-2'>
                        <FileIcon className='h-5 w-5 text-gray-400' />
                        <span className='font-medium text-gray-700'>
                            {title || filename || t('components.pdf_viewer.document')}
                        </span>
                    </div>
                </div>
                <div className='relative h-[700px] overflow-auto border border-gray-200 bg-white'>
                    <div className='absolute inset-0 flex h-full items-center justify-center bg-white/80'>
                        <div className='flex flex-col items-center gap-3 text-center'>
                            <FileIcon className='h-12 w-12 text-gray-400' />
                            <span className='text-sm font-medium text-gray-600'>
                                {t('components.pdf_viewer.no_source')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${className}`}>
            <div className='flex items-center justify-between rounded-t-lg bg-gray-100 p-4'>
                <div className='flex items-center gap-2'>
                    {useBase64 && filePath ? (
                        <FileLock className='h-5 w-5 text-green-500' />
                    ) : (
                        <FileIcon className={ny('h-5 w-5 text-blue-600')} />
                    )}
                    <span className='font-medium text-gray-700'>
                        {title || filename || t('components.pdf_viewer.document')}
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    {/* Zoom controls */}
                    <div className='flex items-center gap-1'>
                        <Button
                            variant='outline'
                            type='button'
                            title={t('components.pdf_viewer.zoom_out')}
                            size='icon'
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= MIN_ZOOM_LEVEL}
                        >
                            <ZoomOutIcon />
                        </Button>

                        {/* Zoom preset dropdown using Command */}
                        <Popover open={zoomPresetsOpen} onOpenChange={setZoomPresetsOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    type='button'
                                    title={t('components.pdf_viewer.zoom_presets')}
                                    className='min-w-[80px] justify-between'
                                >
                                    <span className='text-sm font-medium'>
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <ChevronDownIcon className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[200px] p-0' align='end'>
                                <Command>
                                    <CommandInput
                                        placeholder={t('components.pdf_viewer.search_zoom')}
                                        className='h-9'
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {t('components.pdf_viewer.no_zoom_found')}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value='fit-width'
                                                onSelect={handleFitToWidth}
                                                className='cursor-pointer'
                                            >
                                                <MaximizeIcon className='mr-2 h-4 w-4' />
                                                {t('components.pdf_viewer.fit_width')}
                                            </CommandItem>
                                            {zoomPresets.map((preset) => (
                                                <CommandItem
                                                    value={preset.label}
                                                    onSelect={() => handleZoomPreset(preset.value)}
                                                    key={preset.value}
                                                    className={ny(
                                                        'cursor-pointer',
                                                        Math.abs(zoomLevel - preset.value) < 0.01 &&
                                                            'bg-accent text-accent-foreground',
                                                    )}
                                                >
                                                    <PercentIcon className='mr-2 h-4 w-4' />
                                                    {preset.label}
                                                    {Math.abs(zoomLevel - preset.value) < 0.01 && (
                                                        <span className='ml-auto text-xs'>
                                                            {t('components.pdf_viewer.current')}
                                                        </span>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant='outline'
                            type='button'
                            title={t('components.pdf_viewer.zoom_in')}
                            size='icon'
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= MAX_ZOOM_LEVEL}
                        >
                            <ZoomInIcon />
                        </Button>
                    </div>
                    <Button
                        variant='outline'
                        type='button'
                        title={t('components.pdf_viewer.download')}
                        size='icon'
                        onClick={handleDownload}
                    >
                        <DownloadIcon />
                    </Button>
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
                            <div className='flex flex-col items-center gap-3'>
                                <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                                <span className='text-sm text-gray-600'>
                                    {t('components.pdf_viewer.rendering')}
                                </span>
                            </div>
                        </div>
                    }
                    file={pdfSource}
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
