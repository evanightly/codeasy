import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { userServiceHook } from '@/Services/userServiceHook';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Check, Languages } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

export const SetLocalization = () => {
    const { setLocale, currentLocale, getLocales } = useLaravelReactI18n();
    const { user } = usePage().props.auth;
    const updatePreferencesMutation = userServiceHook.useUpdatePreferences();

    const changeLocale = async (locale: string) => {
        try {
            // Update locale in frontend immediately
            setLocale(locale);
            window.axios.defaults.headers['Accept-Language'] = locale;

            // Persist to backend
            await updatePreferencesMutation.mutateAsync({
                id: user.id,
                preferences: { locale },
            });

            toast.success(`Language changed to ${locale.toUpperCase()}`);
        } catch (error) {
            console.error('Failed to update locale preference:', error);
            toast.error('Failed to save language preference');
        }
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
                        disabled={updatePreferencesMutation.isPending}
                    >
                        {locale}
                        {selectedLocale === locale && <Check className='ml-2 h-4 w-4' />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
