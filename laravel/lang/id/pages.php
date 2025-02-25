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
];
