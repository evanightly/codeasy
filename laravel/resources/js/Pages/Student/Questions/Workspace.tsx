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
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';
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
    ChevronDown,
    Clock,
    Columns2,
    Columns3,
    FileQuestion,
    FileText,
    GripVertical,
    Loader2,
    Lock,
    Redo2,
    RotateCcw,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import ReactMarkdown from 'react-markdown';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { toast } from 'sonner';

interface TrackingInfo {
    score_id: number;
    current_time: number;
    completion_status: boolean;
    trial_status: boolean;
    started_at: number;
    // Workspace locking fields
    is_workspace_locked?: boolean;
    workspace_locked_at?: string | null;
    workspace_unlock_at?: string | null;
    can_reattempt?: boolean;
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
    progressiveRevelationConfig: {
        failed_attempts_threshold: number;
        enabled: boolean;
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
    progressiveRevelationConfig,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [code, setCode] = useState(latestCode || '');
    const [isCompiling, setIsCompiling] = useState(false);
    const [output, setOutput] = useState<FastApiOutput[]>([]);
    const [tracking, setTracking] = useState(initialTracking);
    const [navigation, setNavigation] = useState(initialNavigation);
    const [timeSpent, setTimeSpent] = useState(initialTracking.current_time);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [_lastSyncTime, setLastSyncTime] = useState(Date.now());
    const [layoutMode, setLayoutMode] = useLocalStorage<'stacked' | 'side-by-side'>(
        'code-editor-view',
        'stacked',
    );

    // Workspace locking state
    const [isWorkspaceLocked, setIsWorkspaceLocked] = useState(
        tracking.is_workspace_locked || false,
    );
    const [workspaceUnlockAt, setWorkspaceUnlockAt] = useState<string | null>(
        tracking.workspace_unlock_at || null,
    );
    const [canReattempt, setCanReattempt] = useState(tracking.can_reattempt || false);

    // Answer completion state (using completion_status)
    const [isAnswerCompleted, setIsAnswerCompleted] = useState(tracking.completion_status || false);
    const [markAsDoneDialogOpen, setMarkAsDoneDialogOpen] = useState(false);
    const [showMarkAsDoneButton, setShowMarkAsDoneButton] = useState(false);

    // Progressive test case revelation state
    const [failedCompilationCount, setFailedCompilationCount] = useState(0);
    const [revealedTestCases, setRevealedTestCases] = useState<Set<number>>(new Set());
    const [newlyRevealedTestCases, setNewlyRevealedTestCases] = useState<Set<number>>(new Set());

    // Floating material preview state
    const [materialPreviewOpen, setMaterialPreviewOpen] = useState(false);
    const [stickyMaterialVisible, setStickyMaterialVisible] = useLocalStorage(
        'material-panel-visible',
        true,
    );
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollSpeed, setScrollSpeed] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);

    // Resizable panel state
    const [panelWidth, setPanelWidth] = useLocalStorage('material-panel-width', 320); // Default 320px (w-80)
    const [panelHeight, setPanelHeight] = useLocalStorage('material-panel-height', 384); // Default 384px (max-h-96)

    // Helper function to calculate left-side vertical center position
    const getCenterPosition = () => {
        if (typeof window === 'undefined') {
            return { x: 16, y: 0 }; // Fallback for SSR
        }
        const leftX = 16; // Keep on left side (16px from edge)
        const centerY = Math.max(0, (window.innerHeight - panelHeight) / 2 - 100); // Vertically centered with header offset
        return { x: leftX, y: centerY };
    };

    // Draggable panel position state
    const [panelPosition, setPanelPosition] = useLocalStorage('material-panel-position', {
        x: 16,
        y: 0,
    });
    const draggableRef = useRef<HTMLDivElement>(null);

    // Reset panel position to left side, vertically centered
    const resetPanelPosition = () => {
        setPanelPosition(getCenterPosition());
    };

    // Configuration for progressive revelation
    const FAILED_ATTEMPTS_THRESHOLD = progressiveRevelationConfig.failed_attempts_threshold;
    const PROGRESSIVE_REVELATION_ENABLED = progressiveRevelationConfig.enabled;

    // Service hooks for workspace locking
    const reattemptMutation = studentScoreServiceHook.useReattempt();

    // Service hooks for answer completion
    const markAsDoneMutation = studentScoreServiceHook.useMarkAsDone();
    const allowReAttemptMutation = studentScoreServiceHook.useAllowReAttempt();

    // Function to format seconds into readable time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const secs = seconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Function to calculate time remaining until unlock
    const getTimeUntilUnlock = () => {
        if (!workspaceUnlockAt) return null;

        const unlockTime = new Date(workspaceUnlockAt).getTime();
        const currentTime = Date.now();
        const diff = unlockTime - currentTime;

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    // Handle re-attempt functionality
    const handleReattempt = () => {
        reattemptMutation.mutate(
            {
                student_score_id: tracking.score_id,
            },
            {
                onSuccess: () => {
                    toast.success(t('pages.student_questions.workspace.reattempt.success'));
                    // Reset local state
                    setIsWorkspaceLocked(false);
                    setWorkspaceUnlockAt(null);
                    setCanReattempt(false);
                    setCode('');
                    setOutput([]);
                    setTracking((prev) => ({
                        ...prev,
                        completion_status: false,
                        is_workspace_locked: false,
                        workspace_locked_at: null,
                        workspace_unlock_at: null,
                        can_reattempt: false,
                    }));
                },
                onError: () => {
                    toast.error(t('pages.student_questions.workspace.reattempt.error'));
                },
            },
        );
    };

    // Handle code changes
    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    // Handle code execution/compilation
    const handleRunCode = async () => {
        if (isCompiling) return;

        // Check if answer is marked as done (completed)
        if (isAnswerCompleted) {
            toast.error(t('pages.student_questions.workspace.locked.answer_locked'));
            return;
        }

        // Check if workspace is locked
        if (isWorkspaceLocked && !canReattempt) {
            toast.error(t('pages.student_questions.workspace.locked.cannot_run'));
            return;
        }

        setIsCompiling(true);
        try {
            // TODO: implement using service hooks
            const response = await axios.post(route('student.questions.execute'), {
                student_score_id: tracking.score_id,
                code: code,
            });

            setOutput(response.data.output || []);

            // Progressive test case revelation logic
            let isCompilationFailed = false;

            // Check if compilation failed (no tests passed)
            if (response.data.output && Array.isArray(response.data.output)) {
                const hasTestOutput = response.data.output.some(
                    (output: any) => output.type === 'test_stats' && output.content,
                );

                if (hasTestOutput) {
                    const testOutput = response.data.output.find(
                        (output: any) => output.type === 'test_stats',
                    );

                    if (testOutput?.content) {
                        try {
                            const testStats = JSON.parse(testOutput.content);
                            // If no tests passed, count as failed compilation
                            isCompilationFailed = testStats.passed === 0;
                        } catch (error) {
                            console.error('Error parsing test stats:', error);
                        }
                    }
                } else {
                    // If no test output, assume compilation error
                    isCompilationFailed = true;
                }
            } else {
                // If no output, assume compilation error
                isCompilationFailed = true;
            }

            // Handle failed compilation count and test case revelation
            if (isCompilationFailed && PROGRESSIVE_REVELATION_ENABLED) {
                const newFailedCount = failedCompilationCount + 1;
                setFailedCompilationCount(newFailedCount);

                // Check if we should reveal hidden test cases
                if (newFailedCount >= FAILED_ATTEMPTS_THRESHOLD) {
                    const hiddenTestCases = testCases.filter(
                        (tc) => tc.hidden && !revealedTestCases.has(tc.id),
                    );

                    if (hiddenTestCases.length > 0) {
                        const newRevealedIds = new Set(revealedTestCases);
                        const newlyRevealed = new Set<number>();

                        hiddenTestCases.forEach((tc) => {
                            newRevealedIds.add(tc.id);
                            newlyRevealed.add(tc.id);
                        });

                        setRevealedTestCases(newRevealedIds);
                        setNewlyRevealedTestCases(newlyRevealed);

                        toast.info(
                            t('pages.student_questions.workspace.test_cases_revealed', {
                                count: hiddenTestCases.length,
                                attempts: FAILED_ATTEMPTS_THRESHOLD,
                            }) ||
                                `${hiddenTestCases.length} hidden test case(s) revealed after ${FAILED_ATTEMPTS_THRESHOLD} failed attempts`,
                        );

                        // Clear newly revealed after animation
                        setTimeout(() => {
                            setNewlyRevealedTestCases(new Set());
                        }, 2000);
                    }
                }
            } else if (!isCompilationFailed) {
                // Reset failed count on successful compilation
                setFailedCompilationCount(0);
            }

            // Don't automatically set completion status - let student decide
            // Just update the tracking info for test results
            setTracking((prev) => ({
                ...prev,
                trial_status: true, // Mark that student has tried running code
            }));

            // Check if some tests passed to show mark as done button
            if (response.data.success) {
                // Show mark as done button after successful compilation (some/all tests passed)
                setShowMarkAsDoneButton(true);

                // Enable the next button since they've successfully run code
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

            // Check if workspace is locked by teacher/system
            if (response.data.workspace_locked) {
                setIsWorkspaceLocked(true);
                setWorkspaceUnlockAt(response.data.workspace_unlock_at);
                setCanReattempt(false);
                toast.info(t('pages.student_questions.workspace.locked.notification'));
            }
        } catch (error: any) {
            console.error('Error executing code:', error);
            if (error.response?.status === 403 && error.response?.data?.completion_status) {
                setIsAnswerCompleted(true);
                toast.error(t('pages.student_questions.workspace.locked.answer_locked'));
            } else {
                toast.error(t('pages.student_questions.workspace.error.description'));
                setOutput([{ type: 'error', content: 'Failed to execute code' }]);
            }
        } finally {
            setIsCompiling(false);
        }
    };

    // Handle mark as done
    const handleMarkAsDone = () => {
        markAsDoneMutation.mutate(
            { id: tracking.score_id },
            {
                onSuccess: () => {
                    toast.success(t('pages.student_questions.workspace.mark_as_done.success'));
                    setIsAnswerCompleted(true);
                    setMarkAsDoneDialogOpen(false);
                    setShowMarkAsDoneButton(false);
                },
                onError: () => {
                    toast.error(t('pages.student_questions.workspace.mark_as_done.error'));
                },
            },
        );
    };

    // Handle allow re-attempt
    const handleAllowReAttempt = () => {
        allowReAttemptMutation.mutate(
            { id: tracking.score_id },
            {
                onSuccess: () => {
                    toast.success(t('pages.student_questions.workspace.allow_reattempt.success'));
                    // Reload the page to reset the question state
                    window.location.reload();
                },
                onError: (res: any) => {
                    toast.error(res.response?.data?.error);
                },
            },
        );
    };

    // Handle navigation with mark as done dialog
    const handleNavigationWithLockCheck = (questionId: number) => {
        if (showMarkAsDoneButton && !isAnswerCompleted) {
            setMarkAsDoneDialogOpen(true);
            // Store the target question ID for after mark as done dialog
            (window as any).pendingNavigationQuestionId = questionId;
        } else {
            handleNavigation(questionId);
        }
    };

    // Proceed with navigation after mark as done dialog
    const proceedWithNavigation = () => {
        const targetQuestionId = (window as any).pendingNavigationQuestionId;
        if (targetQuestionId) {
            delete (window as any).pendingNavigationQuestionId;
            handleNavigation(targetQuestionId);
        }
        setMarkAsDoneDialogOpen(false);
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
                // Prevent running code if workspace is locked and can't reattempt
                if (isWorkspaceLocked && !canReattempt) {
                    e.preventDefault();
                    return;
                }
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
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            syncTime();
            // Show mark as done dialog if user has unlocked answer but hasn't marked it as done yet
            if (showMarkAsDoneButton && !isAnswerCompleted) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
                setMarkAsDoneDialogOpen(true);
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [timeSpent, showMarkAsDoneButton, isAnswerCompleted]);

    // Real-time countdown update for workspace unlock
    useEffect(() => {
        if (!isWorkspaceLocked || !workspaceUnlockAt) return;

        const countdownTimer = setInterval(() => {
            const timeLeft = getTimeUntilUnlock();
            if (!timeLeft) {
                // Unlock time has passed, update state
                setIsWorkspaceLocked(false);
                setWorkspaceUnlockAt(null);
                setCanReattempt(false);
                clearInterval(countdownTimer);
            }
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, [isWorkspaceLocked, workspaceUnlockAt]);

    // Scroll detection for floating material dragged effect
    useEffect(() => {
        let scrollTimer: NodeJS.Timeout;
        let lastScrollTime = Date.now();
        let animationFrame: number;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const currentTime = Date.now();
            const timeDiff = currentTime - lastScrollTime;
            const scrollDiff = currentScrollY - lastScrollY;

            // Calculate scroll speed (pixels per millisecond)
            const speed = timeDiff > 0 ? Math.abs(scrollDiff) / timeDiff : 0;
            setScrollSpeed(speed);

            // Determine scroll direction
            if (currentScrollY > lastScrollY) {
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY) {
                setScrollDirection('up');
            }

            // Calculate drag offset based on scroll velocity and direction
            const maxOffset = 15; // Maximum pixels to move
            const dampening = 0.8; // Reduces the effect slightly
            const rawOffset = Math.min(maxOffset, Math.abs(scrollDiff) * dampening);
            const offset = scrollDirection === 'down' ? rawOffset : -rawOffset;

            setDragOffset(offset);
            setLastScrollY(currentScrollY);
            setIsScrolling(true);
            lastScrollTime = currentTime;

            // Clear existing timer
            clearTimeout(scrollTimer);

            // Set timer to stop scrolling state and return to center
            scrollTimer = setTimeout(() => {
                setIsScrolling(false);
                setScrollSpeed(0);

                // Smoothly return to center position
                let currentOffset = offset;
                const returnToCenter = () => {
                    currentOffset *= 0.85; // Ease back to center
                    setDragOffset(currentOffset);

                    if (Math.abs(currentOffset) > 0.5) {
                        animationFrame = requestAnimationFrame(returnToCenter);
                    } else {
                        setDragOffset(0);
                    }
                };
                returnToCenter();
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [lastScrollY, scrollDirection]);

    return (
        <AuthenticatedLayout title={question.data.title} padding={false}>
            {/* Custom CSS for dragged effect and resize cursor */}
            <style>
                {`
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50%) translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(-50%) translateX(0px);
                    }
                }
                
                .dragged-glow {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                }
                
                .material-enter {
                    animation: fadeSlideIn 0.5s ease-out;
                }
                `}
            </style>

            {/* Sticky Floating Material Preview */}
            {(material.data.description ||
                (material.data.file_url &&
                    material.data.file_extension?.toLowerCase() === 'pdf')) &&
                stickyMaterialVisible && (
                    <Draggable
                        position={panelPosition}
                        onDrag={(e, data) => {
                            setPanelPosition({ x: data.x, y: data.y });
                        }}
                        nodeRef={draggableRef}
                        handle='.drag-header'
                        bounds='body'
                    >
                        <div
                            style={{
                                transform: `translateY(calc(-50% + ${dragOffset}px))`,
                                transition: isScrolling ? 'none' : 'transform 0.3s ease-out',
                            }}
                            ref={draggableRef}
                            className={`material-enter fixed top-1/2 z-40 hidden transition-all duration-300 lg:block`}
                        >
                            <Resizable
                                width={panelWidth}
                                resizeHandles={['se']}
                                onResize={(e, { size }) => {
                                    setPanelWidth(size.width);
                                    setPanelHeight(size.height);
                                }}
                                minConstraints={[280, 200]}
                                maxConstraints={[600, 800]}
                                height={panelHeight}
                            >
                                <div className='group relative'>
                                    {/* Material Preview Card */}
                                    <div
                                        style={{
                                            width: `${panelWidth}px`,
                                            height: `${panelHeight}px`,
                                        }}
                                        className={`transform overflow-hidden rounded-lg border bg-background shadow-lg transition-all duration-300 group-hover:scale-105 ${
                                            isScrolling ? 'dragged-glow' : ''
                                        }`}
                                    >
                                        {/* Header */}
                                        <div className='drag-header flex cursor-move items-center justify-between border-b bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/40'>
                                            <div className='flex items-center gap-2'>
                                                {/* Drag Handle Visual Indicator */}
                                                <div
                                                    title={t(
                                                        'pages.student_questions.workspace.drag_panel',
                                                        { defaultValue: 'Drag to move panel' },
                                                    )}
                                                    className='rounded p-1 transition-colors'
                                                >
                                                    <GripVertical className='h-4 w-4 text-muted-foreground transition-colors' />
                                                </div>
                                                <FileText
                                                    className={`h-4 w-4 text-primary transition-colors duration-300 ${
                                                        isScrolling ? 'text-blue-500' : ''
                                                    }`}
                                                />
                                                <h3 className='truncate text-sm font-medium'>
                                                    {material.data.title}
                                                </h3>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => setStickyMaterialVisible(false)}
                                                className='h-6 w-6 p-0 opacity-70 hover:opacity-100'
                                            >
                                                <X className='h-3 w-3' />
                                                <span className='sr-only'>
                                                    {t('pages.student_questions.workspace.close', {
                                                        defaultValue: 'Close',
                                                    })}
                                                </span>
                                            </Button>
                                        </div>

                                        {/* Content */}
                                        <div
                                            style={{ height: `${panelHeight - 60}px` }} // Subtract header height
                                            className='space-y-3 overflow-auto p-4'
                                        >
                                            {/* Learning Material Description */}
                                            {material.data.description && (
                                                <div className='rounded-md bg-muted/20 p-3'>
                                                    <h4 className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                                        {t(
                                                            'pages.student_questions.workspace.description',
                                                            { defaultValue: 'Description' },
                                                        )}
                                                    </h4>
                                                    <div className='prose prose-sm max-w-none text-sm'>
                                                        <ReactMarkdown>
                                                            {material.data.description}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PDF Material Section */}
                                            {material.data.file_url &&
                                                material.data.file_extension?.toLowerCase() ===
                                                    'pdf' && (
                                                    <div className='overflow-hidden rounded-md border bg-background'>
                                                        <PDFViewer
                                                            title='-'
                                                            fileUrl={material.data.file_url}
                                                            filename={
                                                                material.data.file ||
                                                                material.data.title
                                                            }
                                                            className='h-full'
                                                        />
                                                    </div>
                                                )}
                                        </div>

                                        {/* Expand Button */}
                                        <div className='border-t bg-muted/10 px-4 py-2'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => setMaterialPreviewOpen(true)}
                                                className='w-full justify-center text-xs'
                                            >
                                                {t(
                                                    'pages.student_questions.workspace.expand_material',
                                                    { defaultValue: 'Expand Material' },
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Resizable>

                            {/* Drag indicator with direction arrow */}
                            {isScrolling && (
                                <div className='absolute -right-3 top-1/2 flex -translate-y-1/2 transform flex-col items-center'>
                                    <div
                                        className={`w-1 animate-pulse rounded-full shadow-lg transition-all duration-200 ${
                                            scrollSpeed > 0.5
                                                ? 'h-12 bg-gradient-to-b from-primary to-primary/60'
                                                : 'h-8 bg-gradient-to-b from-primary to-primary/80'
                                        }`}
                                    />
                                    <div
                                        className={`mt-1 transform text-primary transition-transform duration-200 ${
                                            scrollDirection === 'up' ? 'rotate-180' : ''
                                        }`}
                                    >
                                        <ChevronDown className='h-3 w-3' />
                                    </div>
                                </div>
                            )}

                            {/* Quick restore button when material is hidden */}
                            {!stickyMaterialVisible && (
                                <div className='absolute -left-16 top-4'>
                                    <Button
                                        title={t(
                                            'pages.student_questions.workspace.show_material',
                                            {
                                                defaultValue: 'Show Material',
                                            },
                                        )}
                                        size='sm'
                                        onClick={() => {
                                            resetPanelPosition();
                                            setStickyMaterialVisible(true);
                                        }}
                                        className='h-10 w-10 animate-pulse rounded-full p-0 shadow-lg transition-all duration-300 hover:shadow-xl'
                                    >
                                        <FileText className='h-4 w-4' />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Draggable>
                )}

            <div className='flex min-h-screen flex-col'>
                {/* Header with navigation */}
                <div className='sticky top-0 z-[1] border-b bg-background'>
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

                            {/* Material Preview Button - Mobile (opens dialog) */}
                            {(material.data.description ||
                                (material.data.file_url &&
                                    material.data.file_extension?.toLowerCase() === 'pdf')) && (
                                <Button
                                    variant='outline'
                                    title={t('pages.student_questions.workspace.view_material', {
                                        defaultValue: 'View Material',
                                    })}
                                    size='sm'
                                    onClick={() => setMaterialPreviewOpen(true)}
                                    className='lg:hidden'
                                >
                                    <FileText className='h-4 w-4' />
                                </Button>
                            )}

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
                                                {testCases.map((testCase) => {
                                                    // Determine if this test case should be visible
                                                    const isTestCaseVisible =
                                                        !testCase.hidden ||
                                                        revealedTestCases.has(testCase.id);
                                                    const isNewlyRevealed =
                                                        newlyRevealedTestCases.has(testCase.id);

                                                    return (
                                                        <div
                                                            key={testCase.id}
                                                            className={`mb-2 rounded-md border p-3 transition-all duration-500 ${
                                                                isNewlyRevealed
                                                                    ? 'animate-pulse border-green-300 bg-green-100 dark:border-green-600 dark:bg-green-900/20'
                                                                    : 'bg-muted'
                                                            }`}
                                                        >
                                                            <div className='flex items-center gap-2'>
                                                                <p className='flex-1 text-sm'>
                                                                    {testCase.description}
                                                                </p>
                                                                {testCase.hidden &&
                                                                    !revealedTestCases.has(
                                                                        testCase.id,
                                                                    ) && (
                                                                        <Lock className='h-3 w-3 text-muted-foreground' />
                                                                    )}
                                                                {isNewlyRevealed && (
                                                                    <Badge
                                                                        variant='secondary'
                                                                        className='text-xs'
                                                                    >
                                                                        Revealed!
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {isTestCaseVisible &&
                                                                testCase.input && (
                                                                    <pre className='mt-1 overflow-x-auto rounded bg-background p-2 text-xs'>
                                                                        <code>
                                                                            {testCase.input}
                                                                        </code>
                                                                    </pre>
                                                                )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Failed Attempts Progress Indicator - Mobile */}
                                        {PROGRESSIVE_REVELATION_ENABLED &&
                                            testCases.some(
                                                (tc) => tc.hidden && !revealedTestCases.has(tc.id),
                                            ) &&
                                            failedCompilationCount > 0 && (
                                                <div className='mt-4 rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20'>
                                                    <div className='mb-2 flex items-center gap-2'>
                                                        <AlertTriangle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                                                        <span className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                                                            {t(
                                                                'pages.student_questions.workspace.progressive_revelation.failed_attempts_label',
                                                            )}
                                                            : {failedCompilationCount}/
                                                            {FAILED_ATTEMPTS_THRESHOLD}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            (failedCompilationCount /
                                                                FAILED_ATTEMPTS_THRESHOLD) *
                                                            100
                                                        }
                                                        className='h-2'
                                                    />
                                                    <p className='mt-2 text-xs text-orange-700 dark:text-orange-300'>
                                                        {failedCompilationCount <
                                                        FAILED_ATTEMPTS_THRESHOLD
                                                            ? `${FAILED_ATTEMPTS_THRESHOLD - failedCompilationCount} ${t('pages.student_questions.workspace.progressive_revelation.attempts_remaining')}`
                                                            : t(
                                                                  'pages.student_questions.workspace.progressive_revelation.all_revealed',
                                                              )}
                                                    </p>
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
                                        onClick={() =>
                                            handleNavigationWithLockCheck(navigation.previous!.id)
                                        }
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
                                        onClick={() =>
                                            handleNavigationWithLockCheck(navigation.next!.id)
                                        }
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

                {/* Workspace Locked Alert */}
                {isWorkspaceLocked && (
                    <div className='border-b bg-destructive/10 p-4'>
                        <Alert variant='destructive'>
                            <Lock className='h-4 w-4' />
                            <AlertTitle>
                                {t('pages.student_questions.workspace.locked.title')}
                            </AlertTitle>
                            <AlertDescription className='mt-2'>
                                <p className='mb-2'>
                                    {t('pages.student_questions.workspace.locked.description')}
                                </p>
                                {workspaceUnlockAt && (
                                    <div className='mb-3 flex items-center gap-2 text-sm'>
                                        <Clock className='h-4 w-4' />
                                        <span>
                                            {t(
                                                'pages.student_questions.workspace.locked.unlock_in',
                                            )}
                                            :{' '}
                                            <strong>
                                                {getTimeUntilUnlock() ||
                                                    t(
                                                        'pages.student_questions.workspace.locked.unlock_now',
                                                    )}
                                            </strong>
                                        </span>
                                    </div>
                                )}
                                {canReattempt && (
                                    <div className='flex gap-2'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={handleReattempt}
                                            disabled={reattemptMutation.isPending}
                                            className='border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                                        >
                                            {reattemptMutation.isPending ? (
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            ) : (
                                                <RotateCcw className='mr-2 h-4 w-4' />
                                            )}
                                            {t(
                                                'pages.student_questions.workspace.locked.reattempt',
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Main workspace content with resizable panels */}
                <div className='flex flex-1 overflow-hidden'>
                    <ResizablePanelGroup direction='horizontal' className='hidden lg:flex'>
                        {/* Question description panel - desktop */}
                        <ResizablePanel minSize={20} defaultSize={25} className='overflow-hidden'>
                            <div className='flex h-full flex-col overflow-y-auto border-r'>
                                <div className='flex flex-col gap-4 p-4'>
                                    {/* Material Preview Button - Desktop */}
                                    {(material.data.description ||
                                        (material.data.file_url &&
                                            material.data.file_extension?.toLowerCase() ===
                                                'pdf')) && (
                                        <Button
                                            variant={stickyMaterialVisible ? 'default' : 'outline'}
                                            title={
                                                stickyMaterialVisible
                                                    ? t(
                                                          'pages.student_questions.workspace.hide_material',
                                                          {
                                                              defaultValue: 'Hide Material',
                                                          },
                                                      )
                                                    : t(
                                                          'pages.student_questions.workspace.show_material',
                                                          {
                                                              defaultValue: 'Show Material',
                                                          },
                                                      )
                                            }
                                            size='sm'
                                            onClick={() => {
                                                if (!stickyMaterialVisible) {
                                                    // Reset position when showing the material panel
                                                    resetPanelPosition();
                                                }
                                                setStickyMaterialVisible(!stickyMaterialVisible);
                                            }}
                                            className='hidden w-fit lg:flex'
                                        >
                                            <FileText className='h-4 w-4' />
                                            <span className='ml-1'>
                                                {stickyMaterialVisible
                                                    ? t(
                                                          'pages.student_questions.workspace.hide_material',
                                                          {
                                                              defaultValue: 'Hide',
                                                          },
                                                      )
                                                    : t(
                                                          'pages.student_questions.workspace.show_material',
                                                          {
                                                              defaultValue: 'Material',
                                                          },
                                                      )}
                                            </span>
                                        </Button>
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
                                            {testCases.map((testCase) => {
                                                // Determine if this test case should be visible
                                                const isTestCaseVisible =
                                                    !testCase.hidden ||
                                                    revealedTestCases.has(testCase.id);
                                                const isNewlyRevealed = newlyRevealedTestCases.has(
                                                    testCase.id,
                                                );

                                                return (
                                                    <div
                                                        key={testCase.id}
                                                        className={`mb-2 rounded-md border p-3 transition-all duration-500 ${
                                                            isNewlyRevealed
                                                                ? 'animate-pulse border-green-300 bg-green-100 dark:border-green-600 dark:bg-green-900/20'
                                                                : 'bg-muted'
                                                        }`}
                                                    >
                                                        <div className='flex items-center gap-2'>
                                                            <p className='flex-1 text-sm'>
                                                                {testCase.description}
                                                            </p>
                                                            {testCase.hidden &&
                                                                !revealedTestCases.has(
                                                                    testCase.id,
                                                                ) && (
                                                                    <Lock className='h-3 w-3 text-muted-foreground' />
                                                                )}
                                                            {isNewlyRevealed && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='text-xs'
                                                                >
                                                                    {t(
                                                                        'pages.student_questions.workspace.progressive_revelation.test_case_revealed',
                                                                    )}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {isTestCaseVisible && testCase.input && (
                                                            <pre className='mt-1 overflow-x-auto rounded bg-background p-2 text-xs'>
                                                                <code>{testCase.input}</code>
                                                            </pre>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Failed Attempts Progress Indicator - Desktop */}
                                    {PROGRESSIVE_REVELATION_ENABLED &&
                                        testCases.some(
                                            (tc) => tc.hidden && !revealedTestCases.has(tc.id),
                                        ) &&
                                        failedCompilationCount > 0 && (
                                            <div className='mt-4 rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20'>
                                                <div className='mb-2 flex items-center gap-2'>
                                                    <AlertTriangle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                                                    <span className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                                                        {t(
                                                            'pages.student_questions.workspace.progressive_revelation.failed_attempts_label',
                                                        )}
                                                        : {failedCompilationCount}/
                                                        {FAILED_ATTEMPTS_THRESHOLD}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={
                                                        (failedCompilationCount /
                                                            FAILED_ATTEMPTS_THRESHOLD) *
                                                        100
                                                    }
                                                    className='h-2'
                                                />
                                                <p className='mt-2 text-xs text-orange-700 dark:text-orange-300'>
                                                    {failedCompilationCount <
                                                    FAILED_ATTEMPTS_THRESHOLD
                                                        ? `${FAILED_ATTEMPTS_THRESHOLD - failedCompilationCount} ${t('pages.student_questions.workspace.progressive_revelation.attempts_remaining')}`
                                                        : t(
                                                              'pages.student_questions.workspace.progressive_revelation.all_revealed',
                                                          )}
                                                </p>
                                            </div>
                                        )}

                                    <div className='mt-4 text-center text-sm text-muted-foreground'>
                                        {t('pages.student_questions.workspace.time_spent')}:{' '}
                                        {formatTime(timeSpent)}
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Code editor and output panel group */}
                        <ResizablePanel minSize={50} defaultSize={75}>
                            <ResizablePanelGroup
                                direction={layoutMode === 'stacked' ? 'vertical' : 'horizontal'}
                                className='h-full'
                            >
                                {/* Code editor panel */}
                                <ResizablePanel
                                    minSize={30}
                                    defaultSize={layoutMode === 'stacked' ? 60 : 65}
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
                                                    <div className='flex items-center gap-2'>
                                                        <Button
                                                            title={
                                                                isAnswerCompleted
                                                                    ? t(
                                                                          'pages.student_questions.workspace.locked.answer_locked',
                                                                      )
                                                                    : isWorkspaceLocked &&
                                                                        !canReattempt
                                                                      ? t(
                                                                            'pages.student_questions.workspace.locked.cannot_run',
                                                                        )
                                                                      : undefined
                                                            }
                                                            onClick={handleRunCode}
                                                            disabled={
                                                                isCompiling ||
                                                                isAnswerCompleted ||
                                                                (isWorkspaceLocked && !canReattempt)
                                                            }
                                                            data-testid='run-code-button'
                                                        >
                                                            {isCompiling ? (
                                                                <Loader2 className='animate-spin' />
                                                            ) : isAnswerCompleted ? (
                                                                <Lock />
                                                            ) : isWorkspaceLocked &&
                                                              !canReattempt ? (
                                                                <Lock />
                                                            ) : (
                                                                <Redo2 />
                                                            )}
                                                            {isCompiling
                                                                ? t(
                                                                      'pages.student_questions.workspace.running',
                                                                  )
                                                                : isAnswerCompleted
                                                                  ? t(
                                                                        'pages.student_questions.workspace.locked.answer_locked_button',
                                                                    )
                                                                  : isWorkspaceLocked &&
                                                                      !canReattempt
                                                                    ? t(
                                                                          'pages.student_questions.workspace.locked.button',
                                                                      )
                                                                    : t(
                                                                          'pages.student_questions.workspace.run',
                                                                      )}
                                                            {(!isWorkspaceLocked || canReattempt) &&
                                                                !isAnswerCompleted &&
                                                                ' (CTRL + Enter)'}
                                                        </Button>

                                                        {/* Mark as Done Button */}
                                                        {showMarkAsDoneButton &&
                                                            !isAnswerCompleted && (
                                                                <Button
                                                                    variant='outline'
                                                                    onClick={() =>
                                                                        setMarkAsDoneDialogOpen(
                                                                            true,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        markAsDoneMutation.isPending
                                                                    }
                                                                    className='border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                                                                >
                                                                    {markAsDoneMutation.isPending ? (
                                                                        <Loader2 className='h-4 w-4 animate-spin' />
                                                                    ) : (
                                                                        <Check className='h-4 w-4' />
                                                                    )}
                                                                    <span className='ml-1 hidden md:inline'>
                                                                        {t(
                                                                            'pages.student_questions.workspace.mark_as_done.button',
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            )}

                                                        {/* Allow Re-attempt Button */}
                                                        {isAnswerCompleted && (
                                                            <Button
                                                                variant='outline'
                                                                onClick={handleAllowReAttempt}
                                                                disabled={
                                                                    allowReAttemptMutation.isPending
                                                                }
                                                                className='border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
                                                            >
                                                                {allowReAttemptMutation.isPending ? (
                                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                                ) : (
                                                                    <RotateCcw className='h-4 w-4' />
                                                                )}
                                                                <span className='ml-1 hidden md:inline'>
                                                                    {t(
                                                                        'pages.student_questions.workspace.allow_reattempt.button',
                                                                    )}
                                                                </span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                }
                                                data-testid='code-editor'
                                                className='flex-1 overflow-x-scroll'
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel
                                    minSize={20}
                                    defaultSize={layoutMode === 'stacked' ? 40 : 35}
                                >
                                    <div className='flex h-full flex-col'>
                                        <div className='border-b bg-muted/30 px-4 py-2'>
                                            <h3 className='font-medium'>
                                                {t('pages.student_questions.workspace.output')}
                                            </h3>
                                        </div>
                                        <div
                                            data-testid='output-panel'
                                            className='max-h-20 flex-1 overflow-auto p-4 lg:max-h-[calc(100vh-200px)]'
                                        >
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
                                                                        <pre className='whitespace-pre-wrap break-all text-xs'>
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
                                                                                data-testid='test-results-badge'
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
                                                                    <pre className='whitespace-pre-wrap break-all text-xs'>
                                                                        {out.content}
                                                                    </pre>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className='break-all rounded-md bg-muted p-3 text-sm'
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
                        </ResizablePanel>
                    </ResizablePanelGroup>

                    {/* Mobile layout */}
                    <div className='flex flex-1 flex-col lg:hidden'>
                        {/* Code Editor */}
                        <div className='flex-1'>
                            <CodeEditor
                                value={code}
                                showThemePicker={true}
                                onChange={handleCodeChange}
                                language={ProgrammingLanguageEnum.PYTHON}
                                headerClassName='pt-3 px-3'
                                headerChildren={
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            title={
                                                isAnswerCompleted
                                                    ? t(
                                                          'pages.student_questions.workspace.locked.answer_locked',
                                                      )
                                                    : isWorkspaceLocked && !canReattempt
                                                      ? t(
                                                            'pages.student_questions.workspace.locked.cannot_run',
                                                        )
                                                      : undefined
                                            }
                                            size='sm'
                                            onClick={handleRunCode}
                                            disabled={
                                                isCompiling ||
                                                isAnswerCompleted ||
                                                (isWorkspaceLocked && !canReattempt)
                                            }
                                        >
                                            {isCompiling ? (
                                                <Loader2 className='animate-spin' />
                                            ) : isAnswerCompleted ? (
                                                <Lock />
                                            ) : isWorkspaceLocked && !canReattempt ? (
                                                <Lock />
                                            ) : (
                                                <Redo2 />
                                            )}
                                            {isCompiling
                                                ? t('pages.student_questions.workspace.running')
                                                : isAnswerCompleted
                                                  ? t(
                                                        'pages.student_questions.workspace.locked.answer_locked_button',
                                                    )
                                                  : isWorkspaceLocked && !canReattempt
                                                    ? t(
                                                          'pages.student_questions.workspace.locked.button',
                                                      )
                                                    : t('pages.student_questions.workspace.run')}
                                        </Button>

                                        {/* Mark as Done Button */}
                                        {showMarkAsDoneButton && !isAnswerCompleted && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setMarkAsDoneDialogOpen(true)}
                                                disabled={markAsDoneMutation.isPending}
                                                className='border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                                            >
                                                {markAsDoneMutation.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <Check className='h-4 w-4' />
                                                )}
                                            </Button>
                                        )}

                                        {/* Allow Re-attempt Button */}
                                        {isAnswerCompleted && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={handleAllowReAttempt}
                                                disabled={allowReAttemptMutation.isPending}
                                                className='border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
                                            >
                                                {allowReAttemptMutation.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <RotateCcw className='h-4 w-4' />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                }
                            />
                        </div>

                        {/* Output */}
                        <div className='border-t bg-background'>
                            <div className='border-b bg-muted/30 px-4 py-2'>
                                <h3 className='text-sm font-medium'>
                                    {t('pages.student_questions.workspace.output')}
                                </h3>
                            </div>
                            <div className='max-h-64 overflow-auto p-4'>
                                {output.length === 0 && !isCompiling ? (
                                    <div className='flex h-32 items-center justify-center text-center text-muted-foreground'>
                                        <div>
                                            <AlertTriangle className='mx-auto mb-2 h-6 w-6' />
                                            <p className='text-sm'>
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
                                                    <Alert variant='destructive' key={i}>
                                                        <AlertCircle className='h-4 w-4' />
                                                        <AlertTitle>
                                                            {t(
                                                                'pages.student_questions.workspace.error.title',
                                                            )}
                                                        </AlertTitle>
                                                        <AlertDescription>
                                                            <pre className='whitespace-pre-wrap break-all text-xs'>
                                                                {out.content}
                                                            </pre>
                                                        </AlertDescription>
                                                    </Alert>
                                                );
                                            } else if (out.type === 'test_stats') {
                                                return (
                                                    <Card key={i}>
                                                        <CardContent className='p-3'>
                                                            <div className='mb-2 flex items-center justify-between'>
                                                                <h4 className='text-sm font-medium'>
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
                                                                    {out.success}/{out.total_tests}
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
                                                        <pre className='whitespace-pre-wrap break-all text-xs'>
                                                            {out.content}
                                                        </pre>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div key={i} className='break-all text-sm'>
                                                        {out.content}
                                                    </div>
                                                );
                                            }
                                        })}
                                        {isCompiling && (
                                            <div className='flex items-center justify-center p-4 text-muted-foreground'>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                {t('pages.student_questions.workspace.running')}
                                                ...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Material Preview Dialog */}
                <Dialog open={materialPreviewOpen} onOpenChange={setMaterialPreviewOpen}>
                    <DialogContent className='max-h-[90vh] max-w-[90vw] overflow-hidden'>
                        <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                                <FileText className='h-5 w-5' />
                                {material.data.title}
                            </DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>

                        <div className='flex flex-col gap-4 overflow-auto'>
                            {/* Learning Material Description */}
                            {material.data.description && (
                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <h3 className='mb-2 text-sm font-medium'>
                                        {t('pages.student_questions.workspace.description', {
                                            defaultValue: 'Description',
                                        })}
                                    </h3>
                                    <ReactMarkdown>{material.data.description}</ReactMarkdown>
                                </div>
                            )}

                            {/* PDF Material Section */}
                            {material.data.file_url &&
                                material.data.file_extension?.toLowerCase() === 'pdf' && (
                                    <div className='my-3 rounded-md border bg-background'>
                                        <PDFViewer
                                            title='-'
                                            fileUrl={material.data.file_url}
                                            filename={material.data.file || material.data.title}
                                            className='max-h-[60vh] min-h-96'
                                        />
                                    </div>
                                )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Mark as Done Dialog */}
                <Dialog open={markAsDoneDialogOpen} onOpenChange={setMarkAsDoneDialogOpen}>
                    <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                                <Check className='h-5 w-5 text-green-600' />
                                {t('pages.student_questions.workspace.mark_as_done.dialog.title')}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    'pages.student_questions.workspace.mark_as_done.dialog.description',
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className='mt-3 space-y-4'>
                            <Alert>
                                <AlertCircle />
                                <AlertTitle>
                                    {t(
                                        'pages.student_questions.workspace.mark_as_done.dialog.warning_title',
                                    )}
                                </AlertTitle>
                                <AlertDescription>
                                    {t(
                                        'pages.student_questions.workspace.mark_as_done.dialog.warning_description',
                                    )}
                                </AlertDescription>
                            </Alert>
                            <div className='flex justify-end gap-3'>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        setMarkAsDoneDialogOpen(false);
                                        // Clear pending navigation if exists
                                        delete (window as any).pendingNavigationQuestionId;
                                    }}
                                    disabled={markAsDoneMutation.isPending}
                                >
                                    {t(
                                        'pages.student_questions.workspace.mark_as_done.dialog.cancel',
                                    )}
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={proceedWithNavigation}
                                    disabled={markAsDoneMutation.isPending}
                                    className='border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
                                >
                                    {t(
                                        'pages.student_questions.workspace.mark_as_done.dialog.continue',
                                    )}
                                </Button>
                                <Button
                                    onClick={handleMarkAsDone}
                                    disabled={markAsDoneMutation.isPending}
                                    className='bg-green-600 hover:bg-green-700'
                                >
                                    {markAsDoneMutation.isPending ? (
                                        <Loader2 className='mr-2 animate-spin' />
                                    ) : (
                                        <Check className='mr-2' />
                                    )}
                                    {t(
                                        'pages.student_questions.workspace.mark_as_done.dialog.mark_done',
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
