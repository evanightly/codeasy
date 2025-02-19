import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { useAnchorObserver } from '@/Hooks/use-anchor-observer';
import { useOnChange } from '@/Hooks/use-on-change';
import { ny } from '@/Lib/Utils';
import type { PopoverContentProps, PopoverTriggerProps } from '@radix-ui/react-popover';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { AlignLeft, ChevronRight } from 'lucide-react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode, RefObject } from 'react';
import * as React from 'react';
import { createContext, forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

// #region Types
export interface TOCItemType {
    title: ReactNode;
    url: string;
    depth: number;
}

export type TableOfContents = TOCItemType[];
export type TOCThumb = [top: number, height: number];

export interface TOCProps {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export interface PageStyles {
    tocNav?: string;
    toc?: string;
    page?: string;
    article?: string;
}

export interface TOCItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;

    onActiveChange?: (v: boolean) => void;
}

// #region Components
const ScrollArea = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} className={ny('overflow-hidden', className)} {...props}>
        {children}
        <ScrollAreaPrimitive.Corner />
        <ScrollBar orientation='vertical' />
    </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollViewport = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Viewport
        ref={ref}
        className={ny('size-full rounded-[inherit]', className)}
        {...props}
    >
        {children}
    </ScrollAreaPrimitive.Viewport>
));

ScrollViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

const ScrollBar = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Scrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.Scrollbar
        ref={ref}
        orientation={orientation}
        className={ny(
            'data-[state=hidden]:animate-fd-fade-out flex select-none',
            orientation === 'vertical' && 'h-full w-1.5',
            orientation === 'horizontal' && 'h-1.5 flex-col',
            className,
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb className='bg-fd-border relative flex-1 rounded-full' />
    </ScrollAreaPrimitive.Scrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

export { ScrollArea, ScrollBar, ScrollViewport };

// #region Contexts
const ActiveAnchorContext = createContext<string[]>([]);
const ScrollContext = createContext<RefObject<HTMLElement | null>>({
    current: null,
});
const StylesContext = createContext<PageStyles>({
    tocNav: 'xl:hidden',
    toc: 'max-xl:hidden',
});

// #region Hooks
function useActiveAnchor(): string | undefined {
    return useContext(ActiveAnchorContext).at(-1);
}

function useActiveAnchors(): string[] {
    return useContext(ActiveAnchorContext);
}

function usePageStyles() {
    return useContext(StylesContext);
}

// #region Utility Functions
function isDifferent(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b))
        return b.length !== a.length || a.some((v, i) => isDifferent(v, b[i]));
    return a !== b;
}

function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') ref(value);
            else if (ref !== null && typeof ref === 'object')
                (ref as React.MutableRefObject<T | null>).current = value;
        });
    };
}

function getItemOffset(depth: number): number {
    if (depth <= 2) return 14;
    if (depth === 3) return 26;
    return 36;
}

function getLineOffset(depth: number): number {
    return depth >= 3 ? 10 : 0;
}

// #region Components
export function ScrollProvider({
    containerRef,
    children,
}: {
    containerRef: RefObject<HTMLElement | null>;
    children?: ReactNode;
}): React.ReactElement {
    return <ScrollContext.Provider value={containerRef}>{children}</ScrollContext.Provider>;
}

export function AnchorProvider({
    toc,
    single = true,
    children,
}: {
    toc: TableOfContents;
    single?: boolean;
    children?: ReactNode;
}): React.ReactElement {
    const headings = useMemo(() => {
        return toc.map((item) => item.url.split('#')[1]);
    }, [toc]);

    return (
        <ActiveAnchorContext.Provider value={useAnchorObserver(headings, single)}>
            {children}
        </ActiveAnchorContext.Provider>
    );
}

