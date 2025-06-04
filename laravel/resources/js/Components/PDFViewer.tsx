'use-client';
import { PDFViewerEnhanced } from '@/Components/PDFViewerEnhanced';
import { extractFilePathFromUrl } from '@/Utils/pdfViewerUtils';

interface PDFViewerProps {
    className?: string;
    filename?: string;
    fileUrl: string;
    title?: string;
    withPagination?: boolean;
}

/**
 * Legacy PDF Viewer component (backward compatibility wrapper)
 *
 * This component maintains backward compatibility with existing code
 * while internally using the enhanced PDF viewer with base64 support
 * to prevent Internet Download Manager (IDM) interference.
 *
 * Known issues:
 * - Rendering website laggy
 * - Interferes with DashboardSetTheme and DashboardSetLocalization components
 */
export const PDFViewer = ({
    className = '',
    filename,
    fileUrl,
    title,
    withPagination,
}: PDFViewerProps) => {
    // Extract file path for base64 conversion
    const filePath = extractFilePathFromUrl(fileUrl);

    return (
        <PDFViewerEnhanced
            {...{
                className,
                filename,
                filePath: filePath || undefined,
                fileUrl,
                title,
                useBase64: true,
                withPagination,
            }}
        />
    );
};
