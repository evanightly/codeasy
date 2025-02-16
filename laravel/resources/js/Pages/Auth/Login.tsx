import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Input } from '@/Components/UI/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

type Step = 'emailStep' | 'passwordStep' | 'authing';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [step, setStep] = useState<Step>('emailStep');
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const [typedManually, setTypedManually] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const variants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    const handleNextEmail: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.email) {
            alert('Silakan isi email/username!');
            return;
        }
        setStep('passwordStep');
    };

    const signIn = () => {
        setStep('authing');
        window.axios
            .post(route('login'), data)
            .then(() => {
                router.visit(route('dashboard'));
                setAutoSubmitted(false);
                setTypedManually(false);
            })
            .catch(() => {
                reset();
                setStep('passwordStep');
            })
            .finally(reset);
    };

    const handleSubmitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        signIn();
    };

    // Auto sign in jika password di-autofill
    useEffect(() => {
        if (step === 'passwordStep') {
            // Reset state saat masuk ke password step
            setTypedManually(false);
            setAutoSubmitted(false);

            // Beri delay untuk menunggu autofill browser
            const autoFillTimer = setTimeout(() => {
                const passwordInput = passwordInputRef.current;
                if (passwordInput?.value && !typedManually && !autoSubmitted) {
                    setData('password', passwordInput.value);
                    setAutoSubmitted(true);
                    signIn();
                }
            }, 1500);

            return () => clearTimeout(autoFillTimer);
        }
    }, [step]);

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form
                onSubmit={(e) => e.preventDefault()}
                className="relative mx-auto w-full max-w-md rounded bg-white"
            >
                <AnimatePresence mode="wait">
                    {step === 'authing' ? (
                        <motion.div
                            key="authing"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={variants}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <p className="mb-4 text-lg font-semibold text-gray-700">
                                Authenticating...
                            </p>
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="fields"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={variants}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Field email */}
                            <div
                                className={`transition-all duration-300 ${
                                    step === 'emailStep'
                                        ? 'h-auto opacity-100'
                                        : 'pointer-events-none h-0 opacity-0'
                                } `}
                            >
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email / Username"
                                    />
                                    <TextInput
                                        id="email"
                                        name="email"
                                        type="text"
                                        autoComplete="username"
                                        value={data.email}
                                        autoFocus
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <PrimaryButton
                                        onClick={handleNextEmail}
                                        disabled={processing}
                                    >
                                        Next
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Field password */}
                            <div
                                className={`transition-all duration-300 ${
                                    step === 'passwordStep'
                                        ? 'h-auto opacity-100'
                                        : 'pointer-events-none h-0 opacity-0'
                                } `}
                            >
                                <>
                                    <div>
                                        <InputLabel
                                            htmlFor="password"
                                            value="Password"
                                        />
                                        <Input
                                            autoFocus
                                            ref={passwordInputRef}
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={data.password}
                                            className="mt-1 block w-full"
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                );
                                                // Check if input is from user interaction
                                                const inputType = (
                                                    e.nativeEvent as InputEvent
                                                ).inputType;
                                                if (
                                                    inputType &&
                                                    inputType !==
                                                        'insertFromPaste'
                                                ) {
                                                    setTypedManually(true);
                                                }
                                            }}
                                            // Add onKeyDown handler for Enter key
                                            onKeyDown={(
                                                e: React.KeyboardEvent<HTMLInputElement>,
                                            ) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    !processing
                                                ) {
                                                    e.preventDefault();
                                                    signIn();
                                                }
                                            }}
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* <div className="mt-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData(
                                                        'remember',
                                                        e.target.checked as any,
                                                    )
                                                }
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                Remember me
                                            </span>
                                        </label>
                                    </div> */}

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="space-x-4 text-sm">
                                            {canResetPassword && (
                                                <Link
                                                    href={route(
                                                        'password.request',
                                                    )}
                                                    className="text-gray-600 underline hover:text-gray-900"
                                                >
                                                    Forgot Password?
                                                </Link>
                                            )}
                                            <Link
                                                href={route('register')}
                                                className="text-gray-600 underline hover:text-gray-900"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                        <PrimaryButton
                                            onClick={handleSubmitPassword}
                                            disabled={processing}
                                        >
                                            Sign In
                                        </PrimaryButton>
                                    </div>
                                </>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </GuestLayout>
    );
}
