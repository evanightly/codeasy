import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Badge } from '@/Components/UI/badge';
import { Card, CardContent } from '@/Components/UI/card';
import { Progress } from '@/Components/UI/progress';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface OutputPanelProps {
    output: any[];
    isCompiling: boolean;
    className?: string;
}

export function OutputPanel({ output, isCompiling, className = '' }: OutputPanelProps) {
    const { t } = useLaravelReactI18n();

    if (output.length === 0 && !isCompiling) {
        return (
            <div
                className={`flex h-full items-center justify-center text-center text-muted-foreground ${className}`}
            >
                <div>
                    <AlertTriangle className='mx-auto mb-2 h-8 w-8' />
                    <p>{t('pages.student_questions.workspace.no_output_yet')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {output.map((out, i) => {
                if (out.type === 'image') {
                    return (
                        <div key={i} className='rounded-md border'>
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
                                {t('pages.student_questions.workspace.error.title')}
                            </AlertTitle>
                            <AlertDescription>
                                <pre className='whitespace-pre-wrap text-xs'>{out.content}</pre>
                            </AlertDescription>
                        </Alert>
                    );
                } else if (out.type === 'test_stats') {
                    return (
                        <Card key={i}>
                            <CardContent className='p-4'>
                                <div className='mb-2 flex items-center justify-between'>
                                    <h4 className='font-medium'>
                                        {t('pages.student_questions.workspace.test_results')}
                                    </h4>
                                    <Badge
                                        variant={
                                            out.success === out.total_tests
                                                ? 'success'
                                                : 'destructive'
                                        }
                                    >
                                        {out.success}/{out.total_tests}
                                        {t('pages.student_questions.workspace.passed')}
                                    </Badge>
                                </div>
                                <Progress
                                    value={(out.success / out.total_tests) * 100}
                                    className='h-2'
                                />
                            </CardContent>
                        </Card>
                    );
                } else if (out.type === 'test_result') {
                    return (
                        <div key={i} className='rounded-md bg-muted p-3 text-sm'>
                            <pre className='whitespace-pre-wrap text-xs'>{out.content}</pre>
                        </div>
                    );
                } else {
                    return (
                        <div key={i} className='rounded-md bg-muted p-3 text-sm'>
                            {out.content}
                        </div>
                    );
                }
            })}
            {isCompiling && (
                <div className='flex items-center justify-center p-4 text-muted-foreground'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('pages.student_questions.workspace.running')}...
                </div>
            )}
        </div>
    );
}
