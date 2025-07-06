import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useTheme } from '@/Contexts/ThemeContext';
import { Check, SwatchBook } from 'lucide-react';

export const DashboardSetTheme = () => {
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
                            handleThemeChange(theme, e);
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
