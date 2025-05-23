import { Button } from '@/Components/UI/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Code, ExternalLink } from 'lucide-react';

interface TestCaseExamplesProps {
    onExampleClick: (example: string) => void;
}

export function TestCaseExamples({ onExampleClick }: TestCaseExamplesProps) {
    const { t } = useLaravelReactI18n();

    const examples = [
        {
            title: 'Basic Equality',
            code: 'self.assertEqual(add(2, 3), 5)',
        },
        {
            title: 'Function Output',
            code: 'result = subtract(10, 5)\nself.assertEqual(result, 5)',
        },
        {
            title: 'Multiple Assertions',
            code: 'self.assertEqual(multiply(2, 3), 6)\nself.assertEqual(multiply(0, 5), 0)\nself.assertTrue(multiply(2, 2) == 4)',
        },
        {
            title: 'String Comparison',
            code: 'self.assertEqual(greeting("John"), "Hello, John!")\nself.assertTrue("John" in greeting("John"))',
        },
        {
            title: 'Exception Handling',
            code: 'with self.assertRaises(ValueError):\n    divide(10, 0)',
        },
        {
            title: 'List Comparison',
            code: 'self.assertEqual(sort_list([3, 1, 2]), [1, 2, 3])\nself.assertIn(5, get_list_with_five())',
        },
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                    <Code className='h-4 w-4' />
                    {t('components.test_case_examples.title', {
                        defaultValue: 'Example Test Cases',
                    })}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto max-w-[90vw] p-4 sm:max-w-[600px]' align='start'>
                <div className='space-y-3'>
                    <p className='text-xs text-muted-foreground'>
                        {t('components.test_case_examples.description', {
                            defaultValue: 'Click an example to insert it into the input field.',
                        })}
                    </p>
                    <div className='grid gap-2 sm:grid-cols-2'>
                        {examples.map((example, index) => (
                            <div
                                onClick={() => onExampleClick(example.code)}
                                key={index}
                                className='cursor-pointer rounded-md border bg-background p-2 text-xs hover:border-primary hover:bg-primary/5'
                            >
                                <p className='mb-1 font-medium'>{example.title}</p>
                                <pre className='overflow-x-auto whitespace-pre-wrap'>
                                    {example.code}
                                </pre>
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-end'>
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://docs.python.org/3/library/unittest.html'
                            className='inline-flex items-center gap-1 text-xs text-blue-600 hover:underline'
                        >
                            {t('components.test_case_examples.docs_link', {
                                defaultValue: 'Python unittest documentation',
                            })}
                            <ExternalLink className='h-3 w-3' />
                        </a>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
