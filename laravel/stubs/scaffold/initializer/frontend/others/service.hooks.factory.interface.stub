import { AxiosRequestConfig } from 'axios';
import type {
    UseMutationOptions as ReactQueryUseMutationOptions,
    UseQueryOptions,
} from '@tanstack/react-query';
import { PaginateResponse } from '@/Support/Interfaces/Others/PaginateResponse';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others/ServiceFilterOptions';
import { Resource } from '@/Support/Interfaces/Resources';

export interface ServiceHooks {
    baseRoute: string;
    baseKey?: string;
}

export interface DefaultOptions<T = unknown> {
    axiosRequestConfig?: AxiosRequestConfig;
    useQueryOptions?: UseQueryOptions<T>;
}

export interface DefaultMutationOptions<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown,
> extends Omit<DefaultOptions, 'useQueryOptions'> {
    useMutationOptions?: ReactQueryUseMutationOptions<TData, TError, TVariables, TContext>;
}

export interface UseGetAllOptions<T> extends DefaultOptions<PaginateResponse<T>> {
    filters?: ServiceFilterOptions;
}

export interface UseGetOptions<T> extends DefaultOptions<T> {
    id: number;
}

export interface UseCreateOptions<T extends Resource>
    extends DefaultMutationOptions<Partial<T>, Error, { data: Partial<T> }> {}

export interface UseUpdateOptions<T extends Resource>
    extends DefaultMutationOptions<Partial<T>, Error, { id: number; data: Partial<T> }> {}

export interface UseDeleteOptions<T extends Resource>
    extends DefaultMutationOptions<Partial<T>, Error, { id: number }> {}