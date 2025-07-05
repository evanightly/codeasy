<?php

return [
    'common' => [
        'columns' => [
            'created_at' => 'Dibuat Pada',
            'updated_at' => 'Diperbarui Pada',
            'timestamps' => 'Informasi Waktu',
        ],
    ],
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
    'auth' => [
        'login' => [
            'title' => 'Selamat Datang Kembali',
            'subtitle' => 'Kuasai Data Science dengan Platform Pembelajaran bertenaga AI',
            'description' => 'Rasakan pembelajaran yang dipersonalisasi dengan Taksonomi Bloom',
            'hero_title' => 'Codeasy',
            'fields' => [
                'identifier' => 'Email atau Nama Pengguna',
                'password' => 'Kata Sandi',
                'remember' => 'Ingat saya',
            ],
            'buttons' => [
                'next' => 'Selanjutnya',
                'back' => 'Kembali',
                'sign_in' => 'Masuk',
                'sign_up' => 'Daftar',
                'forgot_password' => 'Lupa kata sandi?',
                'dont_have_account' => 'Belum punya akun?',
            ],
            'messages' => [
                'authenticating' => 'Mengautentikasi...',
                'success' => 'Berhasil masuk!',
                'error' => 'Kredensial tidak valid',
            ],
            'features' => [
                'ai_assessment' => 'Penilaian Kognitif bertenaga AI',
                'personalized_learning' => 'Jalur Pembelajaran Adaptif',
                'real_world_projects' => 'Pengalaman Proyek Dunia Nyata',
            ],
            'placeholders' => [
                'identifier' => 'Masukkan email atau nama pengguna Anda',
                'password' => 'Masukkan kata sandi Anda',
            ],
            'ui' => [
                'welcome_back_header' => 'Selamat Datang Kembali',
                'continue_journey' => 'Lanjutkan perjalanan belajar Anda',
                'verifying_credentials' => 'Mohon tunggu sementara kami memverifikasi kredensial Anda...',
                'toggle_dark_mode' => 'Alihkan mode gelap',
                'switch_to_light' => 'Beralih ke Mode Terang',
                'switch_to_dark' => 'Beralih ke Mode Gelap',
            ],
        ],
        'register' => [
            'title' => 'Buat Akun',
            'subtitle' => 'Mulai perjalanan Data Science Anda dengan pembelajaran yang dipersonalisasi',
            'description' => 'Buat akun Anda dan buka kekuatan pendidikan bertenaga AI',
            'hero_title' => 'Bergabung dengan Codeasy',
            'fields' => [
                'name' => 'Nama',
                'email' => 'Email',
                'role' => 'Peran',
                'school' => 'Sekolah',
                'password' => 'Kata Sandi',
                'password_confirmation' => 'Konfirmasi Kata Sandi',
                'already_registered' => 'Sudah terdaftar?',
                'select_role' => 'Pilih peran',
                'select_school' => 'Pilih sekolah',
                'reset_role' => 'Hapus pilihan',
            ],
            'buttons' => [
                'register' => 'Daftar',
            ],
            'messages' => [
                'pending' => 'Membuat akun Anda...',
                'success' => 'Akun berhasil dibuat!',
                'error' => 'Terjadi masalah saat membuat akun Anda',
            ],
            'features' => [
                'intelligent_assessment' => 'Penilaian Cerdas & Umpan Balik',
                'progress_tracking' => 'Pelacakan Kemajuan & Analitik',
                'comprehensive_materials' => 'Materi Pembelajaran Komprehensif',
            ],
            'placeholders' => [
                'name' => 'Masukkan nama lengkap Anda',
                'email' => 'Masukkan alamat email Anda',
                'password' => 'Buat kata sandi yang kuat',
                'password_confirmation' => 'Konfirmasi kata sandi Anda',
            ],
            'ui' => [
                'get_started' => 'Mulai',
                'create_account_subtitle' => 'Buat akun Anda untuk mulai belajar',
                'toggle_dark_mode' => 'Alihkan mode gelap',
                'switch_to_light' => 'Beralih ke Mode Terang',
                'switch_to_dark' => 'Beralih ke Mode Gelap',
            ],
        ],
        'verify_email' => [
            'resend_button' => 'Kirim Ulang Email Verifikasi',
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
                'profile_image' => 'Foto Profil',
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
                    'create' => 'Error membuat pengguna',
                    'update' => 'Error memperbarui pengguna',
                    'delete' => 'Error menghapus pengguna',
                ],
            ],
        ],
        'index' => [
            'title' => 'Pengguna',
            'actions' => [
                'create' => 'Buat Pengguna',
                'edit' => 'Edit Pengguna',
                'delete' => 'Hapus Pengguna',
                'import_students' => 'Impor Siswa',
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
            'fields' => [
                'password' => 'Kata Sandi',
                'avatar_help' => 'Seret file ke sini atau klik untuk mengunggah',
            ],
            'buttons' => [
                'create' => 'Buat Pengguna',
            ],
        ],
        'edit' => [
            'title' => 'Edit Pengguna: :name',
            'fields' => [
                'password' => 'Kata Sandi Baru (opsional)',
                'roles' => 'Peran',
            ],
            'buttons' => [
                'update' => 'Perbarui Pengguna',
            ],
        ],
        'show' => [
            'title' => 'Detail Pengguna: :name',
            'no_username' => 'Tidak ada nama pengguna',
            'no_roles' => 'Tidak ada peran yang ditetapkan untuk pengguna ini',
            'sections' => [
                'information' => 'Informasi',
                'contact_information' => 'Informasi Kontak',
                'roles' => 'Peran',
                'timestamps' => 'Informasi Waktu',
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
        'import' => [
            'upload_title' => 'File untuk pengunggahan siswa',
            'title' => 'Impor Siswa',
            'description' => 'Unggah file CSV atau Excel untuk mengimpor siswa secara massal. Pastikan file Anda memiliki format yang diperlukan.',
            'download_excel_template' => 'Unduh Template Excel',
            'download_csv_template' => 'Unduh Template CSV',
            'template_description' => 'Unduh file template untuk melihat format yang diperlukan untuk impor siswa.',
            'buttons' => [
                'cancel' => 'Batal',
                'preview' => 'Pratinjau',
                'confirm_import' => 'Konfirmasi Impor',
            ],
            'previewing' => 'Memindai file untuk pratinjau...',
            'preview_error' => 'Terjadi kesalahan saat membuat pratinjau file. Periksa format dan coba lagi.',
            'preview_success' => 'Pratinjau file berhasil. Periksa data di bawah ini sebelum impor.',
            'import_error' => 'Terjadi kesalahan saat mengimpor file. Periksa format dan coba lagi.',
            'import_success' => 'File berhasil diimpor.',
            'importing' => 'Mengimpor siswa, harap tunggu...',
            'preview' => [
                'title' => 'Pratinjau Siswa yang Diimpor',
                'description' => 'Periksa data sebelum impor. Pastikan semua informasi benar.',
                'stats' => 'Statistik Pratinjau',
                'students_list' => 'Daftar Siswa',
                'student_count' => 'Jumlah Siswa: :count',
            ],
        ],
    ],
    'permission' => [
        'edit' => [
            'title' => 'Edit Permission',
        ],
        'common' => [
            'fields' => [
                'name' => 'Nama Permission',
                'group' => 'Grup',
            ],
            'placeholders' => [
                'name' => 'contoh: users-create, roles-read',
            ],
            'help_texts' => [
                'name_format' => 'Nama permission harus dalam format: resource-action',
                'valid_actions' => 'Aksi yang valid: :actions',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Permission name is required',
                    'format' => 'Invalid permission format. Must be: resource-action where action is one of: :actions',
                ],
            ],
            'messages' => [
                'not_found' => 'Permission not found',
                'pending' => [
                    'create' => 'Creating permission...',
                    'update' => 'Updating permission...',
                    'delete' => 'Deleting permission...',
                ],
                'success' => [
                    'create' => 'Permission created successfully',
                    'update' => 'Permission updated successfully',
                    'delete' => 'Permission deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating permission',
                    'update' => 'Error updating permission',
                    'delete' => 'Error deleting permission',
                ],
            ],
        ],
        'index' => [
            'title' => 'Permissions',
            'actions' => [
                'create' => 'Create Permission',
                'edit' => 'Edit Permission',
                'delete' => 'Delete Permission',
            ],
            'columns' => [
                'name' => 'Name',
                'group' => 'Group',
                'actions' => 'Actions',
            ],
        ],
        'create' => [
            'title' => 'Create Permission',
            'buttons' => [
                'create' => 'Create Permission',
            ],
        ],
        'edit' => [
            'title' => 'Edit Permission: :name',
            'buttons' => [
                'update' => 'Update Permission',
            ],
        ],
        'show' => [
            'title' => 'Detail Permission: :name',
            'no_roles' => 'Tidak ada peran yang ditetapkan untuk permission ini',
            'fields' => [
                'guard_name' => 'Nama Guard',
                'action' => 'Aksi',
            ],
            'sections' => [
                'information' => 'Informasi',
                'roles' => 'Peran Terkait',
                'timestamps' => 'Informasi Waktu',
            ],
        ],
    ],
    'role' => [
        'common' => [
            'fields' => [
                'name' => 'Nama Peran',
                'guard_name' => 'Nama Guard',
                'permissions' => 'Permissions',
            ],
            'placeholders' => [
                'name' => 'Masukkan nama peran',
                'guard_name' => 'web',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Nama peran wajib diisi',
                ],
            ],
            'messages' => [
                'not_found' => 'Peran tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat peran...',
                    'update' => 'Memperbarui peran...',
                    'delete' => 'Menghapus peran...',
                ],
                'success' => [
                    'create' => 'Peran berhasil dibuat',
                    'update' => 'Peran berhasil diperbarui',
                    'delete' => 'Peran berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Error membuat peran',
                    'update' => 'Error memperbarui peran',
                    'delete' => 'Error menghapus peran',
                ],
            ],
        ],
        'index' => [
            'title' => 'Peran',
            'actions' => [
                'create' => 'Buat Peran',
                'edit' => 'Edit Peran',
                'delete' => 'Hapus Peran',
            ],
            'columns' => [
                'name' => 'Nama',
                'guard_name' => 'Guard',
                'users' => 'Pengguna',
                'actions' => 'Aksi',
            ],
        ],
        'create' => [
            'title' => 'Buat Peran',
            'buttons' => [
                'create' => 'Buat Peran',
            ],
        ],
        'edit' => [
            'title' => 'Edit Peran: :name',
            'buttons' => [
                'update' => 'Perbarui Peran',
            ],
        ],
        'show' => [
            'title' => 'Detail Peran: :name',
            'no_permissions' => 'Tidak ada permission yang ditetapkan untuk peran ini',
            'no_users' => 'Tidak ada pengguna yang ditetapkan untuk peran ini',
            'sections' => [
                'information' => 'Informasi',
                'permissions' => 'Permissions',
                'users' => 'Pengguna',
                'timestamps' => 'Informasi Waktu',
            ],
        ],
    ],
    'school' => [
        'common' => [
            'fields' => [
                'name' => 'Nama Sekolah',
                'address' => 'Alamat',
                'city' => 'Kota',
                'state' => 'Provinsi',
                'zip' => 'Kode Pos',
                'phone' => 'Telepon',
                'email' => 'Email',
                'website' => 'Website',
                'active' => 'Status Aktif',
            ],
            'placeholders' => [
                'name' => 'Masukkan nama sekolah',
                'address' => 'Masukkan alamat sekolah',
                'city' => 'Masukkan kota',
                'state' => 'Masukkan provinsi',
                'zip' => 'Masukkan kode pos',
                'phone' => 'Masukkan nomor telepon',
                'email' => 'Masukkan email sekolah',
                'website' => 'Masukkan website sekolah',
                'select_user' => 'Pilih pengguna',
                'student' => 'Siswa',
                'select_students' => 'Pilih siswa',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Nama sekolah wajib diisi',
                ],
                'address' => [
                    'required' => 'Alamat wajib diisi',
                ],
                'email' => [
                    'invalid' => 'Format email tidak valid',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Membuat sekolah...',
                    'update' => 'Memperbarui sekolah...',
                    'delete' => 'Menghapus sekolah...',
                    'assign_admin' => 'Menetapkan administrator...',
                    'unassign_admin' => 'Menghapus administrator...',
                    'assign_student' => 'Menetapkan siswa...',
                    'unassign_student' => 'Menghapus siswa...',
                    'assign_students' => 'Menetapkan siswa...',
                    'unassign_students' => 'Menghapus siswa...',
                ],
                'success' => [
                    'create' => 'Sekolah berhasil dibuat',
                    'update' => 'Sekolah berhasil diperbarui',
                    'delete' => 'Sekolah berhasil dihapus',
                    'assign_admin' => 'Administrator berhasil ditetapkan',
                    'unassign_admin' => 'Administrator berhasil dihapus',
                    'assign_student' => 'Siswa berhasil ditetapkan',
                    'unassign_student' => 'Siswa berhasil dihapus',
                    'assign_students' => ':count siswa berhasil ditetapkan',
                    'unassign_students' => ':count siswa berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Error membuat sekolah',
                    'update' => 'Error memperbarui sekolah',
                    'delete' => 'Error menghapus sekolah',
                    'assign_admin' => 'Error menetapkan administrator',
                    'unassign_admin' => 'Error menghapus administrator',
                    'assign_student' => 'Error menetapkan siswa',
                    'unassign_student' => 'Error menghapus siswa',
                    'assign_students' => 'Error menetapkan siswa',
                    'unassign_students' => 'Error menghapus siswa',
                ],
            ],
            'sections' => [
                'information' => 'Informasi Sekolah',
                'contact_information' => 'Informasi Kontak',
                'administrators' => 'Administrator',
                'teachers' => 'Guru',
                'students' => 'Siswa',
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
            'empty_states' => [
                'no_administrators' => 'Tidak ada administrator yang ditetapkan',
                'no_teachers' => 'Tidak ada guru yang ditetapkan',
                'no_students' => 'Tidak ada siswa yang terdaftar',
                'no_schools' => 'Tidak ada sekolah yang ditetapkan',
            ],
        ],
        'index' => [
            'title' => 'Sekolah',
            'actions' => [
                'create' => 'Buat Sekolah',
                'show' => 'Tampilkan Detail',
                'edit' => 'Edit Sekolah',
                'delete' => 'Hapus Sekolah',
                'assign_admin' => 'Tetapkan Administrator',
                'assign_student' => 'Tetapkan Siswa',
            ],
            'columns' => [
                'name' => 'Nama',
                'address' => 'Alamat',
                'city' => 'Kota',
                'phone' => 'Telepon',
                'email' => 'Email',
                'actions' => 'Aksi',
            ],
        ],
        'create' => [
            'title' => 'Buat Sekolah',
            'buttons' => [
                'create' => 'Buat Sekolah',
            ],
        ],
        'edit' => [
            'title' => 'Edit Sekolah: :name',
            'buttons' => [
                'update' => 'Perbarui Sekolah',
            ],
        ],
        'show' => [
            'title' => 'Detail Sekolah: :name',
            'buttons' => [
                'back' => 'Kembali ke Sekolah',
            ],
            'dialogs' => [
                'assign_student' => [
                    'title' => 'Tetapkan Siswa',
                    'description' => 'Pilih siswa untuk ditetapkan ke sekolah ini',
                    'buttons' => [
                        'assign' => 'Tetapkan Siswa',
                    ],
                ],
            ],
        ],
        'assign_admin' => [
            'title' => 'Tetapkan Administrator Sekolah',
            'description' => 'Pilih pengguna untuk ditetapkan sebagai administrator sekolah',
            'buttons' => [
                'assign' => 'Tetapkan Administrator',
                'cancel' => 'Batal',
            ],
        ],
        'bulk_actions' => [
            'title' => 'Aksi Massal',
            'selected' => ':count dipilih',
            'buttons' => [
                'assign_selected' => 'Tetapkan yang Dipilih',
            ],
            'placeholders' => [
                'search' => 'Cari pengguna...',
                'no_data' => 'Tidak ada pengguna tersedia',
            ],
            'empty_state' => [
                'title' => 'Tidak ada pengguna ditemukan',
                'description' => 'Coba ubah kriteria pencarian Anda',
            ],
        ],
        'assign_student' => [
            'title' => 'Tetapkan Siswa',
            'description' => 'Pilih siswa untuk ditetapkan ke sekolah ini',
            'buttons' => [
                'assign' => 'Tetapkan Siswa',
            ],
        ],
    ],
    'school_request' => [
        'common' => [
            'fields' => [
                'school' => 'Sekolah',
                'user' => 'Pengguna',
                'message' => 'Pesan',
                'status' => 'Status',
                'created_at' => 'Dibuat Pada',
            ],
            'placeholders' => [
                'school' => 'Pilih sekolah',
                'message' => 'Masukkan pesan permintaan Anda',
            ],
            'default_messages' => [
                'student' => 'Permintaan pendaftaran siswa',
                'teacher' => 'Permintaan pendaftaran guru',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'Sekolah wajib dipilih',
                ],
                'user_id' => [
                    'required' => 'Pengguna wajib dipilih',
                ],
                'message' => [
                    'required' => 'Pesan wajib diisi',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Membuat permintaan...',
                    'update' => 'Memperbarui permintaan...',
                    'delete' => 'Menghapus permintaan...',
                    'approve' => 'Menyetujui permintaan...',
                    'reject' => 'Menolak permintaan...',
                ],
                'success' => [
                    'create' => 'Permintaan berhasil dibuat',
                    'update' => 'Permintaan berhasil diperbarui',
                    'delete' => 'Permintaan berhasil dihapus',
                    'approve' => 'Permintaan berhasil disetujui',
                    'reject' => 'Permintaan berhasil ditolak',
                ],
                'error' => [
                    'create' => 'Error membuat permintaan',
                    'update' => 'Error memperbarui permintaan',
                    'delete' => 'Error menghapus permintaan',
                    'approve' => 'Error menyetujui permintaan',
                    'reject' => 'Error menolak permintaan',
                    'already_requested' => 'Anda sudah mengajukan permintaan untuk sekolah ini yang sedang pending atau sudah disetujui',
                ],
            ],
            'status' => [
                'pending' => 'Pending',
                'approved' => 'Disetujui',
                'rejected' => 'Ditolak',
            ],
        ],
        'index' => [
            'title' => 'Permintaan Sekolah',
            'buttons' => [
                'create' => 'Buat Permintaan',
            ],
            'columns' => [
                'school' => 'Sekolah',
                'message' => 'Pesan',
                'status' => 'Status',
                'created_at' => 'Dibuat Pada',
                'actions' => 'Aksi',
            ],
            'empty_state' => 'Tidak ada permintaan sekolah ditemukan',
        ],
        'create' => [
            'title' => 'Buat Permintaan Sekolah',
            'buttons' => [
                'create' => 'Kirim Permintaan',
            ],
        ],
        'edit' => [
            'title' => 'Edit Permintaan Sekolah',
            'buttons' => [
                'update' => 'Perbarui Permintaan',
            ],
        ],
        'show' => [
            'title' => 'Detail Permintaan Sekolah',
            'buttons' => [
                'approve' => 'Setujui',
                'reject' => 'Tolak',
                'back' => 'Kembali ke Permintaan',
            ],
        ],
    ],
    'student_course_cognitive_classification' => [
        'index' => [
            'title' => 'Klasifikasi Kognitif Kursus Siswa',
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
            'enhanced_export' => 'Ekspor Lanjutan',
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
            'export' => [
                'title' => 'Ekspor Klasifikasi',
                'description' => 'Pilih kursus untuk ekspor klasifikasi kognitif',
            ],
            'enhanced_export' => [
                'title' => 'Ekspor Data Nilai Siswa Lanjutan',
                'description' => 'Ekspor data nilai siswa komprehensif dengan riwayat klasifikasi dan metrik teragregasi.',
                'course_label' => 'Kursus',
                'classification_type_label' => 'Tipe Klasifikasi',
                'classification_date_label' => 'Tanggal Klasifikasi (Opsional)',
                'select_students_label' => 'Pilih Siswa',
                'select_course_placeholder' => 'Pilih kursus...',
                'select_classification_type_placeholder' => 'Pilih tipe klasifikasi...',
                'loading_dates' => 'Memuat tanggal...',
                'latest_classification' => 'Klasifikasi terbaru (default)',
                'select_all' => 'Pilih Semua',
                'loading_students' => 'Memuat siswa...',
                'loading_dates_description' => 'Memuat tanggal klasifikasi yang tersedia...',
                'classification_date_description' => 'Pilih tanggal klasifikasi spesifik atau biarkan kosong untuk menggunakan klasifikasi terbaru untuk setiap siswa.',
                'students_selected' => ':selected dari :total siswa dipilih',
                'export_button' => 'Ekspor Data Lanjutan',
                'exporting' => 'Mengekspor...',
                'table_headers' => [
                    'select' => 'Pilih',
                    'name' => 'Nama',
                    'email' => 'Email',
                    'username' => 'Username',
                ],
            ],
        ],
        'messages' => [
            'no_material_classifications' => 'Tidak ada klasifikasi materi ditemukan untuk kursus ini',
            'no_course_classifications' => 'Tidak ada klasifikasi kursus ditemukan',
            'deleting' => 'Menghapus klasifikasi...',
            'delete_success' => 'Klasifikasi berhasil dihapus',
            'delete_error' => 'Gagal menghapus klasifikasi',
        ],
    ],

    'classification' => [
        'status' => [
            'loading' => 'Memuat...',
            'loading_material_details' => 'Memuat detail materi...',
            'material_error_failed' => 'Gagal memuat detail materi',
        ],
        'table_headers' => [
            'question' => 'Pertanyaan',
            'compiles' => 'Kompilasi',
            'time_min' => 'Waktu (menit)',
            'complete' => 'Selesai',
        ],
        'labels' => [
            'criteria_used' => 'Kriteria yang Digunakan',
            'question_metrics' => 'Metrik Pertanyaan',
            'calculation_details' => 'Detail Perhitungan',
            'material_name' => 'Nama Materi',
            'material_performance' => 'Performa Materi',
        ],
        'cards' => [
            'view_details' => 'Lihat Detail',
        ],
        'messages' => [
            'no_calculation_details' => 'Tidak ada detail perhitungan tersedia',
            'no_question_metrics' => 'Tidak ada metrik pertanyaan tersedia',
        ],
    ],
    'classroom' => [
        'common' => [
            'fields' => [
                'school' => 'Sekolah',
                'name' => 'Nama Kelas',
                'description' => 'Deskripsi',
                'grade' => 'Tingkat',
                'year' => 'Tahun Akademik',
                'active' => 'Status Aktif',
                'status' => 'Status',
                'students' => 'Siswa',
                'student' => 'Siswa',
            ],
            'placeholders' => [
                'school' => 'Pilih sekolah',
                'name' => 'Masukkan nama kelas',
                'description' => 'Masukkan deskripsi kelas',
                'grade' => 'Pilih tingkat',
                'year' => 'Masukkan tahun akademik',
                'active' => 'Pilih status aktif',
                'status' => 'Pilih status',
                'students' => 'Pilih siswa',
                'student' => 'Pilih siswa',
                'select_students' => 'Pilih siswa',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'Sekolah wajib dipilih',
                ],
                'name' => [
                    'required' => 'Nama kelas wajib diisi',
                ],
                'grade' => [
                    'required' => 'Tingkat wajib dipilih',
                ],
                'year' => [
                    'required' => 'Tahun akademik wajib diisi',
                ],
                'students' => [
                    'required' => 'Silakan pilih setidaknya satu siswa',
                ],
                'student_id' => [
                    'required' => 'Silakan pilih siswa',
                ],
            ],
            'messages' => [
                'not_found' => 'Kelas tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat kelas...',
                    'update' => 'Memperbarui kelas...',
                    'delete' => 'Menghapus kelas...',
                    'assign_student' => 'Menetapkan siswa...',
                    'assign_students' => 'Menetapkan siswa...',
                    'remove_student' => 'Menghapus siswa...',
                ],
                'success' => [
                    'create' => 'Kelas berhasil dibuat',
                    'update' => 'Kelas berhasil diperbarui',
                    'delete' => 'Kelas berhasil dihapus',
                    'assign_student' => 'Siswa berhasil ditetapkan',
                    'assign_students' => ':count siswa berhasil ditetapkan',
                    'remove_student' => 'Siswa berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Error membuat kelas',
                    'update' => 'Error memperbarui kelas',
                    'delete' => 'Error menghapus kelas',
                    'unauthorized' => 'Anda tidak memiliki otorisasi untuk mengelola kelas di sekolah ini',
                    'assign_student' => 'Error menetapkan siswa',
                    'assign_students' => 'Error menetapkan siswa',
                    'remove_student' => 'Error menghapus siswa',
                ],
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
        ],
        'index' => [
            'title' => 'Kelas',
            'buttons' => [
                'create' => 'Buat Kelas',
            ],
            'search_placeholder' => 'Cari kelas...',
            'empty_state' => 'Tidak ada kelas ditemukan',
        ],
        'create' => [
            'title' => 'Buat Kelas',
            'buttons' => [
                'create' => 'Buat Kelas',
            ],
        ],
        'edit' => [
            'title' => 'Edit Kelas',
            'buttons' => [
                'update' => 'Perbarui Kelas',
            ],
        ],
        'show' => [
            'title' => 'Detail Kelas',
            'sections' => [
                'information' => 'Informasi',
                'students' => 'Siswa',
            ],
            'student_columns' => [
                'name' => 'Nama',
                'email' => 'Email',
                'actions' => 'Aksi',
            ],
            'buttons' => [
                'assign_student' => 'Tetapkan Siswa',
            ],
            'empty_states' => [
                'no_students' => 'Tidak ada siswa yang ditetapkan ke kelas ini',
                'no_classrooms' => 'Tidak ada kelas yang ditetapkan',
            ],
            'dialogs' => [
                'assign_student' => [
                    'title' => 'Tetapkan Siswa',
                    'description' => 'Pilih siswa untuk ditetapkan ke kelas ini',
                    'buttons' => [
                        'assign' => 'Tetapkan Siswa',
                    ],
                ],
            ],
            'bulk_actions' => [
                'title' => 'Aksi Massal',
                'selected' => ':count dipilih',
                'buttons' => [
                    'assign_selected' => 'Tetapkan yang Dipilih',
                ],
                'placeholders' => [
                    'search' => 'Cari pengguna...',
                    'no_data' => 'Tidak ada pengguna tersedia',
                ],
                'empty_state' => [
                    'title' => 'Tidak ada pengguna ditemukan',
                    'description' => 'Coba ubah kriteria pencarian Anda',
                ],
            ],
        ],
    ],
    'course' => [
        'common' => [
            'fields' => [
                'name' => 'Nama Kursus',
                'description' => 'Deskripsi',
                'classroom' => 'Kelas',
                'teacher' => 'Guru',
                'active' => 'Status Aktif',
                'status' => 'Status',
                'workspace_lock_timeout' => 'Batas Waktu Kunci Ruang Kerja',
            ],
            'placeholders' => [
                'name' => 'Masukkan nama kursus',
                'description' => 'Masukkan deskripsi kursus',
                'classroom' => 'Pilih kelas',
                'teacher' => 'Pilih guru',
                'timeout_value' => 'Masukkan nilai batas waktu',
            ],
            'time_units' => [
                'minutes' => 'Menit',
                'hours' => 'Jam',
                'days' => 'Hari',
                'months' => 'Bulan',
            ],
            'help' => [
                'workspace_lock_timeout' => 'Berapa lama siswa harus menunggu sebelum dapat mencoba lagi setelah menyelesaikan semua soal dalam suatu materi. Atur ke 0 untuk mengizinkan percobaan ulang langsung.',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Nama kursus wajib diisi',
                ],
                'class_room_id' => [
                    'required' => 'Kelas wajib dipilih',
                ],
                'teacher_id' => [
                    'required' => 'Guru wajib dipilih',
                ],
            ],
            'messages' => [
                'not_found' => 'Kursus tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat kursus...',
                    'update' => 'Memperbarui kursus...',
                    'delete' => 'Menghapus kursus...',
                ],
                'success' => [
                    'create' => 'Kursus berhasil dibuat',
                    'update' => 'Kursus berhasil diperbarui',
                    'delete' => 'Kursus berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Gagal membuat kursus',
                    'update' => 'Gagal memperbarui kursus',
                    'delete' => 'Gagal menghapus kursus',
                ],
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
            'sections' => [
                'details' => 'Detail Kursus',
                'information' => 'Informasi',
                'timestamps' => 'Informasi Waktu',
            ],
            'not_assigned' => 'Tidak Ditugaskan',
        ],
        'index' => [
            'title' => 'Kursus',
            'buttons' => [
                'create' => 'Buat Kursus',
            ],
            'search_placeholder' => 'Cari kursus...',
            'empty_state' => 'Tidak ada kursus ditemukan',
        ],
        'create' => [
            'title' => 'Buat Kursus',
            'buttons' => [
                'create' => 'Buat Kursus',
            ],
        ],
        'edit' => [
            'title' => 'Edit Kursus',
            'buttons' => [
                'update' => 'Perbarui Kursus',
            ],
        ],
        'show' => [
            'title' => 'Detail Kursus',
            'sections' => [
                'information' => 'Informasi',
                'learning_materials' => 'Materi Pembelajaran',
                'locked_students' => 'Siswa Terkunci',
            ],
            'locked_students' => [
                'title' => 'Manajemen Siswa Terkunci',
                'description' => 'Kelola siswa yang ruang kerjanya terkunci karena telah menyelesaikan semua soal dalam materi.',
                'loading' => 'Memuat siswa terkunci...',
                'no_locked_students' => 'Tidak Ada Siswa Terkunci',
                'no_locked_students_description' => 'Saat ini tidak ada siswa dengan ruang kerja terkunci dalam kursus ini.',
                'columns' => [
                    'student' => 'Siswa',
                    'material' => 'Materi',
                    'locked_at' => 'Dikunci Pada',
                    'unlock_at' => 'Buka Pada',
                    'status' => 'Status',
                    'actions' => 'Aksi',
                ],
                'status' => [
                    'locked' => 'Terkunci',
                    'can_reattempt' => 'Dapat Mengulang',
                ],
                'actions' => [
                    'unlock' => 'Buka Ruang Kerja',
                ],
                'unlock_now' => 'Tersedia Sekarang',
            ],
        ],
        'import' => [
            'title' => 'Impor Kursus',
            'description' => 'Impor kursus dari file Excel atau arsip ZIP yang berisi Excel dan file terkait',
            'upload_title' => 'Unggah File Impor Kursus',
            'download_template' => 'Unduh Template',
            'drag_drop' => 'Seret dan jatuhkan file Excel atau arsip ZIP di sini, atau klik untuk menjelajah',
            'supported_formats' => 'Mendukung file .xlsx, .xls dan .zip hingga 50MB',
            'stats' => 'Diimpor: {courses} kursus, {materials} materi, {questions} soal, {testCases} kasus uji',
            'errors' => 'Kesalahan:',
            'instructions_title' => 'Petunjuk',
            'instructions' => [
                'download' => 'Unduh template dan isi data kursus Anda',
                'identifiers' => 'Anda dapat menggunakan nama kelas dan email guru sebagai pengganti ID',
                'materials' => 'Materi harus mereferensikan kursus berdasarkan nama',
                'questions' => 'Soal harus mereferensikan materi berdasarkan judul dan menyertakan nama kursus',
                'test_cases' => 'Kasus uji harus mereferensikan soal berdasarkan judul dan menyertakan judul materi dan nama kursus',
                'order' => 'Isi lembar kerja berurutan: Kursus → Materi → Soal → KasusUji',
                'backup' => 'Simpan cadangan file Excel dan lampiran Anda',
                'zip_use' => 'Untuk lampiran file, gunakan file ZIP yang berisi Excel dan file yang direferensikan',
                'file_references' => 'Dalam Excel, tambahkan jalur file relatif terhadap root ZIP (mis., "materials/lecture1.pdf")',
                'file_handling' => 'Semua file akan disimpan dan dapat diakses oleh siswa tanpa perlu menentukan jalur',
            ],
            'buttons' => [
                'import' => 'Impor Kursus',
                'open_import' => 'Impor',
            ],
            'downloading_template' => 'Mengunduh template...',
            'download_success' => 'Template berhasil diunduh',
            'download_error' => 'Gagal mengunduh template',
            'importing' => 'Mengimpor kursus...',
            'import_success' => 'Kursus berhasil diimpor',
            'import_error' => 'Gagal mengimpor kursus',
            'validation' => [
                'file_required' => 'Silakan pilih file untuk diimpor',
                'file_type' => 'Hanya file .xlsx, .xls dan .zip yang diterima',
                'file_size' => 'Ukuran file tidak boleh melebihi 50MB',
            ],
            'zip' => [
                'title' => 'Impor Arsip ZIP',
                'description' => 'Unggah file ZIP yang berisi file Excel dan materi yang direferensikan',
                'instructions' => 'File ZIP harus berisi satu file Excel dan file apa pun yang direferensikan dalam lembar Excel',
                'structure' => 'Atur file Anda dalam folder dalam ZIP untuk manajemen yang lebih baik',
                'example' => 'Contoh: Tempatkan materi PDF dalam folder "materials" dan referensikan sebagai "materials/file.pdf"',
                'error' => [
                    'no_excel' => 'Tidak ada file Excel ditemukan dalam arsip ZIP',
                    'missing_file' => 'File yang direferensikan tidak ditemukan dalam arsip ZIP: {file}',
                    'extraction' => 'Kesalahan mengekstrak file ZIP: {error}',
                ],
                'file_handling' => [
                    'title' => 'Penanganan File',
                    'description' => 'File disimpan dengan nama unik untuk menghindari konflik',
                    'note' => 'Saat mereferensikan file dalam Excel, cukup sertakan jalur relatif dalam arsip ZIP',
                    'example' => 'Misalnya, gunakan "materials/lecture1.pdf" untuk mereferensikan file tersebut di dalam ZIP Anda',
                    'storage' => 'Semua file yang diunggah akan dapat diakses oleh siswa tanpa perlu menentukan jalur',
                ],
            ],
            'preview_dialog' => [
                'title' => 'Pratinjau Impor',
                'description' => 'Silakan tinjau data yang akan diimpor sebelum melanjutkan',
                'tabs' => [
                    'summary' => 'Ringkasan',
                    'pdf_content' => 'Konten PDF',
                    'courses' => 'Kursus',
                    'materials' => 'Materi',
                ],
                'excel_content' => 'Konten Excel',
                'courses' => 'Kursus',
                'materials' => 'Materi',
                'questions' => 'Soal',
                'test_cases' => 'Kasus Uji',
                'pdf_content' => 'Konten PDF',
                'pdf_files' => 'File PDF',
                'detected_questions' => 'Soal Terdeteksi',
                'detected_test_cases' => 'Kasus Uji Terdeteksi',
                'no_pdf_content' => 'Tidak ada soal terdeteksi dari file PDF',
                'no_courses' => 'Tidak ada kursus ditemukan dalam file impor',
                'no_materials' => 'Tidak ada materi ditemukan dalam file impor',
                'cancel' => 'Batal',
                'confirm' => 'Impor Sekarang',
                'importing' => 'Mengimpor...',
            ],
            'previewing' => 'Menganalisis file impor...',
            'preview_success' => 'Pratinjau berhasil dibuat',
            'preview_error' => 'Gagal membuat pratinjau',
            'download_material_template' => 'Unduh Template Materi',
            'downloading_material_template' => 'Mengunduh template Materi...',
            'download_material_success' => 'Template Materi berhasil diunduh',
            'download_material_error' => 'Gagal mengunduh template Materi',
        ],
    ],
    'learning_material' => [
        'common' => [
            'fields' => [
                'title' => 'Judul',
                'description' => 'Deskripsi',
                'type' => 'Tipe',
                'order' => 'Urutan',
                'file' => 'File',
                'file_extension' => 'Ekstensi File',
                'status' => 'Status',
                'active' => 'Status Aktif',
                'course' => 'Kursus',
            ],
            'placeholders' => [
                'title' => 'Masukkan judul',
                'description' => 'Masukkan deskripsi',
                'type' => 'Pilih tipe',
                'file_extension' => 'Masukkan ekstensi file',
            ],
            'types' => [
                'article' => 'Artikel',
                'quiz' => 'Kuis',
                'live_code' => 'Live Coding',
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
            'sections' => [
                'details' => 'Detail Materi',
                'timestamps' => 'Informasi Waktu',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Judul wajib diisi',
                ],
                'course_id' => [
                    'required' => 'Kursus wajib diisi',
                ],
                'type' => [
                    'required' => 'Tipe materi wajib diisi',
                ],
                'order_number' => [
                    'required' => 'Nomor urutan wajib diisi',
                ],
            ],
            'messages' => [
                'not_found' => 'Materi pembelajaran tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat materi pembelajaran...',
                    'update' => 'Memperbarui materi pembelajaran...',
                    'delete' => 'Menghapus materi pembelajaran...',
                ],
                'success' => [
                    'create' => 'Materi pembelajaran berhasil dibuat',
                    'update' => 'Materi pembelajaran berhasil diperbarui',
                    'delete' => 'Materi pembelajaran berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Gagal membuat materi pembelajaran',
                    'update' => 'Gagal memperbarui materi pembelajaran',
                    'delete' => 'Gagal menghapus materi pembelajaran',
                ],
            ],
            'no_course' => 'Tidak Ada Kursus Ditugaskan',
        ],
        'index' => [
            'title' => 'Materi Pembelajaran',
            'buttons' => [
                'create' => 'Tambah Materi',
            ],
            'search_placeholder' => 'Cari materi...',
            'empty_state' => 'Tidak ada materi pembelajaran ditemukan',
        ],
        'create' => [
            'title' => 'Buat Materi Pembelajaran',
            'buttons' => [
                'create' => 'Buat Materi',
            ],
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Pratinjau tidak tersedia untuk tipe file ini',
        ],
        'edit' => [
            'title' => 'Edit Materi Pembelajaran',
            'buttons' => [
                'update' => 'Perbarui Materi',
            ],
            'current_file' => 'File Saat Ini',
            'new_file_preview' => 'Pratinjau File Baru',
            'current_file_preview' => 'Pratinjau File Saat Ini',
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Pratinjau tidak tersedia untuk tipe file ini',
        ],
        'show' => [
            'title' => 'Detail Materi Pembelajaran',
            'sections' => [
                'information' => 'Informasi',
                'details' => 'Detail Materi',
                'questions' => 'Soal',
            ],
            'file_info' => 'File: :name (:extension)',
            'view_file' => 'Lihat File',
            'full_pdf_link' => 'Lihat PDF Lengkap',
        ],
    ],
    'learning_material_question' => [
        'common' => [
            'fields' => [
                'title' => 'Judul Soal',
                'description' => 'Deskripsi Soal',
                'type' => 'Tipe Soal',
                'order' => 'Urutan',
                'clue' => 'Petunjuk/Clue',
                'pre_code' => 'Kode Pre-definisi',
                'example_code' => 'Contoh Kode Solusi',
                'file' => 'File Soal',
                'file_extension' => 'Ekstensi File',
                'status' => 'Status',
                'active' => 'Status Aktif',
            ],
            'placeholders' => [
                'title' => 'Masukkan judul soal',
                'description' => 'Masukkan deskripsi soal atau instruksi',
                'clue' => 'Masukkan petunjuk atau clue untuk siswa',
                'pre_code' => 'Masukkan kode awal untuk siswa',
                'example_code' => 'Masukkan contoh kode solusi',
            ],
            'help' => [
                'clue' => 'Berikan petunjuk yang dapat dilihat siswa jika mereka kesulitan',
                'pre_code' => 'Berikan kode awal yang akan dimuat untuk siswa sebagai titik awal',
                'example_code' => 'Berikan contoh solusi yang dapat digunakan sebagai referensi',
                'question_file' => 'Unggah file PDF atau gambar yang berisi detail soal atau elemen visual',
                'starter_code' => null, // Remove this line or comment it out
            ],
            'types' => [
                'quiz' => 'Soal Kuis',
                'live_code' => 'Latihan Live Coding',
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Judul soal wajib diisi',
                ],
                'description' => [
                    'required' => 'Konten soal wajib diisi',
                ],
                'material_id' => [
                    'required' => 'Materi pembelajaran wajib diisi',
                ],
                'order_number' => [
                    'required' => 'Nomor urutan wajib diisi',
                ],
            ],
            'messages' => [
                'not_found' => 'Soal tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat soal...',
                    'update' => 'Memperbarui soal...',
                    'delete' => 'Menghapus soal...',
                ],
                'success' => [
                    'create' => 'Soal berhasil dibuat',
                    'update' => 'Soal berhasil diperbarui',
                    'delete' => 'Soal berhasil dihapus',
                ],
                'error' => [
                    'create' => 'Gagal membuat soal',
                    'update' => 'Gagal memperbarui soal',
                    'delete' => 'Gagal menghapus soal',
                ],
            ],
            'actions' => [
                'manage_test_cases' => 'Kelola Kasus Uji',
            ],
        ],
        'index' => [
            'title' => 'Soal',
            'buttons' => [
                'create' => 'Tambah Soal',
            ],
            'empty_state' => 'Tidak ada soal ditemukan',
        ],
        'create' => [
            'title' => 'Buat Soal',
            'buttons' => [
                'create' => 'Buat Soal',
            ],
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Pratinjau tidak tersedia untuk tipe file ini',
            'test_cases' => [
                'note' => 'Kasus Uji untuk Live Coding',
                'description' => 'Untuk soal live coding, Anda dapat menambahkan kasus uji setelah membuat soal.',
                'add_later' => 'Anda akan dapat menambahkan kasus uji dari halaman detail soal.',
            ],
        ],
        'edit' => [
            'title' => 'Edit Soal',
            'buttons' => [
                'update' => 'Perbarui Soal',
            ],
            'current_file' => 'File Soal Saat Ini',
            'new_file_preview' => 'Pratinjau File Baru',
            'current_file_preview' => 'Pratinjau File Saat Ini',
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Tidak ada pratinjau tersedia untuk tipe file ini',
            'test_cases' => [
                'title' => 'Kasus Uji',
                'description' => 'Anda dapat mengelola kasus uji untuk soal live coding ini',
                'manage_button' => 'Kelola Kasus Uji',
            ],
        ],
        'show' => [
            'title' => 'Detail Soal',
            'question_file' => 'File Soal',
            'sections' => [
                'information' => 'Informasi',
                'test_cases' => 'Kasus Uji',
            ],
        ],
    ],
    'learning_material_question_test_case' => [
        'common' => [
            'fields' => [
                'description' => 'Deskripsi Tes',
                'input' => 'Input',
                'output' => 'Output',
                'expected_output' => 'Output yang Diharapkan',
                'output_type' => 'Tipe Output',
                'hidden' => 'Tes Tersembunyi',
                'active' => 'Status Aktif',
                'explanation' => 'Penjelasan',
                'status' => 'Status',
                'language' => 'Bahasa Pemrograman',
                'visibility' => 'Visibilitas',
            ],
            'help' => [
                'description' => 'Jelaskan apa yang sedang diperiksa oleh kasus uji ini',
                'input' => 'Masukkan kode atau input sampel untuk menguji soal',
                'expected_output' => 'Unggah file PDF atau gambar yang menunjukkan output yang diharapkan untuk kasus uji ini',
                'hidden' => 'Tes tersembunyi hanya terlihat oleh guru dan digunakan untuk penilaian',
                'language' => 'Pilih bahasa pemrograman untuk kasus uji ini',
            ],
            'validations' => [
                'description' => [
                    'required' => 'Deskripsi tes wajib diisi',
                ],
            ],
            'status' => [
                'active' => 'Aktif',
                'inactive' => 'Tidak Aktif',
            ],
            'visibility' => [
                'hidden' => 'Tersembunyi',
                'visible' => 'Terlihat',
            ],
            'messages' => [
                'not_found' => 'Kasus uji tidak ditemukan',
                'pending' => [
                    'create' => 'Membuat kasus uji...',
                    'update' => 'Memperbarui kasus uji...',
                    'delete' => 'Menghapus kasus uji...',
                    'toggle' => 'Memperbarui visibilitas kasus uji...',
                ],
                'success' => [
                    'create' => 'Kasus uji berhasil dibuat',
                    'update' => 'Kasus uji berhasil diperbarui',
                    'delete' => 'Kasus uji berhasil dihapus',
                    'toggle' => 'Visibilitas kasus uji berhasil diperbarui',
                ],
                'error' => [
                    'create' => 'Gagal membuat kasus uji',
                    'update' => 'Gagal memperbarui kasus uji',
                    'delete' => 'Gagal menghapus kasus uji',
                    'toggle' => 'Gagal memperbarui visibilitas kasus uji',
                ],
            ],
            'placeholders' => [
                'language' => 'Pilih bahasa',
                'input' => 'Masukkan input kasus uji',
                'expected_output' => 'Masukkan output yang diharapkan',
                'description' => 'Masukkan deskripsi kasus uji',
            ],
            'confirmations' => [
                'toggle_visibility' => [
                    'title' => 'Konfirmasi Perubahan Visibilitas',
                    'message' => 'Apakah Anda yakin ingin mengubah visibilitas kasus uji ini?',
                    'show' => 'sekarang',
                    'hide' => 'tidak lagi',
                    'confirm' => 'Ya, ubah visibilitas',
                    'cancel' => 'Batal',
                ],
                'delete' => [
                    'title' => 'Konfirmasi Penghapusan',
                    'message' => 'Apakah Anda yakin ingin menghapus kasus uji ini? Tindakan ini tidak dapat dibatalkan.',
                    'confirm' => 'Ya, hapus',
                    'cancel' => 'Batal',
                ],
            ],
            'confirmation' => [
                'toggle' => [
                    'title' => 'Konfirmasi Perubahan Visibilitas',
                    'message' => 'Apakah Anda yakin ingin mengubah visibilitas kasus uji ini?',
                ],
            ],
            'sections' => [
                'details' => 'Detail Kasus Uji',
            ],
            'debug_section' => [
                'title' => 'Debug Kasus Uji',
                'description' => 'Debug kasus uji Anda dengan menjalankannya pada contoh kode. Gunakan "student_code" dalam kasus uji Anda untuk merujuk pada kode yang sedang diuji.',
            ],
            'debug_dialog' => [
                'title' => 'Debug Kasus Uji',
            ],
            'actions' => [
                'create' => 'Buat Kasus Uji',
                'edit' => 'Edit Kasus Uji',
                'delete' => 'Hapus Kasus Uji',
                'make_visible' => 'Buat Terlihat',
                'make_hidden' => 'Buat Tersembunyi',
                'toggle_status' => 'Alihkan Status',
                'debug' => 'Debug Kasus Uji',
            ],
        ],
        'no_test_cases' => [
            'title' => 'Tidak Ada Kasus Uji Ditemukan',
            'message' => 'Belum ada kasus uji untuk soal materi pembelajaran ini. Buat kasus uji untuk memulai.',
            'add_button' => 'Tambah Kasus Uji',
        ],
        'index' => [
            'title' => 'Kasus Uji',
            'buttons' => [
                'create' => 'Tambah Kasus Uji',
            ],
            'empty_state' => 'Tidak ada kasus uji ditemukan',
        ],
        'create' => [
            'title' => 'Buat Kasus Uji',
            'buttons' => [
                'create' => 'Buat Kasus Uji',
            ],
            'file_preview' => 'Pratinjau File',
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Tidak ada pratinjau tersedia untuk tipe file ini',
        ],
        'edit' => [
            'title' => 'Edit Kasus Uji',
            'buttons' => [
                'update' => 'Perbarui Kasus Uji',
            ],
            'current_file' => 'File Saat Ini',
            'new_file_preview' => 'Pratinjau File Baru',
            'current_file_preview' => 'Pratinjau File Saat Ini',
            'preview' => 'Pratinjau File',
            'no_preview_available' => 'Tidak ada pratinjau tersedia untuk tipe file ini',
        ],
        'show' => [
            'title' => 'Detail Kasus Uji',
            'hidden' => 'Tersembunyi',
            'visible' => 'Terlihat',
            'expected_output_file' => 'File Output yang Diharapkan',
            'sections' => [
                'details' => 'Detail Kasus Uji',
            ],
        ],
        'import' => [
            'title' => 'Impor Kasus Uji',
            'description' => 'Unggah file CSV atau Excel untuk mengimpor kasus uji secara massal',
            'template' => [
                'title' => 'Unduh Template',
                'description' => 'Unduh file template dengan format yang benar',
            ],
            'preview' => [
                'title' => 'Pratinjau Impor',
                'total_rows' => 'Total baris: :count',
                'row_number' => 'Baris #',
            ],
            'buttons' => [
                'download_csv' => 'Unduh Template CSV',
                'download_excel' => 'Unduh Template Excel',
                'preview' => 'Pratinjau',
                'back' => 'Kembali',
                'confirm_import' => 'Konfirmasi Impor',
                'import' => 'Impor Kasus Uji',
                'cancel' => 'Batal',
            ],
            'messages' => [
                'downloading_template' => 'Mengunduh template...',
                'download_success' => 'Template berhasil diunduh',
                'download_error' => 'Gagal mengunduh template',
                'previewing' => 'Menganalisis file impor...',
                'preview_success' => 'Pratinjau berhasil dimuat',
                'preview_error' => 'Gagal melihat pratinjau file',
                'importing' => 'Mengimpor kasus uji...',
                'import_success' => 'Kasus uji berhasil diimpor',
                'import_error' => 'Gagal mengimpor kasus uji',
            ],
            'upload' => [
                'title' => 'Unggah File Impor Test Case',
            ],
        ],
    ],
    'profile' => [
        'edit' => [
            'title' => 'Pengaturan Profil',
            'tabs' => [
                'profile' => 'Profil',
                'password' => 'Kata Sandi',
                'danger' => 'Zona Bahaya',
            ],
        ],
        'sections' => [
            'information' => 'Informasi Profil',
            'password' => 'Perbarui Kata Sandi',
            'delete_account' => 'Hapus Akun',
        ],
        'descriptions' => [
            'information' => 'Perbarui informasi profil dan alamat email akun Anda.',
            'password' => 'Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk tetap aman.',
            'delete_account' => 'Setelah akun Anda dihapus, semua sumber daya dan data akan dihapus secara permanen.',
        ],
        'fields' => [
            'name' => 'Nama',
            'username' => 'Nama Pengguna',
            'email' => 'Email',
            'current_password' => 'Kata Sandi Saat Ini',
            'new_password' => 'Kata Sandi Baru',
            'confirm_password' => 'Konfirmasi Kata Sandi',
            'password' => 'Kata Sandi',
        ],
        'validations' => [
            'name' => [
                'required' => 'Nama wajib diisi',
            ],
            'username' => [
                'required' => 'Nama pengguna wajib diisi',
            ],
            'email' => [
                'required' => 'Email wajib diisi',
                'invalid' => 'Silakan masukkan alamat email yang valid',
            ],
            'current_password' => [
                'required' => 'Kata sandi saat ini wajib diisi',
            ],
            'password' => [
                'min' => 'Kata sandi harus minimal 8 karakter',
                'required' => 'Kata sandi wajib diisi',
                'required_for_deletion' => 'Kata sandi diperlukan untuk mengonfirmasi penghapusan akun',
            ],
            'password_confirmation' => [
                'required' => 'Silakan konfirmasi kata sandi Anda',
                'match' => 'Konfirmasi kata sandi tidak cocok',
            ],
        ],
        'buttons' => [
            'save' => 'Simpan',
            'delete_account' => 'Hapus Akun',
            'cancel' => 'Batal',
            'confirm_delete' => 'Hapus Akun',
        ],
        'messages' => [
            'success' => [
                'update' => 'Profil berhasil diperbarui',
                'password' => 'Kata sandi berhasil diperbarui',
                'delete' => 'Akun berhasil dihapus',
            ],
            'error' => [
                'update' => 'Terjadi kesalahan saat memperbarui profil Anda',
                'password' => 'Terjadi kesalahan saat memperbarui kata sandi Anda',
                'delete' => 'Terjadi kesalahan saat menghapus akun Anda',
            ],
        ],
        'verification' => [
            'title' => 'Verifikasi Email',
            'message' => 'Alamat email Anda belum diverifikasi.',
            'resend_link' => 'Klik di sini untuk mengirim ulang email verifikasi',
            'sent' => 'Tautan verifikasi baru telah dikirim ke alamat email Anda.',
        ],
        'upload' => [
            'label' => 'Seret & jatuhkan foto profil Anda atau <span class="filepond--label-action">Jelajahi</span>',
            'hint' => 'Direkomendasikan: Gambar persegi, maksimal 1MB (.jpg, .png)',
        ],
        'warnings' => [
            'delete_account' => 'Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda secara permanen dan semua data terkait.',
        ],
        'delete_dialog' => [
            'title' => 'Apakah Anda yakin?',
            'description' => 'Setelah akun Anda dihapus, semua sumber daya dan data akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.',
        ],
    ],
    'student_courses' => [
        'common' => [
            'fields' => [
                'name' => 'Nama',
                'classroom' => 'Kelas',
                'description' => 'Deskripsi',
                'progress' => 'Progres',
                'progress_label' => 'Soal Selesai',
            ],
        ],
        'index' => [
            'title' => 'Kursus Saya',
            'progress' => 'Progres',
            'progress_label' => 'Soal Selesai',
        ],
        'show' => [
            'title' => 'Detail Kursus',
        ],
        'actions' => [
            'back_to_list' => 'Kembali ke Daftar',
            'back_to_home' => 'Kembali ke Beranda',
            'back_to_dashboard' => 'Kembali ke Dashboard',
            'back_to_courses' => 'Kembali ke Kursus',
            'back_to_course' => 'Kembali ke Kursus',
            'back_to_material' => 'Kembali ke Materi',
        ],
    ],

    'student_materials' => [
        'common' => [
            'fields' => [
                'title' => 'Judul',
                'type' => 'Tipe',
                'description' => 'Deskripsi',
            ],
        ],
        'index' => [
            'title' => 'Materi Pembelajaran',
        ],
        'show' => [
            'title' => 'Detail Materi',
            'progress' => 'Progres Anda',
            'questions' => 'Soal',
            'completed' => ':count dari :total soal selesai',
            'completed_label' => 'Selesai',
            'in_progress' => 'Sedang Berlangsung',
            'score' => 'Nilai',
            'continue' => 'Lanjutkan',
            'start' => 'Mulai',
            'next_material' => 'Materi Selanjutnya',
        ],
    ],

    'student_questions' => [
        'workspace' => [
            'question' => 'Soal',
            'time' => 'Waktu',
            'time_spent' => 'Waktu yang Dihabiskan',
            'view_image' => 'Gambar Soal',
            'clue' => 'Petunjuk',
            'test_cases' => 'Kasus Uji',
            'code' => 'Kode',
            'output' => 'Output',
            'run' => 'Jalankan Kode',
            'running' => 'Menjalankan',
            'next' => 'Soal Selanjutnya',
            'previous' => 'Soal Sebelumnya',
            'run_first' => 'Anda harus menjalankan kode Anda setidaknya sekali untuk melanjutkan',
            'completed' => 'Selesai',
            'no_output_yet' => 'Belum ada output. Jalankan kode Anda untuk melihat hasil.',
            'test_results' => 'Hasil Tes',
            'passed' => ' berhasil',
            'success' => [
                'title' => 'Selamat!',
                'description' => 'Semua tes berhasil dilewati.',
            ],
            'error' => [
                'title' => 'Kesalahan Menjalankan Kode',
                'description' => 'Terjadi masalah saat menjalankan kode Anda. Silakan periksa kesalahan.',
            ],
            'view_material' => 'Lihat Materi',
            'side_by_side_view' => 'Tampilan Berdampingan',
            'stacked_view' => 'Tampilan Bertumpuk',
            'locked' => [
                'title' => 'Ruang Kerja Terkunci',
                'description' => 'Ruang kerja Anda telah dikunci karena Anda menyelesaikan semua soal dalam materi ini. Anda dapat mencoba lagi setelah periode buka kunci atau menunggu persetujuan guru.',
                'cannot_run' => 'Tidak dapat menjalankan kode saat ruang kerja terkunci',
                'button' => 'Terkunci',
                'notification' => 'Ruang kerja telah dikunci karena menyelesaikan semua soal',
                'unlock_in' => 'Buka dalam',
                'unlock_now' => 'Tersedia untuk dibuka',
                'reattempt' => 'Coba Lagi',
                'answer_locked' => 'Jawaban terkunci. Tidak dapat menjalankan kode.',
                'answer_locked_button' => 'Jawaban Terkunci',
            ],
            'reattempt' => [
                'success' => 'Berhasil mereset ruang kerja! Sekarang Anda dapat mencoba lagi.',
                'error' => 'Gagal mereset ruang kerja. Silakan coba lagi.',
            ],
            'test_cases_revealed' => 'Kasus uji tambahan telah diungkapkan untuk membantu Anda debug kode!',
            'progressive_revelation' => [
                'failed_attempts_label' => 'Percobaan Gagal',
                'attempts_remaining' => 'percobaan lagi hingga kasus uji tambahan diungkapkan',
                'all_revealed' => 'Semua kasus uji tambahan telah diungkapkan',
                'test_case_revealed' => 'Kasus Uji Diungkapkan',
            ],
            'mark_as_done' => [
                'button' => 'Tandai Selesai',
                'success' => 'Soal berhasil ditandai selesai!',
                'error' => 'Gagal menandai soal selesai. Silakan coba lagi.',
                'dialog' => [
                    'title' => 'Tandai Soal Selesai',
                    'description' => 'Apakah Anda yakin ingin menandai soal ini selesai? Setelah ditandai, Anda tidak dapat mengubah kode kecuali Anda mengizinkan percobaan ulang.',
                    'warning_title' => 'Pemberitahuan Penting',
                    'warning_description' => 'Menandai selesai akan memfinalisasi solusi Anda saat ini. Anda dapat mengizinkan percobaan ulang nanti jika diperlukan.',
                    'cancel' => 'Batal',
                    'continue' => 'Lanjutkan Tanpa Menandai',
                    'mark_done' => 'Tandai Selesai',
                ],
            ],
            'allow_reattempt' => [
                'button' => 'Coba Lagi',
                'success' => 'Percobaan ulang berhasil diizinkan! Halaman akan dimuat ulang.',
                'error' => 'Gagal mengizinkan percobaan ulang. Silakan coba lagi.',
            ],
            'allow_reattempt_all' => [
                'button' => 'Coba Lagi Semua Soal',
                'success' => 'Percobaan ulang untuk semua soal berhasil diizinkan! Halaman akan dimuat ulang.',
                'error' => 'Gagal mengizinkan percobaan ulang untuk semua soal. Silakan coba lagi.',
                'dialog' => [
                    'title' => 'Coba Lagi Semua Soal',
                    'description' => 'Apakah Anda yakin ingin mereset semua soal dalam materi ini untuk percobaan ulang? Ini akan menandai semua soal yang selesai sebagai belum selesai.',
                    'warning_title' => 'Pemberitahuan Penting',
                    'warning_description' => 'Tindakan ini akan mereset status penyelesaian semua soal dalam materi ini.',
                    'cancel' => 'Batal',
                    'confirm' => 'Coba Lagi Semua',
                ],
            ],
            'close' => 'Tutup',
            'description' => 'Deskripsi',
            'material_file' => 'File Materi',
            'expand_material' => 'Perluas Materi',
            'hide_material' => 'Sembunyikan Materi',
            'show_material' => 'Tampilkan Materi',
            'resize_panel' => 'Seret untuk mengubah ukuran panel',
            'drag_panel' => 'Seret header untuk menggeser panel',
        ],
    ],
    'dashboard' => [
        'common' => [
            'title' => 'Dashboard',
            'loading' => 'Memuat data dashboard...',
            'no_data' => 'Tidak ada data tersedia',
            'chart_titles' => [
                'bar_chart' => 'Grafik Batang',
                'pie_chart' => 'Grafik Lingkaran',
                'line_chart' => 'Grafik Garis',
                'area_chart' => 'Grafik Area',
                'radar_chart' => 'Grafik Radar',
                'radial_chart' => 'Grafik Radial',
            ],
        ],
        'student' => [
            'title' => 'Dashboard Siswa',
            'subtitle' => 'Lihat progres pembelajaran Anda di sini',
            'latest_work_progress' => [
                'title' => 'Progres Pembelajaran Terbaru',
                'description' => 'Lanjutkan belajar dari tempat Anda tinggalkan',
                'loading' => 'Memuat data...',
                'no_progress' => 'Belum ada progres pembelajaran.',
                'course_label' => 'Kursus:',
                'material_label' => 'Materi:',
                'current_question_label' => 'Progres soal saat ini:',
                'continue_button' => 'Lanjutkan Soal Saat Ini',
                'skip_button' => 'Lompat ke Soal Berikutnya',
                'start_next_button' => 'Mulai Soal Berikutnya',
            ],
            'cognitive_classification' => [
                'title' => 'Klasifikasi Kognitif',
                'description' => 'Tingkat pemahaman kognitif berdasarkan taksonomi Bloom',
                'loading' => 'Memuat data kursus...',
                'no_courses' => 'Belum terdaftar di kursus apapun.',
                'classification_history_title' => 'Riwayat Klasifikasi Kognitif -',
                'classification_history_subtitle' => 'Lihat perkembangan tingkat kognitif dan tren pembelajaran dari waktu ke waktu',
                'card' => [
                    'click_for_details' => 'Klik untuk melihat riwayat detail',
                    'loading' => 'Memuat...',
                    'no_classification' => 'Belum ada klasifikasi',
                    'last_classified' => 'Terakhir:',
                ],
            ],
            'charts' => [
                'learning_progress' => [
                    'title' => 'Progres Pembelajaran (Grafik Area)',
                    'description' => 'Sejak pertama bergabung',
                ],
                'cognitive_level' => [
                    'title' => 'Tingkat Kognitif Bloom (Lingkaran)',
                    'description' => 'Hasil Klasifikasi',
                ],
                'module_progress' => [
                    'title' => 'Modul Belum Selesai (Batang)',
                    'description' => 'Progres modul personal',
                    'footer' => '1 = Selesai, 0 = Belum',
                ],
            ],
        ],
        'school_admin' => [
            'title' => 'Ikhtisar Admin Sekolah',
            'subtitle' => 'Dashboard ringkasan untuk Sekolah',
            'charts' => [
                'population' => [
                    'title' => 'Populasi Sekolah (Grafik Batang)',
                    'description' => 'Staf, Guru, Siswa',
                    'footer' => 'Statistik Saat Ini',
                ],
                'facilities' => [
                    'title' => 'Fasilitas Sekolah (Lingkaran)',
                    'description' => 'Lab, Proyektor, dll.',
                    'items_label' => 'Item',
                ],
                'class_development' => [
                    'title' => 'Perkembangan Kelas (Radar)',
                    'description' => 'Januari vs Juni',
                ],
                'level_performance' => [
                    'title' => 'Performa Tingkat (Grafik Radial)',
                    'description' => 'SD, SMP, SMA',
                ],
            ],
        ],
        'teacher' => [
            'title' => 'Dashboard Guru',
            'subtitle' => 'Ikhtisar kursus dan progres siswa',
            'chart_titles' => [
                'class_scores' => 'Nilai Kelas',
                'class_scores_description' => 'Nilai rata-rata per kelas',
                'module_completion' => 'Penyelesaian Modul',
                'module_completion_description' => 'Status penyelesaian modul',
                'subject_mastery' => 'Penguasaan Mata Pelajaran',
                'subject_mastery_description' => 'Tingkat penguasaan per mata pelajaran',
                'top_students' => 'Siswa Terbaik',
                'top_students_description' => 'Berdasarkan progres',
                'bloom_taxonomy' => 'Distribusi Taksonomi Bloom',
                'bloom_taxonomy_description' => 'Distribusi tingkat kognitif',
                'question_difficulty' => 'Tingkat Kesulitan Soal',
                'question_difficulty_description' => 'Distribusi Mudah/Sedang/Sulit',
                'student_progress' => 'Progres Siswa',
                'student_progress_description' => 'Ikhtisar status penyelesaian',
                'time_spent' => 'Analisis Waktu yang Dihabiskan',
                'time_spent_description' => 'Rata-rata waktu per modul',
            ],
            'labels' => [
                'completed' => 'Selesai',
                'in_progress' => 'Sedang Berlangsung',
                'not_started' => 'Belum Dimulai',
                'top_student' => 'Siswa Terbaik',
                'class_average' => 'Rata-rata Kelas',
                'expected' => 'Diharapkan',
                'actual' => 'Aktual',
                'students' => 'Siswa',
                'modules' => 'Modul',
                'questions' => 'Soal',
                'easy' => 'Mudah',
                'medium' => 'Sedang',
                'hard' => 'Sulit',
            ],
            'taxonomy_levels' => [
                'remember' => 'Mengingat',
                'understand' => 'Memahami',
                'apply' => 'Menerapkan',
                'analyze' => 'Menganalisis',
                'evaluate' => 'Mengevaluasi',
                'create' => 'Menciptakan',
            ],
            'stats' => [
                'total_students' => 'Total Siswa',
                'active_students' => 'Siswa Aktif',
                'total_courses' => 'Total Kursus',
                'total_materials' => 'Total Materi',
                'total_questions' => 'Total Soal',
                'average_score' => 'Nilai Rata-rata',
                'completion_rate' => 'Tingkat Penyelesaian',
                'pass_rate' => 'Tingkat Kelulusan',
            ],
            'latest_progress' => [
                'title' => 'Progres Siswa Terbaru',
                'description' => 'Aktivitas siswa dan pembaruan progres terbaru',
                'labels' => [
                    'course' => 'Kursus',
                    'material' => 'Materi',
                    'question' => 'Soal',
                    'score' => 'Nilai',
                    'time_spent' => 'Waktu yang Dihabiskan',
                    'students' => 'Siswa',
                    'recent_activity' => 'Aktivitas Terbaru',
                ],
                'status' => [
                    'completed' => 'Selesai',
                    'in_progress' => 'Sedang Berlangsung',
                    'started' => 'Dimulai',
                ],
                'no_activity' => [
                    'title' => 'Tidak Ada Aktivitas Terbaru',
                    'description' => 'Tidak ada aktivitas siswa terbaru untuk ditampilkan.',
                ],
                'showing_recent' => 'Menampilkan :count aktivitas terbaru (dari :total total)',
                'showing_recent_for_course' => 'Menampilkan :count aktivitas terbaru untuk :course',
                'tabs' => [
                    'overview' => 'Ikhtisar',
                    'courses' => 'Kursus',
                    'recent_activity' => 'Aktivitas Terbaru',
                    'no_progress' => 'Siswa Tanpa Progres',
                ],
                'no_progress' => [
                    'title' => 'Siswa Tanpa Progres',
                    'students_count' => 'siswa',
                    'columns' => [
                        'name' => 'Nama Siswa',
                        'email' => 'Email',
                        'status' => 'Status',
                    ],
                    'status' => [
                        'not_started' => 'Belum Dimulai',
                    ],
                    'all_students_active' => [
                        'title' => 'Semua Siswa Aktif!',
                        'description' => 'Semua siswa dalam kursus ini telah mulai mengerjakan materi.',
                    ],
                ],
                'loading' => [
                    'no_progress_data' => 'Memuat data siswa...',
                ],
                'dialog' => [
                    'course_progress_title' => 'Progres Kursus',
                ],
            ],
        ],
        'admin' => [
            'title' => 'Admin Overview',
            'subtitle' => 'Dashboard ringkasan untuk Administrator',
            'charts' => [
                'users_bar' => [
                    'title' => 'Users (Bar Chart)',
                    'description' => '6-month Growth',
                    'footer' => 'Trending up',
                ],
                'user_roles_pie' => [
                    'title' => 'Peran Pengguna (Diagram Lingkaran)',
                    'description' => 'Admin / Guru / Siswa',
                    'total_label' => 'total',
                ],
                'site_visits_line' => [
                    'title' => 'Kunjungan Situs (Diagram Garis)',
                    'description' => 'Data satu minggu',
                ],
                'radar_example' => [
                    'title' => 'Contoh Diagram Radar',
                    'description' => 'Januari vs Juni',
                ],
            ],
        ],
        'student_tracking' => [
            'title' => 'Sistem Pelacakan Tugas Siswa',
            'description' => 'Lacak kemajuan siswa melalui kursus, materi, dan soal',
            'no_data' => [
                'title' => 'Tidak ada data tersedia',
                'description' => 'Data kemajuan siswa saat ini tidak tersedia.',
            ],
            'no_courses' => [
                'title' => 'Tidak Ada Kursus Tersedia',
                'subtitle' => 'Silakan periksa kembali nanti.',
                'description' => 'Saat ini tidak ada kursus yang tersedia untuk dilacak.',
            ],
            'loading' => [
                'dashboard_data' => 'Memuat data dashboard...',
                'progress_data' => 'Memuat data kemajuan siswa...',
                'course_details' => 'Memuat detail kursus...',
                'student_details' => 'Memuat detail siswa...',
            ],
            'tabs' => [
                'overview' => 'Ringkasan',
                'courses' => 'Kursus',
                'students' => 'Siswa',
            ],
            'sections' => [
                'learning_materials' => 'Materi Pembelajaran',
                'course_completion' => 'Ringkasan Penyelesaian Kursus',
                'top_students' => 'Siswa Berprestasi Tertinggi',
            ],
            'stats' => [
                'total_courses' => 'Total Kursus',
                'total_students' => 'Total Siswa',
                'completed_courses' => 'Kursus Selesai',
            ],
            'labels' => [
                'students' => 'siswa',
                'materials' => 'materi',
                'avg_completion' => 'Rata-rata Penyelesaian',
                'questions' => 'soal',
                'complete' => 'Selesai',
                'courses' => 'kursus',
                'enrolled_in' => 'Terdaftar dalam',
                'students_enrolled' => 'siswa terdaftar',
            ],
            'columns' => [
                'student' => 'Siswa',
                'completed' => 'Selesai',
                'progress' => 'Kemajuan',
                'status' => 'Status',
                'material' => 'Materi',
                'courses' => 'Kursus',
                'avg_score' => 'Nilai Rata-rata',
                'student_name' => 'Nama Siswa',
                'actions' => 'Aksi',
            ],
            'status' => [
                'complete' => 'Selesai',
                'in_progress' => 'Dalam Proses',
                'not_started' => 'Belum Dimulai',
            ],
            'actions' => [
                'view_details' => 'Lihat Detail',
                'view_progress' => 'Lihat Kemajuan',
            ],
            'instructions' => [
                'click_student' => 'Klik pada siswa untuk melihat kemajuan detail mereka di semua kursus dan materi.',
            ],
            'dialogs' => [
                'course_details' => [
                    'title' => 'Detail Kursus: :name',
                    'description' => 'Kemajuan siswa untuk setiap materi pembelajaran',
                ],
                'student_progress' => [
                    'title' => 'Kemajuan Siswa: :name',
                    'description' => 'Kemajuan detail di semua kursus dan materi',
                ],
            ],
        ],
        'active_users' => [
            'title' => 'Pengguna Aktif',
            'description' => 'Pengguna yang sedang online dalam 15 menit terakhir',
            'no_active_users' => 'Tidak ada pengguna aktif saat ini',
            'loading' => 'Memuat pengguna aktif...',
            'error_loading' => 'Gagal memuat pengguna aktif',
            'total_active' => 'aktif',
            'users_count' => ' pengguna',
            'and_more' => 'dan :count lainnya...',
            'last_updated' => 'Terakhir diperbarui',
        ],
        'admin' => [
            'title' => 'Ringkasan Admin',
            'subtitle' => 'Dashboard ringkasan untuk Administrator',
            'charts' => [
                'users_bar' => [
                    'title' => 'Pengguna (Grafik Batang)',
                    'description' => 'Pertumbuhan 6 bulan',
                    'footer' => 'Trending naik',
                ],
                'user_roles_pie' => [
                    'title' => 'Peran Pengguna (Grafik Lingkaran)',
                    'description' => 'Admin / Guru / Siswa',
                    'total_label' => 'total',
                ],
                'site_visits_line' => [
                    'title' => 'Kunjungan Situs (Grafik Garis)',
                    'description' => 'Data satu minggu',
                ],
                'radar_example' => [
                    'title' => 'Contoh Grafik Radar',
                    'description' => 'Januari vs Juni',
                ],
            ],
        ],
        'student_tracking' => [
            'title' => 'Sistem Pelacakan Tugas Siswa',
            'description' => 'Lacak kemajuan siswa melalui kursus, materi, dan soal',
            'no_data' => [
                'title' => 'Tidak ada data tersedia',
                'description' => 'Data kemajuan siswa saat ini tidak tersedia.',
            ],
            'no_courses' => [
                'title' => 'Tidak Ada Kursus Tersedia',
                'subtitle' => 'Silakan periksa kembali nanti.',
                'description' => 'Saat ini tidak ada kursus yang tersedia untuk dilacak.',
            ],
            'loading' => [
                'dashboard_data' => 'Memuat data dashboard...',
                'progress_data' => 'Memuat data kemajuan siswa...',
                'course_details' => 'Memuat detail kursus...',
                'student_details' => 'Memuat detail siswa...',
            ],
            'tabs' => [
                'overview' => 'Ringkasan',
                'courses' => 'Kursus',
                'students' => 'Siswa',
            ],
            'sections' => [
                'learning_materials' => 'Materi Pembelajaran',
                'course_completion' => 'Ringkasan Penyelesaian Kursus',
                'top_students' => 'Siswa Berprestasi Tertinggi',
            ],
            'stats' => [
                'total_courses' => 'Total Kursus',
                'total_students' => 'Total Siswa',
                'completed_courses' => 'Kursus Selesai',
            ],
            'labels' => [
                'students' => 'siswa',
                'materials' => 'materi',
                'avg_completion' => 'Rata-rata Penyelesaian',
                'questions' => 'soal',
                'complete' => 'Selesai',
                'courses' => 'kursus',
                'enrolled_in' => 'Terdaftar di',
                'students_enrolled' => 'siswa terdaftar',
            ],
            'columns' => [
                'student' => 'Siswa',
                'completed' => 'Selesai',
                'progress' => 'Kemajuan',
                'status' => 'Status',
                'material' => 'Materi',
                'courses' => 'Kursus',
                'avg_score' => 'Nilai Rata-rata',
                'student_name' => 'Nama Siswa',
                'actions' => 'Aksi',
            ],
            'status' => [
                'complete' => 'Selesai',
                'in_progress' => 'Dalam Proses',
                'not_started' => 'Belum Dimulai',
            ],
            'actions' => [
                'view_details' => 'Lihat Detail',
                'view_progress' => 'Lihat Kemajuan',
            ],
            'instructions' => [
                'click_student' => 'Klik pada siswa untuk melihat kemajuan detail mereka di semua kursus dan materi.',
            ],
            'dialogs' => [
                'course_details' => [
                    'title' => 'Detail Kursus: :name',
                    'description' => 'Kemajuan siswa untuk setiap materi pembelajaran',
                ],
                'student_progress' => [
                    'title' => 'Kemajuan Siswa: :name',
                    'description' => 'Kemajuan detail di semua kursus dan materi',
                ],
            ],
        ],
    ],
    'student_cognitive_classification' => [
        'index' => [
            'title' => 'Klasifikasi Kognitif Siswa',
        ],
        'create' => [
            'title' => 'Buat Klasifikasi Kognitif Siswa',
        ],
        'edit' => [
            'title' => 'Edit Klasifikasi Kognitif Siswa',
        ],
        'show' => [
            'title' => 'Detail Klasifikasi Kognitif Siswa',
        ],
        'columns' => [
            'student' => 'Siswa',
            'course' => 'Kursus',
            'classification_type' => 'Jenis Klasifikasi',
            'classification_level' => 'Tingkat Klasifikasi',
            'classification_score' => 'Skor Klasifikasi',
            'classified_at' => 'Diklasifikasikan Pada',
        ],
        'fields' => [
            'user_id' => 'Siswa',
            'course_id' => 'Kursus',
            'course' => 'Kursus',
            'classification_type' => 'Jenis Klasifikasi',
            'classification_level' => 'Tingkat Klasifikasi',
            'classification_score' => 'Skor Klasifikasi',
            'raw_data' => 'Data Mentah',
            'classified_at' => 'Diklasifikasikan Pada',
            'export_format' => 'Format Ekspor',
            'include_classification' => 'Sertakan Hasil Klasifikasi',
            'include_classification_description' => 'Sertakan hasil klasifikasi kognitif dalam lembar ekspor',
        ],
        'placeholders' => [
            'select_student' => 'Pilih siswa',
            'select_course' => 'Pilih kursus',
            'select_classification_type' => 'Pilih jenis klasifikasi',
            'select_export_format' => 'Pilih format ekspor',
        ],
        'export_formats' => [
            'raw' => 'Format Data Mentah',
            'ml_tool' => 'Format Alat ML (RapidMiner)',
        ],
        'buttons' => [
            'run_classification' => 'Jalankan Klasifikasi',
            'start_classification' => 'Mulai Klasifikasi',
            'export_excel' => 'Ekspor Klasifikasi',
            'export_raw_data' => 'Ekspor Data Mentah',
            'start_export' => 'Mulai Ekspor',
        ],
        'dialogs' => [
            'classification' => [
                'title' => 'Jalankan Klasifikasi Kognitif',
                'description' => 'Pilih kursus dan jenis klasifikasi untuk menjalankan proses klasifikasi kognitif untuk semua siswa dalam kursus.',
            ],
            'export' => [
                'title' => 'Ekspor Klasifikasi',
                'description' => 'Ini akan mengekspor semua data klasifikasi ke file Excel',
            ],
            'export_raw_data' => [
                'title' => 'Ekspor Data Klasifikasi Mentah',
                'description' => 'Ini akan mengekspor data mentah siswa yang digunakan untuk klasifikasi ke file Excel. Pilih kursus untuk mengekspor data.',
            ],
            'delete' => [
                'title' => 'Hapus Klasifikasi',
                'description' => 'Apakah Anda yakin ingin menghapus klasifikasi ini? Tindakan ini tidak dapat dibatalkan.',
            ],
        ],
        'messages' => [
            'classification_running' => 'Menjalankan proses klasifikasi...',
            'classification_success' => 'Klasifikasi berhasil diselesaikan',
            'classification_error' => 'Error menjalankan klasifikasi',
            'export_started' => 'Ekspor dimulai. Unduhan Anda akan segera dimulai.',
            'raw_data_export_started' => 'Ekspor data mentah dimulai. Unduhan Anda akan segera dimulai.',
            'deleting' => 'Menghapus klasifikasi...',
            'delete_success' => 'Klasifikasi berhasil dihapus',
            'delete_error' => 'Error menghapus klasifikasi',
        ],
        'sections' => [
            'classifications' => 'Klasifikasi Kognitif',
        ],
        'descriptions' => [
            'classifications' => 'Lihat semua klasifikasi kognitif siswa dalam sistem',
        ],
        'classification_types' => [
            'topsis' => 'Metode TOPSIS',
            'fuzzy' => 'Logika Fuzzy',
            'neural' => 'Jaringan Neural',
        ],
    ],
    'test_case_change_tracker' => [
        'index' => [
            'title' => 'Pelacakan Perubahan Kasus Uji',
        ],
        'sections' => [
            'upcoming' => 'Eksekusi Ulang yang Akan Datang',
            'history' => 'Riwayat Eksekusi',
        ],
        'tabs' => [
            'upcoming' => 'Akan Datang',
            'history' => 'Riwayat',
        ],
        'columns' => [
            'course' => 'Kursus',
            'material' => 'Materi Pembelajaran',
            'question' => 'Soal',
            'change_type' => 'Jenis Perubahan',
            'affected_students' => 'Siswa Terdampak',
            'time_remaining' => 'Waktu Tersisa',
            'actions' => 'Aksi',
            'status' => 'Status',
            'scheduled_at' => 'Dijadwalkan Pada',
            'completed_at' => 'Diselesaikan Pada',
        ],
        'change_types' => [
            'created' => 'Dibuat',
            'updated' => 'Diperbarui',
            'deleted' => 'Dihapus',
        ],
        'status' => [
            'pending' => 'Pending',
            'in_progress' => 'Dalam Proses',
            'completed' => 'Selesai',
            'failed' => 'Gagal',
            'imminent' => 'Segera',
        ],
        'buttons' => [
            'execute_now' => 'Eksekusi Sekarang',
        ],
        'stats' => [
            'pending' => 'Eksekusi Ulang Pending',
            'completed' => 'Eksekusi Ulang Selesai',
            'failed' => 'Eksekusi Ulang Gagal',
            'pending_description' => 'Perubahan kasus uji menunggu eksekusi ulang',
            'completed_description' => 'Eksekusi ulang berhasil diselesaikan',
            'failed_description' => 'Eksekusi ulang yang mengalami error',
        ],
        'labels' => [
            'total' => 'total',
            'passed' => 'lulus',
            'failed' => 'gagal',
        ],
        'messages' => [
            'pending' => [
                'execute' => 'Mengeksekusi validasi kode siswa...',
            ],
            'success' => [
                'execute' => 'Eksekusi berhasil diantrekan',
            ],
            'error' => [
                'execute' => 'Gagal mengantrekan eksekusi',
            ],
        ],
    ],

    'classification' => [
        'dialog' => [
            'title' => 'Detail Klasifikasi',
            'description' => 'Langkah-langkah detail dari proses klasifikasi',
        ],
        'material_dialog' => [
            'title' => 'Detail Klasifikasi Materi',
            'description' => 'Informasi detail tentang klasifikasi kognitif materi',
        ],
        'course_dialog' => [
            'title' => 'Detail Klasifikasi Kursus',
            'description' => 'Informasi detail tentang klasifikasi kognitif kursus',
        ],
        'report_dialog' => [
            'title' => 'Laporan Klasifikasi Kognitif',
        ],
        'cards' => [
            'benefit_criteria' => 'Kriteria Keuntungan',
            'cost_criteria' => 'Kriteria Biaya',
            'classification_result' => 'Hasil Klasifikasi',
            'rule_base_mapping' => 'Pemetaan Basis Aturan',
            'calculation_process' => 'Proses Perhitungan',
            'classification_overview' => 'Ringkasan Klasifikasi',
            'material_details' => 'Detail Materi',
            'material_classification' => 'Klasifikasi Materi',
            'recommendations' => 'Rekomendasi',
            'areas_for_improvement' => 'Area untuk Perbaikan',
            'question_performance' => 'Performa Soal',
            'additional_information' => 'Informasi Tambahan',
            'test_case_metrics' => 'Metrik Kasus Uji',
            'classification_history_memory' => 'Riwayat Klasifikasi (Tes Memori)',
        ],
        'section_headers' => [
            'column_sums' => 'Jumlah Kolom',
            'normalized_matrix' => 'Matriks Ternormalisasi',
            'weights' => 'Bobot',
            'weighted_matrix' => 'Matriks Berbobot',
            'ideal_solutions' => 'Solusi Ideal',
            'performance_scores' => 'Skor Performa',
            'final_score' => 'Skor Akhir',
            'final_level' => 'Tingkat Akhir',
            'material_classifications' => 'Klasifikasi Materi',
            'calculation_details' => 'Detail Perhitungan',
            'students_by_level' => 'Siswa per Tingkat',
            'cognitive_classification_report' => 'Laporan Klasifikasi Kognitif',
        ],
        'labels' => [
            'benefits' => 'Keuntungan:',
            'costs' => 'Biaya:',
            'course' => 'Kursus:',
            'benefit_up' => 'Keuntungan ↑',
            'cost_down' => 'Biaya ↓',
            'overall_test_case_completion' => 'Penyelesaian Kasus Uji Keseluruhan',
            'no_test_case_metrics' => 'Tidak ada metrik kasus uji tersedia.',
            'not_specified' => 'Tidak ditentukan',
            'unknown_student' => 'Siswa Tidak Dikenal',
            'unknown_material' => 'Materi Tidak Dikenal',
        ],
        'table_headers' => [
            'material' => 'Materi',
            'material_name' => 'Nama Materi',
            'solution' => 'Solusi',
            'alternative' => 'Alternatif',
            'performance_score' => 'Skor Performa (Ci)',
            'level' => 'Tingkat',
            'score_range' => 'Rentang Skor',
            'score' => 'Skor',
            'question' => 'Soal',
            'completed' => 'Selesai',
            'total' => 'Total',
            'completion_rate' => 'Tingkat Penyelesaian',
            'compiles' => 'Kompilasi',
            'time_min' => 'Waktu (menit)',
            'complete' => 'Selesai',
            'trial' => 'Percobaan',
            'variables' => 'Variabel',
            'functions' => 'Fungsi',
            'test_cases' => 'Kasus Uji',
            'compile_count' => 'compile_count',
            'coding_time' => 'coding_time',
            'trial_status' => 'trial_status',
            'completion_status' => 'completion_status',
            'variable_count' => 'variable_count',
            'function_count' => 'function_count',
            'test_case_rate' => 'test_case_rate',
        ],
        'status' => [
            'loading' => 'Memuat detail klasifikasi...',
            'error_title' => 'Error',
            'error_message' => 'Gagal memuat detail klasifikasi',
            'material_error' => 'Error memuat detail klasifikasi materi. Silakan coba lagi.',
            'material_error_failed' => 'Gagal memuat detail klasifikasi materi',
        ],
    ],

    // Permission Messages
    'permission' => [
        'messages' => [
            'loading' => 'Memperbarui izin...',
            'success' => 'Izin berhasil diperbarui',
            'error' => 'Terjadi error saat memperbarui izin',
        ],
    ],

    // Sandbox
    'sandbox' => [
        'buttons' => [
            'submit' => 'Kirim',
        ],
    ],

    'welcome' => [
        'meta' => [
            'title' => 'Codeasy - Pembelajaran Python dan Data Science',
            'description' => 'Codeasy adalah platform pembelajaran Python untuk Data Science dengan analisis kognitif otomatis berdasarkan Taksonomi Bloom.',
            'og_title' => 'Codeasy - Pembelajaran Python dan Data Science',
            'og_description' => 'Platform pembelajaran interaktif dengan autograding dan analisis kognitif otomatis.',
        ],
        'navbar' => [
            'brand' => 'Codeasy',
            'navigation' => [
                'features' => 'Fitur',
                'how_it_works' => 'Cara Kerja',
                'testimonials' => 'Testimoni',
                'manual_book' => 'Buku Manual',
                'questionnaire' => 'Kuesioner',
                'dashboard' => 'Dashboard',
                'login' => 'Masuk',
                'get_started' => 'Mulai',
            ],
            'aria' => [
                'toggle_navigation' => 'Toggle Navigation',
            ],
        ],
        'hero' => [
            'badge' => 'Didukung oleh Machine Learning',
            'title' => 'Sistem Pembelajaran Data Science',
            'rotating_words' => [
                'data_science' => 'Data Science',
                'data_analytics' => 'Analitik Data',
                'business_intelligence' => 'Business Intelligence',
            ],
            'subtitle' => 'Tingkatkan pemahaman Anda tentang pemrograman Python untuk Data Science dengan sistem autograding dan analisis kognitif otomatis berdasarkan Taksonomi Bloom.',
            'cta' => [
                'get_started' => 'Mulai',
                'try_sandbox' => 'Coba Sandbox',
            ],
            'code_editor' => [
                'filename' => 'cognitive_analysis.py',
                'language' => 'Python • Machine Learning',
                'comments' => [
                    'load_data' => '# Muat data siswa',
                    'extract_features' => '# Ekstrak fitur dari submisi kode siswa',
                    'extract_labels' => '# Ekstrak label tingkat kognitif yang ada untuk pelatihan',
                    'split_data' => '# Bagi data untuk pelatihan dan pengujian',
                    'train_classifier' => '# Latih classifier tingkat kognitif',
                    'predict_levels' => '# Prediksi tingkat kognitif',
                    'output_accuracy' => '# Output akurasi model dan distribusi',
                ],
                'bloom_levels' => [
                    'remembering' => 'Mengingat',
                    'understanding' => 'Memahami',
                    'applying' => 'Menerapkan',
                    'analyzing' => 'Menganalisis',
                    'evaluating' => 'Mengevaluasi',
                    'creating' => 'Menciptakan',
                ],
                'output' => [
                    'model_accuracy' => 'Akurasi model:',
                    'cognitive_distribution' => 'Distribusi tingkat kognitif:',
                ],
                'legend' => [
                    'title' => 'Analisis Tingkat Kognitif',
                    'auto_generated' => 'Dihasilkan otomatis',
                    'analysis_result' => 'Analisis real-time menunjukkan akurasi 85% dalam klasifikasi tingkat kognitif',
                    'levels' => [
                        'remembering' => 'Mengingat',
                        'understanding' => 'Memahami',
                        'applying' => 'Menerapkan',
                        'analyzing' => 'Menganalisis',
                        'evaluating' => 'Mengevaluasi',
                        'creating' => 'Menciptakan',
                    ],
                ],
            ],
        ],
        'cognitive_analysis' => [
            'title' => 'Analisis Kognitif Real-time',
            'subtitle' => 'Berdasarkan Taksonomi Bloom',
            'levels' => [
                'remembering' => 'Mengingat',
                'understanding' => 'Memahami',
                'applying' => 'Menerapkan',
                'analyzing' => 'Menganalisis',
                'evaluating' => 'Mengevaluasi',
                'creating' => 'Menciptakan',
            ],
        ],
        'features' => [
            'badge' => 'Fitur Platform',
            'title' => 'Fitur Platform',
            'subtitle' => 'Solusi pembelajaran lengkap untuk Python Data Science',
            'cards' => [
                'autograding' => [
                    'title' => 'Penilaian Otomatis',
                    'description' => 'Umpan balik instan pada kode Python Anda dengan test case yang komprehensif',
                ],
                'cognitive_analysis' => [
                    'title' => 'Analisis Kognitif',
                    'description' => 'Penilaian real-time terhadap kemajuan pembelajaran berdasarkan Taksonomi Bloom',
                ],
                'skkni_curriculum' => [
                    'title' => 'Kurikulum SKKNI',
                    'description' => 'Kurikulum berdasarkan Standar Kompetensi Kerja Nasional Indonesia untuk Data Science',
                ],
            ],
            'items' => [
                'autograding' => [
                    'title' => 'Penilaian Otomatis',
                    'description' => 'Umpan balik instan pada kode Python Anda dengan test case yang komprehensif',
                ],
                'cognitive_analysis' => [
                    'title' => 'Analisis Kognitif',
                    'description' => 'Penilaian real-time terhadap kemajuan pembelajaran berdasarkan Taksonomi Bloom',
                ],
                'interactive_learning' => [
                    'title' => 'Pembelajaran Interaktif',
                    'description' => 'Latihan pemrograman hands-on dengan eksekusi kode langsung',
                ],
                'progress_tracking' => [
                    'title' => 'Pelacakan Kemajuan',
                    'description' => 'Analitik detail tentang perjalanan pembelajaran dan pengembangan keterampilan',
                ],
                'adaptive_system' => [
                    'title' => 'Sistem Adaptif',
                    'description' => 'Jalur pembelajaran yang dipersonalisasi berdasarkan performa individu',
                ],
                'real_time_feedback' => [
                    'title' => 'Umpan Balik Real-time',
                    'description' => 'Respons langsung terhadap submisi kode dan pemecahan masalah',
                ],
            ],
        ],
        'how_it_works' => [
            'badge' => 'Proses Sederhana',
            'title' => 'Cara Kerja Codeasy',
            'subtitle' => 'Langkah sederhana untuk menguasai Data Science',
            'steps' => [
                'choose_material' => [
                    'title' => 'Pilih Materi Pembelajaran',
                    'description' => 'Pilih dari kurikulum Python dan Data Science komprehensif kami berdasarkan standar SKKNI',
                ],
                'learn_concepts' => [
                    'title' => 'Pelajari Konsep Inti',
                    'description' => 'Pelajari fondasi teoretis dengan contoh interaktif dan aplikasi dunia nyata',
                ],
                'coding_practice' => [
                    'title' => 'Praktik Coding',
                    'description' => 'Tulis dan eksekusi kode Python di lingkungan pengembangan terintegrasi kami',
                ],
                'cognitive_analysis' => [
                    'title' => 'Dapatkan Analisis Kognitif',
                    'description' => 'Terima penilaian detail tentang tingkat pemahaman Anda berdasarkan Taksonomi Bloom',
                ],
            ],
        ],
        'statistics' => [
            'badge' => 'Platform Impact',
            'title' => 'Menciptakan Talenta Data Science Berkualitas',
            'subtitle' => 'Bergabung dengan ribuan pelajar dari berbagai institusi pendidikan di Indonesia',
            'stats' => [
                'active_students' => [
                    'number' => '10,000+',
                    'label' => 'Pelajar Aktif',
                ],
                'institutions' => [
                    'number' => '150+',
                    'label' => 'Institusi Pendidikan',
                ],
                'completion_rate' => [
                    'number' => '95%',
                    'label' => 'Tingkat Kelulusan',
                ],
                'industry_absorption' => [
                    'number' => '86%',
                    'label' => 'Alumni Terserap Industri',
                ],
            ],
        ],
        'testimonials' => [
            'badge' => 'Testimoni',
            'title' => 'Apa Kata Siswa',
            'subtitle' => 'Umpan balik dari komunitas pembelajaran kami',
            'reviews' => [
                'student_1' => [
                    'name' => 'Sarah Johnson',
                    'role' => 'Mahasiswa Ilmu Komputer',
                    'quote' => 'Codeasy membantu saya memahami konsep Data Science lebih baik dari platform lainnya. Analisis kognitifnya sangat membantu.',
                ],
                'instructor_1' => [
                    'name' => 'Dr. Ahmad Rahman',
                    'role' => 'Instruktur Data Science',
                    'quote' => 'Sistem autograding memberikan umpan balik instan yang mempercepat proses pembelajaran siswa secara signifikan.',
                ],
                'student_2' => [
                    'name' => 'Maria Garcia',
                    'role' => 'Mahasiswa Business Analytics',
                    'quote' => 'Saya suka bagaimana platform ini beradaptasi dengan kecepatan belajar saya dan memberikan tantangan yang dipersonalisasi.',
                ],
            ],
            'items' => [
                'testimonial_1' => [
                    'content' => 'Codeasy membantu saya memahami konsep Data Science lebih baik dari platform lainnya. Analisis kognitifnya sangat membantu.',
                    'author' => 'Sarah Johnson',
                    'role' => 'Mahasiswa Ilmu Komputer',
                ],
                'testimonial_2' => [
                    'content' => 'Sistem autograding memberikan umpan balik instan yang mempercepat proses pembelajaran saya secara signifikan.',
                    'author' => 'Ahmad Rahman',
                    'role' => 'Penggemar Data Science',
                ],
                'testimonial_3' => [
                    'content' => 'Saya suka bagaimana platform ini beradaptasi dengan kecepatan belajar saya dan memberikan tantangan yang dipersonalisasi.',
                    'author' => 'Maria Garcia',
                    'role' => 'Mahasiswa Business Analytics',
                ],
            ],
        ],
        'partners' => [
            'badge' => 'Mitra Kami',
            'title' => 'Dipercaya oleh Institusi Terkemuka',
            'placeholder' => 'Logo Mitra',
        ],
        'cta' => [
            'badge' => 'Mulai',
            'title' => 'Siap Mulai Belajar?',
            'subtitle' => 'Bergabung dengan ribuan siswa yang menguasai Data Science dengan Codeasy',
            'buttons' => [
                'register_now' => 'Daftar Sekarang',
                'learn_more' => 'Pelajari Lebih Lanjut',
            ],
            'button' => 'Mulai Sekarang',
        ],
        'footer' => [
            'brand' => 'Codeasy',
            'description' => 'Memberdayakan generasi berikutnya dari Data Scientists dengan platform pembelajaran bertenaga AI dan analisis kognitif.',
            'sections' => [
                'platform' => [
                    'title' => 'Platform',
                    'links' => [
                        'features' => 'Fitur',
                        'courses' => 'Kursus',
                        'pricing' => 'Harga',
                    ],
                ],
                'company' => [
                    'title' => 'Perusahaan',
                    'links' => [
                        'about_us' => 'Tentang Kami',
                        'blog' => 'Blog',
                        'careers' => 'Karir',
                    ],
                ],
                'legal' => [
                    'title' => 'Legal',
                    'links' => [
                        'privacy_policy' => 'Kebijakan Privasi',
                        'terms_of_service' => 'Syarat Layanan',
                    ],
                ],
            ],
            'copyright' => '© :year Codeasy. Semua hak dilindungi.',
            'links' => [
                'privacy' => 'Kebijakan Privasi',
                'terms' => 'Syarat Layanan',
                'contact' => 'Kontak',
            ],
        ],
    ],

    // Student Score Export
    'student_score' => [
        'export' => [
            'title' => 'Laporan Skor Siswa - Tingkat Penyelesaian per Materi',
            'course_label' => 'Kursus',
            'headers' => [
                'student_name' => 'Nama Siswa',
                'student_id' => 'ID Siswa',
                'overall_average' => 'Rata-rata Keseluruhan (%)',
                'material_completion' => '(% Selesai)',
            ],
            'filename' => 'data_tabular_skor_siswa',
            'dialog' => [
                'title' => 'Ekspor Skor Siswa',
                'description' => 'Ekspor file Excel yang menunjukkan tingkat penyelesaian untuk semua siswa di seluruh materi. Setiap sel menunjukkan persentase kasus uji yang diselesaikan.',
                'course_label' => 'Kursus',
                'select_course_placeholder' => 'Pilih kursus',
                'loading' => 'Memuat...',
                'buttons' => [
                    'export_excel' => 'Ekspor Excel',
                    'exporting' => 'Mengekspor...',
                ],
            ],
        ],
    ],
];
