import { Model } from '@/Support/Interfaces/Models';

export interface ServiceFilterOptions<T extends Model | undefined = undefined> {
    page?: number;
    page_size?: number | 'all';
    sortBy?: T extends Model
        ? Array<[keyof T | string, 'asc' | 'desc']>
        : Array<[string, 'asc' | 'desc']>; // hopefully it will show typesafe of T and the sorting direction
    search?: string;
    relations?: string; // format 'relation1,relation2.nestedRelation'
    relations_count?: string; // format 'relation1,relation2.nestedRelation'
    column_filters?: T extends Model
        ? {
              [K in keyof T]?: any;
          } & Record<string, any>
        : Record<string, any>;

    [key: string]: any; // Allow for additional filter options
}
