import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormEventHandler, useEffect, useState } from 'react';

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

  // Tambahkan state untuk deteksi user mengetik manual
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
    post(route('login'), {
      onFinish: () => {
        reset('password');
        setAutoSubmitted(false);
        setTypedManually(false);
      },
    });
  };

  const handleSubmitPassword: FormEventHandler = (e) => {
    e.preventDefault();
    signIn();
  };

  // Auto sign in jika password di-autofill
  useEffect(() => {
    if (
      step === 'passwordStep' &&
      data.password &&
      !autoSubmitted &&
      !processing &&
      !typedManually
    ) {
      // Pastikan hanya auto-submit jika user belum mengetik manual
      setAutoSubmitted(true);
      signIn();
    }
  }, [step, data.password, autoSubmitted, typedManually, processing]);

  return (
    <GuestLayout>
      <Head title="Log in" />

      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">
          {status}
        </div>
      )}

      <div className="relative mx-auto mt-8 w-full max-w-md rounded bg-white p-4 shadow">
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
                className={`
                  transition-all duration-300
                  ${step === 'emailStep'
                    ? 'opacity-100 h-auto'
                    : 'opacity-0 h-0 pointer-events-none'
                  }
                `}
              >
                <form onSubmit={handleNextEmail}>
                  <div>
                    <InputLabel htmlFor="email" value="Email / Username" />
                    <TextInput
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="username"
                      value={data.email}
                      autoFocus
                      className="mt-1 block w-full"
                      onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <PrimaryButton disabled={processing}>Next</PrimaryButton>
                  </div>
                </form>
              </div>

              {/* Field password */}
              <div
                className={`
                  transition-all duration-300
                  ${step === 'passwordStep'
                    ? 'opacity-100 mt-4 h-auto'
                    : 'opacity-0 h-0 pointer-events-none'
                  }
                `}
              >
                <form onSubmit={handleSubmitPassword}>
                  <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={data.password}
                      className="mt-1 block w-full"
                      onChange={(e) => {
                        setData('password', e.target.value);
                      }}
                      // Jika user menekan keyboard di password field
                      onKeyDown={() => setTypedManually(true)}
                    />
                    <InputError
                      message={errors.password}
                      className="mt-2"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked as any)}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Remember me
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="space-x-4 text-sm">
                      {canResetPassword && (
                        <Link
                          href={route('password.request')}
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
                    <PrimaryButton disabled={processing}>
                      Sign In
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GuestLayout>
  );
}
