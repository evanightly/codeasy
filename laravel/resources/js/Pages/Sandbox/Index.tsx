import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Button } from '@/Components/UI/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/UI/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/UI/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/UI/tooltip';
import { useDarkMode } from '@/Contexts/ThemeContext';
import { ny } from '@/Lib/Utils';
import { python } from '@codemirror/lang-python';
import { Head } from '@inertiajs/react';
import * as codemirrorThemes from '@uiw/codemirror-themes-all';
import CodeMirror from '@uiw/react-codemirror';
import {
    AlertCircle,
    Check,
    ChevronsUpDown,
    Ellipsis,
    Loader2,
    Moon,
    Redo2,
    Sun,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const THEMES = [
    'dark',
    'light',
    'abcdef',
    'abyss',
    'androidstudio',
    'atomone',
    'aura',
    'bbedit',
    'bespin',
    'darcula',
    'dracula',
    'duotoneDark',
    'duotoneLight',
    'eclipse',
    'githubDark',
    'githubLight',
    'gruvboxDark',
    'gruvboxLight',
    'kimbie',
    'material',
    'materialDark',
    'materialLight',
    'monokai',
    'monokaiDimmed',
    'noctisLilac',
    'nord',
    'okaidia',
    'quietlight',
    'red',
    'solarizedDark',
    'solarizedLight',
    'sublime',
    'tokyoNight',
    'tokyoNightDay',
    'tokyoNightStorm',
    'tomorrowNightBlue',
    'vscodeDark',
    'xcodeDark',
    'xcodeLight',
] as const;

export default function Index() {
    const [isCompiling, setIsCompiling] = useState(false);
    const [code, setCode] = useState("print('Test')");
    const [output, setOutput] = useState([]);
    const [themeComboboxOpen, setThemeComboboxOpen] = useState(false);
    const [theme, setTheme] = useState(
        (codemirrorThemes as Record<string, any>)['monokai'],
    );
    const [selectedThemeName, setSelectedThemeName] = useState('monokai');
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const handleSubmit = async (e?: any) => {
        // Make e optional since we'll call this without an event from keyboard
        if (e) e.preventDefault();

        setIsCompiling(true);

        const res = await window.axios.post(route('sandbox.store'), {
            code,
            type: 'sandbox',
        });
        console.log(res);

        setOutput(res.data);

        setIsCompiling(false);
    };

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [code]); // Add code as dependency to ensure we have latest code state

    const onChange = useCallback((val: any, viewUpdate: any) => {
        setCode(val);
    }, []);

    const handleThemeChange = (themeName: string) => {
        setSelectedThemeName(themeName);
        setTheme((codemirrorThemes as Record<string, any>)[themeName]);
        setThemeComboboxOpen(false);
    };

    return (
        <>
            <Head title="Sandbox" />
            <div className="flex flex-col">
                <div className="p-5 flex flex-col gap-5">
                    <h1 className="text-3xl font-semibold">Sandbox</h1>
                    <Alert variant="destructive" className="w-full lg:w-1/2">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            visualizations generated by sandbox will be deleted
                            in 2 days
                        </AlertDescription>
                    </Alert>
                </div>
                <div className="flex flex-col gap-5 px-5 lg:flex-row">
                    <div className="flex flex-1 flex-col gap-5">
                        <div className="flex gap-5">
                            <Popover
                                open={themeComboboxOpen}
                                onOpenChange={setThemeComboboxOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        // aria-expanded={open}
                                        className="w-[200px] justify-between"
                                    >
                                        {selectedThemeName}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search theme..."
                                            className="border-none focus:ring-0"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                No theme found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {THEMES.map((themeName) => (
                                                    <CommandItem
                                                        key={themeName}
                                                        value={themeName}
                                                        onSelect={
                                                            handleThemeChange
                                                        }
                                                    >
                                                        {themeName}
                                                        <Check
                                                            className={ny(
                                                                'ml-auto',
                                                                selectedThemeName ===
                                                                    themeName
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Button
                                size="icon"
                                variant="outline"
                                onClick={toggleDarkMode}
                            >
                                {isDarkMode ? <Sun /> : <Moon />}
                            </Button>
                        </div>

                        <div className="flex">
                            <div className="flex flex-col gap-5 border bg-background-2 p-5">
                                <Button size="icon">
                                    <PythonIcon />
                                </Button>
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <Ellipsis />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Other compilers will be added
                                                soon
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <CodeMirror
                                value={code}
                                height="500px"
                                extensions={[python()]}
                                onChange={onChange}
                                className="w-full"
                                theme={theme}
                            />
                        </div>

                        <Button
                            disabled={isCompiling}
                            onClick={handleSubmit}
                            type="submit"
                            className="ml-auto flex items-center gap-5"
                        >
                            {isCompiling ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Redo2 className="size-4" />
                            )}
                            {isCompiling ? 'Running...' : 'Run (Ctrl + Enter)'}
                        </Button>
                    </div>

                    <div className="flex flex-1 flex-col">
                        <h2 className="text-2xl font-semibold">Output</h2>

                        <div className="flex flex-col gap-5 px-0 py-5">
                            {output.map((out: any, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="rounded bg-background-2 px-3 py-2"
                                    >
                                        {out.type === 'image' ? (
                                            <img
                                                className="mx-auto w-[30rem] rounded bg-background-2"
                                                key={i}
                                                src={out.content}
                                                alt="output"
                                            />
                                        ) : (
                                            <div
                                                key={i}
                                                className="rounded bg-background-2 px-3 py-2"
                                            >
                                                {out.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const PythonIcon = (props: React.ComponentProps<'svg'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 255"
            width="20"
            height="20"
            {...props}
        >
            <defs>
                <linearGradient
                    id="a"
                    x1="12.959"
                    x2="224.782"
                    y1="12.88"
                    y2="233.972"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#387EB8" />
                    <stop offset="1" stopColor="#366994" />
                </linearGradient>
                <linearGradient
                    id="b"
                    x1="85.411"
                    x2="243.234"
                    y1="85.333"
                    y2="252.425"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#FFE052" />
                    <stop offset="1" stopColor="#FFC331" />
                </linearGradient>
            </defs>
            <path
                fill="url(#a)"
                d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z"
            />
            <path
                fill="url(#b)"
                d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z"
            />
        </svg>
    );
};
