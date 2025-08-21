export enum CognitiveLevelEnum {
    C1 = 'C1',
    C2 = 'C2',
    C3 = 'C3',
    C4 = 'C4',
    C5 = 'C5',
    C6 = 'C6',
}

export const cognitiveLevelLabels: Record<CognitiveLevelEnum, string> = {
    [CognitiveLevelEnum.C1]: 'C1 - Remember',
    [CognitiveLevelEnum.C2]: 'C2 - Understand',
    [CognitiveLevelEnum.C3]: 'C3 - Apply',
    [CognitiveLevelEnum.C4]: 'C4 - Analyze',
    [CognitiveLevelEnum.C5]: 'C5 - Evaluate',
    [CognitiveLevelEnum.C6]: 'C6 - Create',
};

export const cognitiveLevelDescriptions: Record<CognitiveLevelEnum, string> = {
    [CognitiveLevelEnum.C1]:
        'Remembering - The student needs to remember facts, concepts, or procedures.',
    [CognitiveLevelEnum.C2]:
        'Understanding - The student needs to understand and explain ideas or concepts.',
    [CognitiveLevelEnum.C3]: 'Applying - The student needs to apply knowledge in new situations.',
    [CognitiveLevelEnum.C4]:
        'Analyzing - The student needs to break information into parts and examine relationships.',
    [CognitiveLevelEnum.C5]:
        'Evaluating - The student needs to make judgments based on criteria and standards.',
    [CognitiveLevelEnum.C6]:
        'Creating - The student needs to put elements together to form a coherent whole.',
};
