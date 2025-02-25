import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Check, Languages } from 'lucide-react';
import { useMemo } from 'react';

export const SetLocalization = () => {
    const { setLocale, isLocale, currentLocale, getLocales } = useLaravelReactI18n();

    const changeLocale = (locale: string) => {
        setLocale(locale);
        window.axios.defaults.headers['Accept-Language'] = locale;
    };

    const selectedLocale = useMemo(() => currentLocale(), [currentLocale]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <DropdownMenuItem>
                    <Languages />
                    Language
                </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                {getLocales().map((locale) => (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            changeLocale(locale);
                        }}
                        key={locale}
                    >
                        {locale}
                        {selectedLocale === locale && <Check className='ml-2 h-4 w-4' />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
