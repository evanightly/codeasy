export const SchoolRequestStatusEnum = {
    APPROVED: 'approved',
    PENDING: 'pending',
    REJECTED: 'rejected',
} as const;

export type SchoolRequestStatusEnum =
    (typeof SchoolRequestStatusEnum)[keyof typeof SchoolRequestStatusEnum];
