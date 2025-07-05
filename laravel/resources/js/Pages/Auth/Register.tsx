import GenericDataSelector from '@/Components/GenericDataSelector';
import AnimatedGradientText from '@/Components/UI/animated-gradient-text';
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import SparklesText from '@/Components/UI/sparkles-text';
import { TextAnimate } from '@/Components/UI/text-animate';
import { useDarkMode } from '@/Contexts/ThemeContext';
import { authServiceHook } from '@/Services/authServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    BookOpen,
    Brain,
    GraduationCap,
    Lock,
    Mail,
    Moon,
    School,
    Sparkles,
    Sun,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthThemeSelector } from './Components/AuthThemeSelector';

const MemoizedTextAnimate = memo(TextAnimate);

export default function Register() {
    const { t } = useLaravelReactI18n();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const registerMutation = authServiceHook.useRegister();

    // Define form schema with Zod
    const formSchema = z
        .object({
            name: z.string().min(1, t('validation.required', { attribute: 'name' })),
            email: z
                .string()
                .min(1, t('validation.required', { attribute: 'email' }))
                .email(t('validation.email', { attribute: 'email' })),
            password: z
                .string()
                .min(8, t('validation.min.string', { attribute: 'password', min: 8 })),
            password_confirmation: z
                .string()
                .min(1, t('validation.required', { attribute: 'password confirmation' })),
            role: z.string().nullish(), // Make role nullable
            school_id: z.number().nullish(), // nullish allows both null and undefined
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: t('validation.confirmed', { attribute: 'password' }),
            path: ['password_confirmation'],
        })
        .refine((data) => !(data.role === RoleEnum.TEACHER && !data.school_id), {
            message: t('validation.required_if', {
                attribute: 'school',
                other: 'role',
                value: RoleEnum.TEACHER,
            }),
            path: ['school_id'],
        })
        .refine((data) => !(data.role === RoleEnum.STUDENT && !data.school_id), {
            message: t('validation.required_if', {
                attribute: 'school',
                other: 'role',
                value: RoleEnum.STUDENT,
            }),
            path: ['school_id'],
        });

    // Setup form with react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: null, // Default to null instead of empty string
            school_id: null,
        },
    });

    // Watch role to show/hide school selector
    const selectedRole = form.watch('role');
    const showSchoolSelector =
        selectedRole === RoleEnum.TEACHER || selectedRole === RoleEnum.STUDENT;

    // Reset school_id when role changes to something other than Teacher or Student
    useEffect(() => {
        if (selectedRole !== RoleEnum.TEACHER && selectedRole !== RoleEnum.STUDENT) {
            form.setValue('school_id', null);
        }
    }, [selectedRole, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            registerMutation.mutateAsync({
                data: values,
            }),
            {
                loading: t('pages.auth.register.messages.pending'),
                success: () => {
                    router.visit(route(`${ROUTES.DASHBOARD}.index`));
                    return t('pages.auth.register.messages.success');
                },
                error: (error) => {
                    // Handle specific validation errors
                    if (error.response?.data?.errors) {
                        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
                            if (key in form.formState.errors) {
                                form.setError(key as any, {
                                    type: 'manual',
                                    message: Array.isArray(messages) ? messages[0] : messages,
                                });
                            }
                        });
                    }
                    return t('pages.auth.register.messages.error');
                },
            },
        );
    };

    const fetchSchools = async (filters: ServiceFilterOptions) => {
        const response = await schoolServiceHook.getAll({
            filters: {
                ...filters,
            },
        });
        return response.data;
    };

    const roles = Object.entries(RoleEnum).filter(
        // Filter out admin roles - only allow Teacher and Student registration
        ([_, value]) => value === RoleEnum.TEACHER || value === RoleEnum.STUDENT,
    );

    return (
        <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/20 via-tertiary/20 to-primary/10 dark:from-primary/10 dark:via-tertiary/10 dark:to-primary/5'>
            <Head title={t('pages.auth.register.title')} />

            {/* Dark Mode Toggle & Theme Selector - Top Right */}
            <div className='absolute right-6 top-6 z-20 flex items-center gap-3'>
                <AuthThemeSelector />
                <button
                    title={
                        isDarkMode
                            ? t('pages.auth.register.ui.switch_to_light')
                            : t('pages.auth.register.ui.switch_to_dark')
                    }
                    onClick={toggleDarkMode}
                    className='group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/20'
                >
                    <div className='relative overflow-hidden'>
                        <Sun
                            className={`h-5 w-5 text-amber-500 transition-all duration-500 ${
                                isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                            }`}
                        />
                        <Moon
                            className={`absolute inset-0 h-5 w-5 text-foreground transition-all duration-500 ${
                                isDarkMode ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                            }`}
                        />
                    </div>
                    <span className='sr-only'>{t('pages.auth.register.ui.toggle_dark_mode')}</span>
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
            <div className='absolute right-1/4 top-1/3'>
                <Ripple numCircles={5} mainCircleSize={350} />
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
                                text={t('pages.auth.register.hero_title')}
                                sparklesCount={12}
                                colors={{
                                    first: 'hsl(var(--tertiary))',
                                    second: 'hsl(var(--quaternary))',
                                }}
                                className='bg-gradient-to-r from-info via-tertiary to-quaternary bg-clip-text text-5xl font-bold text-transparent'
                            />

                            <MemoizedTextAnimate
                                once
                                className='text-xl leading-relaxed text-foreground'
                                by='word'
                                animation='fadeIn'
                            >
                                {t('pages.auth.register.subtitle')}
                            </MemoizedTextAnimate>

                            <MemoizedTextAnimate
                                once
                                delay={0.5}
                                className='text-lg text-foreground/80'
                                by='character'
                                animation='slideUp'
                            >
                                {t('pages.auth.register.description')}
                            </MemoizedTextAnimate>
                        </div>

                        {/* Feature Highlights */}
                        <div className='space-y-4'>
                            <motion.div
                                transition={{ delay: 1, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-foreground'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Brain className='h-6 w-6 text-tertiary' />
                                <span>
                                    {t('pages.auth.register.features.intelligent_assessment')}
                                </span>
                            </motion.div>

                            <motion.div
                                transition={{ delay: 1.2, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-foreground'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GraduationCap className='h-6 w-6 text-info' />
                                <span>{t('pages.auth.register.features.progress_tracking')}</span>
                            </motion.div>

                            <motion.div
                                transition={{ delay: 1.4, duration: 0.6 }}
                                initial={{ opacity: 0, y: 20 }}
                                className='flex items-center gap-3 text-foreground'
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <BookOpen className='h-6 w-6 text-pink-400' />
                                <span>
                                    {t('pages.auth.register.features.comprehensive_materials')}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side - Register Form */}
                    <motion.div
                        transition={{ duration: 0.8, delay: 0.2 }}
                        initial={{ opacity: 0, x: 50 }}
                        className='mx-auto w-full max-w-md'
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <NeonGradientCard
                            neonColors={{
                                firstColor: 'hsl(var(--tertiary))',
                                secondColor: 'hsl(var(--quaternary))',
                            }}
                            className='light:bg-white/90 bg-white/10 backdrop-blur-xl dark:bg-white/10'
                            borderSize={2}
                            borderRadius={20}
                        >
                            <div className='space-y-6 p-8'>
                                {/* Header */}
                                <div className='space-y-4 text-center'>
                                    <AnimatedGradientText className='text-foreground'>
                                        {t('pages.auth.register.ui.get_started')}
                                    </AnimatedGradientText>

                                    <div className='space-y-2'>
                                        <h1 className='light:text-slate-800 text-2xl font-bold text-foreground'>
                                            {t('pages.auth.register.title')}
                                        </h1>
                                        <p className='light:text-slate-600 text-sm text-foreground/50'>
                                            {t('pages.auth.register.ui.create_account_subtitle')}
                                        </p>
                                    </div>
                                </div>

                                {/* Register Form */}
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(handleSubmit)}
                                        className='space-y-4'
                                    >
                                        {/* Name Field */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                        <User className='h-4 w-4' />
                                                        {t('pages.auth.register.fields.name')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder={t(
                                                                'pages.auth.register.placeholders.name',
                                                            )}
                                                            className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-tertiary'
                                                            autoFocus
                                                            autoComplete='name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='name'
                                            control={form.control}
                                        />

                                        {/* Email Field */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                        <Mail className='h-4 w-4' />
                                                        {t('pages.auth.register.fields.email')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type='email'
                                                            placeholder={t(
                                                                'pages.auth.register.placeholders.email',
                                                            )}
                                                            className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-tertiary'
                                                            autoComplete='username'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='email'
                                            control={form.control}
                                        />

                                        {/* Role Field */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                        <Users className='h-4 w-4' />
                                                        {t('pages.auth.register.fields.role')}
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value || ''} // Handle null value
                                                        onValueChange={(value) => {
                                                            // If the special "reset" value is selected
                                                            if (value === 'reset') {
                                                                field.onChange(null); // Set to null instead of empty string
                                                                form.setValue('school_id', null);
                                                                return;
                                                            }
                                                            field.onChange(value || null); // Convert empty string to null if needed
                                                        }}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className='border-foreground/50 text-foreground transition-colors focus:border-tertiary'>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.auth.register.fields.select_role',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {field.value && (
                                                                    <SelectItem
                                                                        value='reset'
                                                                        className='font-medium text-destructive'
                                                                    >
                                                                        {t(
                                                                            'pages.auth.register.fields.reset_role',
                                                                        )}
                                                                    </SelectItem>
                                                                )}
                                                                {roles.map(([key, value]) => (
                                                                    <SelectItem
                                                                        value={value}
                                                                        key={key}
                                                                    >
                                                                        {value}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='role'
                                            control={form.control}
                                        />

                                        {/* School Selector - Conditionally Rendered */}
                                        {showSchoolSelector && (
                                            <motion.div
                                                transition={{ duration: 0.3 }}
                                                initial={{ opacity: 0, height: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                            >
                                                <FormField
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                                <School className='h-4 w-4' />
                                                                {t(
                                                                    'pages.auth.register.fields.school',
                                                                )}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className='[&_button:focus]:border-tertiary [&_button]:border-foreground/50 [&_button]:text-foreground [&_button]:transition-colors'>
                                                                    <GenericDataSelector<SchoolResource>
                                                                        setSelectedData={(id) =>
                                                                            field.onChange(id)
                                                                        }
                                                                        selectedDataId={field.value}
                                                                        renderItem={(item) =>
                                                                            item?.name ?? ''
                                                                        }
                                                                        placeholder={t(
                                                                            'pages.auth.register.fields.select_school',
                                                                        )}
                                                                        fetchData={fetchSchools}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className='text-red-300' />
                                                        </FormItem>
                                                    )}
                                                    name='school_id'
                                                    control={form.control}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Password Field */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                        <Lock className='h-4 w-4' />
                                                        {t('pages.auth.register.fields.password')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type='password'
                                                            placeholder={t(
                                                                'pages.auth.register.placeholders.password',
                                                            )}
                                                            className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-tertiary'
                                                            autoComplete='new-password'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='password'
                                            control={form.control}
                                        />

                                        {/* Password Confirmation Field */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-foreground/50'>
                                                        <Lock className='h-4 w-4' />
                                                        {t(
                                                            'pages.auth.register.fields.password_confirmation',
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type='password'
                                                            placeholder={t(
                                                                'pages.auth.register.placeholders.password_confirmation',
                                                            )}
                                                            className='border-foreground/50 text-foreground transition-colors placeholder:text-foreground/50 focus:border-tertiary'
                                                            autoComplete='new-password'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-red-300' />
                                                </FormItem>
                                            )}
                                            name='password_confirmation'
                                            control={form.control}
                                        />

                                        {/* Form Actions */}
                                        <div className='flex items-center justify-between pt-4'>
                                            <Link
                                                href={route(ROUTES.LOGIN)}
                                                className='text-sm text-foreground/50 transition-colors hover:text-foreground'
                                            >
                                                {t('pages.auth.register.fields.already_registered')}
                                            </Link>

                                            <Button
                                                type='submit'
                                                loading={registerMutation.isPending}
                                                disabled={registerMutation.isPending}
                                                className='bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-white hover:from-purple-700 hover:to-blue-700'
                                            >
                                                <UserPlus className='mr-2 h-4 w-4' />
                                                {t('pages.auth.register.buttons.register')}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </NeonGradientCard>
                    </motion.div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className='absolute left-20 top-20 hidden xl:block'>
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
                    <Sparkles className='h-8 w-8 text-info opacity-60' />
                </motion.div>
            </div>

            <div className='absolute bottom-20 right-20 hidden xl:block'>
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
                    <GraduationCap className='h-6 w-6 text-tertiary opacity-40' />
                </motion.div>
            </div>
        </div>
    );
}
