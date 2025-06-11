import { FilePondUploader } from '@/Components/FilePondUploader';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Download, FileText, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface TestCaseImportProps {
    question: number;
    learningMaterial: number;
    course: number;
}

interface PreviewData {
    headers: string[];
    data: string[][];
    total_rows: number;
}

export const TestCaseImport = ({ question, learningMaterial, course }: TestCaseImportProps) => {
    const { t } = useLaravelReactI18n();
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);

    const downloadTemplateMutation =
        learningMaterialQuestionTestCaseServiceHook.useDownloadTemplate();
    const downloadExcelTemplateMutation =
        learningMaterialQuestionTestCaseServiceHook.useDownloadTemplate();
    const previewImportMutation = learningMaterialQuestionTestCaseServiceHook.usePreviewImport();
    const importTestCasesMutation = learningMaterialQuestionTestCaseServiceHook.useImport();

    const handleDownloadTemplate = useCallback(
        (format: 'csv' | 'xlsx' = 'csv') => {
            const mutation =
                format === 'xlsx' ? downloadExcelTemplateMutation : downloadTemplateMutation;

            toast.promise(
                mutation.mutateAsync({
                    course,
                    learningMaterial,
                    question,
                    format,
                }),
                {
                    loading: t(
                        'pages.learning_material_question_test_case.import.messages.downloading_template',
                        {
                            defaultValue: 'Downloading template...',
                        },
                    ),
                    success: t(
                        'pages.learning_material_question_test_case.import.messages.download_success',
                        {
                            defaultValue: 'Template downloaded successfully',
                        },
                    ),
                    error: t(
                        'pages.learning_material_question_test_case.import.messages.download_error',
                        {
                            defaultValue: 'Failed to download template',
                        },
                    ),
                },
            );
        },
        [
            course,
            learningMaterial,
            question,
            downloadTemplateMutation,
            downloadExcelTemplateMutation,
            t,
        ],
    );

    const handlePreview = useCallback(() => {
        if (!selectedFile) {
            toast.error(
                t('pages.learning_material_question_test_case.import.validation.file_required', {
                    defaultValue: 'Please select a file to preview',
                }),
            );
            return;
        }

        toast.promise(
            previewImportMutation.mutateAsync({
                file: selectedFile,
                course,
                learningMaterial,
                question,
            }),
            {
                loading: t(
                    'pages.learning_material_question_test_case.import.messages.previewing',
                    {
                        defaultValue: 'Analyzing import file...',
                    },
                ),
                success: (response) => {
                    console.log('Preview response:', response);

                    setPreviewData(response.data);
                    setPreviewOpen(true);
                    return t(
                        'pages.learning_material_question_test_case.import.messages.preview_success',
                        {
                            defaultValue: 'Preview loaded successfully',
                        },
                    );
                },
                error: (error) => {
                    console.error('Preview error:', error);
                    return t(
                        'pages.learning_material_question_test_case.import.messages.preview_error',
                        {
                            defaultValue: 'Failed to preview file',
                        },
                    );
                },
            },
        );
    }, [selectedFile, course, learningMaterial, question, previewImportMutation, t]);

    const handleImport = useCallback(() => {
        if (!selectedFile) return;

        toast.promise(
            importTestCasesMutation.mutateAsync({
                file: selectedFile,
                learning_material_question_id: question,
                course,
                learningMaterial,
                question,
            }),
            {
                loading: t('pages.learning_material_question_test_case.import.messages.importing', {
                    defaultValue: 'Importing test cases...',
                }),
                success: (data) => {
                    setPreviewData(null);
                    setPreviewOpen(false);
                    setSelectedFile(null);
                    setOpen(false);

                    const message =
                        data.data?.message ||
                        t(
                            'pages.learning_material_question_test_case.import.messages.import_success',
                            {
                                defaultValue: 'Test cases imported successfully',
                            },
                        );

                    return message;
                },
                error: (error) => {
                    console.error('Import error:', error);
                    return t(
                        'pages.learning_material_question_test_case.import.messages.import_error',
                        {
                            defaultValue: 'Failed to import test cases',
                        },
                    );
                },
            },
        );
    }, [selectedFile, course, learningMaterial, question, importTestCasesMutation, t]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='outline'>
                        <Upload className='mr-2 h-4 w-4' />
                        {t('pages.learning_material_question_test_case.import.buttons.import', {
                            defaultValue: 'Import Test Cases',
                        })}
                    </Button>
                </DialogTrigger>
                <DialogContent className='max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>
                            {t('pages.learning_material_question_test_case.import.title', {
                                defaultValue: 'Import Test Cases',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.learning_material_question_test_case.import.description', {
                                defaultValue:
                                    'Upload a CSV or Excel file containing test cases. Download the template first to see the required format.',
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    {!previewOpen && (
                        <div className='mt-4 space-y-4'>
                            {/* Template Download Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        {t(
                                            'pages.learning_material_question_test_case.import.template.title',
                                            {
                                                defaultValue: 'Download Template',
                                            },
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex gap-2'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleDownloadTemplate('csv')}
                                            disabled={downloadTemplateMutation.isPending}
                                        >
                                            {downloadTemplateMutation.isPending ? (
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            ) : (
                                                <Download className='mr-2 h-4 w-4' />
                                            )}
                                            {t(
                                                'pages.learning_material_question_test_case.import.buttons.download_csv',
                                                {
                                                    defaultValue: 'Download CSV Template',
                                                },
                                            )}
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleDownloadTemplate('xlsx')}
                                            disabled={downloadExcelTemplateMutation.isPending}
                                        >
                                            {downloadExcelTemplateMutation.isPending ? (
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            ) : (
                                                <FileText className='mr-2 h-4 w-4' />
                                            )}
                                            {t(
                                                'pages.learning_material_question_test_case.import.buttons.download_excel',
                                                {
                                                    defaultValue: 'Download Excel Template',
                                                },
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* File Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        {t(
                                            'pages.learning_material_question_test_case.import.upload.title',
                                            {
                                                defaultValue: 'Upload File',
                                            },
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='pt-0'>
                                    <FilePondUploader
                                        value={selectedFile}
                                        onChange={setSelectedFile}
                                        disabled={
                                            previewImportMutation.isPending ||
                                            importTestCasesMutation.isPending
                                        }
                                        acceptedFileTypes={[
                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                            'application/vnd.ms-excel',
                                            'text/csv',
                                        ]}
                                    />
                                </CardContent>
                            </Card>

                            <div className='flex justify-end gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => setOpen(false)}
                                    disabled={
                                        previewImportMutation.isPending ||
                                        importTestCasesMutation.isPending
                                    }
                                >
                                    {t(
                                        'pages.learning_material_question_test_case.import.buttons.cancel',
                                        {
                                            defaultValue: 'Cancel',
                                        },
                                    )}
                                </Button>
                                <Button
                                    onClick={handlePreview}
                                    disabled={
                                        !selectedFile ||
                                        previewImportMutation.isPending ||
                                        importTestCasesMutation.isPending
                                    }
                                >
                                    {previewImportMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <FileText className='mr-2 h-4 w-4' />
                                    )}
                                    {t(
                                        'pages.learning_material_question_test_case.import.buttons.preview',
                                        {
                                            defaultValue: 'Preview',
                                        },
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Preview Section */}
                    {previewOpen && previewData && (
                        <div className='space-y-4'>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        {t(
                                            'pages.learning_material_question_test_case.import.preview.title',
                                            {
                                                defaultValue: 'Import Preview',
                                            },
                                        )}
                                    </CardTitle>
                                    <p className='text-sm text-muted-foreground'>
                                        {t(
                                            'pages.learning_material_question_test_case.import.preview.total_rows',
                                            {
                                                defaultValue: 'Total rows: {count}',
                                                count: previewData.total_rows,
                                            },
                                        )}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className='max-h-64 overflow-auto'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {previewData.headers.map((header, index) => (
                                                        <TableHead
                                                            key={index}
                                                            className={`whitespace-nowrap ${
                                                                index === 0
                                                                    ? 'w-16 bg-muted/50 text-center font-semibold'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {header}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.data.map((row, rowIndex) => (
                                                    <TableRow key={rowIndex}>
                                                        {row.map((cell, cellIndex) => (
                                                            <TableCell
                                                                key={cellIndex}
                                                                className={`${
                                                                    cellIndex === 0
                                                                        ? 'w-16 bg-muted/30 text-center text-sm font-medium'
                                                                        : 'max-w-[200px] truncate'
                                                                }`}
                                                            >
                                                                {cell}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className='flex justify-end gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => setPreviewOpen(false)}
                                    disabled={importTestCasesMutation.isPending}
                                >
                                    {t(
                                        'pages.learning_material_question_test_case.import.buttons.back',
                                        {
                                            defaultValue: 'Back',
                                        },
                                    )}
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={importTestCasesMutation.isPending}
                                >
                                    {importTestCasesMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <Upload className='mr-2 h-4 w-4' />
                                    )}
                                    {t(
                                        'pages.learning_material_question_test_case.import.buttons.confirm_import',
                                        {
                                            defaultValue: 'Confirm Import',
                                        },
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TestCaseImport;
