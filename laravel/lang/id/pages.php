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
    'student_questions' => [
        'workspace' => [
            'question' => 'Pertanyaan',
            'time' => 'Waktu',
            'time_spent' => 'Waktu Dihabiskan',
            'view_image' => 'Gambar Pertanyaan',
            'clue' => 'Petunjuk',
            'test_cases' => 'Test Case',
            'code' => 'Kode',
            'output' => 'Output',
            'run' => 'Jalankan Kode',
            'running' => 'Berjalan',
            'next' => 'Pertanyaan Selanjutnya',
            'previous' => 'Pertanyaan Sebelumnya',
            'run_first' => 'Anda harus menjalankan kode setidaknya sekali untuk melanjutkan',
            'completed' => 'Selesai',
            'no_output_yet' => 'Belum ada output. Jalankan kode Anda untuk melihat hasil.',
            'test_results' => 'Hasil Test',
            'passed' => ' lulus',
            'success' => [
                'title' => 'Selamat!',
                'description' => 'Semua test berhasil dijalankan.',
            ],
            'error' => [
                'title' => 'Error Menjalankan Kode',
                'description' => 'Terjadi masalah saat menjalankan kode Anda. Silakan periksa error.',
            ],
            'view_material' => 'Lihat Materi',
            'side_by_side_view' => 'Tampilan Berdampingan',
            'stacked_view' => 'Tampilan Bertumpuk',
            'locked' => [
                'title' => 'Workspace Terkunci',
                'description' => 'Workspace Anda telah dikunci karena Anda menyelesaikan semua pertanyaan dalam materi ini. Anda dapat mencoba lagi setelah periode unlock atau menunggu persetujuan guru.',
                'cannot_run' => 'Tidak dapat menjalankan kode saat workspace terkunci',
                'button' => 'Terkunci',
                'notification' => 'Workspace telah dikunci karena penyelesaian semua pertanyaan',
                'unlock_in' => 'Terbuka dalam',
                'unlock_now' => 'Tersedia untuk dibuka',
                'reattempt' => 'Coba Lagi',
                'answer_locked' => 'Jawaban terkunci. Tidak dapat menjalankan kode.',
                'answer_locked_button' => 'Jawaban Terkunci',
            ],
            'reattempt' => [
                'success' => 'Berhasil mereset workspace! Anda bisa mencoba lagi.',
                'error' => 'Gagal mereset workspace. Silakan coba lagi.',
            ],
            'mark_as_done' => [
                'button' => 'Tandai Selesai',
                'success' => 'Pertanyaan berhasil ditandai selesai!',
                'error' => 'Gagal menandai pertanyaan selesai. Silakan coba lagi.',
                'dialog' => [
                    'title' => 'Tandai Pertanyaan Selesai',
                    'description' => 'Apakah Anda yakin ingin menandai pertanyaan ini selesai? Setelah ditandai, Anda tidak dapat mengubah kode kecuali mengizinkan percobaan ulang.',
                    'warning_title' => 'Pemberitahuan Penting',
                    'warning_description' => 'Menandai selesai akan memfinalisasi solusi Anda saat ini. Anda dapat mengizinkan percobaan ulang nanti jika diperlukan.',
                    'cancel' => 'Batal',
                    'continue' => 'Lanjutkan Tanpa Menandai',
                    'mark_done' => 'Tandai Selesai',
                ],
            ],
            'allow_reattempt' => [
                'button' => 'Coba Lagi',
                'success' => 'Percobaan ulang berhasil diizinkan! Halaman akan di-refresh.',
                'error' => 'Gagal mengizinkan percobaan ulang. Silakan coba lagi.',
            ],
            'allow_reattempt_all' => [
                'button' => 'Coba Lagi Semua Soal',
                'success' => 'Percobaan ulang untuk semua soal berhasil diizinkan! Halaman akan di-refresh.',
                'error' => 'Gagal mengizinkan percobaan ulang untuk semua soal. Silakan coba lagi.',
                'dialog' => [
                    'title' => 'Coba Lagi Semua Soal',
                    'description' => 'Apakah Anda yakin ingin mereset semua soal dalam materi ini untuk dicoba lagi? Ini akan menandai semua soal yang telah selesai menjadi belum selesai.',
                    'warning_title' => 'Pemberitahuan Penting',
                    'warning_description' => 'Tindakan ini akan mereset status penyelesaian semua soal dalam materi ini.',
                    'cancel' => 'Batal',
                    'confirm' => 'Coba Lagi Semua',
                ],
            ],
        ],
    ],
];
