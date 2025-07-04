import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import { Separator } from '@/Components/UI/separator';
import { Sheet, SheetContent } from '@/Components/UI/sheet';
import { Skeleton } from '@/Components/UI/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/UI/tooltip';
import { useIsMobile } from '@/Hooks/use-mobile';
import { ny } from '@/Lib/Utils';
import { useLocalStorage } from '@uidotdev/usehooks';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const _SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
const SIDEBAR_MIN_WIDTH = 200; // 12.5rem in pixels
const SIDEBAR_MAX_WIDTH = 480; // 30rem in pixels
const SIDEBAR_DEFAULT_WIDTH = 256; // 16rem in pixels

interface SidebarContext {
    state: 'expanded' | 'collapsed';
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
    width: number;
    setWidth: (width: number) => void;
    isResizing: boolean;
    setIsResizing: (resizing: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a Sidebar.');
    }

    return context;
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(
    (
        {
            defaultOpen: _defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref,
    ) => {
        const isMobile = useIsMobile();
        const [openMobile, setOpenMobile] = React.useState(false);

        // Use useLocalStorage for persistent state
        const [storedCollapsed, setStoredCollapsed] = useLocalStorage('sidebar:collapsed', false);
        const [storedWidth, setStoredWidth] = useLocalStorage(
            'sidebar:width',
            SIDEBAR_DEFAULT_WIDTH,
        );

        // Width and resizing state
        const [isResizing, setIsResizing] = React.useState(false);

        // Clamp stored width to valid bounds
        const clampedWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, storedWidth));

        // This is the internal state of the sidebar.
        // We use openProp and setOpenProp for control from outside the component.
        const [_open, _setOpen] = React.useState(openProp ?? !storedCollapsed);
        const open = openProp ?? _open;

        const setOpen = React.useCallback(
            (value: boolean | ((value: boolean) => boolean)) => {
                const newValue = typeof value === 'function' ? value(open) : value;

                if (setOpenProp) {
                    setOpenProp(newValue);
                } else {
                    _setOpen(newValue);
                }

                // Store the collapsed state
                setStoredCollapsed(!newValue);

                // This sets the cookie to keep the sidebar state.
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${newValue}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
            },
            [setOpenProp, open, setStoredCollapsed],
        );

        // Width setter with persistence
        const setWidth = React.useCallback(
            (newWidth: number) => {
                const clampedWidth = Math.max(
                    SIDEBAR_MIN_WIDTH,
                    Math.min(SIDEBAR_MAX_WIDTH, newWidth),
                );
                setStoredWidth(clampedWidth);
            },
            [setStoredWidth],
        );

        // Helper to toggle the sidebar.
        const toggleSidebar = React.useCallback(() => {
            return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
        }, [isMobile, setOpen, setOpenMobile]);

        // Adds a keyboard shortcut to toggle the sidebar.
        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    toggleSidebar();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [toggleSidebar]);

        // We add a state so that we can do data-state="expanded" or "collapsed".
        // This makes it easier to style the sidebar with Tailwind classes.
        const state = open ? 'expanded' : 'collapsed';

        const contextValue = React.useMemo<SidebarContext>(
            () => ({
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
                width: clampedWidth,
                setWidth,
                isResizing,
                setIsResizing,
            }),
            [
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
                clampedWidth,
                setWidth,
                isResizing,
                setIsResizing,
            ],
        );

        return (
            <SidebarContext.Provider value={contextValue}>
                <TooltipProvider delayDuration={0}>
                    <div
                        style={
                            {
                                '--sidebar-width': `${clampedWidth}px`,
                                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                                ...style,
                            } as React.CSSProperties
                        }
                        ref={ref}
                        className={ny(
                            'group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground has-[[data-variant=inset]]:bg-sidebar',
                            className,
                        )}
                        {...props}
                    >
                        {children}
                    </div>
                </TooltipProvider>
            </SidebarContext.Provider>
        );
    },
);
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right';
        variant?: 'sidebar' | 'floating' | 'inset';
        collapsible?: 'offcanvas' | 'icon' | 'none';
    }
