import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportOptions {
    filename?: string;
    title?: string;
    subtitle?: string;
    margin?: number;
    format?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
    quality?: number;
}

interface OutputItem {
    type: 'text' | 'image' | 'error' | 'input' | 'test_stats';
    content?: string;
    error_type?: string;
    error_msg?: string;
}

/**
 * Export code execution output to PDF
 */
export const exportOutputToPDF = async (
    code: string,
    output: OutputItem[],
    options: PDFExportOptions = {},
): Promise<void> => {
    const {
        filename = 'code-execution-output',
        title = 'Code Execution Output',
        subtitle = 'Generated Output Report',
        margin = 20,
        format = 'a4',
        orientation = 'portrait',
        quality: _quality = 1.0,
    } = options;

    try {
        // Add some validation
        if (!code || code.trim() === '') {
            throw new Error('Code content is required for PDF export');
        }

        if (!Array.isArray(output)) {
            throw new Error('Output must be an array');
        }

        // Create PDF instance
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - 2 * margin;
        let currentY = margin;

        // Add title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 10;

        // Add subtitle and timestamp
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, margin, currentY);
        currentY += 6;
        pdf.setFontSize(10);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, currentY);
        currentY += 15;

        // Add code section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Source Code:', margin, currentY);
        currentY += 8;

        // Add code with background
        pdf.setFontSize(9);
        pdf.setFont('courier', 'normal');
        pdf.setFillColor(248, 249, 250); // Light gray background

        const codeLines = code.split('\n');
        const lineHeight = 4;
        const maxLinesPerPage = Math.floor((pageHeight - currentY - margin) / lineHeight);

        const codeBoxHeight = Math.min(
            codeLines.length * lineHeight + 6,
            maxLinesPerPage * lineHeight + 6,
        );
        pdf.rect(margin, currentY - 2, contentWidth, codeBoxHeight, 'F');

        codeLines.forEach((line) => {
            if (currentY + lineHeight > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
            }

            // Wrap long lines
            const maxCharsPerLine = Math.floor(contentWidth * 2.5); // Approximate characters per line
            if (line.length > maxCharsPerLine) {
                const wrappedLines = [];
                for (let i = 0; i < line.length; i += maxCharsPerLine) {
                    wrappedLines.push(line.substring(i, i + maxCharsPerLine));
                }
                wrappedLines.forEach((wrappedLine) => {
                    pdf.text(wrappedLine, margin + 2, currentY);
                    currentY += lineHeight;
                });
            } else {
                pdf.text(line || ' ', margin + 2, currentY);
                currentY += lineHeight;
            }
        });

        currentY += 10;

        // Add output section
        if (output && output.length > 0) {
            // Check if we need a new page
            if (currentY > pageHeight - margin - 30) {
                pdf.addPage();
                currentY = margin;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Execution Output:', margin, currentY);
            currentY += 10;

            // Process each output item
            for (const [index, item] of output.entries()) {
                // Skip items with no content for certain types
                if (!item || (item.type !== 'image' && !item.content && item.type !== 'error')) {
                    continue;
                }

                // Check if we need a new page
                if (currentY > pageHeight - margin - 20) {
                    pdf.addPage();
                    currentY = margin;
                }
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');

                if (item.type === 'error') {
                    pdf.setTextColor(220, 38, 127); // Red color
                    pdf.text(
                        `Error ${index + 1}: ${item.error_type || 'Unknown Error'}`,
                        margin,
                        currentY,
                    );
                    currentY += 6;

                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(item.error_msg || 'No error message', margin + 5, currentY);
                    currentY += 6;
                } else if (item.type === 'image') {
                    pdf.setTextColor(34, 197, 94); // Green color
                    pdf.text(`Visualization ${index + 1}:`, margin, currentY);
                    currentY += 8;

                    // Handle both URL-based images and base64 data URLs
                    if (item.content) {
                        try {
                            let imageData: string;
                            let imageFormat = 'PNG';

                            // Check if it's a base64 data URL
                            if (item.content.startsWith('data:image/')) {
                                imageData = item.content;
                                // Detect format from data URL
                                if (
                                    item.content.includes('data:image/jpeg') ||
                                    item.content.includes('data:image/jpg')
                                ) {
                                    imageFormat = 'JPEG';
                                } else if (item.content.includes('data:image/png')) {
                                    imageFormat = 'PNG';
                                } else if (item.content.includes('data:image/webp')) {
                                    imageFormat = 'WEBP';
                                }
                            } else if (
                                item.content.startsWith('http://') ||
                                item.content.startsWith('https://')
                            ) {
                                // Fetch the image from URL and convert to base64
                                try {
                                    const response = await fetch(item.content);
                                    if (!response.ok) {
                                        throw new Error(
                                            `Failed to fetch image: ${response.status}`,
                                        );
                                    }

                                    const blob = await response.blob();
                                    const base64 = await new Promise<string>((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = () => resolve(reader.result as string);
                                        reader.onerror = reject;
                                        reader.readAsDataURL(blob);
                                    });

                                    imageData = base64;

                                    // Detect format from URL or blob type
                                    if (
                                        item.content.includes('.jpg') ||
                                        item.content.includes('.jpeg') ||
                                        blob.type.includes('jpeg')
                                    ) {
                                        imageFormat = 'JPEG';
                                    } else if (
                                        item.content.includes('.png') ||
                                        blob.type.includes('png')
                                    ) {
                                        imageFormat = 'PNG';
                                    } else if (
                                        item.content.includes('.webp') ||
                                        blob.type.includes('webp')
                                    ) {
                                        imageFormat = 'WEBP';
                                    }
                                } catch (fetchError) {
                                    console.warn('Failed to fetch image from URL:', fetchError);
                                    throw new Error('Could not fetch image from URL');
                                }
                            } else {
                                throw new Error('Invalid image content format');
                            }

                            // Calculate image dimensions to fit within page while maintaining aspect ratio
                            const maxImageWidth = contentWidth - 10; // Leave some margin
                            const maxImageHeight = 150; // Maximum height in mm

                            // Create a temporary image to get actual dimensions
                            const tempImg = new Image();
                            await new Promise<void>((resolve, reject) => {
                                tempImg.onload = () => resolve();
                                tempImg.onerror = () => reject(new Error('Failed to load image'));
                                tempImg.src = imageData;
                            });

                            // Calculate aspect ratio and final dimensions
                            const aspectRatio = tempImg.width / tempImg.height;
                            let finalWidth = maxImageWidth;
                            let finalHeight = finalWidth / aspectRatio;

                            // If height exceeds maximum, scale based on height instead
                            if (finalHeight > maxImageHeight) {
                                finalHeight = maxImageHeight;
                                finalWidth = finalHeight * aspectRatio;
                            }

                            // Check if we need a new page for the image
                            if (currentY + finalHeight > pageHeight - margin - 20) {
                                pdf.addPage();
                                currentY = margin;
                                // Recalculate available height on new page
                                const availableHeight = pageHeight - currentY - margin - 20;
                                if (finalHeight > availableHeight) {
                                    finalHeight = availableHeight;
                                    finalWidth = finalHeight * aspectRatio;
                                }
                            }

                            // Add the image to PDF with calculated dimensions
                            try {
                                pdf.addImage(
                                    imageData,
                                    imageFormat,
                                    margin + 5,
                                    currentY,
                                    finalWidth,
                                    finalHeight,
                                    undefined, // alias
                                    'FAST', // compression
                                );

                                // Move cursor down past the image with some spacing
                                currentY += finalHeight + 10;
                            } catch (_error) {
                                // If image fails to embed, add error message
                                pdf.text(
                                    '[Image failed to embed - please check original output]',
                                    margin + 5,
                                    currentY,
                                );
                                currentY += 15;
                            }
                        } catch (imageError) {
                            console.warn('Failed to embed image in PDF:', imageError);
                            // Fallback to placeholder text
                            pdf.setTextColor(100, 100, 100);
                            pdf.setFont('helvetica', 'italic');
                            pdf.text(
                                '[Image could not be embedded - View in original output]',
                                margin + 5,
                                currentY,
                            );
                            currentY += 6;
                        }
                    } else {
                        // Fallback for missing content
                        pdf.setTextColor(100, 100, 100);
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(
                            '[Image/Visualization - View in original output]',
                            margin + 5,
                            currentY,
                        );
                        currentY += 6;
                    }
                } else if (item.type === 'test_stats') {
                    pdf.setTextColor(59, 130, 246); // Blue color
                    pdf.text(`Test Results ${index + 1}:`, margin, currentY);
                    currentY += 6;

                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont('courier', 'normal');
                    pdf.setFontSize(8);

                    const testLines = (item.content || '').split('\n');
                    testLines.forEach((line) => {
                        if (currentY > pageHeight - margin - 5) {
                            pdf.addPage();
                            currentY = margin;
                        }
                        pdf.text(line || ' ', margin + 5, currentY);
                        currentY += 3.5;
                    });
                } else {
                    pdf.setTextColor(75, 85, 99); // Gray color
                    pdf.text(`Output ${index + 1}:`, margin, currentY);
                    currentY += 6;

                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont('courier', 'normal');
                    pdf.setFontSize(8);

                    const outputLines = (item.content || '').split('\n');
                    outputLines.forEach((line) => {
                        if (currentY > pageHeight - margin - 5) {
                            pdf.addPage();
                            currentY = margin;
                        }
                        // Handle long lines
                        const maxCharsPerLine = Math.floor(contentWidth * 3);
                        if (line.length > maxCharsPerLine) {
                            for (let i = 0; i < line.length; i += maxCharsPerLine) {
                                const segment = line.substring(i, i + maxCharsPerLine);
                                pdf.text(segment, margin + 5, currentY);
                                currentY += 3.5;
                                if (currentY > pageHeight - margin - 5) {
                                    pdf.addPage();
                                    currentY = margin;
                                }
                            }
                        } else {
                            pdf.text(line || ' ', margin + 5, currentY);
                            currentY += 3.5;
                        }
                    });
                }

                currentY += 5; // Space between output items
                pdf.setTextColor(0, 0, 0); // Reset color
            }
        } else {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            pdf.text('No output generated', margin, currentY);
        }

        // Add footer
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        }

        // Save the PDF
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        pdf.save(`${filename}_${timestamp}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};

/**
 * Export element content to PDF using html2canvas
 */
export const exportElementToPDF = async (
    elementId: string,
    options: PDFExportOptions = {},
): Promise<void> => {
    const {
        filename = 'exported-content',
        format = 'a4',
        orientation = 'portrait',
        quality = 1.0,
    } = options;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with ID "${elementId}" not found`);
        }

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: quality,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        // Create PDF
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate dimensions to fit the page
        const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);
        const width = canvasWidth * ratio;
        const height = canvasHeight * ratio;

        // Center the image on the page
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, width, height);

        // Save the PDF
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        pdf.save(`${filename}_${timestamp}.pdf`);
    } catch (error) {
        console.error('Error generating PDF from element:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};
