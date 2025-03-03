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
    acceptedFileTypes?: string[];
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

    // Create localized labels for FilePond
    // const labels = useMemo(
    //     () => ({
    //         labelIdle: labelIdle || t('components.filepond.labels.label_idle'),
    //         labelTapToCancel: t('components.filepond.labels.label_tap_to_cancel'),
    //         labelTapToRetry: t('components.filepond.labels.label_tap_to_retry'),
    //         labelTapToUndo: t('components.filepond.labels.label_tap_to_undo'),
    //         labelButtonRemoveItem: t('components.filepond.labels.label_button_remove_item'),
    //         labelButtonProcessItem: t('components.filepond.labels.label_button_process_item'),
    //         labelButtonUndoItemProcessing: t(
    //             'components.filepond.labels.label_button_undo_item_processing',
    //         ),
    //         labelButtonRetryItemProcessing: t(
    //             'components.filepond.labels.label_button_retry_item_processing',
    //         ),
    //         labelButtonProcessItemUpload: t(
    //             'components.filepond.labels.label_button_process_item_upload',
    //         ),
    //         labelFileWaitingForSizeCalculation: t(
    //             'components.filepond.labels.label_file_waiting_for_size_calculation',
    //         ),
    //         labelFileSizeNotAvailable: t(
    //             'components.filepond.labels.label_file_size_not_available',
    //         ),
    //         labelFileLoading: t('components.filepond.labels.label_file_loading_error'),
    //         labelFileProcessing: t('components.filepond.labels.label_file_processing'),
    //         labelFileProcessingComplete: t(
    //             'components.filepond.labels.label_file_processing_complete',
    //         ),
    //         labelFileProcessingAborted: t(
    //             'components.filepond.labels.label_file_processing_aborted',
    //         ),
    //         labelFileProcessingError: t('components.filepond.labels.label_file_processing_error'),
    //     }),
    //     [t, labelIdle],
    // );

    // Errors messages
    const fileValidateTypeLabelExpectedTypes = useMemo(() => {
        return acceptedFileTypes?.join(', ') || '';
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
                })}
                labelFileTypeNotAllowed={t('components.filepond.errors.file_type_not_allowed')}
                fileValidateTypeLabelExpectedTypes={fileValidateTypeLabelExpectedTypes}
                files={files}
                disabled={disabled}
                credits={false}
                allowMultiple={false}
                acceptedFileTypes={acceptedFileTypes}
                // Spread all other labels
                // {...labels}
            />
        </div>
    );
};
