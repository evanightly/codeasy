import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/UI/command';
import { Input } from '@/Components/UI/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { CognitiveLevelEnum } from '@/Support/Enums/cognitiveLevelEnum';
import {
    CourseResource,
    LearningMaterialQuestionTestCaseResource,
} from '@/Support/Interfaces/Resources';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    CheckSquare,
    ChevronDown,
    Download,
    FileSpreadsheet,
    Filter,
    GripVertical,
    Save,
    Search,
    Square,
    Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Drag and drop imports
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IntentEnum } from '@/Support/Enums/intentEnum';

interface Props {
    course: CourseResource;
    testCases: LearningMaterialQuestionTestCaseResource[];
}

interface ImportResult {
    successful: {
        testCase: LearningMaterialQuestionTestCaseResource;
        matched: string;
        cognitiveLevels: CognitiveLevelEnum[];
    }[];
    failed: { csvEntry: string; reason: string }[];
    totalProcessed: number;
}

interface ImportModeSelection {
    excelRowCount: number;
    testCaseCount: number;
    selectedMode: 'smart' | 'sequence' | null;
    showModeSelection: boolean;
    excelData?: { testCasePattern: string; cognitiveLevels: string }[];
    mergeMode?: 'smart' | 'sequence';
    sequenceValidation?: SequenceValidationResult;
    showSequenceValidation?: boolean;
}

interface SequenceValidationResult {
    matches: {
        index: number;
        testCase: LearningMaterialQuestionTestCaseResource;
        excelPattern: string;
        isMatch: boolean;
        materialId?: number;
        materialTitle?: string;
    }[];
    hasAnyMismatch: boolean;
    mismatchCount: number;
    matchCount: number;
    materialGroups: {
        materialId: number;
        materialTitle: string;
        matches: {
            index: number;
            testCase: LearningMaterialQuestionTestCaseResource;
            excelPattern: string;
            isMatch: boolean;
        }[];
    }[];
}

