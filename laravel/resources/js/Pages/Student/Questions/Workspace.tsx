import CodeEditor from '@/Components/CodeEditor';
import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent } from '@/Components/UI/card';
import { Progress } from '@/Components/UI/progress';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/UI/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ProgrammingLanguageEnum } from '@/Support/Enums/programmingLanguageEnum';
import { FastApiOutput } from '@/Support/Interfaces/Others';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Check,
    FileQuestion,
    Loader2,
    Redo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

// interface TestCase {
//     id: number;
//     description: string;
//     input: string;
//     hidden: boolean;
//     active: boolean;
// }

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
}

export default function Workspace({
    course,
    material,
    question,
    testCases,
    tracking,
    latestCode,
    navigation,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [code, setCode] = useState(latestCode || '');
    const [isCompiling, setIsCompiling] = useState(false);
    const [output, setOutput] = useState<FastApiOutput[]>([]);
    const [timeSpent, setTimeSpent] = useState(tracking.current_time);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(Date.now());

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
            const response = await axios.post(route('student.questions.execute'), {
                student_score_id: tracking.score_id,
                code: code,
            });

            setOutput(response.data.output || []);

            // Check for completion status
            if (response.data.success && tracking.completion_status) {
                // toast({
                //     title: t('pages.student_questions.workspace.success.title'),
                //     description: t('pages.student_questions.workspace.success.description'),
                //     variant: 'success',
                // });

                toast.success(t('pages.student_questions.workspace.success.description'));
            }
        } catch (error) {
            console.error('Error executing code:', error);
            // toast({
            //     title: t('pages.student_questions.workspace.error.title'),
            //     description: t('pages.student_questions.workspace.error.description'),
            //     variant: 'destructive',
            // });

            toast.error(t('pages.student_questions.workspace.error.description'));
            setOutput([{ type: 'error', content: 'Failed to execute code' }]);
        } finally {
            setIsCompiling(false);
        }
    };

    // Handle navigation to next or previous question
    const handleNavigation = (questionId: number) => {
        // Always sync time before navigating away
        syncTime().then(() => {
            router.visit(
                route('student.questions.show', [course.data.id, material.data.id, questionId]),
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
                                href={route('student.materials.show', [
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

                            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant='outline' size='sm' className='lg:hidden'>
                                        <FileQuestion className='h-4 w-4' />
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
                                    <div className='mt-4'>
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
                                            <div className='mt-4'>
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main workspace content */}
                <div className='flex flex-1 overflow-hidden'>
                    {/* Question description panel - desktop */}
                    <div className='hidden w-1/3 overflow-y-auto border-r lg:block'>
                        <div className='p-4'>
                            {/* <ReactMarkdown className='prose prose-sm dark:prose-invert max-w-none'> */}
                            <ReactMarkdown>{question.data.description}</ReactMarkdown>

                            {question.data.file_url && (
                                <div className='mt-4'>
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
                                <div className='mt-4'>
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

                    {/* Code editor and output panel */}
                    <div className='flex flex-1 flex-col overflow-hidden'>
                        <Tabs defaultValue='code' className='flex flex-1 flex-col'>
                            <div className='border-b px-4'>
                                <TabsList>
                                    <TabsTrigger value='code'>
                                        {t('pages.student_questions.workspace.code')}
                                    </TabsTrigger>
                                    <TabsTrigger value='output'>
                                        {t('pages.student_questions.workspace.output')}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value='code'
                                className='flex-1 overflow-hidden p-0 data-[state=active]:flex-1'
                            >
                                <div className='flex h-full flex-col'>
                                    <div className='flex-1'>
                                        <CodeEditor
                                            value={code}
                                            showThemePicker={true}
                                            onChange={handleCodeChange}
                                            language={ProgrammingLanguageEnum.PYTHON}
                                            height='calc(100vh - 13rem)'
                                        />
                                    </div>

                                    <div className='flex items-center justify-between border-t bg-background p-4'>
                                        <div className='text-sm text-muted-foreground lg:hidden'>
                                            {t('pages.student_questions.workspace.time')}:{' '}
                                            {formatTime(timeSpent)}
                                        </div>

                                        <Button
                                            onClick={handleRunCode}
                                            disabled={isCompiling}
                                            className='ml-auto flex items-center gap-2'
                                        >
                                            {isCompiling ? (
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                                <Redo2 className='h-4 w-4' />
                                            )}
                                            {isCompiling
                                                ? t('pages.student_questions.workspace.running')
                                                : t('pages.student_questions.workspace.run')}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value='output'
                                className='flex-1 overflow-auto p-0 data-[state=active]:flex-1'
                            >
                                <div className='flex h-full flex-col'>
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
                                                            <Alert variant='destructive' key={i}>
                                                                <AlertCircle className='h-4 w-4' />
                                                                <AlertTitle>
                                                                    {t(
                                                                        'pages.student_questions.workspace.error',
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
                                                                            variant={
                                                                                out.success ===
                                                                                out.total_tests
                                                                                    ? 'success'
                                                                                    : 'destructive'
                                                                            }
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
                                                                            (out.success /
                                                                                out.total_tests) *
                                                                            100
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

                                    <div className='flex items-center justify-between border-t bg-background p-4'>
                                        <div className='text-sm text-muted-foreground lg:hidden'>
                                            {t('pages.student_questions.workspace.time')}:
                                            {formatTime(timeSpent)}
                                        </div>

                                        <Button
                                            onClick={handleRunCode}
                                            disabled={isCompiling}
                                            className='ml-auto flex items-center gap-2'
                                        >
                                            {isCompiling ? (
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                                <Redo2 className='h-4 w-4' />
                                            )}
                                            {isCompiling
                                                ? t('pages.student_questions.workspace.running')
                                                : t('pages.student_questions.workspace.run')}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
