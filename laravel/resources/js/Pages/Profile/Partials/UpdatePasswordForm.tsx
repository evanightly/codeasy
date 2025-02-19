import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }: { className?: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className='text-lg font-medium text-gray-900'>Update Password</h2>

                <p className='mt-1 text-sm text-gray-600'>
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className='mt-6 space-y-6'>
                <div>
                    <InputLabel value='Current Password' htmlFor='current_password' />

                    <TextInput
                        value={data.current_password}
                        type='password'
                        ref={currentPasswordInput}
                        onChange={(e) => setData('current_password', e.target.value)}
                        id='current_password'
                        className='mt-1 block w-full'
                        autoComplete='current-password'
                    />

                    <InputError message={errors.current_password} className='mt-2' />
                </div>

                <div>
                    <InputLabel value='New Password' htmlFor='password' />

                    <TextInput
                        value={data.password}
                        type='password'
                        ref={passwordInput}
                        onChange={(e) => setData('password', e.target.value)}
                        id='password'
                        className='mt-1 block w-full'
                        autoComplete='new-password'
                    />

                    <InputError message={errors.password} className='mt-2' />
                </div>

                <div>
                    <InputLabel value='Confirm Password' htmlFor='password_confirmation' />

                    <TextInput
                        value={data.password_confirmation}
                        type='password'
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        id='password_confirmation'
                        className='mt-1 block w-full'
                        autoComplete='new-password'
                    />

                    <InputError message={errors.password_confirmation} className='mt-2' />
                </div>

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
