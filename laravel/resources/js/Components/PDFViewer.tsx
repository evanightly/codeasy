import { Button } from '@/Components/UI/button';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DownloadIcon, FileIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PDFViewerProps {
    fileUrl: string;
    filename?: string;
    className?: string;
}

// Simplified PDF viewer that uses an iframe - most reliable method
export const PDFViewer = ({ fileUrl, filename, className = '' }: PDFViewerProps) => {
    const { t } = useLaravelReactI18n();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            // If still loading after 2 seconds, assume the iframe loaded
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Add a data attribute to help prevent IDM interception
    const iframeUrl = `${fileUrl}#toolbar=0&navpanes=0&idm=no`;

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
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={fileUrl}
                        className='text-sm text-gray-700 hover:text-blue-600'
                    >
                        {t('components.pdf_viewer.open_in_new_tab')}
                    </a>
                    <a target='_blank' rel='noopener noreferrer' href={fileUrl} download>
                        <Button variant='outline' type='button' size='sm'>
                            <DownloadIcon className='h-4 w-4' />
                        </Button>
                    </a>
                </div>
            </div>

            <div className='relative border border-gray-200 bg-white'>
                {loading && (
                    <div className='absolute inset-0 flex h-[500px] items-center justify-center bg-white/80'>
                        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                    </div>
                )}

                <iframe
                    title={filename || 'PDF Document'}
                    src={iframeUrl}
                    onLoad={() => setLoading(false)}
                    className='h-[500px] w-full'
                />
            </div>
        </div>
    );
};
