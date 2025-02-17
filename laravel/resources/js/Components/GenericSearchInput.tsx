import { Input } from '@/Components/UI/input';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { useDebounce } from '@uidotdev/usehooks';
import { ChangeEvent, Dispatch, memo, ReactNode, SetStateAction, useEffect, useState } from 'react';

interface GenericSearchInputProps {
    setFilters: Dispatch<SetStateAction<any>>; // Function to set filters
    debounceDelay?: number; // Optional debounce delay customization
    renderInput?: (value: string, onChange: (e: ChangeEvent<any>) => void) => ReactNode; // Custom input rendering
    defaultInputProps?: {
        placeholder?: string;
        className?: string;
        type?: string;
        [key: string]: any; // To allow passing any other input props
    };
}

const SearchInput = ({
    setFilters,
    debounceDelay = 500,
    renderInput,
    defaultInputProps = {},
}: GenericSearchInputProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

    useEffect(() => {
        setFilters((prevFilters: ServiceFilterOptions) => ({
            ...prevFilters,
            search: debouncedSearchTerm,
        }));
    }, [debouncedSearchTerm, setFilters]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            {renderInput ? (
                /**
                 * Use the custom input element if provided
                 *
                 * Example usage:
                 * <SearchInput
                 *     setFilters={setFilters}
                 *     renderInput={(value, onChange) => (
                 *         <textarea
                 *             value={value}
                 *             placeholder="Search tags..."
                 *             onChange={onChange}
                 *             className="textarea textarea-sm"
                 *         />
                 *     )}
                 * />
                 */
                renderInput(searchTerm, handleChange)
            ) : (
                // Default input field with customizable properties
                <Input
                    value={searchTerm}
                    type={defaultInputProps.type || 'text'} // Default to text input
                    placeholder={defaultInputProps.placeholder || 'Search...'} // Default to "Search..." if no placeholder provided
                    onChange={handleChange}
                    className={defaultInputProps.className} // Default class if none provided
                    {...defaultInputProps} // Spread any additional props
                />
            )}
        </>
    );
};

export default memo(SearchInput);
