/**
 * TODO: Refactor the view material dialog for web and mobile sheet
 */

import CodeEditor from '@/Components/CodeEditor';
import { PDFViewer } from '@/Components/PDFViewer';
import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Badge } from '@/Components/UI/badge';
import { Button, buttonVariants } from '@/Components/UI/button';
import { Card, CardContent } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { Progress } from '@/Components/UI/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/Components/UI/resizable';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/UI/sheet';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { ProgrammingLanguageEnum } from '@/Support/Enums/programmingLanguageEnum';
import { FastApiOutput } from '@/Support/Interfaces/Others';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { Link, router } from '@inertiajs/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Check,
    Columns2,
    Columns3,
    FileQuestion,
    FileTextIcon,
    Loader2,
    Redo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface TrackingInfo {
    score_id: number;
    current_time: number;
    completion_status: boolean;
    trial_status: boolean;
    started_at: number;
}

interface NavigationInfo {
    next: { id: number; title: string; can_proceed: boolean } | null;
    previous: { id: number; title: string } | null;
}

interface Props {
    course: {
        data: CourseResource;
    };
    material: {
        data: LearningMaterialResource;
    };
    question: {
        data: LearningMaterialQuestionResource;
    };
    testCases: LearningMaterialQuestionTestCaseResource[];
    tracking: TrackingInfo;
    latestCode: string | null;
    navigation: NavigationInfo;
    nextMaterial?: {
        id: number;
        title: string;
        first_question_id?: number;
    };
}

