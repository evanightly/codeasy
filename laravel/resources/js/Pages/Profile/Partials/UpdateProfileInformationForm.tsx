import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className='text-lg font-medium text-gray-900'>Profile Information</h2>

                <p className='mt-1 text-sm text-gray-600'>
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className='mt-6 space-y-6'>
                <div>
                    <InputLabel value='Name' htmlFor='name' />

                    <TextInput
                        value={data.name}
                        required
                        onChange={(e) => setData('name', e.target.value)}
                        isFocused
                        id='name'
                        className='mt-1 block w-full'
                        autoComplete='name'
                    />

                    <InputError message={errors.name} className='mt-2' />
                </div>

                <div>
                    <InputLabel value='Email' htmlFor='email' />

                    <TextInput
                        value={data.email}
                        type='email'
                        required
                        onChange={(e) => setData('email', e.target.value)}
                        id='email'
                        className='mt-1 block w-full'
                        autoComplete='username'
                    />

                    <InputError message={errors.email} className='mt-2' />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className='mt-2 text-sm text-gray-800'>
                            Your email address is unverified.
                            <Link
                                method='post'
                                href={route('verification.send')}
                                className='rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                as='button'
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className='mt-2 text-sm font-medium text-green-600'>
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className='flex items-center gap-4'>
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        leaveTo='opacity-0'
                        leave='transition ease-in-out'
                        enterFrom='opacity-0'
                        enter='transition ease-in-out'
                    >
                        <p className='text-sm text-gray-600'>Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
