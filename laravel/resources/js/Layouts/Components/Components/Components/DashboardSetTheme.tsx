import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useTheme } from '@/Contexts/ThemeContext';
import { Check, SwatchBook } from 'lucide-react';

export const DashboardSetTheme = () => {
    const { isDarkMode, currentTheme, availableThemes, toggleDarkMode, setTheme } = useTheme();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <DropdownMenuItem>
                    <SwatchBook />
                    Theme
                </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                {availableThemes.map((theme) => (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            setTheme(theme);
                        }}
                        key={theme.name}
                    >
                        {theme.name}
                        {currentTheme?.name === theme.name && <Check className='ml-2 h-4 w-4' />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