const Index = ({ course, testCases }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
    const [materialSortBy, setMaterialSortBy] = useState<'id' | 'title' | 'count' | 'manual'>('id');
    const [materialOrder, setMaterialOrder] = useState<number[]>([]);
    const [updates, setUpdates] = useState<Map<number, CognitiveLevelEnum[]>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importModeSelection, setImportModeSelection] = useState<ImportModeSelection | null>(
        null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Cognitive levels with labels
    const cognitiveLevels = [
        { value: CognitiveLevelEnum.C1, label: 'C1 - Remember' },
        { value: CognitiveLevelEnum.C2, label: 'C2 - Understand' },
        { value: CognitiveLevelEnum.C3, label: 'C3 - Apply' },
        { value: CognitiveLevelEnum.C4, label: 'C4 - Analyze' },
        { value: CognitiveLevelEnum.C5, label: 'C5 - Evaluate' },
        { value: CognitiveLevelEnum.C6, label: 'C6 - Create' },
    ];

    // Extract unique learning materials for filtering
    const availableMaterials = useMemo(() => {
        const materialsMap = new Map();
        testCases.forEach((testCase) => {
            const material = testCase.learning_material_question?.learning_material;
            if (material && material.id) {
                if (!materialsMap.has(material.id)) {
                    materialsMap.set(material.id, {
                        id: material.id,
                        title: material.title || `Material ${material.id}`,
                        count: 0,
                    });
                }
                const existing = materialsMap.get(material.id);
                existing.count += 1;
            }
        });

        const materials = Array.from(materialsMap.values());

        // Sort based on selected sort option
        switch (materialSortBy) {
            case 'id':
                return materials.sort((a, b) => a.id - b.id);
            case 'title':
                return materials.sort((a, b) => a.title.localeCompare(b.title));
            case 'count':
                return materials.sort((a, b) => b.count - a.count); // Descending order
            case 'manual':
                // Use custom order if available, otherwise fall back to ID sort
                if (materialOrder.length > 0) {
                    const orderMap = new Map(materialOrder.map((id, index) => [id, index]));
                    return materials.sort((a, b) => {
                        const orderA = orderMap.get(a.id) ?? materials.length;
                        const orderB = orderMap.get(b.id) ?? materials.length;
                        if (orderA !== orderB) return orderA - orderB;
                        return a.id - b.id; // Fallback to ID for items not in custom order
                    });
                }
                return materials.sort((a, b) => a.id - b.id);
            default:
                return materials.sort((a, b) => a.id - b.id);
        }
    }, [testCases, materialSortBy, materialOrder]);

    // Initialize material order when materials change or sort changes to manual
    const initializeMaterialOrder = () => {
        if (materialSortBy === 'manual' && materialOrder.length === 0) {
            const materialIds = availableMaterials.map((m) => m.id);
            setMaterialOrder(materialIds);
        }
    };

    // Effect to initialize material order
    useMemo(() => {
        initializeMaterialOrder();
    }, [materialSortBy, availableMaterials.length]);

    // Filter test cases based on search query and selected materials
    const filteredTestCases = useMemo(() => {
        let filtered = testCases;

        // Filter by selected materials
        if (selectedMaterialIds.length > 0) {
            filtered = filtered.filter((testCase) => {
                const materialId = testCase.learning_material_question?.learning_material?.id;
                return materialId && selectedMaterialIds.includes(materialId);
            });

            // Sort filtered test cases to match material sort order
            if (materialSortBy === 'id') {
                filtered = filtered.sort((a, b) => {
                    const materialIdA = a.learning_material_question?.learning_material?.id || 0;
                    const materialIdB = b.learning_material_question?.learning_material?.id || 0;
                    return materialIdA - materialIdB;
                });
            } else if (materialSortBy === 'title') {
                filtered = filtered.sort((a, b) => {
                    const titleA = a.learning_material_question?.learning_material?.title || '';
                    const titleB = b.learning_material_question?.learning_material?.title || '';
                    return titleA.localeCompare(titleB);
                });
            } else if (materialSortBy === 'manual' && materialOrder.length > 0) {
                const orderMap = new Map(materialOrder.map((id, index) => [id, index]));
                filtered = filtered.sort((a, b) => {
                    const materialIdA = a.learning_material_question?.learning_material?.id || 0;
                    const materialIdB = b.learning_material_question?.learning_material?.id || 0;
                    const orderA = orderMap.get(materialIdA) ?? materialOrder.length;
                    const orderB = orderMap.get(materialIdB) ?? materialOrder.length;
                    if (orderA !== orderB) return orderA - orderB;
                    return materialIdA - materialIdB; // Fallback to ID
                });
            }
            // For count sorting, maintain the original order since count doesn't apply to individual test cases
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (testCase) =>
                    testCase.title?.toLowerCase().includes(query) ||
                    testCase.description?.toLowerCase().includes(query) ||
                    testCase.learning_material_question?.title?.toLowerCase().includes(query) ||
                    testCase.learning_material_question?.learning_material?.title
                        ?.toLowerCase()
                        .includes(query),
            );
        }

        return filtered;
    }, [testCases, searchQuery, selectedMaterialIds]);

    // Calculate base filtered count (before search) for proper count display
    const materialFilteredTestCases = useMemo(() => {
        if (selectedMaterialIds.length === 0) return testCases;

        return testCases.filter((testCase) => {
            const materialId = testCase.learning_material_question?.learning_material?.id;
            return materialId && selectedMaterialIds.includes(materialId);
        });
    }, [testCases, selectedMaterialIds]);

    // Handle material filter changes
    const handleMaterialFilterChange = (materialId: number) => {
        setSelectedMaterialIds((prev) => {
            if (prev.includes(materialId)) {
                return prev.filter((id) => id !== materialId);
            } else {
                return [...prev, materialId];
            }
        });
    };

    // Handle "All Materials" toggle
    const handleAllMaterialsToggle = () => {
        if (selectedMaterialIds.length === 0) {
            // Currently showing all materials, so select all specific materials
            setSelectedMaterialIds(availableMaterials.map((m) => m.id));
        } else {
            // Some or all materials are selected, so clear selection (show all)
            setSelectedMaterialIds([]);
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedMaterialIds([]);
    };

    // Handle drag and drop reordering
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setMaterialOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Export filtered test cases
    const handleExportFilteredTestCases = () => {
        const params = new URLSearchParams({
            intent: IntentEnum.LEARNING_MATERIAL_QUESTION_TEST_CASE_ALL_TEST_CASES_EXPORT_FILTERED,
            selectedMaterialIds: JSON.stringify(selectedMaterialIds),
            searchQuery: searchQuery,
        });

        const url =
            route(`${ROUTES.COURSES}.test-cases.cognitive-levels`, course.id) +
            '?' +
            params.toString();

        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Export started! Your file will download shortly.');
    };

    // Export sequence validation report
    const handleExportSequenceValidation = async () => {
        if (!importModeSelection?.sequenceValidation?.materialGroups) {
            toast.error('No validation data available. Please run sequence validation first.');
            return;
        }

        try {
            // Combine validation data with original Excel data for comprehensive export
            const exportData = {
                ...importModeSelection.sequenceValidation,
                excelData: importModeSelection.excelData, // Include original Excel data for cognitive levels
            };

            // Make POST request to export endpoint
            const response = await axios.post(
                route('courses.test-cases.cognitive-levels.export-sequence-validation', course.id),
                {
                    validationData: exportData,
                    materials: selectedMaterialIds,
                    searchQuery: searchQuery,
                },
                {
                    responseType: 'blob', // Important for file downloads
                    headers: {
                        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    },
                },
            );

            // Create blob link and download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const courseName =
                (course as any).name || (course as any).title || `course_${course.id}`;
            link.download = `sequence_validation_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(downloadUrl);

            toast.success('Sequence validation report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export sequence validation report. Please try again.');
        }
    };

    // Sortable Material Item Component
    const SortableMaterialItem = ({
        material,
        isSelected,
        onChange,
    }: {
        material: { id: number; title: string; count: number };
        isSelected: boolean;
        onChange: (id: number) => void;
    }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
            id: material.id,
        });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div style={style} ref={setNodeRef} className='flex items-center space-x-2 py-1'>
                <div
                    {...attributes}
                    {...listeners}
                    className='cursor-grab p-1 active:cursor-grabbing'
                >
                    <GripVertical className='h-4 w-4 text-gray-400' />
                </div>
                <Checkbox onCheckedChange={() => onChange(material.id)} checked={isSelected} />
                <span className='flex-1 text-sm'>
                    #{material.id} - {material.title}
                </span>
                <Badge variant='secondary' className='text-xs'>
                    {material.count}
                </Badge>
            </div>
        );
    };

    // Group test cases by material for display
    const groupedTestCases = useMemo(() => {
        const groups = new Map();

        filteredTestCases.forEach((testCase) => {
            const material = testCase.learning_material_question?.learning_material;
            const materialId = material?.id || 0;
            const materialTitle = material?.title || 'Unknown Material';

            if (!groups.has(materialId)) {
                groups.set(materialId, {
                    materialId,
                    materialTitle,
                    testCases: [],
                });
            }

            groups.get(materialId).testCases.push(testCase);
        });

        return Array.from(groups.values()).sort((a, b) => {
            if (materialSortBy === 'manual' && materialOrder.length > 0) {
                const orderMap = new Map(materialOrder.map((id, index) => [id, index]));
                const orderA = orderMap.get(a.materialId) ?? materialOrder.length;
                const orderB = orderMap.get(b.materialId) ?? materialOrder.length;
                if (orderA !== orderB) return orderA - orderB;
            }
            return a.materialId - b.materialId;
        });
    }, [filteredTestCases, materialSortBy, materialOrder]);

    // Get current cognitive levels for a test case (either from updates or original data)
    const getCurrentCognitiveLevels = (
        testCase: LearningMaterialQuestionTestCaseResource,
    ): CognitiveLevelEnum[] => {
        if (updates.has(testCase.id)) {
            return updates.get(testCase.id) || [];
        }

        // Debug log to see what we're getting from the backend
        // console.log(`Test case ${testCase.id} cognitive_levels:`, testCase.cognitive_levels);

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

    // Parse Excel content and return structured data
    const parseExcelContent = async (
        file: File,
    ): Promise<{ testCasePattern: string; cognitiveLevels: string }[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });

                    // Get the first worksheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    const result: { testCasePattern: string; cognitiveLevels: string }[] = [];

                    // Skip header row and process data
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i] as any[];
                        if (row && row.length >= 2 && row[0] && row[1]) {
                            result.push({
                                testCasePattern: String(row[0]).trim(),
                                cognitiveLevels: String(row[1]).trim(),
                            });
                        }
                    }

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsBinaryString(file);
        });
    };

    // Convert cognitive levels string to array
    const parseCognitiveLevels = (cognitiveLevelsStr: string): CognitiveLevelEnum[] => {
        const levels = cognitiveLevelsStr.split(',').map((level) => level.trim());
        const validLevels: CognitiveLevelEnum[] = [];

        for (const level of levels) {
            if (Object.values(CognitiveLevelEnum).includes(level as CognitiveLevelEnum)) {
                validLevels.push(level as CognitiveLevelEnum);
            }
        }

        return validLevels;
    };

    // Find matching test case for a CSV pattern
    const findMatchingTestCase = (
        pattern: string,
    ): LearningMaterialQuestionTestCaseResource | null => {
        // Search within filtered test cases instead of all test cases
        const searchPool = filteredTestCases;

        // First try exact match on description
        let match = searchPool.find(
            (testCase) => testCase.input && testCase.input.includes(pattern),
        );

        // console.log(searchPool, pattern);

        if (match) return match;

        // Try partial match on description (more lenient)
        match = searchPool.find((testCase) => {
            if (!testCase.description) return false;

            // Extract key parts from the pattern for fuzzy matching
            const cleanPattern = pattern
                .toLowerCase()
                .replace(/["'`]/g, '') // Remove quotes
                .replace(/self\.assertin\(/gi, '') // Remove assertIn wrapper
                .replace(/,\s*student_code\)/gi, '') // Remove student_code parameter
                .replace(/[()]/g, '') // Remove remaining parentheses
                .trim();

            const keyParts = cleanPattern
                .split(/[,\s]+/) // Split on comma and whitespace
                .filter(
                    (part) =>
                        part.length > 2 && !['and', 'the', 'of', 'in', 'to', 'for'].includes(part),
                ); // Filter meaningful parts

            const testCaseDesc = testCase.description!.toLowerCase();

            // Check if any key part matches
            return keyParts.some((part) => testCaseDesc.includes(part));
        });

        // If still no match, try even more aggressive matching
        if (!match) {
            match = searchPool.find((testCase) => {
                if (!testCase.description) return false;

                // Extract function/method names from the pattern
                const functionMatches = pattern.match(/["']([^"']+)["']/g);
                if (functionMatches) {
                    const functions = functionMatches
                        .map((f) => f.replace(/["']/g, ''))
                        .filter((f) => f.length > 2);

                    return functions.some((func) =>
                        testCase.description!.toLowerCase().includes(func.toLowerCase()),
                    );
                }

                return false;
            });
        }

        return match || null;
    };

    // Validate sequence matching between Excel data and test cases
    const validateSequenceMatching = (
        excelData: { testCasePattern: string; cognitiveLevels: string }[],
    ): SequenceValidationResult => {
        const matches = excelData.map((excelEntry, index) => {
            if (index >= filteredTestCases.length) {
                return {
                    index,
                    testCase: filteredTestCases[filteredTestCases.length - 1], // fallback to last test case
                    excelPattern: excelEntry.testCasePattern,
                    isMatch: false,
                    materialId:
                        filteredTestCases[filteredTestCases.length - 1]?.learning_material_question
                            ?.learning_material?.id,
                    materialTitle:
                        filteredTestCases[filteredTestCases.length - 1]?.learning_material_question
                            ?.learning_material?.title,
                };
            }

            const testCase = filteredTestCases[index];
            const excelPattern = excelEntry.testCasePattern.trim();
            const testCaseInput = testCase.input?.trim() || '';

            // Check for exact match
            let isMatch = excelPattern === testCaseInput;

            // If not exact match, try partial matching
            if (!isMatch && excelPattern && testCaseInput) {
                // Check if excel pattern is contained in test case input or vice versa
                isMatch =
                    testCaseInput.includes(excelPattern) || excelPattern.includes(testCaseInput);

                // Also try normalized comparison (removing extra whitespace, case insensitive for some parts)
                if (!isMatch) {
                    const normalizedPattern = excelPattern.toLowerCase().replace(/\s+/g, ' ');
                    const normalizedInput = testCaseInput.toLowerCase().replace(/\s+/g, ' ');
                    isMatch = normalizedPattern === normalizedInput;
                }
            }

            return {
                index,
                testCase,
                excelPattern,
                isMatch,
                materialId: testCase.learning_material_question?.learning_material?.id,
                materialTitle: testCase.learning_material_question?.learning_material?.title,
            };
        });

        const mismatchCount = matches.filter((m) => !m.isMatch).length;
        const matchCount = matches.filter((m) => m.isMatch).length;

        // Group matches by material
        const materialGroupsMap = new Map();
        matches.forEach((match) => {
            const materialId = match.materialId || 0;
            const materialTitle = match.materialTitle || 'Unknown Material';

            if (!materialGroupsMap.has(materialId)) {
                materialGroupsMap.set(materialId, {
                    materialId,
                    materialTitle,
                    matches: [],
                });
            }

            materialGroupsMap.get(materialId).matches.push({
                index: match.index,
                testCase: match.testCase,
                excelPattern: match.excelPattern,
                isMatch: match.isMatch,
            });
        });

        const materialGroups = Array.from(materialGroupsMap.values());

        return {
            matches,
            hasAnyMismatch: mismatchCount > 0,
            mismatchCount,
            matchCount,
            materialGroups,
        };
    };

    // Sequence merge: Map excel entries to test cases by index order
    const handleMergeMode = (mode: 'sequence' | 'smart') => {
        if (!importModeSelection) return;

        // If sequence mode is selected, validate the matching first
        if (mode === 'sequence' && importModeSelection.excelData) {
            const validation = validateSequenceMatching(importModeSelection.excelData);

            if (validation.hasAnyMismatch) {
                // Show validation results and ask for confirmation
                setImportModeSelection({
                    ...importModeSelection,
                    sequenceValidation: validation,
                    showSequenceValidation: true,
                    showModeSelection: false,
                });
                return;
            }
        }

        setImportModeSelection({
            ...importModeSelection,
            mergeMode: mode,
            showModeSelection: false,
        });

        // Continue with the selected merge strategy using stored Excel data
        if (importModeSelection.excelData) {
            if (mode === 'sequence') {
                const result = performSequenceMerge(importModeSelection.excelData);
                processImportResult(result);
            } else {
                const result = performSmartMerge(importModeSelection.excelData);
                processImportResult(result);
            }
        }
    };

    // Handle force sync confirmation
    const handleForceSequenceSync = (force: boolean) => {
        if (!importModeSelection || !importModeSelection.excelData) return;

        if (force) {
            // Proceed with sequence merge despite mismatches
            const result = performSequenceMerge(importModeSelection.excelData);
            processImportResult(result);
            setImportModeSelection(null); // Close all dialogs
        } else {
            // Go back to mode selection
            setImportModeSelection({
                ...importModeSelection,
                showSequenceValidation: false,
                showModeSelection: true,
            });
        }
    };

    const processImportResult = (result: any) => {
        // Process the merge result here
        console.log('Merge result:', result);
        // Add your result processing logic here
        setIsImporting(false);
    };

    const performSequenceMerge = (
        excelData: { testCasePattern: string; cognitiveLevels: string }[],
    ) => {
        const successful: ImportResult['successful'] = [];
        const failed: ImportResult['failed'] = [];

        excelData.forEach((excelEntry, index) => {
            if (index < filteredTestCases.length) {
                const testCase = filteredTestCases[index]; // Use filtered test cases
                const parsedLevels = parseCognitiveLevels(excelEntry.cognitiveLevels);

                if (parsedLevels.length > 0) {
                    successful.push({
                        testCase: testCase,
                        matched: `Row ${index + 1} → Test Case #${testCase.id}`,
                        cognitiveLevels: parsedLevels,
                    });

                    // Update the UI state immediately
                    setUpdates((prev) => new Map(prev.set(testCase.id, parsedLevels)));
                } else {
                    failed.push({
                        csvEntry: `Row ${index + 1}: ${excelEntry.testCasePattern} -> ${excelEntry.cognitiveLevels}`,
                        reason: 'Invalid cognitive levels format',
                    });
                }
            } else {
                failed.push({
                    csvEntry: `Row ${index + 1}: ${excelEntry.testCasePattern} -> ${excelEntry.cognitiveLevels}`,
                    reason: 'No corresponding test case (exceeds available filtered test cases)',
                });
            }
        });

        return { successful, failed };
    };

    // Smart merge: Use pattern matching
    const performSmartMerge = (
        excelData: { testCasePattern: string; cognitiveLevels: string }[],
    ) => {
        const successful: ImportResult['successful'] = [];
        const failed: ImportResult['failed'] = [];

        for (const excelEntry of excelData) {
            const { testCasePattern, cognitiveLevels } = excelEntry;
            const matchingTestCase = findMatchingTestCase(testCasePattern);

            if (matchingTestCase) {
                const parsedLevels = parseCognitiveLevels(cognitiveLevels);
                if (parsedLevels.length > 0) {
                    successful.push({
                        testCase: matchingTestCase,
                        matched: testCasePattern,
                        cognitiveLevels: parsedLevels,
                    });

                    // Update the UI state immediately
                    setUpdates((prev) => new Map(prev.set(matchingTestCase.id, parsedLevels)));
                } else {
                    failed.push({
                        csvEntry: `${testCasePattern} -> ${cognitiveLevels}`,
                        reason: 'Invalid cognitive levels format',
                    });
                }
            } else {
                failed.push({
                    csvEntry: `${testCasePattern} -> ${cognitiveLevels}`,
                    reason: 'No matching test case found',
                });
            }
        }

        return { successful, failed };
    };

    // Handle Excel file import
    const handleExcelImport = async (file: File) => {
        setIsImporting(true);
        setImportResult(null);

        try {
            const excelData = await parseExcelContent(file);

            // Check if we should show merge mode selection
            const excelRowCount = excelData.length;
            const testCaseCount = filteredTestCases.length; // Use filtered test cases count

            if (excelRowCount === testCaseCount) {
                // Show merge mode selection
                setImportModeSelection({
                    excelRowCount,
                    testCaseCount,
                    selectedMode: null,
                    showModeSelection: true,
                    showSequenceValidation: false,
                    excelData,
                });
                setIsImporting(false);
                return;
            }

            // If counts don't match, proceed with smart merge directly
            await processImport(excelData, 'smart');
        } catch (error) {
            console.error('Error importing Excel:', error);
            toast.error('Failed to parse Excel file. Please check the format.');
            setIsImporting(false);
        }
    };

    // Process the import with selected merge mode
    const processImport = async (
        excelData: { testCasePattern: string; cognitiveLevels: string }[],
        mode: 'smart' | 'sequence',
    ) => {
        try {
            let successful: ImportResult['successful'];
            let failed: ImportResult['failed'];

            if (mode === 'sequence') {
                const result = performSequenceMerge(excelData);
                successful = result.successful;
                failed = result.failed;
            } else {
                const result = performSmartMerge(excelData);
                successful = result.successful;
                failed = result.failed;
            }

            const result: ImportResult = {
                successful,
                failed,
                totalProcessed: excelData.length,
            };

            setImportResult(result);

            if (successful.length > 0) {
                const modeText = mode === 'sequence' ? 'sequence merge' : 'smart merge';
                toast.success(
                    `Successfully imported cognitive levels for ${successful.length} test cases using ${modeText}`,
                );
            }

            if (failed.length > 0) {
                toast.warning(
                    `Failed to import ${failed.length} entries. Check import results for details.`,
                );
            }
        } catch (error) {
            console.error('Error processing import:', error);
            toast.error('Failed to process import. Please try again.');
        } finally {
            setIsImporting(false);
            setImportModeSelection(null);
        }
    };

    // Handle file input change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                handleExcelImport(file);
            } else {
                toast.error('Please select an Excel file (.xlsx or .xls)');
            }
        }
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

            console.log('updateData', updateData);

            await new Promise<void>((resolve, reject) => {
                router.patch(
                    route(`${ROUTES.COURSES}.test-cases.cognitive-levels.bulk-update`, course.id),
                    { updates: updateData } as any,
                    {
                        onSuccess: () => {
                            setUpdates(new Map());
                            toast.success('Cognitive levels updated successfully');
                            // Refresh the page to show updated data
                            // router.visit(
                            //     route(`${ROUTES.COURSES}.test-cases.cognitive-levels`, course.id),
                            //     {
                            //         preserveState: false,
                            //         preserveScroll: true,
                            //     },
                            // );
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

                            {/* Material Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-[240px] justify-between'>
                                        <div className='flex items-center space-x-2'>
                                            <Filter className='h-4 w-4' />
                                            <div className='flex flex-col items-start'>
                                                <span>
                                                    {selectedMaterialIds.length === 0
                                                        ? 'All Materials'
                                                        : selectedMaterialIds.length ===
                                                            availableMaterials.length
                                                          ? 'All Materials (Selected)'
                                                          : selectedMaterialIds.length === 1
                                                            ? availableMaterials.find(
                                                                  (m) =>
                                                                      m.id ===
                                                                      selectedMaterialIds[0],
                                                              )?.title
                                                            : `${selectedMaterialIds.length} materials selected`}
                                                </span>
                                                <span className='text-xs text-muted-foreground'>
                                                    Sort:{' '}
                                                    {materialSortBy === 'id'
                                                        ? 'ID'
                                                        : materialSortBy === 'title'
                                                          ? 'Title'
                                                          : 'Count'}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown className='h-4 w-4' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[240px] p-0'>
                                    <Command>
                                        <CommandInput placeholder='Search materials...' />

                                        {/* Sort Options */}
                                        <div className='border-b px-3 py-2'>
                                            <div className='mb-2 text-xs font-medium text-muted-foreground'>
                                                Sort by:
                                            </div>
                                            <div className='flex gap-1'>
                                                <Button
                                                    variant={
                                                        materialSortBy === 'id'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size='sm'
                                                    onClick={() => setMaterialSortBy('id')}
                                                    className='h-6 px-2 text-xs'
                                                >
                                                    ID
                                                </Button>
                                                <Button
                                                    variant={
                                                        materialSortBy === 'title'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size='sm'
                                                    onClick={() => setMaterialSortBy('title')}
                                                    className='h-6 px-2 text-xs'
                                                >
                                                    Title
                                                </Button>
                                                <Button
                                                    variant={
                                                        materialSortBy === 'count'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size='sm'
                                                    onClick={() => setMaterialSortBy('count')}
                                                    className='h-6 px-2 text-xs'
                                                >
                                                    Count
                                                </Button>
                                                <Button
                                                    variant={
                                                        materialSortBy === 'manual'
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size='sm'
                                                    onClick={() => setMaterialSortBy('manual')}
                                                    className='h-6 px-2 text-xs'
                                                >
                                                    Manual
                                                </Button>
                                            </div>
                                        </div>

                                        <CommandList>
                                            <CommandEmpty>No materials found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem onSelect={handleAllMaterialsToggle}>
                                                    <Checkbox
                                                        className='mr-2'
                                                        checked={selectedMaterialIds.length === 0}
                                                    />
                                                    <div className='flex w-full items-center justify-between'>
                                                        <span>All Materials</span>
                                                        <span className='text-xs text-muted-foreground'>
                                                            ({testCases.length})
                                                        </span>
                                                    </div>
                                                </CommandItem>

                                                {materialSortBy === 'manual' ? (
                                                    <DndContext
                                                        sensors={sensors}
                                                        onDragEnd={handleDragEnd}
                                                        collisionDetection={closestCenter}
                                                    >
                                                        <SortableContext
                                                            strategy={verticalListSortingStrategy}
                                                            items={materialOrder}
                                                        >
                                                            {availableMaterials.map((material) => (
                                                                <SortableMaterialItem
                                                                    onChange={
                                                                        handleMaterialFilterChange
                                                                    }
                                                                    material={material}
                                                                    key={material.id}
                                                                    isSelected={selectedMaterialIds.includes(
                                                                        material.id,
                                                                    )}
                                                                />
                                                            ))}
                                                        </SortableContext>
                                                    </DndContext>
                                                ) : (
                                                    availableMaterials.map((material) => (
                                                        <CommandItem
                                                            onSelect={() =>
                                                                handleMaterialFilterChange(
                                                                    material.id,
                                                                )
                                                            }
                                                            key={material.id}
                                                        >
                                                            <Checkbox
                                                                className='mr-2'
                                                                checked={selectedMaterialIds.includes(
                                                                    material.id,
                                                                )}
                                                            />
                                                            <div className='flex w-full items-center justify-between'>
                                                                <div className='flex min-w-0 flex-1 flex-col items-start'>
                                                                    <span className='truncate'>
                                                                        {material.title}
                                                                    </span>
                                                                    <span className='text-xs text-muted-foreground'>
                                                                        ID: {material.id}
                                                                    </span>
                                                                </div>
                                                                <span className='ml-2 text-xs text-muted-foreground'>
                                                                    ({material.count})
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className='text-sm text-muted-foreground'>
                                Showing {filteredTestCases.length} of{' '}
                                {materialFilteredTestCases.length} test cases
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(selectedMaterialIds.length > 0 || searchQuery.trim()) && (
                            <div className='mb-6'>
                                <div className='mb-3 flex items-center justify-between'>
                                    <h3 className='text-sm font-medium'>Active Filters</h3>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={clearAllFilters}
                                        className='text-xs'
                                    >
                                        Clear All
                                    </Button>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {searchQuery.trim() && (
                                        <Badge
                                            variant='secondary'
                                            className='flex items-center gap-1'
                                        >
                                            Search: "{searchQuery}"
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className='ml-1 rounded text-xs hover:bg-muted'
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {selectedMaterialIds.map((materialId) => {
                                        const material = availableMaterials.find(
                                            (m) => m.id === materialId,
                                        );
                                        if (!material) return null;
                                        return (
                                            <Badge
                                                variant='secondary'
                                                key={materialId}
                                                className='flex items-center gap-1'
                                            >
                                                Material: {material.title}
                                                <button
                                                    onClick={() =>
                                                        handleMaterialFilterChange(materialId)
                                                    }
                                                    className='ml-1 rounded text-xs hover:bg-muted'
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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

                {/* Import Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Upload className='h-5 w-5' />
                            Import Cognitive Levels from Excel
                        </CardTitle>
                        <CardDescription>
                            Upload an Excel file to automatically map cognitive levels to test
                            cases. The Excel should contain test case patterns and their cognitive
                            levels (e.g., "C1, C2").
                            <br />
                            <strong>Format:</strong> Columns should be "test_case_pattern" and
                            "cognitive_levels"
                            <br />
                            <strong>Example:</strong>{' '}
                            <code>self.assertIn("read_csv", student_code)</code> with{' '}
                            <code>C1, C2</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {/* Action Buttons */}
                            <div className='flex gap-2'>
                                {/* Download Template Button */}
                                <Button variant='outline'>
                                    <a
                                        href={route(
                                            `${ROUTES.COURSES}.test-cases.cognitive-levels.download-template`,
                                            course.id,
                                        )}
                                        className='flex items-center gap-2'
                                    >
                                        <FileSpreadsheet className='h-4 w-4' />
                                        Download Excel Template
                                    </a>
                                </Button>

                                {/* Export Filtered Button */}
                                <Button
                                    variant='outline'
                                    onClick={handleExportFilteredTestCases}
                                    className='flex items-center gap-2'
                                >
                                    <Download className='h-4 w-4' />
                                    Export Filtered ({filteredTestCases.length} test cases)
                                    {selectedMaterialIds.length > 0 && (
                                        <span className='text-xs text-muted-foreground'>
                                            from {selectedMaterialIds.length} materials
                                        </span>
                                    )}
                                </Button>
                            </div>

                            {/* Merge Mode Selection Dialog */}
                            {importModeSelection && importModeSelection.showModeSelection && (
                                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-2'>
                                            <AlertCircle className='h-5 w-5 text-blue-600' />
                                            <h4 className='font-medium text-blue-800'>
                                                Choose Import Method
                                            </h4>
                                        </div>
                                        <p className='text-sm text-blue-700'>
                                            Your Excel file contains exactly{' '}
                                            {importModeSelection.excelRowCount} rows, which matches
                                            your {importModeSelection.testCaseCount} test cases.
                                            Please choose how to import:
                                        </p>
                                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                                            <Button
                                                variant='outline'
                                                onClick={() => handleMergeMode('sequence')}
                                                disabled={isImporting}
                                                className='flex h-auto flex-col items-start gap-2 p-4 text-left'
                                            >
                                                <div className='font-medium'>Sequence Merge</div>
                                                <div className='text-xs text-muted-foreground'>
                                                    Map Excel rows to test cases by order (Row 1 →
                                                    Test Case 1, Row 2 → Test Case 2, etc.)
                                                </div>
                                            </Button>
                                            <Button
                                                variant='outline'
                                                onClick={() => handleMergeMode('smart')}
                                                disabled={isImporting}
                                                className='flex h-auto flex-col items-start gap-2 p-4 text-left'
                                            >
                                                <div className='font-medium'>Smart Merge</div>
                                                <div className='text-xs text-muted-foreground'>
                                                    Match Excel patterns to test cases using
                                                    intelligent pattern recognition
                                                </div>
                                            </Button>
                                        </div>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => {
                                                setImportModeSelection(null);
                                            }}
                                            className='w-full'
                                        >
                                            Cancel Import
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Sequence Validation Dialog */}
                            {importModeSelection &&
                                importModeSelection.showSequenceValidation &&
                                importModeSelection.sequenceValidation && (
                                    <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-2'>
                                                <AlertCircle className='h-5 w-5 text-orange-600' />
                                                <h4 className='font-medium text-orange-800'>
                                                    Sequence Validation Warning
                                                </h4>
                                            </div>
                                            <div className='text-sm text-orange-700'>
                                                <p className='mb-3'>
                                                    Found{' '}
                                                    {
                                                        importModeSelection.sequenceValidation
                                                            .mismatchCount
                                                    }{' '}
                                                    mismatches out of{' '}
                                                    {
                                                        importModeSelection.sequenceValidation
                                                            .matches.length
                                                    }{' '}
                                                    rows. The Excel patterns don't exactly match the
                                                    test case inputs in sequence order.
                                                </p>
                                                <div className='max-h-64 overflow-y-auto rounded border border-orange-200 bg-white p-3'>
                                                    <h5 className='mb-2 font-medium'>
                                                        Validation Results by Material:
                                                    </h5>
                                                    <div className='space-y-4 text-xs'>
                                                        {importModeSelection.sequenceValidation.materialGroups.map(
                                                            (group) => (
                                                                <div
                                                                    key={group.materialId}
                                                                    className='space-y-2'
                                                                >
                                                                    <div className='sticky top-0 border-b border-gray-200 bg-white pb-1'>
                                                                        <div className='text-sm font-semibold text-gray-700'>
                                                                            📚 Material #
                                                                            {group.materialId}:{' '}
                                                                            {group.materialTitle}
                                                                        </div>
                                                                        <div className='text-xs text-gray-500'>
                                                                            {
                                                                                group.matches.filter(
                                                                                    (m) =>
                                                                                        m.isMatch,
                                                                                ).length
                                                                            }{' '}
                                                                            / {group.matches.length}{' '}
                                                                            matches
                                                                        </div>
                                                                    </div>
                                                                    {group.matches.map((match) => (
                                                                        <div
                                                                            key={match.index}
                                                                            className={`ml-4 flex items-start gap-2 rounded p-2 ${
                                                                                match.isMatch
                                                                                    ? 'border border-green-200 bg-green-50'
                                                                                    : 'border border-red-200 bg-red-50'
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className={`mt-0.5 h-2 w-2 rounded-full ${
                                                                                    match.isMatch
                                                                                        ? 'bg-green-500'
                                                                                        : 'bg-red-500'
                                                                                }`}
                                                                            ></div>
                                                                            <div className='min-w-0 flex-1'>
                                                                                <div className='font-medium'>
                                                                                    Row{' '}
                                                                                    {match.index +
                                                                                        1}{' '}
                                                                                    → Test Case #
                                                                                    {
                                                                                        match
                                                                                            .testCase
                                                                                            .id
                                                                                    }
                                                                                </div>
                                                                                <div className='truncate text-gray-600'>
                                                                                    <strong>
                                                                                        Excel:
                                                                                    </strong>{' '}
                                                                                    {match.excelPattern ||
                                                                                        'Empty'}
                                                                                </div>
                                                                                <div className='truncate text-gray-600'>
                                                                                    <strong>
                                                                                        Test Case:
                                                                                    </strong>{' '}
                                                                                    {match.testCase.input?.substring(
                                                                                        0,
                                                                                        100,
                                                                                    ) || 'Empty'}
                                                                                    {match.testCase
                                                                                        .input &&
                                                                                    match.testCase
                                                                                        .input
                                                                                        .length >
                                                                                        100
                                                                                        ? '...'
                                                                                        : ''}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-3 sm:flex-row'>
                                                <Button
                                                    variant='default'
                                                    onClick={() => handleForceSequenceSync(true)}
                                                    disabled={isImporting}
                                                    className='flex-1'
                                                >
                                                    Force Sequence Sync
                                                </Button>
                                                <Button
                                                    variant='secondary'
                                                    onClick={handleExportSequenceValidation}
                                                    disabled={
                                                        isImporting ||
                                                        !importModeSelection?.sequenceValidation
                                                            ?.materialGroups
                                                    }
                                                    className='flex flex-1 items-center gap-2'
                                                >
                                                    <Download className='h-4 w-4' />
                                                    Export Validation Report
                                                </Button>
                                                <Button
                                                    variant='outline'
                                                    onClick={() => handleForceSequenceSync(false)}
                                                    disabled={isImporting}
                                                    className='flex-1'
                                                >
                                                    Back to Method Selection
                                                </Button>
                                            </div>
                                            <p className='text-xs text-orange-600'>
                                                <strong>Force Sequence Sync:</strong> Will proceed
                                                with row-by-row mapping regardless of input
                                                mismatches.
                                                <br />
                                                <strong>Back to Method Selection:</strong> Choose
                                                Smart Merge instead for pattern-based matching.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* File Upload Section */}
                            <div className='mb-4 flex items-center gap-4'>
                                <Button
                                    variant='outline'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isImporting}
                                    className='flex items-center gap-2'
                                >
                                    <FileSpreadsheet className='h-4 w-4' />
                                    {isImporting ? 'Processing...' : 'Select Excel File'}
                                </Button>
                                {importResult && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setImportResult(null)}
                                        className='flex items-center gap-2'
                                    >
                                        <AlertCircle className='h-4 w-4' />
                                        Clear Results
                                    </Button>
                                )}
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className='hidden'
                                    accept='.xlsx,.xls'
                                />
                            </div>
                        </div>

                        {/* Import Results */}
                        {importResult && (
                            <div className='mt-4 space-y-4'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                                        <div className='flex items-center gap-2'>
                                            <CheckCircle className='h-5 w-5 text-green-600' />
                                            <span className='font-medium text-green-800'>
                                                Successful
                                            </span>
                                        </div>
                                        <p className='mt-1 text-2xl font-bold text-green-600'>
                                            {importResult.successful.length}
                                        </p>
                                    </div>

                                    <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                                        <div className='flex items-center gap-2'>
                                            <AlertCircle className='h-5 w-5 text-red-600' />
                                            <span className='font-medium text-red-800'>Failed</span>
                                        </div>
                                        <p className='mt-1 text-2xl font-bold text-red-600'>
                                            {importResult.failed.length}
                                        </p>
                                    </div>

                                    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                        <div className='flex items-center gap-2'>
                                            <FileSpreadsheet className='h-5 w-5 text-blue-600' />
                                            <span className='font-medium text-blue-800'>Total</span>
                                        </div>
                                        <p className='mt-1 text-2xl font-bold text-blue-600'>
                                            {importResult.totalProcessed}
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Results */}
                                {(importResult.successful.length > 0 ||
                                    importResult.failed.length > 0) && (
                                    <div className='overflow-hidden rounded-lg border'>
                                        <div className='border-b px-4 py-2'>
                                            <h4 className='font-medium'>Import Details</h4>
                                        </div>
                                        <div className='max-h-64 overflow-y-auto'>
                                            {/* Successful imports */}
                                            {importResult.successful.map((item, index) => (
                                                <div
                                                    key={`success-${index}`}
                                                    className='flex items-start gap-3 border-b bg-green-50 px-4 py-2'
                                                >
                                                    <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600' />
                                                    <div className='min-w-0 flex-1'>
                                                        <p className='truncate text-sm font-medium text-green-800'>
                                                            {item.testCase.description ||
                                                                'Test Case #' + item.testCase.id}
                                                        </p>
                                                        <p className='text-xs text-green-600'>
                                                            Matched: "{item.matched}" →{' '}
                                                            {item.cognitiveLevels.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Failed imports */}
                                            {importResult.failed.map((item, index) => (
                                                <div
                                                    key={`failed-${index}`}
                                                    className='flex items-start gap-3 border-b bg-red-50 px-4 py-2'
                                                >
                                                    <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600' />
                                                    <div className='min-w-0 flex-1'>
                                                        <p className='truncate text-sm font-medium text-red-800'>
                                                            {item.csvEntry}
                                                        </p>
                                                        <p className='text-xs text-red-600'>
                                                            {item.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Test Cases List */}
                <div className='space-y-4'>
                    {filteredTestCases.length === 0 ? (
                        <Card>
                            <CardContent className='py-8 text-center'>
                                <p className='text-muted-foreground'>
                                    {searchQuery.trim() || selectedMaterialIds.length > 0
                                        ? 'No test cases found matching your current filters.'
                                        : 'No test cases found in this course.'}
                                </p>
                                {(searchQuery.trim() || selectedMaterialIds.length > 0) && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={clearAllFilters}
                                        className='mt-3'
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        groupedTestCases.map((group) => (
                            <div key={group.materialId} className='space-y-4'>
                                {/* Material Header */}
                                <div className='sticky top-0 z-10 rounded-lg border bg-background p-3 shadow-sm'>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-4 w-1 rounded-full bg-primary'></div>
                                        <h2 className='text-lg font-semibold'>
                                            📚 Material #{group.materialId}: {group.materialTitle}
                                        </h2>
                                        <Badge variant='secondary' className='ml-auto'>
                                            {group.testCases.length} test cases
                                        </Badge>
                                    </div>
                                </div>

                                {/* Test Cases for this Material */}
                                {group.testCases.map(
                                    (
                                        testCase: LearningMaterialQuestionTestCaseResource,
                                        index: number,
                                    ) => {
                                        const currentLevels = getCurrentCognitiveLevels(testCase);
                                        const hasUpdates = updates.has(testCase.id);

                                        return (
                                            <Card
                                                key={testCase.id}
                                                className={
                                                    hasUpdates
                                                        ? 'border-blue-200 bg-blue-50/20'
                                                        : ''
                                                }
                                            >
                                                <CardContent className='py-4'>
                                                    <div className='space-y-4'>
                                                        {/* Test Case Info */}
                                                        <div>
                                                            <div className='flex items-start justify-between'>
                                                                <div className='space-y-1'>
                                                                    <h3 className='font-medium'>
                                                                        {`Test Case #${testCase.id} - ${index + 1}`}
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
                                                                            testCase
                                                                                .learning_material_question
                                                                                ?.title
                                                                        }
                                                                    </p>
                                                                    <p className='text-xs text-muted-foreground'>
                                                                        Input:{' '}
                                                                        {testCase.input?.substring(
                                                                            0,
                                                                            100,
                                                                        )}
                                                                        {testCase.input &&
                                                                        testCase.input.length > 100
                                                                            ? '...'
                                                                            : ''}
                                                                    </p>
                                                                </div>
                                                                <div className='flex flex-wrap gap-1'>
                                                                    {currentLevels.map((level) => (
                                                                        <Badge
                                                                            variant='secondary'
                                                                            key={level}
                                                                        >
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
                                                                    const isChecked =
                                                                        currentLevels.includes(
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
                                                                                onCheckedChange={(
                                                                                    checked,
                                                                                ) =>
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
                                    },
                                )}
                            </div>
                        ))
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
