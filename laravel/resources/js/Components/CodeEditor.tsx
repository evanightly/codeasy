import { Button } from '@/Components/UI/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/UI/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { useDarkMode } from '@/Contexts/ThemeContext';
import { ny } from '@/Lib/Utils';
import { python } from '@codemirror/lang-python';
import * as codemirrorThemes from '@uiw/codemirror-themes-all';
import CodeMirror from '@uiw/react-codemirror';
import { Check, ChevronsUpDown, Moon, Sun } from 'lucide-react';
import { useCallback, useState } from 'react';

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

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: string;
    showThemePicker?: boolean;
    language?: 'python' | 'javascript';
    label?: string;
}

export default function CodeEditor({
    value,
    onChange,
    height = '300px',
    showThemePicker = true,
    language = 'python',
    label,
}: CodeEditorProps) {
    const [themeComboboxOpen, setThemeComboboxOpen] = useState(false);
    const [theme, setTheme] = useState((codemirrorThemes as Record<string, any>)['monokai']);
    const [selectedThemeName, setSelectedThemeName] = useState('monokai');
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const handleCodeChange = useCallback(
        (val: string) => {
            onChange(val);
        },
        [onChange],
    );

    const handleThemeChange = (themeName: string) => {
        setSelectedThemeName(themeName);
        setTheme((codemirrorThemes as Record<string, any>)[themeName]);
        setThemeComboboxOpen(false);
    };

    const getLanguageExtension = () => {
        switch (language) {
            case 'python':
                return python();
            default:
                return python();
        }
    };

    return (
        <div className='flex flex-col gap-3'>
            {label && <label className='text-sm font-medium'>{label}</label>}
            <div className='flex flex-col gap-3'>
                {showThemePicker && (
                    <div className='flex gap-3'>
                        <Popover open={themeComboboxOpen} onOpenChange={setThemeComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    className='w-[200px] justify-between'
                                >
                                    {selectedThemeName}
                                    <ChevronsUpDown className='opacity-50' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[200px] p-0'>
                                <Command>
                                    <CommandInput
                                        placeholder='Search theme...'
                                        className='border-none focus:ring-0'
                                    />
                                    <CommandList>
                                        <CommandEmpty>No theme found.</CommandEmpty>
                                        <CommandGroup>
                                            {THEMES.map((themeName) => (
                                                <CommandItem
                                                    value={themeName}
                                                    onSelect={handleThemeChange}
                                                    key={themeName}
                                                >
                                                    {themeName}
                                                    <Check
                                                        className={ny(
                                                            'ml-auto',
                                                            selectedThemeName === themeName
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
                            variant='outline'
                            type='button'
                            size='icon'
                            onClick={toggleDarkMode}
                        >
                            {isDarkMode ? <Sun /> : <Moon />}
                        </Button>
                    </div>
                )}

                <CodeMirror
                    value={value}
                    theme={theme}
                    onChange={handleCodeChange}
                    height={height}
                    extensions={[getLanguageExtension()]}
                    className='w-full rounded-md border'
                />
            </div>
        </div>
    );
}
