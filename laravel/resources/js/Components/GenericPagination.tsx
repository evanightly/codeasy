import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/UI/pagination';
import { ny } from '@/Lib/Utils';
import { PAGINATION_NAVIGATOR } from '@/Support/Constants/paginationNavigator';
import { PaginateMeta, PaginateMetaLink } from '@/Support/Interfaces/Others';
import { HTMLAttributes } from 'react';

interface GenericPaginationProps extends HTMLAttributes<HTMLDivElement> {
    meta?: PaginateMeta;
    handleChangePage: (page: number) => void;
}

export default function ({ meta, handleChangePage, className }: GenericPaginationProps) {
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

    const ConditionallyRenderPagination = ({ link, i }: { link: PaginateMetaLink; i: number }) => {
        if (!meta) {
            return null;
        }
        const navigateToPrevious = () => {
            if (meta.current_page! > 1) {
                handleChangePage(meta.current_page! - 1);
            }
        };

        const navigateToNext = () => {
            if (meta.current_page! < meta.last_page!) {
                handleChangePage(meta.current_page! + 1);
            }
        };
        const GeneratedPagination = () => {
            if (link.label === PAGINATION_NAVIGATOR.PREVIOUS) {
                if (meta.current_page !== 1)
                    return (
                        <PaginationItem>
                            <PaginationPrevious onClick={navigateToPrevious} />
                        </PaginationItem>
                    );
            } else if (link.label === PAGINATION_NAVIGATOR.NEXT) {
                if (meta.current_page !== meta.last_page)
                    return (
                        <PaginationItem>
                            <PaginationNext onClick={navigateToNext} />
                        </PaginationItem>
                    );
            } else if (link.label === PAGINATION_NAVIGATOR.ELLIPSIS) {
                return (
                    <PaginationItem key={i}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            } else {
                return (
                    <>
                        <PaginationItem
                            onClick={() => {
                                handleChangePage(
                                    fixPagination(link.url) ?? PAGINATION_NAVIGATOR.FIRST_PAGE,
                                );
                            }}
                            key={link.label}>
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
                <PaginationContent className="cursor-pointer">
                    {meta.links?.map((link, i) => (
                        <ConditionallyRenderPagination link={link} key={i} i={i} />
                    ))}
                </PaginationContent>
            </Pagination>
        )
    );
}
