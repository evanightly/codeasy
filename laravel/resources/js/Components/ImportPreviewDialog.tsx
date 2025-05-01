import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { CourseImportPreview } from '@/Support/Interfaces/Others';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CodeIcon, FileTextIcon, FolderIcon, TableIcon } from 'lucide-react';
import { Badge } from './UI/badge';

interface ImportPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewData: CourseImportPreview | null;
    onConfirmImport: () => void;
    isLoading: boolean;
}

export const ImportPreviewDialog = ({
    open,
    onOpenChange,
    previewData,
    onConfirmImport,
    isLoading,
}: ImportPreviewDialogProps) => {
    const { t } = useLaravelReactI18n();

    if (!previewData) return null;

    const { courses, materials, questions, testCases, pdfContent, stats, isZipImport } =
        previewData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>
                        {t('pages.course.import.preview_dialog.title', {
                            defaultValue: 'Import Preview',
                        })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('pages.course.import.preview_dialog.description', {
                            defaultValue: 'Please review the data to be imported before proceeding',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue='summary' className='mt-2'>
                    <TabsList className='grid w-full grid-cols-4'>
                        <TabsTrigger value='summary'>
                            <TableIcon className='mr-2 h-4 w-4' />
                            {t('pages.course.import.preview_dialog.tabs.summary', {
                                defaultValue: 'Summary',
                            })}
                        </TabsTrigger>
                        {courses.length > 0 && (
                            <TabsTrigger value='courses'>
                                <FolderIcon className='mr-2 h-4 w-4' />
                                {t('pages.course.import.preview_dialog.tabs.courses', {
                                    defaultValue: 'Courses',
                                })}
                            </TabsTrigger>
                        )}
                        {Object.keys(pdfContent).length > 0 && (
                            <TabsTrigger value='pdf_content'>
                                <FileTextIcon className='mr-2 h-4 w-4' />
                                {t('pages.course.import.preview_dialog.tabs.pdf_content', {
                                    defaultValue: 'PDF Content',
                                })}
                            </TabsTrigger>
                        )}
                        {materials.length > 0 && (
                            <TabsTrigger value='materials'>
                                <CodeIcon className='mr-2 h-4 w-4' />
                                {t('pages.course.import.preview_dialog.tabs.materials', {
                                    defaultValue: 'Materials',
                                })}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent value='summary' className='py-4'>
                        <div className='rounded-md bg-muted p-4'>
                            <h3 className='text-lg font-semibold'>Import Summary</h3>
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className='rounded-md bg-card p-4'>
                                    <h4 className='font-medium'>Excel Content</h4>
                                    <ul className='mt-2 space-y-1'>
                                        <li className='flex items-center justify-between'>
                                            <span>
                                                {t('pages.course.import.preview_dialog.courses', {
                                                    defaultValue: 'Courses',
                                                })}
                                            </span>
                                            <span className='font-semibold'>{stats.courses}</span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span>
                                                {t('pages.course.import.preview_dialog.materials', {
                                                    defaultValue: 'Materials',
                                                })}
                                            </span>
                                            <span className='font-semibold'>{stats.materials}</span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span>
                                                {t('pages.course.import.preview_dialog.questions', {
                                                    defaultValue: 'Questions',
                                                })}
                                            </span>
                                            <span className='font-semibold'>{stats.questions}</span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span>
                                                {t(
                                                    'pages.course.import.preview_dialog.test_cases',
                                                    {
                                                        defaultValue: 'Test Cases',
                                                    },
                                                )}
                                            </span>
                                            <span className='font-semibold'>{stats.testCases}</span>
                                        </li>
                                    </ul>
                                </div>

                                {isZipImport && (
                                    <div className='rounded-md bg-card p-4'>
                                        <h4 className='font-medium'>
                                            {t('pages.course.import.preview_dialog.pdf_content', {
                                                defaultValue: 'PDF Content',
                                            })}
                                        </h4>
                                        <ul className='mt-2 space-y-1'>
                                            <li className='flex items-center justify-between'>
                                                <span>
                                                    {t(
                                                        'pages.course.import.preview_dialog.pdf_files',
                                                        {
                                                            defaultValue: 'PDF Files',
                                                        },
                                                    )}
                                                </span>
                                                <span className='font-semibold'>
                                                    {Object.keys(pdfContent).length}
                                                </span>
                                            </li>
                                            <li className='flex items-center justify-between'>
                                                <span>
                                                    {t(
                                                        'pages.course.import.preview_dialog.detected_questions',
                                                        {
                                                            defaultValue: 'Detected Questions',
                                                        },
                                                    )}
                                                </span>
                                                <span className='font-semibold'>
                                                    {stats.pdfQuestions}
                                                </span>
                                            </li>
                                            <li className='flex items-center justify-between'>
                                                <span>
                                                    {t(
                                                        'pages.course.import.preview_dialog.detected_test_cases',
                                                        {
                                                            defaultValue: 'Detected Test Cases',
                                                        },
                                                    )}
                                                </span>
                                                <span className='font-semibold'>
                                                    {stats.pdfTestCases}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Courses Tab */}
                    {courses.length > 0 && (
                        <TabsContent value='courses' className='py-4'>
                            {courses.length === 0 ? (
                                <div className='mt-2 rounded-md bg-amber-50 p-4 text-amber-800'>
                                    {t('pages.course.import.preview_dialog.no_courses', {
                                        defaultValue: 'No courses found in the import file',
                                    })}
                                </div>
                            ) : (
                                <div className='max-h-96 overflow-y-auto rounded-md border'>
                                    <table className='w-full text-left text-sm'>
                                        <thead className='sticky top-0 bg-muted'>
                                            <tr>
                                                <th className='px-4 py-2'>Name</th>
                                                <th className='px-4 py-2'>Classroom</th>
                                                <th className='px-4 py-2'>Teacher</th>
                                                <th className='px-4 py-2'>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y'>
                                            {courses.map((course, index) => (
                                                <tr key={index} className='bg-card'>
                                                    <td className='px-4 py-2 font-medium'>
                                                        {course.name}
                                                    </td>
                                                    <td className='px-4 py-2'>
                                                        {course.classroom}
                                                    </td>
                                                    <td className='px-4 py-2'>
                                                        {course.teacher_email}
                                                    </td>
                                                    <td className='max-w-xs truncate px-4 py-2'>
                                                        {course.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* PDF Content Tab */}
                    {Object.keys(pdfContent).length > 0 && (
                        <TabsContent value='pdf_content' className='py-4'>
                            {Object.keys(pdfContent).length === 0 ? (
                                <div className='mt-2 rounded-md bg-amber-50 p-4 text-amber-800'>
                                    {t('pages.course.import.preview_dialog.no_pdf_content', {
                                        defaultValue: 'No questions detected from PDF files',
                                    })}
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {Object.entries(pdfContent).map(
                                        ([filename, content], index) => (
                                            <div key={index} className='rounded-md border p-4'>
                                                <h3 className='mb-2 font-semibold'>{filename}</h3>
                                                <div className='mt-4'>
                                                    <h4 className='text-sm font-medium text-muted-foreground'>
                                                        Detected Questions:
                                                    </h4>
                                                    <ul className='mt-2 space-y-2'>
                                                        {content.questions.map(
                                                            (question, qIndex) => {
                                                                // Find test cases for this question
                                                                const questionTestCases =
                                                                    content.testCases.filter(
                                                                        (tc) =>
                                                                            tc.question_index ===
                                                                            qIndex,
                                                                    );

                                                                return (
                                                                    <li
                                                                        key={qIndex}
                                                                        className='rounded-md bg-muted p-2 text-sm'
                                                                    >
                                                                        <div className='font-medium'>
                                                                            {question.title}
                                                                        </div>
                                                                        <div className='mt-1 text-muted-foreground'>
                                                                            {question.description}
                                                                        </div>

                                                                        {/* Show test cases for this question */}
                                                                        {questionTestCases.length >
                                                                            0 && (
                                                                            <div className='mt-3'>
                                                                                <div className='text-xs font-medium'>
                                                                                    Test Cases:
                                                                                </div>
                                                                                <ul className='mt-1 space-y-1'>
                                                                                    {questionTestCases.map(
                                                                                        (
                                                                                            testCase,
                                                                                            tcIndex,
                                                                                        ) => (
                                                                                            <li
                                                                                                key={
                                                                                                    tcIndex
                                                                                                }
                                                                                                className='rounded border border-border bg-background p-1.5 text-xs'
                                                                                            >
                                                                                                <div className='font-medium'>
                                                                                                    {
                                                                                                        testCase.description
                                                                                                    }
                                                                                                    {testCase.hidden && (
                                                                                                        <Badge
                                                                                                            variant='secondary'
                                                                                                            className='ml-2 rounded-full px-1.5 py-0.5 text-[10px]'
                                                                                                        >
                                                                                                            Hidden
                                                                                                        </Badge>
                                                                                                    )}
                                                                                                </div>
                                                                                                {testCase.input && (
                                                                                                    <div className='mt-1 font-mono text-[10px] text-muted-foreground'>
                                                                                                        {
                                                                                                            testCase.input
                                                                                                        }
                                                                                                    </div>
                                                                                                )}
                                                                                            </li>
                                                                                        ),
                                                                                    )}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                );
                                                            },
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* Materials Tab */}
                    {materials.length > 0 && (
                        <TabsContent value='materials' className='py-4'>
                            {materials.length === 0 ? (
                                <div className='mt-2 rounded-md bg-amber-50 p-4 text-amber-800'>
                                    {t('pages.course.import.preview_dialog.no_materials', {
                                        defaultValue: 'No materials found in the import file',
                                    })}
                                </div>
                            ) : (
                                <div className='max-h-96 overflow-y-auto rounded-md border'>
                                    <table className='w-full text-left text-sm'>
                                        <thead className='sticky top-0 bg-muted'>
                                            <tr>
                                                <th className='px-4 py-2'>Course</th>
                                                <th className='px-4 py-2'>Title</th>
                                                <th className='px-4 py-2'>Type</th>
                                                <th className='px-4 py-2'>Description</th>
                                                <th className='px-4 py-2'>File</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y'>
                                            {materials.map((material, index) => (
                                                <tr key={index} className='bg-card'>
                                                    <td className='px-4 py-2'>
                                                        {material.course_name}
                                                    </td>
                                                    <td className='px-4 py-2 font-medium'>
                                                        {material.title}
                                                    </td>
                                                    <td className='px-4 py-2'>{material.type}</td>
                                                    <td className='max-w-xs truncate px-4 py-2'>
                                                        {material.description}
                                                    </td>
                                                    <td className='px-4 py-2'>
                                                        {material.file ? material.file : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>

                <DialogFooter className='mt-4'>
                    <DialogClose asChild>
                        <Button variant='outline'>
                            {t('pages.course.import.preview_dialog.cancel', {
                                defaultValue: 'Cancel',
                            })}
                        </Button>
                    </DialogClose>
                    <Button onClick={onConfirmImport} disabled={isLoading}>
                        {isLoading
                            ? t('pages.course.import.preview_dialog.importing', {
                                  defaultValue: 'Importing...',
                              })
                            : t('pages.course.import.preview_dialog.confirm', {
                                  defaultValue: 'Import Now',
                              })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
