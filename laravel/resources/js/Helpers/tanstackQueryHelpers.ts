import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import {
    InvalidateQueryFilters,
    QueryFunction,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import { AxiosRequestConfig, Method } from 'axios';

const mutationApi = async ({
    method,
    url,
    data = {},
    params = {},
    requestConfig = {},
}: {
    method: Method;
    url: string;
    data?: Record<string, any>;
    params?: ServiceFilterOptions;
    requestConfig?: AxiosRequestConfig;
}) => {
    return await window.axios({
        method,
        url,
        data,
        params,
        ...requestConfig,
    });
};

const createMutation = ({
    mutationFn,
    onSuccess,
    invalidateQueryKeys,
}: {
    mutationFn: (...args: any[]) => Promise<any>;
    onSuccess?: () => Promise<void>;
    invalidateQueryKeys?: InvalidateQueryFilters[];
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: async () => {
            if (invalidateQueryKeys) {
                for (const key of invalidateQueryKeys) {
                    await queryClient.invalidateQueries(key);
                }
                if (onSuccess) {
                    await onSuccess();
                }
            }
        },
    });
};

const createQuery = <TQueryFnData, TError, TData>({
    queryKey,
    queryFn,
    queryOptions,
}: {
    queryKey: any[];
    queryFn: QueryFunction<TQueryFnData>;
    queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>;
}) => {
    return useQuery<TQueryFnData, TError, TData>({
        queryKey,
        queryFn,
        ...queryOptions,
    });
};

export { createMutation, createQuery, mutationApi };
