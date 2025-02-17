import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/Components/UI/breadcrumb';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { Fragment } from 'react';

interface GenericBreadcrumbProps {
    breadcrumbs?: GenericBreadcrumbItem[];
}

export default function GenericBreadcrumb({ breadcrumbs }: GenericBreadcrumbProps) {
    return (
        breadcrumbs && (
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs?.map((breadcrumb, index) => (
                        <Fragment key={index}>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={breadcrumb.link}>
                                    {breadcrumb.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        )
    );
}
