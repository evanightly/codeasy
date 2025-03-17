import { LearningMaterialQuestionResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TestCase {
    id: number;
    description: string;
    input: string;
    hidden: boolean;
    active: boolean;
}

interface QuestionInfoProps {
    question: LearningMaterialQuestionResource;
    testCases: TestCase[];
    timeSpent: number;
    className?: string;
}

export function QuestionInfo({
    question,
    testCases,
    timeSpent,
    className = '',
}: QuestionInfoProps) {
    const { t } = useLaravelReactI18n();

    // Function to format seconds into readable time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const secs = seconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`p-4 ${className}`}>
            {/* <ReactMarkdown className='prose prose-sm dark:prose-invert max-w-none'> */}
            <ReactMarkdown>{question.description}</ReactMarkdown>

            {question.file_url && (
                <div className='mt-4'>
                    <h3 className='mb-2 text-sm font-medium'>
                        {t('pages.student_questions.workspace.view_image')}:
                    </h3>
                    <img
                        src={question.file_url}
                        className='max-w-full rounded-md border'
                        alt='Question reference'
                    />
                </div>
            )}

            {question.clue && (
                <div className='mt-4 rounded-md border bg-muted p-3'>
                    <p className='mb-1 text-sm font-medium'>
                        {t('pages.student_questions.workspace.clue')}:
                    </p>
                    <p className='text-sm'>{question.clue}</p>
                </div>
            )}

            {testCases.length > 0 && (
                <div className='mt-4'>
                    <h4 className='mb-2 text-sm font-medium'>
                        {t('pages.student_questions.workspace.test_cases')}:
                    </h4>
                    {testCases.map((testCase) => (
                        <div key={testCase.id} className='mb-2 rounded-md border bg-muted p-3'>
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

            <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>
                    {t('pages.student_questions.workspace.time_spent')}: {formatTime(timeSpent)}
                </span>
            </div>
        </div>
    );
}
