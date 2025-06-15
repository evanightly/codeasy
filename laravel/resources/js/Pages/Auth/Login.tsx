import { Alert } from '@/Components/UI/alert';
import AnimatedGradientText from '@/Components/UI/animated-gradient-text';
import { AnimatedGridPattern } from '@/Components/UI/animated-grid-pattern';
import { Button } from '@/Components/UI/button';
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
import { NeonGradientCard } from '@/Components/UI/neon-gradient-card';
import { Ripple } from '@/Components/UI/ripple';
import SparklesText from '@/Components/UI/sparkles-text';
import { TextAnimate } from '@/Components/UI/text-animate';
import { useDarkMode } from '@/Contexts/ThemeContext';
import { authServiceHook } from '@/Services/authServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Brain,
    GraduationCap,
    Lock,
    LogIn,
    Mail,
    Moon,
    Shield,
    Sparkles,
    Sun,
    UserCheck,
} from 'lucide-react';
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
    const { isDarkMode, toggleDarkMode } = useDarkMode();
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

    // Auto focus password input when step changes to passwordStep
    useEffect(() => {
        if (step === 'passwordStep' && passwordInputRef.current) {
            setTimeout(() => {
                passwordInputRef.current?.focus();
            }, 100); // Short delay to ensure DOM has updated
        }
    }, [step]);

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
        } catch (_error) {
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
        <div className='light:from-slate-50 light:via-purple-50 light:to-blue-50 relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800'>
            <Head title={t('pages.auth.login.title')} />

            {/* Dark Mode Toggle - Top Right */}
            <div className='absolute right-6 top-6 z-20'>
                <button
                    title={
                        isDarkMode
                            ? t('pages.auth.login.ui.switch_to_light')
                            : t('pages.auth.login.ui.switch_to_dark')
                    }
                    onClick={toggleDarkMode}
                    className='group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/20'
                >
                    <div className='relative overflow-hidden'>
                        <Sun
                            className={`h-5 w-5 text-amber-300 transition-all duration-500 ${
                                isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                            }`}
                        />
                        <Moon
                            className={`absolute inset-0 h-5 w-5 text-slate-300 transition-all duration-500 ${
                                isDarkMode ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                            }`}
                        />
                    </div>
                    <span className='sr-only'>{t('pages.auth.login.ui.toggle_dark_mode')}</span>
                </button>
            </div>

            {/* Animated Grid Background */}
            <AnimatedGridPattern
                repeatDelay={1}
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                className='absolute inset-0 h-full w-full skew-y-12'
            />

            {/* Ripple Effect */}
            <div className='absolute left-1/4 top-1/4'>
                <Ripple numCircles={6} mainCircleSize={400} />
            </div>

            {/* Main Container */}
            <div className='relative z-10 flex min-h-screen items-center justify-center p-4'>
                <div className='grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2'>
                    {/* Left Side - Branding & Features */}
                    <motion.div
                        transition={{ duration: 0.8 }}
                        initial={{ opacity: 0, x: -50 }}
                        className='light:text-slate-800 hidden space-y-8 text-foreground lg:block'
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className='space-y-6'>
                            <SparklesText
                                text={t('pages.auth.login.hero_title')}
                                sparklesCount={15}
                                colors={{
                                    first: '#60A5FA',
                                    second: '#A855F7',
                                }}
                                className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-6xl font-bold text-transparent'
                            />

                            <TextAnimate
                                once
                                className='text-xl leading-relaxed text-slate-300'
                                by='word'
                                animation='fadeIn'
                            >
                                {t('pages.auth.login.subtitle')}
                            </TextAnimate>

                            <TextAnimate
                                once
                                delay={0.5}
                                className='text-lg text-slate-400'
                                by='character'
                                animation='slideUp'
                            >
                                {t('pages.auth.login.description')}
                            </TextAnimate>
                        </div>

                        {/* Feature Highlights */}
                        <div className='space-y-4'>
                            <motion.div
                                transition={{ delay: 1, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-slate-300'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Brain className='h-6 w-6 text-purple-400' />
                                <span>{t('pages.auth.login.features.ai_assessment')}</span>
                            </motion.div>

                            <motion.div
                                transition={{ delay: 1.2, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-slate-300'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GraduationCap className='h-6 w-6 text-blue-400' />
                                <span>{t('pages.auth.login.features.personalized_learning')}</span>
                            </motion.div>

                            <motion.div
                                transition={{ delay: 1.4, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-slate-300'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <BookOpen className='h-6 w-6 text-pink-400' />
                                <span>{t('pages.auth.login.features.real_world_projects')}</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side - Login Form */}
                    <motion.div
                        transition={{ duration: 0.8, delay: 0.2 }}
                        initial={{ opacity: 0, x: 50 }}
                        className='mx-auto w-full max-w-md'
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <NeonGradientCard
                            neonColors={{
                                firstColor: '#3B82F6',
                                secondColor: '#8B5CF6',
                            }}
                            className='light:bg-white/90 bg-white/10 backdrop-blur-xl dark:bg-white/10'
                            borderSize={2}
                            borderRadius={20}
                        >
                            <div className='space-y-6 p-8'>
                                {/* Header */}
                                <div className='space-y-4 text-center'>
                                    <AnimatedGradientText className='text-foreground'>
                                        {t('pages.auth.login.ui.welcome_back_header')}
                                    </AnimatedGradientText>

                                    <div className='space-y-2'>
                                        <h1 className='light:text-slate-800 text-2xl font-bold text-foreground'>
                                            {t('pages.auth.login.title')}
                                        </h1>
                                        <p className='light:text-slate-600 text-sm text-foreground/50'>
                                            {t('pages.auth.login.ui.continue_journey')}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Message */}
                                {status && (
                                    <Alert
                                        variant='default'
                                        color='#10B981'
                                        className='border-green-400 bg-green-500/20'
                                    >
                                        <p className='text-center text-sm text-green-300'>
                                            {status}
                                        </p>
                                    </Alert>
                                )}

                                {/* Login Form */}
                                <Form {...form}>
                                    <form
                                        onSubmit={(e) => e.preventDefault()}
                                        className='space-y-6'
                                    >
                                        <AnimatePresence mode='wait'>
                                            {step === 'authing' ? (
                                                <motion.div
                                                    key='authing'
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className='flex flex-col items-center justify-center space-y-4 py-12'
                                                    animate={{ opacity: 1, scale: 1 }}
                                                >
                                                    <div className='relative'>
                                                        <div className='h-12 w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600'></div>
                                                        <UserCheck className='absolute inset-0 m-auto h-6 w-6 text-purple-400' />
                                                    </div>
                                                    <p className='text-lg font-semibold text-foreground'>
                                                        {t(
                                                            'pages.auth.login.messages.authenticating',
                                                        )}
                                                    </p>
                                                    <p className='text-sm text-foreground/50'>
                                                        {t(
                                                            'pages.auth.login.ui.verifying_credentials',
                                                        )}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key='form'
                                                    initial={{ opacity: 0, y: 20 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className='space-y-6'
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    {/* Email Step */}
                                                    <div
                                                        className={`space-y-4 transition-all duration-500 ${
                                                            step === 'emailStep'
                                                                ? 'max-h-96 opacity-100'
                                                                : 'max-h-0 overflow-hidden opacity-0'
                                                        }`}
                                                    >
                                                        <FormField
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                                        <Mail className='h-4 w-4' />
                                                                        {t(
                                                                            'pages.auth.login.fields.identifier',
                                                                        )}
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className='relative'>
                                                                            <Input
                                                                                {...field}
                                                                                placeholder={t(
                                                                                    'pages.auth.login.placeholders.identifier',
                                                                                )}
                                                                                onKeyDown={(e) => {
                                                                                    if (
                                                                                        e.key ===
                                                                                        'Enter'
                                                                                    ) {
                                                                                        e.preventDefault();
                                                                                        handleNextEmail();
                                                                                    }
                                                                                }}
                                                                                className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-purple-400'
                                                                                autoFocus
                                                                                autoComplete='username email'
                                                                            />
                                                                            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                                                <Shield className='h-4 w-4 text-slate-400' />
                                                                            </div>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className='text-red-300' />
                                                                </FormItem>
                                                            )}
                                                            name='email'
                                                            control={form.control}
                                                        />

                                                        <FormField
                                                            render={({ field }) => (
                                                                <FormItem className='flex items-center justify-between space-x-2 space-y-0'>
                                                                    <div className='flex items-center justify-between space-x-2 space-y-0'>
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                onCheckedChange={
                                                                                    field.onChange
                                                                                }
                                                                                className='border-foreground/50 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600'
                                                                                checked={
                                                                                    field.value
                                                                                }
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className='cursor-pointer text-sm font-normal text-foreground/50'>
                                                                            {t(
                                                                                'pages.auth.login.fields.remember',
                                                                            )}
                                                                        </FormLabel>
                                                                    </div>

                                                                    <Link
                                                                        href={route(
                                                                            'password.request',
                                                                        )}
                                                                        className='text-sm text-blue-300 transition-colors hover:text-blue-200'
                                                                    >
                                                                        {t(
                                                                            'pages.auth.login.buttons.forgot_password',
                                                                        )}
                                                                    </Link>
                                                                </FormItem>
                                                            )}
                                                            name='remember'
                                                            control={form.control}
                                                        />

                                                        <div className='flex items-center justify-between pt-2'>
                                                            <Link
                                                                href={route(ROUTES.REGISTER)}
                                                                className='text-sm text-foreground/50 transition-colors'
                                                            >
                                                                {t(
                                                                    'pages.auth.login.buttons.dont_have_account',
                                                                )}
                                                            </Link>

                                                            <Button
                                                                onClick={handleNextEmail}
                                                                disabled={loginMutation.isPending}
                                                                className='bg-gradient-to-r from-purple-600 to-blue-600 px-6 text-white hover:from-purple-700 hover:to-blue-700'
                                                            >
                                                                {t('pages.auth.login.buttons.next')}
                                                                <ArrowRight className='ml-2 h-4 w-4' />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Password Step */}
                                                    <div
                                                        className={`space-y-4 transition-all duration-500 ${
                                                            step === 'passwordStep'
                                                                ? 'max-h-96 opacity-100'
                                                                : 'max-h-0 overflow-hidden opacity-0'
                                                        }`}
                                                    >
                                                        {/* Back Button & Email Display */}
                                                        <div className='flex items-center gap-3 text-foreground/50'>
                                                            <Button
                                                                variant='ghost'
                                                                type='button'
                                                                onClick={() => setStep('emailStep')}
                                                                disabled={loginMutation.isPending}
                                                                className='h-8 w-8 p-0 text-foreground/50'
                                                            >
                                                                <ArrowLeft className='h-4 w-4' />
                                                            </Button>
                                                            <div className='flex items-center gap-2'>
                                                                <Mail className='h-4 w-4 text-foreground/50' />
                                                                <span className='text-sm font-medium text-foreground/50'>
                                                                    {form.getValues('email')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <FormField
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='flex items-center gap-2 text-foreground'>
                                                                        <Lock className='h-4 w-4' />
                                                                        {t(
                                                                            'pages.auth.login.fields.password',
                                                                        )}
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className='relative'>
                                                                            <Input
                                                                                {...field}
                                                                                type='password'
                                                                                ref={
                                                                                    passwordInputRef
                                                                                }
                                                                                placeholder={t(
                                                                                    'pages.auth.login.placeholders.password',
                                                                                )}
                                                                                onKeyDown={(e) => {
                                                                                    if (
                                                                                        e.key ===
                                                                                            'Enter' &&
                                                                                        !loginMutation.isPending
                                                                                    ) {
                                                                                        e.preventDefault();
                                                                                        signIn();
                                                                                    }
                                                                                }}
                                                                                onChange={(e) => {
                                                                                    field.onChange(
                                                                                        e,
                                                                                    );
                                                                                    const inputType =
                                                                                        (
                                                                                            e.nativeEvent as InputEvent
                                                                                        ).inputType;
                                                                                    if (
                                                                                        inputType &&
                                                                                        inputType !==
                                                                                            'insertFromPaste'
                                                                                    ) {
                                                                                        setTypedManually(
                                                                                            true,
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-purple-400'
                                                                                autoFocus
                                                                                autoComplete='current-password'
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className='text-red-300' />
                                                                </FormItem>
                                                            )}
                                                            name='password'
                                                            control={form.control}
                                                        />

                                                        <div className='flex items-center justify-between pt-2'>
                                                            <div className='flex flex-col space-y-1 text-xs'>
                                                                {canResetPassword && (
                                                                    <Link
                                                                        href={route(
                                                                            ROUTES.PASSWORD_REQUEST,
                                                                        )}
                                                                        className='text-foreground/50 transition-colors'
                                                                    >
                                                                        {t(
                                                                            'pages.auth.login.buttons.forgot_password',
                                                                        )}
                                                                    </Link>
                                                                )}
                                                                <Link
                                                                    href={route(ROUTES.REGISTER)}
                                                                    className='text-foreground/50 transition-colors'
                                                                >
                                                                    {t(
                                                                        'pages.auth.login.buttons.sign_up',
                                                                    )}
                                                                </Link>
                                                            </div>

                                                            <Button
                                                                onClick={signIn}
                                                                loading={loginMutation.isPending}
                                                                disabled={loginMutation.isPending}
                                                                className='bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-white hover:from-purple-700 hover:to-blue-700'
                                                            >
                                                                <LogIn className='mr-2 h-4 w-4' />
                                                                {t(
                                                                    'pages.auth.login.buttons.sign_in',
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </Form>
                            </div>
                        </NeonGradientCard>
                    </motion.div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className='absolute right-20 top-20 hidden xl:block'>
                <motion.div
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                >
                    <Sparkles className='h-8 w-8 text-purple-400 opacity-60' />
                </motion.div>
            </div>

            <div className='absolute bottom-20 left-20 hidden xl:block'>
                <motion.div
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                    }}
                    animate={{
                        y: [0, 15, 0],
                        rotate: [0, -5, 0],
                    }}
                >
                    <BookOpen className='h-6 w-6 text-blue-400 opacity-40' />
                </motion.div>
            </div>
        </div>
    );
}
