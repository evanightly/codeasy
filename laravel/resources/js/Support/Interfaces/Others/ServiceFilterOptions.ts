import { Model } from '@/Support/Interfaces/Models';

export interface ServiceFilterOptions<T extends Model | undefined = undefined> {
    page?: number;
    page_size?: number | 'all';
    // sort_by?: T extends Model ? Array<[keyof T | string, 'asc' | 'desc']> : Array<[string, 'asc' | 'desc']>;
    sort_by?: Partial<T> | string | any; // format 'column1,asc,column2,desc'
    sort_dir?: 'asc' | 'desc';
    sort_by_relation_count?: string; // Relation name to sort by count
    sort_dir_relation_count?: 'asc' | 'desc'; // Direction for relation count sorting
    sort_by_relation_field?: Array<{
        relation: string; // Format: 'relation' or 'relation.nestedRelation'
        field: string; // Field in the relation to sort by
        direction?: 'asc' | 'desc'; // Sort direction, defaults to sort_dir or 'desc'
    }>;
    search?: string;
    relations?: string; // format 'relation1,relation2.nestedRelation'
    relations_count?: string; // format 'relation1,relation2.nestedRelation'
    column_filters?: T extends Model
        ? {
              [K in keyof T]?: any;
          } & Record<string, any>
        : Record<string, any>;

    // New nested structure for relation array filters
    relations_array_filters?: {
        [relation: string]: string[] | number[] | boolean[] | null;
    };

    [key: string]: any; // Allow for additional filter options
}
