<?php

return [
    'login' => [
        'title' => 'Selamat Datang Kembali!',
        'fields' => [
            'identifier' => 'Email atau ID Karyawan',
            'password' => 'Kata Sandi',
            'remember' => 'Ingat Saya',
        ],
        'buttons' => [
            'forgot_password' => 'Lupa Kata Sandi?',
            'sign_in' => 'Masuk',
        ],
    ],
    'user' => [
        'common' => [
            'fields' => [
                'name' => 'Nama',
                'email' => 'Email',
                'username' => 'Nama Pengguna',
                'password' => 'Kata Sandi',
                'password_confirmation' => 'Konfirmasi Kata Sandi',
                'roles' => 'Peran',
                'avatar' => 'Avatar',
            ],
            'placeholders' => [
                'name' => 'Masukkan Nama',
                'email' => 'Masukkan Email',
                'username' => 'Masukkan Nama Pengguna',
                'password' => 'Masukkan Kata Sandi',
                'password_confirmation' => 'Konfirmasi Kata Sandi',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Nama wajib diisi',
                    'min' => 'Nama minimal :min karakter',
                ],
                'email' => [
                    'required' => 'Email wajib diisi',
                    'invalid' => 'Email tidak valid',
                ],
                'username' => [
                    'required' => 'Nama pengguna wajib diisi',
                ],
                'password' => [
                    'required' => 'Kata sandi wajib diisi',
                    'min' => 'Kata sandi minimal :min karakter',
                ],
                'password_confirmation' => [
                    'match' => 'Konfirmasi kata sandi tidak cocok',
                ],
            ],
            'messages' => [
                'not_found' => 'Pengguna tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat pengguna...',
                    'update' => 'Memperbarui pengguna...',
                    'delete' => 'Menghapus pengguna...',
                ],
                'success' => [
                    'create' => 'Pengguna berhasil dibuat',
                    'update' => 'Pengguna berhasil diperbarui',
                    'delete' => 'Pengguna berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Gagal membuat pengguna',
                    'update' => 'Gagal memperbarui pengguna',
                    'delete' => 'Gagal menghapus pengguna',
                ],
            ],
        ],
        'index' => [
            'title' => 'Pengguna',
            'actions' => [
                'create' => 'Buat Pengguna',
                'edit' => 'Edit Pengguna',
                'delete' => 'Hapus Pengguna',
            ],
            'columns' => [
                'name' => 'Nama',
                'username' => 'Nama Pengguna',
                'email' => 'Email',
                'roles' => 'Peran',
                'actions' => 'Aksi',
            ],
        ],
        'create' => [
            'title' => 'Buat Pengguna',
            'buttons' => [
                'create' => 'Buat',
            ],
        ],
        'edit' => [
            'title' => 'Edit Pengguna: :name',
            'fields' => [
                'password' => 'Kata Sandi Baru (opsional)',
                'roles' => 'Peran',
            ],
            'buttons' => [
                'update' => 'Perbarui',
            ],
        ],
        'filters' => [
            'roles' => [
                'title' => 'Peran',
                'options' => [
                    'teacher' => 'Guru',
                    'student' => 'Siswa',
                    'school_admin' => 'Admin Sekolah',
                    'super_admin' => 'Super Admin',
                ],
            ],
        ],
    ],
    'student_course_cognitive_classification' => [
        'index' => [
            'title' => 'Klasifikasi Kognitif Siswa per Kursus',
        ],
        'show' => [
            'title' => 'Detail Klasifikasi Kognitif',
        ],
        'sections' => [
            'classifications' => 'Klasifikasi Kognitif Kursus',
            'classification_info' => 'Informasi Klasifikasi',
            'material_classifications' => 'Klasifikasi Materi',
            'details' => 'Detail Klasifikasi',
        ],
        'descriptions' => [
            'classifications' => 'Lihat dan kelola klasifikasi kognitif siswa berdasarkan kursus',
            'classification_info' => 'Informasi dasar tentang klasifikasi',
            'material_classifications' => 'Hasil klasifikasi untuk materi pembelajaran individual',
        ],
        'fields' => [
            'student' => 'Siswa',
            'course' => 'Kursus',
            'classification_type' => 'Metode Klasifikasi',
            'classification_level' => 'Tingkat Kognitif',
            'classification_score' => 'Skor',
            'classified_at' => 'Tanggal Klasifikasi',
            'recommendations' => 'Rekomendasi',
        ],
        'columns' => [
            'student' => 'Siswa',
            'course' => 'Kursus',
            'classification_type' => 'Metode',
            'classification_level' => 'Tingkat',
            'classification_score' => 'Skor',
            'classified_at' => 'Tanggal',
            'material' => 'Materi',
            'actions' => 'Aksi',
        ],
        'buttons' => [
            'export_excel' => 'Ekspor ke Excel',
            'view_report' => 'Lihat Laporan',
            'generate_report' => 'Buat Laporan',
            'back' => 'Kembali ke Daftar',
        ],
        'placeholders' => [
            'select_course' => 'Pilih kursus',
            'select_classification_type' => 'Pilih metode klasifikasi',
        ],
        'dialogs' => [
            'report' => [
                'title' => 'Buat Laporan Kursus',
                'description' => 'Pilih kursus untuk melihat laporan klasifikasi kognitif',
            ],
            'delete' => [
                'title' => 'Hapus Klasifikasi',
                'description' => 'Apakah Anda yakin ingin menghapus klasifikasi ini? Tindakan ini tidak dapat dibatalkan.',
            ],
        ],
        'messages' => [
            'no_material_classifications' => 'Tidak ada klasifikasi materi yang ditemukan untuk kursus ini',
            'no_course_classifications' => 'Tidak ada klasifikasi kursus yang ditemukan',
            'deleting' => 'Menghapus klasifikasi...',
            'delete_success' => 'Klasifikasi berhasil dihapus',
            'delete_error' => 'Gagal menghapus klasifikasi',
        ],
    ],
];
