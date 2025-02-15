/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import axios from 'axios';
import { OctagonAlert } from 'lucide-react';
import { toast } from 'sonner';

window.axios = axios;

function formatErrorMessages(error: any) {
    // console.log(error);

    let errorHtml = '';
    if (error.response.data.errors) {
        Object.keys(error.response.data.errors).forEach((key) => {
            errorHtml += `<p>${error.response.data.errors[key][0]}</p>`;
        });
    }

    return `
    <div class='flex flex-col gap-2'>
        <p>${error.response.data.message}</p>
        <div class='divider divider-horizontal'>Details</div>
        ${errorHtml}
    </div>
    `;
}

function handleAxiosError(error: any) {
    // Skip interceptor (Bypass error handling)
    if (error.config.skipInterceptor) return Promise.reject(error);

    console.error('Hol up:', error);
    if (error.response?.status >= 500) {
        let messages = 'Something went wrong. Please try again later.';

        if (error.response.data.errors && Object.keys(error.response.data.errors).length > 0) {
            messages = formatErrorMessages(error);
        } else {
            messages = error.response.data.message;
        }

        toast.custom(
            (id) => {
                return (
                    <Dialog key={id} defaultOpen>
                        <DialogContent className="flex flex-1 flex-col justify-center gap-4 p-14 py-10 [&>button]:hidden">
                            <DialogHeader className="items-center gap-4">
                                <DialogTitle className="flex flex-col items-center gap-4 text-xl">
                                    <OctagonAlert className="size-20 text-destructive" />
                                    Oops
                                </DialogTitle>
                                <DialogDescription
                                    dangerouslySetInnerHTML={{
                                        __html: messages,
                                    }}
                                />
                            </DialogHeader>
                            <DialogFooter className="sm:justify-center">
                                <DialogClose asChild>
                                    <Button>On It!</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            },
            { duration: Infinity },
        );
    } else if (error.response?.status === 403) {
        let messages = 'You are not authorized to perform this action.';

        if (error.response.data.errors && Object.keys(error.response.data.errors).length > 0) {
            messages = formatErrorMessages(error);
        }

        // console.log(messages);

        toast.error('Unauthorized', {
            description: <div dangerouslySetInnerHTML={{ __html: messages }}></div>,
        });
    } else if (error.response?.status >= 402) {
        let messages = 'Error';

        if (error.response.data.errors && Object.keys(error.response.data.errors).length > 0) {
            messages = formatErrorMessages(error);
        } else {
            messages = error.response.data.message;
        }

        // console.log(error);

        toast.error('Error', {
            richColors: true,
            description: <div dangerouslySetInnerHTML={{ __html: messages }}></div>,
        });
    }
    return Promise.reject(error);
}

window.axios.interceptors.response.use((res) => res, handleAxiosError);

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';