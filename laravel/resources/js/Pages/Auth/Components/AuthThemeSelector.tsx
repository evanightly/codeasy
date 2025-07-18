import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useTheme } from '@/Contexts/ThemeContext';
import { Check, SwatchBook } from 'lucide-react';

export const AuthThemeSelector = () => {
    const { currentTheme, availableThemes, setTheme } = useTheme();

    const handleThemeChange = (theme: any, event: React.MouseEvent) => {
        // Get the click position relative to the viewport
        const rect = event.currentTarget.getBoundingClientRect();
        const origin = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };

        setTheme(theme, origin);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    title='Change Theme'
                    className='group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/20'
                >
                    <SwatchBook className='h-5 w-5 text-foreground transition-colors' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='min-w-40' align='end'>
                {availableThemes.map((theme) => (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            handleThemeChange(theme, e);
                        }}
                        key={theme.name}
                        className='cursor-pointer'
                    >
                        {theme.name}
                        {currentTheme?.name === theme.name && <Check className='ml-auto h-4 w-4' />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