export const TOCItem = forwardRef<HTMLAnchorElement, TOCItemProps>(
    ({ onActiveChange, ...props }, ref) => {
        const containerRef = useContext(ScrollContext);
        const anchors = useActiveAnchors();
        const anchorRef = useRef<HTMLAnchorElement>(null);
        const mergedRef = mergeRefs(anchorRef, ref);

        const isActive = anchors.includes(props.href.slice(1));

        useOnChange(isActive, (v) => {
            const element = anchorRef.current;
            if (!element) return;

            if (v && containerRef.current) {
                scrollIntoView(element, {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                    scrollMode: 'always',
                    boundary: containerRef.current,
                });
            }

            onActiveChange?.(v);
        });

        return (
            <a ref={mergedRef} data-active={isActive} {...props}>
                {props.children}
            </a>
        );
    },
);

TOCItem.displayName = 'TOCItem';

export function TocThumb({
    containerRef,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    containerRef: RefObject<HTMLElement | null>;
}): ReactNode {
    const active = useActiveAnchors();
    const thumbRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef(active);
    activeRef.current = active;

    function calc(container: HTMLElement, active: string[]): TOCThumb {
        if (active.length === 0 || container.clientHeight === 0) return [0, 0];

        let upper = Number.MAX_VALUE;
        let lower = 0;

        for (const item of active) {
            const element = container.querySelector<HTMLElement>(`a[href="#${item}"]`);
            if (!element) continue;

            const styles = getComputedStyle(element);
            upper = Math.min(upper, element.offsetTop + Number.parseFloat(styles.paddingTop));
            lower = Math.max(
                lower,
                element.offsetTop + element.clientHeight - Number.parseFloat(styles.paddingBottom),
            );
        }

        return [upper, lower - upper];
    }

    function update(element: HTMLElement, info: TOCThumb): void {
        element.style.setProperty('--nyx-top', `${info[0]}px`);
        element.style.setProperty('--nyx-height', `${info[1]}px`);
    }

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const onResize = (): void => {
            if (!thumbRef.current) return;
            update(thumbRef.current, calc(container, activeRef.current));
        };

        onResize();
        const observer = new ResizeObserver(onResize);
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [containerRef]);

    useOnChange(active, () => {
        if (!containerRef.current || !thumbRef.current) return;

        update(thumbRef.current, calc(containerRef.current, active));
    });

    return <div role='none' ref={thumbRef} {...props} />;
}

export function TocItemsEmpty() {
    return (
        <div className='rounded-lg border bg-card p-3 text-xs text-muted-foreground'>
            No headings found
        </div>
    );
}

export function Toc(props: HTMLAttributes<HTMLDivElement>) {
    const { toc } = usePageStyles();

    return (
        <div
            id='nyx-toc'
            {...props}
            style={
                {
                    ...props.style,
                    '--nyx-toc-height':
                        'calc(100dvh - var(--nyx-banner-height) - var(--nyx-nav-height))',
                } as any
            }
            className={ny(
                'sticky top-nyx-layout-top h-[var(--nyx-toc-height)] pb-2 pt-12',
                toc,
                props.className,
            )}
        >
            <div className='flex h-full w-[var(--nyx-width)] max-w-full flex-col gap-3 pe-4'>
                {props.children}
            </div>
        </div>
    );
}