>(
    (
        {
            side = 'left',
            variant = 'sidebar',
            collapsible = 'offcanvas',
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

        if (collapsible === 'none') {
            return (
                <div
                    ref={ref}
                    className={ny(
                        'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            );
        }

        if (isMobile) {
            return (
                <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                    <SheetContent
                        style={
                            {
                                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                            } as React.CSSProperties
                        }
                        side={side}
                        data-sidebar='sidebar'
                        data-mobile='true'
                        className='w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden'
                    >
                        <div className='flex size-full flex-col'>{children}</div>
                    </SheetContent>
                </Sheet>
            );
        }

        return (
            <div
                ref={ref}
                data-variant={variant}
                data-state={state}
                data-side={side}
                data-collapsible={state === 'collapsed' ? collapsible : ''}
                className='group peer hidden md:block'
            >
                {/* This is what handles the sidebar gap on desktop */}
                <div
                    className={ny(
                        'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear',
                        'group-data-[collapsible=offcanvas]:w-0',
                        'group-data-[side=right]:rotate-180',
                        variant === 'floating' || variant === 'inset'
                            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
                            : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
                    )}
                />
                <div
                    className={ny(
                        'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex',
                        side === 'left'
                            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                        // Adjust the padding for floating and inset variants.
                        variant === 'floating' || variant === 'inset'
                            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
                            : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
                        className,
                    )}
                    {...props}
                >
                    <div
                        data-sidebar='sidebar'
                        className='flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow'
                    >
                        {children}
                    </div>
                </div>
            </div>
        );
    },
);
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            variant='ghost'
            size='icon'
            ref={ref}
            onClick={(event) => {
                onClick?.(event);
                toggleSidebar();
            }}
            data-sidebar='trigger'
            className={ny('size-7', className)}
            {...props}
        >
            <PanelLeft />
            <span className='sr-only'>Toggle Sidebar</span>
        </Button>
    );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
    ({ className, ...props }, ref) => {
        const { toggleSidebar, width, setWidth, isResizing, setIsResizing, state } = useSidebar();
        const [isDragging, setIsDragging] = React.useState(false);
        const startXRef = React.useRef<number>(0);
        const startWidthRef = React.useRef<number>(0);

        const handleMouseDown = React.useCallback(
            (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (state === 'collapsed') {
                    toggleSidebar();
                    return;
                }

                setIsDragging(true);
                setIsResizing(true);
                startXRef.current = e.clientX;
                startWidthRef.current = width;

                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            },
            [state, toggleSidebar, width, setIsResizing],
        );

        const handleMouseMove = React.useCallback(
            (e: MouseEvent) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startXRef.current;
                const newWidth = startWidthRef.current + deltaX;

                setWidth(newWidth);
            },
            [isDragging, setWidth],
        );

        const handleMouseUp = React.useCallback(() => {
            setIsDragging(false);
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }, [setIsResizing]);

        React.useEffect(() => {
            if (isDragging) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);

                return () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
            }
        }, [isDragging, handleMouseMove, handleMouseUp]);

        return (
            <button
                title={
                    state === 'collapsed' ? 'Expand Sidebar' : 'Drag to resize or click to collapse'
                }
                tabIndex={-1}
                ref={ref}
                onMouseDown={handleMouseDown}
                data-sidebar='rail'
                className={ny(
                    'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
                    '[[data-side=left]_&]:cursor-col-resize [[data-side=right]_&]:cursor-col-resize',
                    '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
                    'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
                    '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
                    '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
                    isResizing && 'cursor-col-resize',
                    className,
                )}
                aria-label={
                    state === 'collapsed' ? 'Expand Sidebar' : 'Drag to resize or click to collapse'
                }
                {...props}
            />
        );
    },
);
SidebarRail.displayName = 'SidebarRail';

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(
    ({ className, ...props }, ref) => {
        return (
            <main
                ref={ref}
                className={ny(
                    'relative flex min-h-svh flex-1 flex-col bg-background',
                    'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarInset.displayName = 'SidebarInset';

const SidebarInput = React.forwardRef<
    React.ElementRef<typeof Input>,
    React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
    return (
        <Input
            ref={ref}
            data-sidebar='input'
            className={ny(
                'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                className,
            )}
            {...props}
        />
    );
});
SidebarInput.displayName = 'SidebarInput';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar='header'
                className={ny('flex flex-col gap-2 p-2', className)}
                {...props}
            />
        );
    },
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar='footer'
                className={ny('flex flex-col gap-2 p-2', className)}
                {...props}
            />
        );
    },
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarSeparator = React.forwardRef<
    React.ElementRef<typeof Separator>,
    React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
    return (
        <Separator
            ref={ref}
            data-sidebar='separator'
            className={ny('mx-2 w-auto bg-sidebar-border', className)}
            {...props}
        />
    );
});
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar='content'
                className={ny(
                    'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar='group'
                className={ny('relative flex w-full min-w-0 flex-col p-2', className)}
                {...props}
            />
        );
    },
);
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            ref={ref}
            data-sidebar='group-label'
            className={ny(
                'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar='group-action'
            className={ny(
                'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                // Increases the hit area of the button on mobile.
                'after:absolute after:-inset-2 after:md:hidden',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
});
SidebarGroupAction.displayName = 'SidebarGroupAction';

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-sidebar='group-content'
            className={ny('w-full text-sm', className)}
            {...props}
        />
    ),
);
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul
            ref={ref}
            data-sidebar='menu'
            className={ny('flex w-full min-w-0 flex-col gap-1', className)}
            {...props}
        />
    ),
);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
    ({ className, ...props }, ref) => (
        <li
            ref={ref}
            data-sidebar='menu-item'
            className={ny('group/menu-item relative', className)}
            {...props}
        />
    ),
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
                windui: 'flex items-center gap-3 px-3 py-6 transition-colors hover:bg-primary/10 hover:text-primary/80 focus:bg-primary/10 data-[active=true]:bg-primary/10 data-[active=true]:text-primary/80 active:bg-primary/20 active:text-primary/70',
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        isActive?: boolean;
        tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(
    (
        {
            asChild = false,
            isActive = false,
            variant = 'default',
            size = 'default',
            tooltip,
            className,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';
        const { isMobile, state } = useSidebar();

        const button = (
            <Comp
                ref={ref}
                data-size={size}
                data-sidebar='menu-button'
                data-active={isActive}
                className={ny(sidebarMenuButtonVariants({ variant, size }), className)}
                {...props}
            />
        );

        if (!tooltip) {
            return button;
        }

        if (typeof tooltip === 'string') {
            tooltip = {
                children: tooltip,
            };
        }

        return (
            <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent
                    side='right'
                    hidden={state !== 'collapsed' || isMobile}
                    align='center'
                    {...tooltip}
                />
            </Tooltip>
        );
    },
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        showOnHover?: boolean;
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar='menu-action'
            className={ny(
                'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
                // Increases the hit area of the button on mobile.
                'after:absolute after:-inset-2 after:md:hidden',
                'peer-data-[size=sm]/menu-button:top-1',
                'peer-data-[size=default]/menu-button:top-1.5',
                'peer-data-[size=lg]/menu-button:top-2.5',
                'group-data-[collapsible=icon]:hidden',
                showOnHover &&
                    'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-sidebar='menu-badge'
            className={ny(
                'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
                'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
                'peer-data-[size=sm]/menu-button:top-1',
                'peer-data-[size=default]/menu-button:top-1.5',
                'peer-data-[size=lg]/menu-button:top-2.5',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    ),
);
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        showIcon?: boolean;
    }
>(({ className, showIcon = false, ...props }, ref) => {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            ref={ref}
            data-sidebar='menu-skeleton'
            className={ny('flex h-8 items-center gap-2 rounded-md px-2', className)}
            {...props}
        >
            {showIcon && (
                <Skeleton data-sidebar='menu-skeleton-icon' className='size-4 rounded-md' />
            )}
            <Skeleton
                style={
                    {
                        '--skeleton-width': width,
                    } as React.CSSProperties
                }
                data-sidebar='menu-skeleton-text'
                className='h-4 max-w-[--skeleton-width] flex-1'
            />
        </div>
    );
});
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul
            ref={ref}
            data-sidebar='menu-sub'
            className={ny(
                'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    ),
);
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
    ({ ...props }, ref) => <li ref={ref} {...props} />,
);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<'a'> & {
        asChild?: boolean;
        size?: 'sm' | 'md';
        isActive?: boolean;
    }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
        <Comp
            ref={ref}
            data-size={size}
            data-sidebar='menu-sub-button'
            data-active={isActive}
            className={ny(
                'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
                'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
