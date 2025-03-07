const programmingLanguages = {
    PYTHON: 'python',
    JAVASCRIPT: 'javascript',
    JAVA: 'java',
    CPP: 'cpp',
    PHP: 'php',
    CSHARP: 'csharp',
    RUBY: 'ruby',
    GO: 'go',
} as const;

export const ProgrammingLanguageEnum = programmingLanguages;

export type ProgrammingLanguageEnum =
    (typeof programmingLanguages)[keyof typeof programmingLanguages];

// Display names for each programming language
export const programmingLanguageLabels: Record<ProgrammingLanguageEnum, string> = {
    [ProgrammingLanguageEnum.PYTHON]: 'Python',
    [ProgrammingLanguageEnum.JAVASCRIPT]: 'JavaScript',
    [ProgrammingLanguageEnum.JAVA]: 'Java',
    [ProgrammingLanguageEnum.CPP]: 'C++',
    [ProgrammingLanguageEnum.PHP]: 'PHP',
    [ProgrammingLanguageEnum.CSHARP]: 'C#',
    [ProgrammingLanguageEnum.RUBY]: 'Ruby',
    [ProgrammingLanguageEnum.GO]: 'Go',
};
