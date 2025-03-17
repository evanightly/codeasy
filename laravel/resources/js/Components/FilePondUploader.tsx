import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useMemo, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Register FilePond plugins
registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize,
);

interface FilePondUploaderProps {
    value?: File | null;
    onChange: (file: File | null) => void;
    acceptedFileTypes?: string[] | string;
    maxFileSize?: string; // e.g., "5MB"
    labelIdle?: string;
    className?: string;
    disabled?: boolean;
}

export const FilePondUploader = ({
    value,
    onChange,
    acceptedFileTypes = ['application/pdf', 'image/*', 'text/plain'],
    maxFileSize = '5MB',
    labelIdle,
    className,
    disabled = false,
}: FilePondUploaderProps) => {
    const { t } = useLaravelReactI18n();
    const [files, setFiles] = useState<any[]>([]);

    // Convert File object to FilePond file object
    useEffect(() => {
        if (value && !files.length) {
            setFiles([
                {
                    source: value,
                    options: {
                        type: 'local',
                    },
                },
            ]);
        } else if (!value) {
            setFiles([]);
        }
    }, [value]);

    // Ensure acceptedFileTypes is always an array for FilePond
    const normalizedAcceptedFileTypes = useMemo(() => {
        return typeof acceptedFileTypes === 'string' ? [acceptedFileTypes] : acceptedFileTypes;
    }, [acceptedFileTypes]);

    // Create a typeLabel for file extension display
    const fileValidateTypeLabelExpectedTypes = useMemo(() => {
        if (typeof acceptedFileTypes === 'string') {
            return acceptedFileTypes;
        }

        return acceptedFileTypes
            .map((type) => {
                if (type.startsWith('.')) return type;
                if (type.includes('/')) return type.split('/')[1];
                return type;
            })
            .join(', ');
    }, [acceptedFileTypes]);

    return (
        <div className={className}>
            <FilePond
                onupdatefiles={(fileItems) => {
                    setFiles(fileItems);
                    // Get the first actual file and handle type conversion properly
                    if (fileItems.length > 0) {
                        // FilePond stores the native File object in the `file` property
                        // but its type doesn't match TypeScript's File interface exactly
                        const filepondFile = fileItems[0].file;

                        // If it's already a native File object, use it directly
                        if (filepondFile instanceof File) {
                            onChange(filepondFile);
                        }
                        // Otherwise if it's an "actual file object" (FilePond's internal representation)
                        else if (
                            filepondFile &&
                            typeof filepondFile === 'object' &&
                            'name' in filepondFile &&
                            'size' in filepondFile &&
                            'type' in filepondFile
                        ) {
                            // Create a new File object using the blob data
                            // This ensures it matches the expected File interface
                            const nativeFile = new File([filepondFile], filepondFile.name, {
                                type: filepondFile.type,
                                lastModified: Date.now(),
                            });
                            onChange(nativeFile);
                        } else {
                            onChange(null);
                        }
                    } else {
                        onChange(null);
                    }
                }}
                maxFileSize={maxFileSize}
                labelMaxFileSizeExceeded={t('components.filepond.errors.size_too_large', {
                    filesize: maxFileSize,
                    defaultValue: `File is too large. Maximum size is ${maxFileSize}`,
                })}
                labelIdle={
                    labelIdle ||
                    t('components.filepond.labels.label_idle', {
                        defaultValue:
                            'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
                    })
                }
                labelFileTypeNotAllowed={t('components.filepond.errors.file_type_not_allowed', {
                    defaultValue: 'File type not allowed',
                })}
                fileValidateTypeLabelExpectedTypes={fileValidateTypeLabelExpectedTypes}
                files={files}
                disabled={disabled}
                credits={false}
                className='filepond-import'
                allowMultiple={false}
                acceptedFileTypes={normalizedAcceptedFileTypes}
            />
        </div>
    );
};
