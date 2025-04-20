export interface CourseImportPreview {
    courses: any[];
    materials: any[];
    questions: any[];
    testCases: any[];
    pdfContent: Record<
        string,
        {
            questions: {
                title: string;
                description: string;
                order_number: number;
            }[];
            testCases: {
                question_index: number;
                description: string;
                input: string;
                hidden: boolean;
                order_number: number;
            }[];
        }
    >;
    isZipImport: boolean;
    stats: {
        courses: number;
        materials: number;
        questions: number;
        testCases: number;
        pdfQuestions: number;
        pdfTestCases: number;
    };
}

export interface CoursePreviewItem {
    name: string;
    description: string | null;
    classroom: string;
    teacher_email: string | null;
    active: boolean;
}

export interface MaterialPreviewItem {
    course_name: string;
    title: string;
    description: string | null;
    type: string;
    order_number: number | null;
    file: string | null;
    file_extension: string | null;
    active: boolean;
}

export interface QuestionPreviewItem {
    material_title: string;
    course_name: string;
    title: string;
    description: string | null;
    order_number: number | null;
    clue: string | null;
    active: boolean;
}

export interface TestCasePreviewItem {
    question_title: string;
    material_title: string;
    course_name: string;
    description: string;
    input: string | null;
    hidden: boolean;
    order_number: number | null;
    active: boolean;
}

export interface PDFContentItem {
    questions: {
        title: string;
        description: string;
        order_number: number;
    }[];
    testCases: {
        question_index: number;
        description: string;
        input: string;
        hidden: boolean;
        order_number: number;
    }[];
}
