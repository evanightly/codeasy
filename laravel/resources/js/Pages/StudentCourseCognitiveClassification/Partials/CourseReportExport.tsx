import { Button } from '@/Components/UI/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DownloadCloud, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface CourseReportExportProps {
    reportRef: React.RefObject<HTMLDivElement>;
    reportData: {
        total_students: number;
        level_distribution: Record<string, number>;
        classifications: Array<{
            id: number;
            classification_level: string;
            classification_score: number | string;
            user?: {
                id: number;
                name: string;
            };
        }>;
    };
    courseName: string;
    classificationType: string;
}

export function CourseReportExport({
    reportData,
    courseName,
    classificationType,
    reportRef,
}: CourseReportExportProps) {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPDF = async () => {
        if (!reportRef.current || !reportData) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher scale for better quality
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Calculate dimensions to fit the page while maintaining aspect ratio
            const imgWidth = 210; // A4 width in mm (portrait)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${courseName}_cognitive_classification_report.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToExcel = () => {
        if (!reportData) return;

        setIsExporting(true);
        try {
            // Prepare the data for Excel export
            const worksheet = XLSX.utils.json_to_sheet(
                reportData.classifications.map((c: any) => ({
                    'Student Name': c.user?.name || 'Unknown',
                    'Cognitive Level': c.classification_level,
                    Score: parseFloat(c.classification_score.toString()).toFixed(4),
                })),
            );

            // Add summary data at the beginning
            XLSX.utils.sheet_add_aoa(
                worksheet,
                [
                    ['Course Cognitive Classification Report'],
                    [`Course: ${courseName}`],
                    [`Classification Type: ${classificationType}`],
                    [`Total Students: ${reportData.total_students}`],
                    [''],
                    ['Level Distribution:'],
                    ...Object.entries(reportData.level_distribution).map(([level, count]) => [
                        level,
                        count,
                    ]),
                    [''],
                    ['Student Details:'],
                ],
                { origin: 'A1' },
            );

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Classification Report');

            // Generate Excel file
            XLSX.writeFile(workbook, `${courseName}_cognitive_classification_report.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className='flex gap-2'>
            <Button
                variant='outline'
                size='sm'
                onClick={exportToPDF}
                disabled={isExporting || !reportData}
                className='flex items-center gap-2'
            >
                <DownloadCloud className='h-4 w-4' />
                Export PDF
            </Button>
            <Button
                variant='outline'
                size='sm'
                onClick={exportToExcel}
                disabled={isExporting || !reportData}
                className='flex items-center gap-2'
            >
                <FileSpreadsheet className='h-4 w-4' />
                Export Excel
            </Button>
        </div>
    );
}
