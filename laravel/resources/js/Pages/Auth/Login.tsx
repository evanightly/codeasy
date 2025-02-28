import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { authServiceHook } from '@/Services/authServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type Step = 'emailStep' | 'passwordStep' | 'authing';

export default function Login({
    status,
    canResetPassword = true,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const { t } = useLaravelReactI18n();
    const [step, setStep] = useState<Step>('emailStep');
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const [typedManually, setTypedManually] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const loginMutation = authServiceHook.useLogin();

    // Define form schema with Zod
    const formSchema = z.object({
        email: z.string().min(1, t('validation.required', { attribute: 'email or username' })),
        password: z.string().min(1, t('validation.required', { attribute: 'password' })),
        remember: z.boolean().default(false),
    });

    // Setup form with react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const variants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    const handleNextEmail = () => {
        const email = form.getValues('email');
        if (!email) {
            form.setError('email', {
                type: 'manual',
                message: t('validation.required', { attribute: 'email' }),
            });
            return;
        }
        setStep('passwordStep');
    };

    const signIn = async () => {
        setStep('authing');
        const values = form.getValues();

        try {
            await loginMutation.mutateAsync({
                data: values,
            });

            // Successful login
            router.visit(route(`${ROUTES.DASHBOARD}.index`));
            setAutoSubmitted(false);
            setTypedManually(false);

            toast.success(t('pages.auth.login.messages.success'));
        } catch (error) {
            // Handle login error
            setStep('passwordStep');
            form.reset({ email: values.email, password: '', remember: values.remember });

            toast.error(t('pages.auth.login.messages.error'));

            // // If there are specific field errors, set them
            // if (error.response?.data?.errors) {
            //     Object.entries(error.response.data.errors).forEach(([key, messages]) => {
            //         form.setError(key as any, {
            //             type: 'manual',
            //             message: Array.isArray(messages) ? messages[0] : messages,
            //         });
            //     });
            // }
        }
    };

    // Auto sign in if password is autofilled
    useEffect(() => {
        if (step === 'passwordStep') {
            // Reset state when entering password step
            setTypedManually(false);
            setAutoSubmitted(false);

            // Delay to wait for browser autofill
            const autoFillTimer = setTimeout(() => {
                const passwordInput = passwordInputRef.current;
                if (passwordInput?.value && !typedManually && !autoSubmitted) {
                    form.setValue('password', passwordInput.value);
                    setAutoSubmitted(true);
                    signIn();
                }
            }, 500);

            return () => clearTimeout(autoFillTimer);
        }
    }, [step]);

    return (
        <GuestLayout>
            <Head title={t('pages.auth.login.title')} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.auth.login.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className='mb-4 rounded-md bg-green-50 p-2 text-sm text-green-600'>
                            {status}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={(e) => e.preventDefault()} className='space-y-4'>
                            <AnimatePresence mode='wait'>
                                {step === 'authing' ? (
                                    <motion.div
                                        variants={variants}
                                        transition={{ duration: 0.3 }}
                                        key='authing'
                                        initial='hidden'
                                        exit='exit'
                                        className='flex flex-col items-center justify-center py-8'
                                        animate='visible'
                                    >
                                        <p className='mb-4 text-lg font-semibold'>
                                            {t('pages.auth.login.messages.authenticating')}
                                        </p>
                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        variants={variants}
                                        transition={{ duration: 0.3 }}
                                        key='fields'
                                        initial='hidden'
                                        exit='exit'
                                        animate='visible'
                                    >
                                        {/* Email/Username field */}
                                        <div
                                            className={`transition-all duration-300 ${
                                                step === 'emailStep'
                                                    ? 'h-auto opacity-100'
                                                    : 'pointer-events-none h-0 opacity-0'
                                            }`}
                                        >
                                            <FormField
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t(
                                                                'pages.auth.login.fields.identifier',
                                                            )}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder='Email or username'
                                                                autoFocus
                                                                autoComplete='username email'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                                name='email'
                                                control={form.control}
                                            />
                                            <FormField
                                                render={({ field }) => (
                                                    <FormItem className='mt-4 flex items-center gap-2'>
                                                        <FormControl>
                                                            <Checkbox
                                                                onCheckedChange={field.onChange}
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className='!m-0 text-sm font-normal'>
                                                            {t('pages.auth.login.fields.remember')}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                                name='remember'
                                                control={form.control}
                                            />
                                            <div className='mt-4 flex items-center justify-end gap-4'>
                                                <Link href={route(ROUTES.REGISTER)}>
                                                    {t(
                                                        'pages.auth.login.buttons.dont_have_account',
                                                    )}
                                                </Link>
                                                <Button
                                                    onClick={handleNextEmail}
                                                    disabled={loginMutation.isPending}
                                                >
                                                    {t('pages.auth.login.buttons.next')}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Password field */}
                                        <div
                                            className={`transition-all duration-300 ${
                                                step === 'passwordStep'
                                                    ? 'h-auto opacity-100'
                                                    : 'pointer-events-none h-0 opacity-0'
                                            }`}
                                        >
                                            <FormField
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t('pages.auth.login.fields.password')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type='password'
                                                                ref={passwordInputRef}
                                                                onKeyDown={(e) => {
                                                                    if (
                                                                        e.key === 'Enter' &&
                                                                        !loginMutation.isPending
                                                                    ) {
                                                                        e.preventDefault();
                                                                        signIn();
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
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
                                                                autoFocus
                                                                autoComplete='current-password'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                                name='password'
                                                control={form.control}
                                            />

                                            <div className='mt-4 flex items-center justify-between'>
                                                <div className='space-x-4 text-sm'>
                                                    {canResetPassword && (
                                                        <Link href={route(ROUTES.PASSWORD_REQUEST)}>
                                                            {t(
                                                                'pages.auth.login.buttons.forgot_password',
                                                            )}
                                                        </Link>
                                                    )}
                                                    <Link href={route(ROUTES.REGISTER)}>
                                                        {t('pages.auth.login.buttons.sign_up')}
                                                    </Link>
                                                </div>
                                                <Button
                                                    onClick={signIn}
                                                    loading={loginMutation.isPending}
                                                    disabled={loginMutation.isPending}
                                                >
                                                    {t('pages.auth.login.buttons.sign_in')}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
