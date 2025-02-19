import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title='Reset Password' />

            <form onSubmit={submit}>
                <div>
                    <InputLabel value='Email' htmlFor='email' />

                    <TextInput
                        value={data.email}
                        type='email'
                        onChange={(e) => setData('email', e.target.value)}
                        name='email'
                        id='email'
                        className='mt-1 block w-full'
                        autoComplete='username'
                    />

                    <InputError message={errors.email} className='mt-2' />
                </div>

                <div className='mt-4'>
                    <InputLabel value='Password' htmlFor='password' />

                    <TextInput
                        value={data.password}
                        type='password'
                        onChange={(e) => setData('password', e.target.value)}
                        name='password'
                        isFocused={true}
                        id='password'
                        className='mt-1 block w-full'
                        autoComplete='new-password'
                    />

                    <InputError message={errors.password} className='mt-2' />
                </div>

                <div className='mt-4'>
                    <InputLabel value='Confirm Password' htmlFor='password_confirmation' />

                    <TextInput
                        value={data.password_confirmation}
                        type='password'
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        name='password_confirmation'
                        className='mt-1 block w-full'
                        autoComplete='new-password'
                    />

                    <InputError message={errors.password_confirmation} className='mt-2' />
                </div>

                <div className='mt-4 flex items-center justify-end'>
                    <PrimaryButton disabled={processing} className='ms-4'>
                        Reset Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