export default function Workspace({
    course,
    material,
    question,
    testCases,
    tracking: initialTracking,
    latestCode,
    navigation: initialNavigation,
    nextMaterial,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [code, setCode] = useState(latestCode || '');
    const [isCompiling, setIsCompiling] = useState(false);
    const [output, setOutput] = useState<FastApiOutput[]>([]);
    const [tracking, setTracking] = useState(initialTracking);
    const [navigation, setNavigation] = useState(initialNavigation);
    const [timeSpent, setTimeSpent] = useState(initialTracking.current_time);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(Date.now());
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [layoutMode, setLayoutMode] = useLocalStorage<'stacked' | 'side-by-side'>(
        'code-editor-view',
        'stacked',
    );

    // Function to format seconds into readable time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const secs = seconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle code changes
    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    // Handle code execution/compilation
    const handleRunCode = async () => {
        if (isCompiling) return;

        setIsCompiling(true);
        try {
            // TODO: implement using service hooks
            const response = await axios.post(route('student.questions.execute'), {
                student_score_id: tracking.score_id,
                code: code,
            });

            setOutput(response.data.output || []);

            // Check for completion status
            if (response.data.success) {
                // Update the local tracking state to reflect completion
                setTracking((prev) => ({
                    ...prev,
                    completion_status: true,
                }));

                // Enable the next button
                if (navigation.next) {
                    setNavigation((prev) => ({
                        ...prev,
                        next: prev.next ? { ...prev.next, can_proceed: true } : null,
                    }));
                }

                // Enable Next Material button if this is the last question
                if (!navigation.next && nextMaterial) {
                    setNavigation((prev) => ({
                        ...prev,
                        next: { id: nextMaterial.id, title: nextMaterial.title, can_proceed: true },
                    }));
                }

                toast.success(t('pages.student_questions.workspace.success.description'));
            }
        } catch (error) {
            console.error('Error executing code:', error);
            toast.error(t('pages.student_questions.workspace.error.description'));
            setOutput([{ type: 'error', content: 'Failed to execute code' }]);
        } finally {
            setIsCompiling(false);
        }
    };

    // Toggle layout between stacked and side-by-side
    const toggleLayout = () => {
        setLayoutMode((prevMode) => (prevMode === 'stacked' ? 'side-by-side' : 'stacked'));
    };

    // Handle navigation to next or previous question
    const handleNavigation = (questionId: number) => {
        // Always sync time before navigating away
        syncTime().then(() => {
            router.visit(
                route(`${ROUTES.STUDENT_COURSE_MATERIAL_QUESTIONS}.show`, [
                    course.data.id,
                    material.data.id,
                    questionId,
                ]),
            );
        });
    };

    // Sync time spent on the question to the backend
    const syncTime = async () => {
        try {
            await axios.post(route('student.questions.update-time'), {
                student_score_id: tracking.score_id,
                seconds: timeSpent,
            });
            setLastSyncTime(Date.now());
            return true;
        } catch (error) {
            console.error('Failed to sync time:', error);
            return false;
        }
    };

    const getTestResultBadgeVariant = (success: number, total: number) => {
        if (success === 0) {
            return 'destructive'; // red
        } else if (success < total) {
            return 'warning'; // partial
        } else {
            return 'success'; // all passed
        }
    };

    // Set up timer and periodic syncing
    useEffect(() => {
        // Start the timer when the component mounts
        const timer = setInterval(() => {
            setTimeSpent((prev) => prev + 1);
        }, 1000);

        // Set up periodic syncing (every 30 seconds)
        const syncTimer = setInterval(() => {
            syncTime();
        }, 30000);

        // Handle keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleRunCode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Clean up timers when component unmounts
        return () => {
            clearInterval(timer);
            clearInterval(syncTimer);
            window.removeEventListener('keydown', handleKeyDown);
            syncTime(); // Final sync when leaving
        };
    }, [tracking.score_id, timeSpent]);

    // Save progress when user leaves page
    useEffect(() => {
        const handleBeforeUnload = () => {
            syncTime();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [timeSpent]);

    return (
        <AuthenticatedLayout title={question.data.title} padding={false}>
            <div className='flex min-h-screen flex-col'>
                {/* Header with navigation */}
                <div className='sticky top-0 z-10 border-b bg-background'>
                    <div className='flex items-center justify-between p-4'>
                        <div className='flex items-center gap-4'>
                            <Link
                                href={route(`${ROUTES.STUDENT_COURSES}.show`, [
                                    course.data.id,
                                    material.data.id,
                                ])}
                            >
                                <Button variant='outline' size='sm'>
                                    <ArrowLeft className='h-4 w-4' />
                                    <span className='ml-1 hidden md:inline'>
                                        {t('pages.student_courses.actions.back_to_material')}
                                    </span>
                                </Button>
                            </Link>

                            <div className='flex flex-col'>
                                <h1 className='text-lg font-semibold'>{question.data.title}</h1>
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <span>{material.data.title}</span>
                                    <span>•</span>
                                    <span>
                                        {t('pages.student_questions.workspace.question')}#
                                        {question.data.order_number}
                                    </span>

                                    {tracking.completion_status && (
                                        <>
                                            <span>•</span>
                                            <Badge
                                                variant='success'
                                                className='flex items-center gap-1'
                                            >
                                                <Check className='h-3 w-3' />
                                                {t('pages.student_questions.workspace.completed')}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            <div className='hidden items-center gap-2 lg:flex'>
                                <span className='text-sm font-medium'>
                                    {t('pages.student_questions.workspace.time')}:
                                </span>
                                <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm'>
                                    {formatTime(timeSpent)}
                                </span>
                            </div>

                            <Button
                                variant='outline'
                                title={
                                    layoutMode === 'stacked'
                                        ? t('pages.student_questions.workspace.side_by_side_view')
                                        : t('pages.student_questions.workspace.stacked_view')
                                }
                                size='sm'
                                onClick={toggleLayout}
                                className='hidden lg:flex'
                            >
                                {layoutMode === 'stacked' ? <Columns2 /> : <Columns3 />}
                            </Button>

                            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant='outline' size='sm' className='lg:hidden'>
                                        <FileQuestion />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side='left'>
                                    <SheetHeader>
                                        <SheetTitle>{question.data.title}</SheetTitle>
                                        <SheetDescription>
                                            {t('pages.student_questions.workspace.question')}#
                                            {question.data.order_number}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className='flex flex-1 flex-col gap-3'>
                                        {material.data.file_url &&
                                            material.data.file_extension?.toLowerCase() ===
                                                'pdf' && (
                                                <Dialog
                                                    open={materialDialogOpen}
                                                    onOpenChange={setMaterialDialogOpen}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            title={t(
                                                                'pages.student_questions.workspace.view_material',
                                                            )}
                                                            size='sm'
                                                            className='w-fit'
                                                        >
                                                            <FileTextIcon />
                                                            <span className='hidden md:inline'>
                                                                {t(
                                                                    'pages.student_questions.workspace.view_material',
                                                                )}
                                                            </span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className='max-h-[90vh] max-w-[90vw] overflow-hidden'>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                {material.data.title}
                                                            </DialogTitle>
                                                            <DialogDescription />
                                                        </DialogHeader>
                                                        <div className='overflow-auto'>
                                                            <PDFViewer
                                                                fileUrl={material.data.file_url}
                                                                filename={
                                                                    material.data.file ||
                                                                    material.data.title
                                                                }
                                                                className='max-h-[80vh]'
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                        {/* <ReactMarkdown className='prose prose-sm dark:prose-invert max-w-none'> */}
                                        <ReactMarkdown>{question.data.description}</ReactMarkdown>

                                        {question.data.clue && (
                                            <div className='mt-4 rounded-md border bg-muted p-3'>
                                                <p className='mb-1 text-sm font-medium'>
                                                    {t('pages.student_questions.workspace.clue')}:
                                                </p>
                                                <p className='text-sm'>{question.data.clue}</p>
                                            </div>
                                        )}

                                        {testCases.length > 0 && (
                                            <div>
                                                <h4 className='mb-2 text-sm font-medium'>
                                                    {t(
                                                        'pages.student_questions.workspace.test_cases',
                                                    )}
                                                    :
                                                </h4>
                                                {testCases.map((testCase) => (
                                                    <div
                                                        key={testCase.id}
                                                        className='mb-2 rounded-md border bg-muted p-3'
                                                    >
                                                        <p className='text-sm'>
                                                            {testCase.description}
                                                        </p>
                                                        {!testCase.hidden && testCase.input && (
                                                            <pre className='mt-1 overflow-x-auto rounded bg-background p-2 text-xs'>
                                                                <code>{testCase.input}</code>
                                                            </pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className='flex items-center gap-2'>
                                {navigation.previous && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleNavigation(navigation.previous!.id)}
                                    >
                                        <ArrowLeft className='h-4 w-4' />
                                        <span className='ml-1 hidden md:inline'>
                                            {t('pages.student_questions.workspace.previous')}
                                        </span>
                                    </Button>
                                )}

                                {navigation.next && (
                                    <Button
                                        variant={
                                            navigation.next.can_proceed ? 'default' : 'outline'
                                        }
                                        title={
                                            !navigation.next.can_proceed
                                                ? t('pages.student_questions.workspace.run_first')
                                                : undefined
                                        }
                                        size='sm'
                                        onClick={() => handleNavigation(navigation.next!.id)}
                                        disabled={!navigation.next.can_proceed}
                                    >
                                        <span className='mr-1 hidden md:inline'>
                                            {t('pages.student_questions.workspace.next')}
                                        </span>
                                        <ArrowRight className='h-4 w-4' />
                                    </Button>
                                )}

                                {/* Show Next Material button when this is the last question and it's completed */}
                                {!navigation.next && tracking.completion_status && nextMaterial && (
                                    <Link
                                        href={
                                            nextMaterial.first_question_id
                                                ? route(
                                                      `${ROUTES.STUDENT_COURSE_MATERIAL_QUESTIONS}.show`,
                                                      [
                                                          course.data.id,
                                                          nextMaterial.id,
                                                          nextMaterial.first_question_id,
                                                      ],
                                                  )
                                                : route(`${ROUTES.STUDENT_COURSE_MATERIALS}.show`, [
                                                      course.data.id,
                                                      nextMaterial.id,
                                                  ])
                                        }
                                        className={buttonVariants({
                                            size: 'sm',
                                            className: 'gap-1',
                                        })}
                                    >
                                        {t('pages.student_materials.show.next_material')}
                                        <ArrowRight className='h-4 w-4' />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main workspace content with resizable panels */}
                <div className='flex flex-1 overflow-hidden'>
                    {/* Question description panel - desktop */}
                    <div
                        className={`hidden ${layoutMode === 'side-by-side' ? 'w-1/4' : 'w-1/3'} overflow-y-auto border-r lg:block`}
                    >
                        <div className='flex flex-col gap-4 p-4'>
                            {/* <ReactMarkdown className='prose prose-sm dark:prose-invert max-w-none'> */}

                            {material.data.file_url &&
                                material.data.file_extension?.toLowerCase() === 'pdf' && (
                                    <Dialog
                                        open={materialDialogOpen}
                                        onOpenChange={setMaterialDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant='outline'
                                                title={t(
                                                    'pages.student_questions.workspace.view_material',
                                                )}
                                                size='sm'
                                                className='w-fit'
                                            >
                                                <FileTextIcon />
                                                <span className='hidden md:inline'>
                                                    {t(
                                                        'pages.student_questions.workspace.view_material',
                                                    )}
                                                </span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className='max-h-[90vh] max-w-[90vw] overflow-hidden'>
                                            <DialogHeader>
                                                <DialogTitle>{material.data.title}</DialogTitle>
                                                <DialogDescription />
                                            </DialogHeader>
                                            <div className='overflow-auto'>
                                                <PDFViewer
                                                    fileUrl={material.data.file_url}
                                                    filename={
                                                        material.data.file || material.data.title
                                                    }
                                                    className='max-h-[80vh]'
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}

                            <ReactMarkdown>{question.data.description}</ReactMarkdown>

                            {question.data.file_url && (
                                <div>
                                    <h3 className='mb-2 text-sm font-medium'>
                                        {t('pages.student_questions.workspace.view_image')}:
                                    </h3>
                                    <img
                                        src={question.data.file_url}
                                        className='max-w-full rounded-md border'
                                        alt='Question reference'
                                    />
                                </div>
                            )}

                            {question.data.clue && (
                                <div className='mt-4 rounded-md border bg-muted p-3'>
                                    <p className='mb-1 text-sm font-medium'>
                                        {t('pages.student_questions.workspace.clue')}:
                                    </p>
                                    <p className='text-sm'>{question.data.clue}</p>
                                </div>
                            )}

                            {testCases.length > 0 && (
                                <div>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.student_questions.workspace.test_cases')}:
                                    </h4>
                                    {testCases.map((testCase) => (
                                        <div
                                            key={testCase.id}
                                            className='mb-2 rounded-md border bg-muted p-3'
                                        >
                                            <p className='text-sm'>{testCase.description}</p>
                                            {!testCase.hidden && testCase.input && (
                                                <pre className='mt-1 overflow-x-auto rounded bg-background p-2 text-xs'>
                                                    <code>{testCase.input}</code>
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className='mt-4 text-center text-sm text-muted-foreground'>
                                {t('pages.student_questions.workspace.time_spent')}:{' '}
                                {formatTime(timeSpent)}
                            </div>
                        </div>
                    </div>

                    {/* Code editor and output panel - now with resizable layout */}
                    <div
                        className={`flex flex-1 ${layoutMode === 'side-by-side' ? 'flex-row' : 'flex-col'} overflow-hidden`}
                    >
                        {layoutMode === 'stacked' ? (
                            <ResizablePanelGroup direction='vertical' className='flex-1'>
                                {/* Code Editor Panel */}
                                <ResizablePanel
                                    minSize={30}
                                    defaultSize={60}
                                    className='overflow-hidden'
                                >
                                    <div className='flex h-full flex-col'>
                                        <div className='border-b bg-muted/30 px-4 py-2'>
                                            <h3 className='font-medium'>
                                                {t('pages.student_questions.workspace.code')}
                                            </h3>
                                        </div>
                                        <div className='flex flex-1'>
                                            <CodeEditor
                                                value={code}
                                                showThemePicker={true}
                                                onChange={handleCodeChange}
                                                language={ProgrammingLanguageEnum.PYTHON}
                                                height='100%'
                                                headerClassName='pt-3 px-3'
                                                headerChildren={
                                                    <Button
                                                        onClick={handleRunCode}
                                                        disabled={isCompiling}
                                                    >
                                                        {isCompiling ? (
                                                            <Loader2 className='animate-spin' />
                                                        ) : (
                                                            <Redo2 />
                                                        )}
                                                        {isCompiling
                                                            ? t(
                                                                  'pages.student_questions.workspace.running',
                                                              )
                                                            : t(
                                                                  'pages.student_questions.workspace.run',
                                                              )}
                                                        {' (CTRL + Enter)'}
                                                    </Button>
                                                }
                                                className='flex-1 overflow-x-scroll'
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel minSize={20} defaultSize={40}>
                                    <div className='flex h-full flex-col'>
                                        <div className='border-b bg-muted/30 px-4 py-2'>
                                            <h3 className='font-medium'>
                                                {t('pages.student_questions.workspace.output')}
                                            </h3>
                                        </div>
                                        <div className='flex-1 overflow-auto p-4'>
                                            {output.length === 0 && !isCompiling ? (
                                                <div className='flex h-full items-center justify-center text-center text-muted-foreground'>
                                                    <div>
                                                        <AlertTriangle className='mx-auto mb-2 h-8 w-8' />
                                                        <p>
                                                            {t(
                                                                'pages.student_questions.workspace.no_output_yet',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {output.map((out, i) => {
                                                        if (out.type === 'image') {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className='rounded-md border'
                                                                >
                                                                    <img
                                                                        src={out.content}
                                                                        className='mx-auto max-w-full rounded'
                                                                        alt={`Output ${i}`}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (out.type === 'error') {
                                                            return (
                                                                <Alert
                                                                    variant='destructive'
                                                                    key={i}
                                                                >
                                                                    <AlertCircle className='h-4 w-4' />
                                                                    <AlertTitle>
                                                                        {t(
                                                                            'pages.student_questions.workspace.error.title',
                                                                        )}
                                                                    </AlertTitle>
                                                                    <AlertDescription>
                                                                        <pre className='whitespace-pre-wrap text-xs'>
                                                                            {out.content}
                                                                        </pre>
                                                                    </AlertDescription>
                                                                </Alert>
                                                            );
                                                        } else if (out.type === 'test_stats') {
                                                            return (
                                                                <Card key={i}>
                                                                    <CardContent className='p-4'>
                                                                        <div className='mb-2 flex items-center justify-between'>
                                                                            <h4 className='font-medium'>
                                                                                {t(
                                                                                    'pages.student_questions.workspace.test_results',
                                                                                )}
                                                                            </h4>
                                                                            <Badge
                                                                                variant={getTestResultBadgeVariant(
                                                                                    out.success,
                                                                                    out.total_tests,
                                                                                )}
                                                                            >
                                                                                {out.success}/
                                                                                {out.total_tests}
                                                                                {t(
                                                                                    'pages.student_questions.workspace.passed',
                                                                                )}
                                                                            </Badge>
                                                                        </div>
                                                                        <Progress
                                                                            value={
                                                                                out.success
                                                                                    ? (out.success /
                                                                                          out.total_tests) *
                                                                                      100
                                                                                    : 0
                                                                            }
                                                                            className='h-2'
                                                                        />
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        } else if (out.type === 'test_result') {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className='rounded-md bg-muted p-3 text-sm'
                                                                >
                                                                    <pre className='whitespace-pre-wrap text-xs'>
                                                                        {out.content}
                                                                    </pre>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className='rounded-md bg-muted p-3 text-sm'
                                                                >
                                                                    {out.content}
                                                                </div>
                                                            );
                                                        }
                                                    })}
                                                    {isCompiling && (
                                                        <div className='flex items-center justify-center p-4 text-muted-foreground'>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            {t(
                                                                'pages.student_questions.workspace.running',
                                                            )}
                                                            ...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        ) : (
                            // Side-by-side layout with horizontal resizable panels
                            <ResizablePanelGroup direction='horizontal' className='flex-1'>
                                {/* Code Editor Panel */}
                                <ResizablePanel
                                    minSize={40}
                                    defaultSize={60}
                                    className='overflow-hidden'
                                >
                                    <div className='flex h-full flex-col'>
                                        <div className='border-b bg-muted/30 px-4 py-2'>
                                            <h3 className='font-medium'>
                                                {t('pages.student_questions.workspace.code')}
                                            </h3>
                                        </div>
                                        <div className='flex-1'>
                                            <CodeEditor
                                                value={code}
                                                showThemePicker={true}
                                                onChange={handleCodeChange}
                                                language={ProgrammingLanguageEnum.PYTHON}
                                                height='100%'
                                                headerClassName='pt-3 px-3'
                                                headerChildren={
                                                    <Button
                                                        onClick={handleRunCode}
                                                        disabled={isCompiling}
                                                    >
                                                        {isCompiling ? (
                                                            <Loader2 className='animate-spin' />
                                                        ) : (
                                                            <Redo2 />
                                                        )}
                                                        {isCompiling
                                                            ? t(
                                                                  'pages.student_questions.workspace.running',
                                                              )
                                                            : t(
                                                                  'pages.student_questions.workspace.run',
                                                              )}
                                                        {' (CTRL + Enter)'}
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel minSize={20} defaultSize={40}>
                                    <div className='flex h-full flex-col'>
                                        <div className='border-b bg-muted/30 px-4 py-2'>
                                            <h3 className='font-medium'>
                                                {t('pages.student_questions.workspace.output')}
                                            </h3>
                                        </div>
                                        <div className='flex-1 overflow-auto p-4'>
                                            {output.length === 0 && !isCompiling ? (
                                                <div className='flex h-full items-center justify-center text-center text-muted-foreground'>
                                                    <div>
                                                        <AlertTriangle className='mx-auto mb-2 h-8 w-8' />
                                                        <p>
                                                            {t(
                                                                'pages.student_questions.workspace.no_output_yet',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {output.map((out, i) => {
                                                        if (out.type === 'image') {
                                                            return (
                                                                <div key={i}>
                                                                    <img
                                                                        src={out.content}
                                                                        className='mx-auto max-w-full rounded'
                                                                        alt={`Output ${i}`}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (out.type === 'error') {
                                                            return (
                                                                <Alert
                                                                    variant='destructive'
                                                                    key={i}
                                                                >
                                                                    <AlertCircle className='h-4 w-4' />
                                                                    <AlertTitle>
                                                                        {t(
                                                                            'pages.student_questions.workspace.error.title',
                                                                        )}
                                                                    </AlertTitle>
                                                                    <AlertDescription>
                                                                        <pre className='whitespace-pre-wrap text-xs'>
                                                                            {out.content}
                                                                        </pre>
                                                                    </AlertDescription>
                                                                </Alert>
                                                            );
                                                        } else if (out.type === 'test_stats') {
                                                            return (
                                                                <Card key={i}>
                                                                    <CardContent className='p-4'>
                                                                        <div className='mb-2 flex items-center justify-between'>
                                                                            <h4 className='font-medium'>
                                                                                {t(
                                                                                    'pages.student_questions.workspace.test_results',
                                                                                )}
                                                                            </h4>
                                                                            <Badge
                                                                                variant={getTestResultBadgeVariant(
                                                                                    out.success,
                                                                                    out.total_tests,
                                                                                )}
                                                                            >
                                                                                {out.success}/
                                                                                {out.total_tests}
                                                                                {t(
                                                                                    'pages.student_questions.workspace.passed',
                                                                                )}
                                                                            </Badge>
                                                                        </div>
                                                                        <Progress
                                                                            value={
                                                                                out.success
                                                                                    ? (out.success /
                                                                                          out.total_tests) *
                                                                                      100
                                                                                    : 0
                                                                            }
                                                                            className='h-2'
                                                                        />
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        } else if (out.type === 'test_result') {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className='rounded-md bg-muted p-3 text-sm'
                                                                >
                                                                    <pre className='whitespace-pre-wrap text-xs'>
                                                                        {out.content}
                                                                    </pre>
                                                                </div>
                                                            );
                                                        } else {
                                                            return <div key={i}>{out.content}</div>;
                                                        }
                                                    })}
                                                    {isCompiling && (
                                                        <div className='flex items-center justify-center p-4 text-muted-foreground'>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            {t(
                                                                'pages.student_questions.workspace.running',
                                                            )}
                                                            ...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        )}

                        {/* Run Button Footer - Fixed at bottom */}
                        {/* <div className='flex items-center justify-between border-t bg-background p-4'>
                            <div className='text-sm text-muted-foreground lg:hidden'>
                                {t('pages.student_questions.workspace.time')}:{' '}
                                {formatTime(timeSpent)}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
