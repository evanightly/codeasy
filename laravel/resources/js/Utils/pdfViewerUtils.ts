/**
 * Utility functions for PDF viewing
 *
 * This module provides helper functions to extract file paths from URLs
 * and facilitate the migration from direct URL PDF viewing to base64 viewing
 * to prevent Internet Download Manager (IDM) interference.
 */

/**
 * Extract file path from storage URL
 *
 * Converts a storage URL like "/storage/learning_materials/file.pdf"
 * to a relative path like "learning_materials/file.pdf" for base64 conversion
 *
 * @param url - The storage URL
 * @returns The relative file path or null if invalid
 */
export function extractFilePathFromUrl(url: string): string | null {
    if (!url) return null;

    // Handle URLs that start with /storage/
    if (url.startsWith('/storage/')) {
        return url.replace('/storage/', '');
    }

    // Handle full URLs with domain
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        if (pathname.includes('/storage/')) {
            return pathname.split('/storage/')[1];
        }
    } catch {
        // Not a valid URL, might already be a relative path
    }

    // If it doesn't contain /storage/, assume it's already a relative path
    if (!url.includes('/storage/')) {
        return url;
    }

    return null;
}

/**
 * Check if a URL is a PDF file
 *
 * @param url - The URL to check
 * @returns True if the URL appears to be a PDF file
 */
export function isPdfUrl(url: string): boolean {
    if (!url) return false;

    // Check file extension
    const lowercaseUrl = url.toLowerCase();
    return lowercaseUrl.endsWith('.pdf') || lowercaseUrl.includes('.pdf?');
}

/**
 * Get filename from URL
 *
 * @param url - The URL to extract filename from
 * @returns The filename or null if not found
 */
export function getFilenameFromUrl(url: string): string | null {
    if (!url) return null;

    try {
        // Handle both relative and absolute URLs
        const pathname = url.startsWith('http') ? new URL(url).pathname : url;
        const segments = pathname.split('/');
        const filename = segments[segments.length - 1];

        // Remove query parameters
        return filename.split('?')[0] || null;
    } catch {
        return null;
    }
}

/**
 * Convert storage URL to base64 compatible path
 *
 * This function helps migrate existing PDFViewer usage to the enhanced version
 * by extracting the file path needed for base64 conversion
 *
 * @param fileUrl - The original file URL
 * @returns Object with filePath for base64 and original fileUrl for fallback
 */
export function convertUrlForEnhancedViewer(fileUrl: string): {
    filePath?: string;
    fileUrl: string;
    filename?: string;
} {
    const extractedPath = extractFilePathFromUrl(fileUrl);
    const extractedFilename = getFilenameFromUrl(fileUrl);

    return {
        filePath: extractedPath || undefined,
        fileUrl,
        filename: extractedFilename || undefined,
    };
}

/**
 * Migration helper type for PDFViewer props
 */
export interface MigratedPdfViewerProps {
    filePath?: string;
    fileUrl?: string;
    filename?: string;
    className?: string;
    withPagination?: boolean;
    useBase64?: boolean;
}

/**
 * Convert old PDFViewer props to enhanced PDFViewer props
 *
 * @param oldProps - Original PDFViewer props
 * @returns Enhanced PDFViewer props with base64 support
 */
export function migratePdfViewerProps(oldProps: {
    fileUrl: string;
    filename?: string;
    className?: string;
    withPagination?: boolean;
}): MigratedPdfViewerProps {
    const { filePath, fileUrl, filename } = convertUrlForEnhancedViewer(oldProps.fileUrl);

    return {
        filePath,
        fileUrl,
        filename: oldProps.filename || filename,
        className: oldProps.className,
        withPagination: oldProps.withPagination,
        useBase64: true, // Default to base64 to prevent IDM interference
    };
}
