import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title='Confirm Password' />

            <div className='mb-4 text-sm text-gray-600'>
                This is a secure area of the application. Please confirm your password before
                continuing.
            </div>

            <form onSubmit={submit}>
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
                    />

                    <InputError message={errors.password} className='mt-2' />
                </div>

                <div className='mt-4 flex items-center justify-end'>
                    <PrimaryButton disabled={processing} className='ms-4'>
                        Confirm
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
