import { Button } from '@/Components/UI/button';
import { CardHeader, CardTitle } from '@/Components/UI/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { ProgrammingLanguageEnum } from '@/Support/Enums/programmingLanguageEnum';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CheckCircle, FileCode2, InfoIcon, Terminal, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CodeEditor from './CodeEditor';
import { Separator } from './UI/separator';

interface TestCaseDebuggerProps {
    testCaseInput: string;
    initialCode?: string;
    language?: ProgrammingLanguageEnum;
    hideTitle?: boolean;
}

export function TestCaseDebugger({
    testCaseInput,
    initialCode = '',
    language = ProgrammingLanguageEnum.PYTHON,
    hideTitle = false,
}: TestCaseDebuggerProps) {
    const { t } = useLaravelReactI18n();
    const [code, setCode] = useState(initialCode);
    const [isExecuting, setIsExecuting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        output: any[];
        error?: string;
    } | null>(null);

    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    const runTestCase = async () => {
        if (!code.trim()) {
            toast.error(t('components.test_case_debugger.no_code'));
            return;
        }

        setIsExecuting(true);
        setTestResult(null);

        try {
            // Use the new dedicated endpoint for test case debugging
            const response = await axios.post('/api/debug-test-case', {
                student_code: code,
                test_case_code: testCaseInput,
                language: language,
            });

            const data = response.data;
            const results = data.results || [];

            // Look for errors
            const errorOutput = results.find((item: any) => item.type === 'error');

            if (errorOutput) {
                setTestResult({
                    success: false,
                    output: results,
                    error: errorOutput.content,
                });
            } else {
                setTestResult({
                    success: data.success,
                    output: results,
                });
            }
        } catch (error: any) {
            console.error('Error executing test case:', error);
            setTestResult({
                success: false,
                output: [],
                error:
                    error.response?.data?.message ||
                    t('components.test_case_debugger.execution_error'),
            });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div>
            {!hideTitle && (
                <CardHeader>
                    <CardTitle>{t('components.test_case_debugger.title')}</CardTitle>
                </CardHeader>
            )}
            <div className='space-y-4'>
                <div className='space-y-2'>
                    <CodeEditor
                        value={code}
                        onChange={handleCodeChange}
                        language={language}
                        height='250px'
                        headerChildren={
                            <Button
                                type='button'
                                onClick={runTestCase}
                                loading={isExecuting}
                                disabled={isExecuting}
                            >
                                {t('components.test_case_debugger.run_button')}
                            </Button>
                        }
                    />
                    <p className='text-xs text-muted-foreground'>
                        {t('components.test_case_debugger.instruction')}
                    </p>
                </div>

                {testResult && (
                    <div
                        className={`mt-4 rounded-md p-4 ${
                            testResult.success
                                ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                    >
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                {testResult.success ? (
                                    <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                                ) : (
                                    <XCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                                )}
                                <span className='font-medium'>
                                    {testResult.success
                                        ? t('components.test_case_debugger.test_passed')
                                        : t('components.test_case_debugger.test_failed')}
                                </span>
                            </div>

                            {/* Popover for execution details */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        type='button'
                                        size='sm'
                                        className='h-8 text-muted-foreground hover:bg-background/50'
                                    >
                                        <InfoIcon className='mr-1 h-4 w-4' />
                                        {t('components.test_case_debugger.view_details')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    sideOffset={5}
                                    className='w-[350px] p-0'
                                    align='end'
                                >
                                    <div className='space-y-2 p-4'>
                                        <h4 className='font-medium'>
                                            {t('components.test_case_debugger.execution_details')}
                                        </h4>

                                        <Separator />

                                        <div className='space-y-3 pt-2'>
                                            {/* Test Output Summary */}
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-2 text-sm'>
                                                    <Terminal className='h-4 w-4 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t(
                                                            'components.test_case_debugger.output_summary',
                                                        )}
                                                    </span>
                                                </div>
                                                <div className='rounded bg-muted p-2 text-xs'>
                                                    <pre className='whitespace-pre-wrap break-all'>
                                                        {testResult.output
                                                            .filter((o) => o.type === 'text')
                                                            .map((o) => o.content)
                                                            .join('\n')}
                                                    </pre>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Test Case Code */}
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-2 text-sm'>
                                                    <FileCode2 className='h-4 w-4 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t(
                                                            'components.test_case_debugger.test_case',
                                                        )}
                                                    </span>
                                                </div>
                                                <div className='rounded bg-muted p-2 text-xs'>
                                                    <pre className='whitespace-pre-wrap break-all'>
                                                        {testCaseInput}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Detailed Test Results */}
                                            {testResult.output.some(
                                                (o) => o.type === 'test_result',
                                            ) && (
                                                <div className='space-y-1'>
                                                    <div className='flex items-center gap-2 text-sm'>
                                                        <Terminal className='h-4 w-4 text-muted-foreground' />
                                                        <span className='font-medium'>
                                                            {t(
                                                                'components.test_case_debugger.detailed_results',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className='rounded bg-muted p-2 text-xs'>
                                                        <pre className='whitespace-pre-wrap'>
                                                            {testResult.output
                                                                .filter(
                                                                    (o) => o.type === 'test_result',
                                                                )
                                                                .map((o) => o.content)
                                                                .join('\n')}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {testResult.error && (
                            <div className='mt-2 rounded bg-background/50 p-2 font-mono text-xs'>
                                <pre className='whitespace-pre-wrap'>{testResult.error}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
