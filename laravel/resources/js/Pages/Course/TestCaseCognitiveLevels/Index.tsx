import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
import { Input } from '@/Components/UI/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { CognitiveLevelEnum } from '@/Support/Enums/cognitiveLevelEnum';
import {
    CourseResource,
    LearningMaterialQuestionTestCaseResource,
} from '@/Support/Interfaces/Resources';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckSquare, Save, Search, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    course: CourseResource;
    testCases: LearningMaterialQuestionTestCaseResource[];
}

const Index = ({ course, testCases }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [updates, setUpdates] = useState<Map<number, CognitiveLevelEnum[]>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cognitive levels with labels
    const cognitiveLevels = [
        { value: CognitiveLevelEnum.C1, label: 'C1 - Remember' },
        { value: CognitiveLevelEnum.C2, label: 'C2 - Understand' },
        { value: CognitiveLevelEnum.C3, label: 'C3 - Apply' },
        { value: CognitiveLevelEnum.C4, label: 'C4 - Analyze' },
        { value: CognitiveLevelEnum.C5, label: 'C5 - Evaluate' },
        { value: CognitiveLevelEnum.C6, label: 'C6 - Create' },
    ];

    // Filter test cases based on search query
    const filteredTestCases = useMemo(() => {
        if (!searchQuery.trim()) return testCases;

        const query = searchQuery.toLowerCase();
        return testCases.filter(
            (testCase) =>
                testCase.title?.toLowerCase().includes(query) ||
                testCase.description?.toLowerCase().includes(query) ||
                testCase.learning_material_question?.title?.toLowerCase().includes(query),
        );
    }, [testCases, searchQuery]);

    // Get current cognitive levels for a test case (either from updates or original data)
    const getCurrentCognitiveLevels = (
        testCase: LearningMaterialQuestionTestCaseResource,
    ): CognitiveLevelEnum[] => {
        if (updates.has(testCase.id)) {
            return updates.get(testCase.id) || [];
        }

        // Debug log to see what we're getting from the backend
        console.log(`Test case ${testCase.id} cognitive_levels:`, testCase.cognitive_levels);

        return (testCase.cognitive_levels as CognitiveLevelEnum[]) || [];
    };

    // Handle cognitive level checkbox changes
    const handleCognitiveLevelChange = (
        testCaseId: number,
        level: CognitiveLevelEnum,
        checked: boolean,
    ) => {
        const currentLevels = getCurrentCognitiveLevels(
            testCases.find((tc) => tc.id === testCaseId)!,
        );
        let newLevels: CognitiveLevelEnum[];

        if (checked) {
            newLevels = [...currentLevels, level];
        } else {
            newLevels = currentLevels.filter((l) => l !== level);
        }

        setUpdates((prev) => new Map(prev.set(testCaseId, newLevels)));
    };

    // Check if there are any pending changes
    const hasChanges = updates.size > 0;

    // Handle bulk select all/none for a cognitive level
    const handleBulkToggle = (level: CognitiveLevelEnum) => {
        const allHaveLevel = filteredTestCases.every((testCase) =>
            getCurrentCognitiveLevels(testCase).includes(level),
        );

        filteredTestCases.forEach((testCase) => {
            handleCognitiveLevelChange(testCase.id, level, !allHaveLevel);
        });
    };

    // Check if all visible test cases have a specific cognitive level
    const isLevelSelectedForAll = (level: CognitiveLevelEnum): boolean => {
        return (
            filteredTestCases.length > 0 &&
            filteredTestCases.every((testCase) =>
                getCurrentCognitiveLevels(testCase).includes(level),
            )
        );
    };

    // Handle save changes
    const handleSave = async () => {
        if (!hasChanges) return;

        setIsSubmitting(true);

        try {
            const updateData = Array.from(updates.entries()).map(([id, cognitive_levels]) => ({
                id,
                cognitive_levels,
            }));

            await new Promise<void>((resolve, reject) => {
                router.patch(
                    route(`${ROUTES.COURSES}.test-cases.cognitive-levels.bulk-update`, course.id),
                    { updates: updateData } as any,
                    {
                        onSuccess: () => {
                            setUpdates(new Map());
                            toast.success('Cognitive levels updated successfully');
                            // Refresh the page to show updated data
                            router.visit(
                                route(`${ROUTES.COURSES}.test-cases.cognitive-levels`, course.id),
                                {
                                    preserveState: false,
                                    preserveScroll: true,
                                },
                            );
                            resolve();
                        },
                        onError: (errors) => {
                            console.error('Update failed:', errors);

                            let errorMessage = 'Failed to update cognitive levels';
                            if (errors) {
                                if (typeof errors === 'string') {
                                    errorMessage = errors;
                                } else if (errors.message) {
                                    errorMessage = errors.message;
                                } else if (errors.updates) {
                                    errorMessage =
                                        'Validation error: ' +
                                        Object.values(errors.updates).flat().join(', ');
                                }
                            }

                            toast.error(errorMessage);
                            reject(new Error('Update failed'));
                        },
                    },
                );
            });
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout title={`Cognitive Levels - ${course.name}`}>
            <Head title={`Cognitive Levels - ${course.name}`} />

            <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.visit(route(`${ROUTES.COURSES}.show`, course.id))}
                            className='flex items-center space-x-2'
                        >
                            <ArrowLeft className='h-4 w-4' />
                            <span>Back to Course</span>
                        </Button>
                        <div>
                            <h1 className='text-2xl font-bold'>Test Case Cognitive Levels</h1>
                            <p className='text-muted-foreground'>Course: {course.name}</p>
                        </div>
                    </div>

                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className='flex items-center space-x-2'
                        >
                            <Save className='h-4 w-4' />
                            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                        </Button>
                    )}
                </div>

                {/* Search and Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Cognitive Levels</CardTitle>
                        <CardDescription>
                            Assign cognitive levels to test cases based on Bloom's taxonomy. You can
                            select multiple levels for each test case.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='mb-6 flex items-center space-x-4'>
                            <div className='relative max-w-md flex-1'>
                                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                                <Input
                                    value={searchQuery}
                                    placeholder='Search test cases or questions...'
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='pl-10'
                                />
                            </div>
                            <div className='text-sm text-muted-foreground'>
                                Showing {filteredTestCases.length} of {testCases.length} test cases
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        <div className='mb-6'>
                            <h3 className='mb-3 text-sm font-medium'>
                                Bulk Actions (for visible test cases)
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {cognitiveLevels.map((level) => (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleBulkToggle(level.value)}
                                        key={level.value}
                                        className='flex items-center space-x-2'
                                    >
                                        {isLevelSelectedForAll(level.value) ? (
                                            <CheckSquare className='h-4 w-4' />
                                        ) : (
                                            <Square className='h-4 w-4' />
                                        )}
                                        <span>{level.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Cases List */}
                <div className='space-y-4'>
                    {filteredTestCases.length === 0 ? (
                        <Card>
                            <CardContent className='py-8 text-center'>
                                <p className='text-muted-foreground'>
                                    {searchQuery
                                        ? 'No test cases found matching your search.'
                                        : 'No test cases found in this course.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredTestCases.map((testCase) => {
                            console.log(testCase);

                            const currentLevels = getCurrentCognitiveLevels(testCase);
                            const hasUpdates = updates.has(testCase.id);

                            return (
                                <Card
                                    key={testCase.id}
                                    className={hasUpdates ? 'border-blue-200 bg-blue-50/20' : ''}
                                >
                                    <CardContent className='py-4'>
                                        <div className='space-y-4'>
                                            {/* Test Case Info */}
                                            <div>
                                                <div className='flex items-start justify-between'>
                                                    <div className='space-y-1'>
                                                        <h3 className='font-medium'>
                                                            {`Test Case #${testCase.id}`}
                                                            {hasUpdates && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='ml-2'
                                                                >
                                                                    Modified
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className='text-sm text-muted-foreground'>
                                                            Question:{' '}
                                                            {
                                                                testCase.learning_material_question
                                                                    ?.title
                                                            }
                                                        </p>
                                                        <p className='text-xs text-muted-foreground'>
                                                            Input:{' '}
                                                            {testCase.input?.substring(0, 100)}
                                                            {testCase.input &&
                                                            testCase.input.length > 100
                                                                ? '...'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    <div className='flex flex-wrap gap-1'>
                                                        {currentLevels.map((level) => (
                                                            <Badge variant='secondary' key={level}>
                                                                {level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cognitive Levels Checkboxes */}
                                            <div>
                                                <h4 className='mb-2 text-sm font-medium'>
                                                    Cognitive Levels
                                                </h4>
                                                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
                                                    {cognitiveLevels.map((level) => {
                                                        const isChecked = currentLevels.includes(
                                                            level.value,
                                                        );
                                                        // console.log(
                                                        //     `Test case ${testCase.id}, level ${level.value}: currentLevels=`,
                                                        //     currentLevels,
                                                        //     'isChecked=',
                                                        //     isChecked,
                                                        // );

                                                        return (
                                                            <div
                                                                key={level.value}
                                                                className='flex items-center space-x-2'
                                                            >
                                                                <Checkbox
                                                                    onCheckedChange={(checked) =>
                                                                        handleCognitiveLevelChange(
                                                                            testCase.id,
                                                                            level.value,
                                                                            checked as boolean,
                                                                        )
                                                                    }
                                                                    id={`${testCase.id}-${level.value}`}
                                                                    checked={isChecked}
                                                                />
                                                                <label
                                                                    htmlFor={`${testCase.id}-${level.value}`}
                                                                    className='cursor-pointer text-sm'
                                                                >
                                                                    {level.label}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Footer with Save Button */}
                {hasChanges && (
                    <div className='sticky bottom-4 flex justify-center'>
                        <Card className='shadow-lg'>
                            <CardContent className='py-3'>
                                <div className='flex items-center space-x-4'>
                                    <span className='text-sm text-muted-foreground'>
                                        {updates.size} test case{updates.size !== 1 ? 's' : ''}{' '}
                                        modified
                                    </span>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className='flex items-center space-x-2'
                                    >
                                        <Save className='h-4 w-4' />
                                        <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