// Main Component
export function NyxTOCItems({
    items,
    isMenu = false,
    label,
}: {
    items: TOCItemType[];
    isMenu?: boolean;
    label?: ReactNode;
}) {
    const viewRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [svg, setSvg] = useState<{
        path: string;
        width: number;
        height: number;
    }>();

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        function onResize(): void {
            if (container.clientHeight === 0) return;
            let w = 0;
            let h = 0;
            const d: string[] = [];
            for (let i = 0; i < items.length; i++) {
                const element: HTMLElement | null = container.querySelector(
                    `a[href="#${items[i].url.slice(1)}"]`,
                );
                if (!element) continue;

                const styles = getComputedStyle(element);
                const offset = getLineOffset(items[i].depth) + 1;
                const top = element.offsetTop + Number.parseFloat(styles.paddingTop);
                const bottom =
                    element.offsetTop +
                    element.clientHeight -
                    Number.parseFloat(styles.paddingBottom);

                w = Math.max(offset, w);
                h = Math.max(h, bottom);

                d.push(`${i === 0 ? 'M' : 'L'}${offset} ${top}`);
                d.push(`L${offset} ${bottom}`);
            }

            setSvg({
                path: d.join(' '),
                width: w + 1,
                height: h,
            });
        }

        const observer = new ResizeObserver(onResize);
        onResize();
        observer.observe(container);
        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return <TocItemsEmpty />;

    return (
        <>
            {label && (
                <h3 className='-ms-0.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <AlignLeft className='size-4' />
                    {label}
                </h3>
            )}
            <ScrollArea className={ny('flex flex-col', isMenu && '-ms-3')}>
                <ScrollViewport ref={viewRef} className='relative min-h-0'>
                    {svg ? (
                        <div
                            style={{
                                width: svg.width,
                                height: svg.height,
                                maskImage: `url("data:image/svg+xml,${
                                    // Inline SVG
                                    encodeURIComponent(
                                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`,
                                    )
                                }")`,
                            }}
                            className='absolute start-0 top-0 rtl:-scale-x-100'
                        >
                            <TocThumb
                                containerRef={containerRef}
                                className='mt-[var(--nyx-top)] h-[var(--nyx-height)] bg-primary transition-all'
                            />
                        </div>
                    ) : null}
                    <ScrollProvider containerRef={viewRef}>
                        <div ref={containerRef} className='flex flex-col'>
                            {items.map((item, i) => (
                                <LocalTOCItem
                                    upper={items[i - 1]?.depth}
                                    lower={items[i + 1]?.depth}
                                    key={item.url}
                                    item={item}
                                />
                            ))}
                        </div>
                    </ScrollProvider>
                </ScrollViewport>
            </ScrollArea>
        </>
    );
}

// Popover Components
export const TocPopover = Popover;

export function TocPopoverTrigger({
    items,
    ...props
}: PopoverTriggerProps & { items: TOCItemType[] }) {
    const active = useActiveAnchor();
    const current = useMemo(() => {
        return items.find((item) => active === item.url.slice(1))?.title;
    }, [items, active]);

    return (
        <PopoverTrigger
            {...props}
            className={ny(
                'inline-flex items-center gap-2 text-nowrap px-4 py-2 text-start',
                props.className,
            )}
        >
            <AlignLeft className='size-4 shrink-0' />
            Table of Contents
            {current && (
                <>
                    <ChevronRight className='-mx-1.5 size-4 shrink-0 text-muted-foreground' />
                    <span className='truncate text-muted-foreground'>{current}</span>
                </>
            )}
        </PopoverTrigger>
    );
}

export function TocPopoverContent(props: PopoverContentProps) {
    return (
        <PopoverContent
            side='bottom'
            hideWhenDetached
            data-toc-popover=''
            alignOffset={16}
            align='start'
            {...props}
            className={ny(
                'flex max-h-[var(--radix-popover-content-available-height)] w-[260px] flex-col gap-4 p-3',
                props.className,
            )}
        >
            {props.children}
        </PopoverContent>
    );
}

function LocalTOCItem({
    item,
    upper = item.depth,
    lower = item.depth,
}: {
    item: TOCItemType;
    upper?: number;
    lower?: number;
}) {
    const offset = getLineOffset(item.depth);
    const upperOffset = getLineOffset(upper);
    const lowerOffset = getLineOffset(lower);

    return (
        <TOCItem
            style={{
                paddingInlineStart: getItemOffset(item.depth),
            }}
            href={item.url}
            className='prose relative py-1.5 text-sm text-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-primary'
        >
            {offset !== upperOffset ? (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 16 16'
                    className='absolute -top-1.5 start-0 size-4 rtl:-scale-x-100'
                >
                    <line
                        y2='12'
                        y1='0'
                        x2={offset}
                        x1={upperOffset}
                        strokeWidth='1'
                        className='stroke-foreground/10'
                    />
                </svg>
            ) : null}
            <div
                style={{
                    insetInlineStart: offset,
                }}
                className={ny(
                    'absolute inset-y-0 w-px bg-foreground/10',
                    offset !== upperOffset && 'top-1.5',
                    offset !== lowerOffset && 'bottom-1.5',
                )}
            />
            {item.title}
        </TOCItem>
    );
}
