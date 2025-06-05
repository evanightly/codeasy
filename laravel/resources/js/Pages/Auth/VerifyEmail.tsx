import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useLaravelReactI18n();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title='Email Verification' />

            <div className='mb-4 text-sm text-gray-600'>
                Thanks for signing up! Before getting started, could you verify your email address
                by clicking on the link we just emailed to you? If you didn't receive the email, we
                will gladly send you another.
            </div>

            {status === 'verification-link-sent' && (
                <div className='mb-4 text-sm font-medium text-green-600'>
                    A new verification link has been sent to the email address you provided during
                    registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className='mt-4 flex items-center justify-between'>
                    <PrimaryButton disabled={processing}>
                        {t('pages.auth.verify_email.resend_button')}
                    </PrimaryButton>

                    <Link
                        method='post'
                        href={route('logout')}
                        className='rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        as='button'
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
