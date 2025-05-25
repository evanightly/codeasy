import { FormControl, FormItem, FormLabel, FormMessage } from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

export interface TimeoutValue {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'months';
}

interface WorkspaceLockTimeoutFieldProps {
    value?: number; // timeout in days from database
    onChange: (days: number) => void;
    label?: string;
    error?: string;
}

export default function WorkspaceLockTimeoutField({
    value = 7,
    onChange,
    label,
    error,
}: WorkspaceLockTimeoutFieldProps) {
    const { t } = useLaravelReactI18n();
    const [timeoutValue, setTimeoutValue] = useState<TimeoutValue>(() => {
        // Convert days to appropriate unit for display
        if (value === 0) return { value: 0, unit: 'days' };
        if (value % 30 === 0 && value >= 30) return { value: value / 30, unit: 'months' };
        if (value % 7 === 0 && value >= 7) return { value: value / 7, unit: 'days' };
        if (value >= 1) return { value: value, unit: 'days' };
        if (value * 24 >= 1) return { value: value * 24, unit: 'hours' };
        return { value: value * 24 * 60, unit: 'minutes' };
    });

    const convertToDays = (val: number, unit: string): number => {
        switch (unit) {
            case 'minutes':
                return val / (24 * 60);
            case 'hours':
                return val / 24;
            case 'days':
                return val;
            case 'months':
                return val * 30; // Approximate 30 days per month
            default:
                return val;
        }
    };

    const handleValueChange = (newValue: string) => {
        const numValue = parseInt(newValue) || 0;
        const newTimeoutValue = { ...timeoutValue, value: numValue };
        setTimeoutValue(newTimeoutValue);
        onChange(convertToDays(numValue, newTimeoutValue.unit));
    };

    const handleUnitChange = (newUnit: string) => {
        const newTimeoutValue = { ...timeoutValue, unit: newUnit as TimeoutValue['unit'] };
        setTimeoutValue(newTimeoutValue);
        onChange(convertToDays(timeoutValue.value, newUnit));
    };

    useEffect(() => {
        // Update display when external value changes
        if (value === 0) {
            setTimeoutValue({ value: 0, unit: 'days' });
            return;
        }

        if (value % 30 === 0 && value >= 30) {
            setTimeoutValue({ value: value / 30, unit: 'months' });
        } else if (value % 7 === 0 && value >= 7) {
            setTimeoutValue({ value: value / 7, unit: 'days' });
        } else if (value >= 1) {
            setTimeoutValue({ value: value, unit: 'days' });
        } else if (value * 24 >= 1) {
            setTimeoutValue({ value: value * 24, unit: 'hours' });
        } else {
            setTimeoutValue({ value: value * 24 * 60, unit: 'minutes' });
        }
    }, [value]);

    return (
        <FormItem>
            <FormLabel>{label || t('pages.course.common.fields.workspace_lock_timeout')}</FormLabel>
            <div className='flex gap-2'>
                <FormControl>
                    <Input
                        value={timeoutValue.value}
                        type='number'
                        placeholder={t('pages.course.common.placeholders.timeout_value')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        min='0'
                    />
                </FormControl>
                <FormControl>
                    <Select value={timeoutValue.unit} onValueChange={handleUnitChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='minutes'>
                                {t('pages.course.common.time_units.minutes')}
                            </SelectItem>
                            <SelectItem value='hours'>
                                {t('pages.course.common.time_units.hours')}
                            </SelectItem>
                            <SelectItem value='days'>
                                {t('pages.course.common.time_units.days')}
                            </SelectItem>
                            <SelectItem value='months'>
                                {t('pages.course.common.time_units.months')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </FormControl>
            </div>
            <div className='text-sm text-muted-foreground'>
                {t('pages.course.common.help.workspace_lock_timeout')}
            </div>
            {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
    );
}
