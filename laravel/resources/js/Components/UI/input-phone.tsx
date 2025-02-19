import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { Button } from '@/Components/UI/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/UI/command';
import type { InputProps } from '@/Components/UI/input';
import { Input } from '@/Components/UI/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/UI/popover';
import { ny } from '@/Lib/Utils';

type InputPhoneProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> &
    Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
        onChange?: (value: RPNInput.Value) => void;
    };

const InputPhone: React.ForwardRefExoticComponent<InputPhoneProps> = React.forwardRef<
    React.ElementRef<typeof RPNInput.default>,
    InputPhoneProps
>(({ className, onChange, ...props }, ref) => (
    <RPNInput.default
        ref={ref}
        /**
         * Handles the onChange event.
         *
         * react-phone-number-input might trigger the onChange event as undefined
         * when a valid phone number is not entered. To prevent this,
         * the value is coerced to an empty string.
         *
         * @param {E164Number | undefined} value - The entered value
         */
        onChange={(value) => onChange?.(value as RPNInput.Value)}
        inputComponent={InputComponent}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        className={ny('flex', className)}
        {...props}
    />
));
InputPhone.displayName = 'InputPhone';

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => (
        <Input className={ny('rounded-e-lg rounded-s-none', className)} {...props} ref={ref} />
    ),
);
InputComponent.displayName = 'InputComponent';

interface CountrySelectOption {
    label: string;
    value: RPNInput.Country;
}

interface CountrySelectProps {
    disabled?: boolean;
    value: RPNInput.Country;
    onChange: (value: RPNInput.Country) => void;
    options: CountrySelectOption[];
}

function CountrySelect({ disabled, value, onChange, options }: CountrySelectProps) {
    const handleSelect = React.useCallback(
        (country: RPNInput.Country) => onChange(country),
        [onChange],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    type='button'
                    disabled={disabled}
                    className={ny('flex gap-1 rounded-e-none rounded-s-lg px-3')}
                >
                    <FlagComponent countryName={value} country={value} />
                    <CaretSortIcon
                        className={ny(
                            '-mr-2 size-4 opacity-50',
                            disabled ? 'hidden' : 'opacity-100',
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[300px] p-0'>
                <Command>
                    <CommandList>
                        <CommandInput placeholder='Search country...' />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    onSelect={() => handleSelect(option.value)}
                                    key={option.value || 'ZZ'}
                                    className='gap-2'
                                >
                                    <FlagComponent
                                        countryName={option.label}
                                        country={option.value}
                                    />
                                    <span className='flex-1 text-sm'>{option.label}</span>
                                    {option.value && (
                                        <span className='text-sm text-foreground/50'>
                                            {`+${RPNInput.getCountryCallingCode(option.value)}`}
                                        </span>
                                    )}
                                    <CheckIcon
                                        className={ny(
                                            'ml-auto size-4',
                                            option.value === value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
    const Flag = flags[country];

    return (
        <span className='flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20'>
            {Flag && <Flag title={countryName} />}
        </span>
    );
}
FlagComponent.displayName = 'FlagComponent';

export { InputPhone };
