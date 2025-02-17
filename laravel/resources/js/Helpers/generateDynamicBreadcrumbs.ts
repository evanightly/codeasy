import { ROUTES } from '@/Support/Constants/routes';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';

function generateDynamicBreadcrumbs(): GenericBreadcrumbItem[] {
    const { url } = usePage(); // Get the current URL path from Inertia.js

    // Extract only the path part from the generated route (without the domain)
    const dashboardPath = new URL(route(`${ROUTES.DASHBOARD}.index`)).pathname;

    // If the current URL is the Dashboard (Home), return only the "Home" breadcrumb
    if (url === dashboardPath) {
        return [
            {
                name: 'Home',
                link: route(`${ROUTES.DASHBOARD}.index`),
                active: true,
            },
        ];
    }

    const paths = url.split('/').filter(Boolean); // Split the URL into parts and remove empty elements

    const breadcrumbs: GenericBreadcrumbItem[] = paths.map((path, index) => {
        const isActive = index === paths.length - 1; // The last path part is the active breadcrumb
        const name = path.charAt(0).toUpperCase() + path.slice(1); // Capitalize the first letter
        const link = `/${paths.slice(0, index + 1).join('/')}`; // Construct the link for each breadcrumb

        return {
            name,
            link,
            active: isActive,
        };
    });

    // Add "Home" as the root breadcrumb
    breadcrumbs.unshift({
        name: 'Home',
        link: route(`${ROUTES.DASHBOARD}.index`),
        active: false,
    });

    return breadcrumbs;
}

export { generateDynamicBreadcrumbs };
