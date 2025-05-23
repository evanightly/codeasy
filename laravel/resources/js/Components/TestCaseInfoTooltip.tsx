import { useLaravelReactI18n } from 'laravel-react-i18n';
import { InfoIcon, LightbulbIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './UI/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './UI/card';

export function TestCaseInfoTooltip() {
    const { t } = useLaravelReactI18n();

    return (
        <Card className='mb-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30'>
            <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300'>
                    <LightbulbIcon className='h-5 w-5' />
                    {t('components.test_case_info.title', {
                        defaultValue: 'Test Case Guidelines',
                    })}
                </CardTitle>
                <CardDescription className='text-blue-600/80 dark:text-blue-400/80'>
                    Follow these guidelines to create effective test cases
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className='list-disc space-y-1 pl-4 text-sm text-blue-700 dark:text-blue-300'>
                    <li>
                        {t('components.test_case_info.student_code', {
                            defaultValue:
                                'Student code is executed globally - all functions and variables are accessible',
                        })}
                    </li>
                    <li>
                        {t('components.test_case_info.unittest', {
                            defaultValue:
                                'Use Python unittest assertions (assertEqual, assertTrue, assertIn, etc.)',
                        })}
                    </li>
                    <li>
                        {t('components.test_case_info.direct_access', {
                            defaultValue:
                                'You can directly call student functions: self.assertEqual(add(5, 5), 10)',
                        })}
                    </li>
                    <li>
                        {t('components.test_case_info.example', {
                            defaultValue:
                                'Example: self.assertTrue(result > 0) or self.assertIn("hello", output)',
                        })}
                    </li>
                </ul>

                <Alert className='mt-3 border-blue-300 bg-blue-100/50 dark:border-blue-800 dark:bg-blue-900/30'>
                    <InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <AlertTitle className='text-blue-700 dark:text-blue-300'>Example</AlertTitle>
                    <AlertDescription>
                        <pre className='mt-1 rounded bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'>
                            {`# Example test case - student code is already executed globally
self.assertEqual(add(5, 5), 10)  # Direct function call
self.assertTrue(multiply(2, 3) == 6)  # Boolean assertion
self.assertIn("hello", greeting("world"))  # String contains`}
                        </pre>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
