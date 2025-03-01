export enum LearningMaterialTypeEnum {
    // Primary types (core functionality)
    LIVE_CODE = 'live_code',

    // Secondary types (current implementation)
    QUIZ = 'quiz',
    ARTICLE = 'article',

    // Future expansion (supporting text-based learning)
    ESSAY = 'essay',
    TUTORIAL = 'tutorial',
    DOCUMENTATION = 'documentation',

    // Media content types (for more visual/interactive learning)
    VIDEO = 'video',
    INTERACTIVE = 'interactive',
    PRESENTATION = 'presentation',
}

// Optional: Group categories for UI organization
export const LearningMaterialCategories = {
    CODING: [LearningMaterialTypeEnum.LIVE_CODE],
    ASSESSMENT: [LearningMaterialTypeEnum.QUIZ, LearningMaterialTypeEnum.ESSAY],
    CONTENT: [
        LearningMaterialTypeEnum.ARTICLE,
        LearningMaterialTypeEnum.TUTORIAL,
        LearningMaterialTypeEnum.DOCUMENTATION,
    ],
    MEDIA: [
        LearningMaterialTypeEnum.VIDEO,
        LearningMaterialTypeEnum.INTERACTIVE,
        LearningMaterialTypeEnum.PRESENTATION,
    ],
};
