import { PaginateMetaLink } from './PaginateMetaLink';

export interface PaginateMeta {
    current_page?: number;
    from?: number;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number;
    total?: number;
    links?: PaginateMetaLink[];
}
