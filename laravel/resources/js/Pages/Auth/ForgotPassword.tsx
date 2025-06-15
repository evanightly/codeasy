import { Alert } from '@/Components/UI/alert';
import { AnimatedGridPattern } from '@/Components/UI/animated-grid-pattern';
import { Button } from '@/Components/UI/button';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft, BookOpen, Mail, Moon, Sparkles, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useLaravelReactI18n();
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    // Form schema
    const forgotPasswordSchema = z.object({
        email: z
            .string()
            .min(1, t('validation.required', { attribute: 'email' }))
            .email(t('validation.email', { attribute: 'email' })),
    });

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(route('password.email'), values, {
                    onSuccess: () => {
                        resolve(true);
                    },
                    onError: (errors) => {
                        if (errors.email) {
                            form.setError('email', {
                                type: 'manual',
                                message: Array.isArray(errors.email)
                                    ? errors.email[0]
                                    : errors.email,
                            });
                        }
                        reject(new Error('Failed to send reset link'));
                    },
                });
            }),
            {
                loading: t('pages.auth.forgot_password.messages.pending'),
                success: t('pages.auth.forgot_password.messages.success'),
                error: t('pages.auth.forgot_password.messages.error'),
            },
        );
    };

    return (
        <div className='light:from-slate-50 light:via-blue-50 light:to-purple-50 relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800'>
            <Head title={t('pages.auth.forgot_password.title')} />

            {/* Dark Mode Toggle - Top Right */}
            <div className='absolute right-6 top-6 z-20'>
                <button
                    title={
                        isDarkMode
                            ? t('pages.auth.forgot_password.ui.switch_to_light')
                            : t('pages.auth.forgot_password.ui.switch_to_dark')
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
                    <span className='sr-only'>
                        {t('pages.auth.forgot_password.ui.toggle_dark_mode')}
                    </span>
                </button>
            </div>

            {/* Back to Login - Top Left */}
            <div className='absolute left-6 top-6 z-20'>
                <Link
                    href={route(`login`)}
                    className='group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/20'
                >
                    <ArrowLeft className='h-5 w-5 text-white transition-transform group-hover:translate-x-0.5' />
                    <span className='sr-only'>
                        {t('pages.auth.forgot_password.ui.back_to_login')}
                    </span>
                </Link>
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
            <div className='absolute left-1/3 top-1/4'>
                <Ripple numCircles={6} mainCircleSize={400} />
            </div>

            {/* Main Container */}
            <div className='relative z-10 flex min-h-screen items-center justify-center p-4'>
                <div className='grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2'>
                    {/* Left Side - Branding & Description */}
                    <motion.div
                        transition={{ duration: 0.8 }}
                        initial={{ opacity: 0, x: -50 }}
                        className='light:text-slate-800 hidden space-y-8 text-foreground lg:block'
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className='space-y-6'>
                            <SparklesText
                                text={t('pages.auth.forgot_password.hero_title')}
                                sparklesCount={12}
                                colors={{
                                    first: '#3B82F6',
                                    second: '#8B5CF6',
                                }}
                                className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold text-transparent'
                            />

                            <TextAnimate
                                once
                                className='text-xl leading-relaxed text-slate-300'
                                by='word'
                                animation='fadeIn'
                            >
                                {t('pages.auth.forgot_password.subtitle')}
                            </TextAnimate>

                            <TextAnimate
                                once
                                delay={0.5}
                                className='text-lg text-slate-400'
                                by='character'
                                animation='slideUp'
                            >
                                {t('pages.auth.forgot_password.description')}
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
                                <Mail className='h-6 w-6 text-blue-400' />
                                <span>{t('pages.auth.forgot_password.features.secure_reset')}</span>
                            </motion.div>

                            <motion.div
                                transition={{ delay: 1.2, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-slate-300'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <BookOpen className='h-6 w-6 text-purple-400' />
                                <span>{t('pages.auth.forgot_password.features.quick_access')}</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side - Forgot Password Form */}
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
                                <div className='space-y-2 text-center'>
                                    <h1 className='text-2xl font-bold text-foreground'>
                                        {t('pages.auth.forgot_password.title')}
                                    </h1>
                                    <p className='text-sm text-foreground/50'>
                                        {t('pages.auth.forgot_password.instruction')}
                                    </p>
                                </div>

                                {status && <Alert>{status}</Alert>}

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(handleSubmit)}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        {t(
                                                            'pages.auth.forgot_password.fields.email',
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t(
                                                                'pages.auth.forgot_password.placeholders.email',
                                                            )}
                                                            className='text-foreground placeholder:text-foreground/50'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='email'
                                            control={form.control}
                                        />

                                        <Button
                                            type='submit'
                                            disabled={form.formState.isSubmitting}
                                            className='w-full transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-blue-600 hover:to-purple-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50'
                                        >
                                            {form.formState.isSubmitting
                                                ? t('pages.auth.forgot_password.buttons.sending')
                                                : t(
                                                      'pages.auth.forgot_password.buttons.send_reset_link',
                                                  )}
                                        </Button>

                                        <div className='text-center'>
                                            <Link
                                                href={route(`login`)}
                                                className='text-sm text-primary transition-colors'
                                            >
                                                {t(
                                                    'pages.auth.forgot_password.buttons.back_to_login',
                                                )}
                                            </Link>
                                        </div>
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
                    <Sparkles className='h-8 w-8 text-blue-400 opacity-60' />
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
                    <Mail className='h-6 w-6 text-purple-400 opacity-40' />
                </motion.div>
            </div>
        </div>
    );
}
