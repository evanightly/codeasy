import { buttonVariants } from '@/Components/UI/button';
import WordRotate from '@/Components/UI/word-rotate';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <header className="w-full bg-white shadow-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-shrink-0 items-center space-x-2">
                        {/* <img
                            className="h-8 w-auto"
                            src="https://via.placeholder.com/40"
                            alt="Logo"
                        /> */}
                        <span className="text-xl font-bold text-blue-600">
                            Codeasy
                        </span>
                    </div>
                    <nav className="hidden space-x-6 md:block">
                        <Link
                            href={route('login')}
                            className="text-gray-700 hover:text-blue-600"
                        >
                            Login
                        </Link>
                        <Link
                            href={route('register')}
                            className={buttonVariants({
                                className: '!bg-blue-600 text-white',
                            })}
                        >
                            Register
                        </Link>
                    </nav>
                    <button
                        className="inline-block text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:hidden"
                        aria-label="Toggle Navigation"
                    >
                        <svg
                            className="h-6 w-6 fill-current"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4 5h16M4 12h16M4 19h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
                    <div className="md:flex md:items-center md:space-x-8">
                        <div className="md:w-1/2">
                            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
                                Sistem Pembelajaran
                                <WordRotate
                                    className="text-yellow-300"
                                    words={[
                                        'Data Science',
                                        'Data Analytics',
                                        'Business Intelligence',
                                    ]}
                                />{' '}
                                Berbasis Python
                            </h1>
                            <p className="mb-6 text-lg text-white/90 md:text-xl">
                                Tingkatkan pemahaman Anda dalam pemrograman
                                Python untuk Data Science. Dilengkapi
                                autograding &amp; analisis otomatis berbasis
                                Taxonomy Bloom!
                            </p>
                            <div className='flex justify-center sm:justify-normal gap-4 items-center flex-col sm:flex-row'>
                                <a
                                    href="#"
                                    className="inline-block rounded-md bg-yellow-300 px-5 py-3 font-semibold text-gray-800 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-200"
                                >
                                    Mulai Sekarang
                                </a>
                                <Link 
                                    href={route('sandbox.index')}
                                >
                                    Atau Coba Sandbox Dulu
                                </Link>
                            </div>
                        </div>
                        {/* <div className="mt-8 flex justify-center md:mt-0 md:w-1/2">
                            <img
                                className="w-3/4 max-w-sm md:w-full"
                                src="https://via.placeholder.com/450x350"
                                alt="Hero Image"
                            />
                        </div> */}
                    </div>
                </div>
            </section>

            <section className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-8 text-3xl font-bold text-gray-800">
                        Kenapa <span className="text-blue-600">Codeasy</span>?
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow transition hover:shadow-md">
                            <div className="mb-4 text-blue-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M4 7h16M4 12h8m-8 5h16"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Autograding Realtime
                            </h3>
                            <p className="text-gray-600">
                                Dapatkan umpan balik instan ketika Anda
                                menuliskan kode Python untuk Data Science.
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow transition hover:shadow-md">
                            <div className="mb-4 text-blue-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.949L9 1m6 0l4.447 2.224A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.949L15 20M9 1v19m6-19v19"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Analisis Pemahaman Siswa
                            </h3>
                            <p className="text-gray-600">
                                Klasifikasi otomatis berdasarkan Taksonomi Bloom
                                untuk mengukur tingkat kognitif Anda.
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow transition hover:shadow-md">
                            <div className="mb-4 text-blue-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M5 3l14 9-14 9V3z"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Kurikulum Berbasis SKKNI
                            </h3>
                            <p className="text-gray-600">
                                Materi dan modul disusun sesuai Standar
                                Kompetensi Kerja Nasional Indonesia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-blue-50 py-12">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-blue-600">
                        Siap Menjadi Data Scientist Handal?
                    </h2>
                    <p className="mb-8 text-lg text-gray-700">
                        Bergabunglah dengan ratusan siswa lain yang telah
                        merasakan kemudahan belajar Python untuk Data Science
                        menggunakan platform <strong>Codeasy</strong>.
                    </p>
                    <a
                        href="#"
                        className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        Daftar Sekarang
                    </a>
                </div>
            </section>

            <footer className="bg-gray-900 py-8 text-gray-300">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:px-6 md:flex-row lg:px-8">
                    <p className="mb-4 md:mb-0">
                        &copy; 2025 Codeasy. All rights reserved.
                    </p>
                    <div className="space-x-4">
                        <a href="#" className="hover:text-white">
                            Kebijakan Privasi
                        </a>
                        <a href="#" className="hover:text-white">
                            Syarat &amp; Ketentuan
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
