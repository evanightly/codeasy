import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { Button } from '@/Components/UI/button';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ConfirmationOptions {
    confirmationTitle?: string;
    confirmationMessage?: string;
}

interface ShowConfirmationProps {
    (onConfirm: () => void, confirmationTitle?: string, confirmationDescription?: string): void;
}

interface ConfirmationDialogContextProps {
    showConfirmation: ShowConfirmationProps;
}

const ConfirmationDialogContext = createContext<ConfirmationDialogContextProps | undefined>(
    undefined,
);

export const useConfirmationDialog = () => {
    const context = useContext(ConfirmationDialogContext);
    if (!context) {
        throw new Error('useConfirmationDialog must be used within a ConfirmationDialogProvider');
    }
    return context;
};

export const ConfirmationDialogProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

    const showConfirmation: ShowConfirmationProps = (
        onConfirm: () => void,
        confirmationTitle?: string,
        confirmationDescription?: string,
    ) => {
        setTitle(confirmationTitle || 'Are you sure?');
        setDescription(confirmationDescription || 'This action is irreversible');
        setOnConfirm(() => onConfirm);
        setIsOpen(true);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirm();
    };

    return (
        <ConfirmationDialogContext.Provider value={{ showConfirmation }}>
            {children}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm md:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription className="text-md">{description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmationDialogContext.Provider>
    );
};

export const useConfirmation = () => {
    const { showConfirmation } = useConfirmationDialog();

    // Wrapper for simplified usage
    return (onConfirm: () => void, options?: ConfirmationOptions) => {
        const title = options?.confirmationTitle || 'Are you sure?';
        const message = options?.confirmationMessage || 'This action is irreversible';

        showConfirmation(onConfirm, title, message);
    };
};
