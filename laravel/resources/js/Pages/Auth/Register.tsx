import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title='Register' />

            <form onSubmit={submit}>
                <div>
                    <InputLabel value='Name' htmlFor='name' />

                    <TextInput
                        value={data.name}
                        required
                        onChange={(e) => setData('name', e.target.value)}
                        name='name'
                        isFocused={true}
                        id='name'
                        className='mt-1 block w-full'
                        autoComplete='name'
                    />

                    <InputError message={errors.name} className='mt-2' />
                </div>

                <div className='mt-4'>
                    <InputLabel value='Email' htmlFor='email' />

                    <TextInput
                        value={data.email}
                        type='email'
                        required
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
                        required
                        onChange={(e) => setData('password', e.target.value)}
                        name='password'
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
                        required
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        name='password_confirmation'
                        id='password_confirmation'
                        className='mt-1 block w-full'
                        autoComplete='new-password'
                    />

                    <InputError message={errors.password_confirmation} className='mt-2' />
                </div>

                <div className='mt-4 flex items-center justify-end'>
                    <Link
                        href={route('login')}
                        className='rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton disabled={processing} className='ms-4'>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
