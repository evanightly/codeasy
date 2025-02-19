import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/UI/pagination';
import { generateUseGetAllQueryKey } from '@/Helpers';
import { ny } from '@/Lib/Utils';
import { PAGINATION_NAVIGATOR } from '@/Support/Constants/paginationNavigator';
import { PaginateMeta, PaginateMetaLink, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Resource } from '@/Support/Interfaces/Resources';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { HTMLAttributes } from 'react';
import { toast } from 'sonner';

interface GenericQueryPaginationProps<R extends Resource = any> {
    meta?: PaginateMeta;
    handleChangePage: (page: number) => void;
    baseKey: string;
    baseRoute: string;
    filters: ServiceFilterOptions<R> | undefined;
}

export default function <R extends Resource = any>({
    baseRoute,
    meta,
    handleChangePage,
    baseKey,
    filters,
    className,
}: HTMLAttributes<HTMLDivElement> & GenericQueryPaginationProps<R>) {
    const isFetching = useIsFetching();
    const queryClient = useQueryClient();

    const prefetchPage = (page: number) => {
        void queryClient.prefetchQuery({
            queryKey: generateUseGetAllQueryKey(baseKey, { ...filters, page }),
            queryFn: async () => {
                const response = await window.axios.get(route(`${baseRoute}.index`), {
                    params: {
                        ...filters,
                        page,
                    },
                });
                return response.data;
            },
        });
    };

    const fixPagination = (link: string) => {
        // convert link to number, if it's not a number, it's a string
        const pageNumber = Number(link);

        // if it's a number, it's a page number
        if (!isNaN(pageNumber)) {
            return pageNumber;
        }

        // if it's not a number, it's a string
        // check if it's an url
        if (!link) {
            return null;
        }

        // if it's an url, extract the page number
        const url = new URL(link);
        const page = url.searchParams.get('page');
        return Number(page);
    };

    const ParsedPagination = ({ html }: { html: string }) => {
        const obj = { __html: html };
        return <div dangerouslySetInnerHTML={obj}></div>;
    };

    const ConditionallyRenderPagination = ({
        link,
        index,
    }: {
        link: PaginateMetaLink;
        index: number;
    }) => {
        if (!meta) {
            return null;
        }

        const previousPage = meta.current_page! - 1;
        const nextPage = meta.current_page! + 1;

        const navigateToLink = (link: PaginateMetaLink) => {
            if (isFetching) {
                toast.info('Please wait, fetching data...');
            }

            if (link.url) {
                handleChangePage(fixPagination(link.url) ?? PAGINATION_NAVIGATOR.FIRST_PAGE);
            }
        };

        const navigateToPrevious = () => {
            if (meta.current_page! > 1) {
                handleChangePage(previousPage);
            }
        };

        const navigateToNext = () => {
            if (meta.current_page! < meta.last_page!) {
                handleChangePage(nextPage);
            }
        };

        const prefetchLink = (link: PaginateMetaLink) => {
            prefetchPage(fixPagination(link.url) ?? PAGINATION_NAVIGATOR.FIRST_PAGE);
        };

        const prefetchPreviousPage = () => {
            if (meta.current_page! > 1) {
                prefetchPage(previousPage);
            }
        };

        const prefetchNextPage = () => {
            if (meta.current_page! < meta.last_page!) {
                prefetchPage(nextPage);
            }
        };

        const GeneratedPagination = () => {
            if (link.label === PAGINATION_NAVIGATOR.PREVIOUS) {
                if (meta.current_page !== 1)
                    return (
                        <PaginationItem>
                            <PaginationPrevious
                                onMouseEnter={prefetchPreviousPage}
                                onClick={navigateToPrevious}
                            />
                        </PaginationItem>
                    );
            } else if (link.label === PAGINATION_NAVIGATOR.NEXT) {
                if (meta.current_page !== meta.last_page)
                    return (
                        <PaginationItem>
                            <PaginationNext
                                onMouseEnter={prefetchNextPage}
                                onClick={navigateToNext}
                            />
                        </PaginationItem>
                    );
            } else if (link.label === PAGINATION_NAVIGATOR.ELLIPSIS) {
                return (
                    <PaginationItem key={index}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            } else {
                return (
                    <>
                        <PaginationItem
                            onMouseEnter={prefetchLink.bind(null, link)} // Prefetch on hover
                            onClick={navigateToLink.bind(null, link)}
                            key={link.label}
                        >
                            <PaginationLink isActive={link.active}>
                                <ParsedPagination html={link.label} />
                            </PaginationLink>
                        </PaginationItem>
                    </>
                );
            }
        };

        return <GeneratedPagination />;
    };

    return (
        meta && (
            <Pagination className={ny('justify-start', className)}>
                <PaginationContent className='cursor-pointer'>
                    {meta.links?.map((link, index) => (
                        <ConditionallyRenderPagination link={link} key={index} index={index} />
                    ))}
                </PaginationContent>
            </Pagination>
        )
    );
}
