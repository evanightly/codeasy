<?php

return [
    'auth' => [
        'unauthorized' => 'Anda tidak memiliki izin untuk mengakses sumber daya ini.',
        'role' => [
            'required' => 'Pengguna harus memiliki peran ":role"',
            'already_has' => 'Pengguna sudah memiliki peran ":role"',
        ],
        'permission' => [
            'required' => 'Pengguna harus memiliki izin ":permission"',
        ],
    ],
    'services' => [
        'school' => [
            'admin' => [
                'already_assigned' => 'Pengguna sudah menjadi administrator sekolah ini.',
                'different_role' => 'Pengguna sudah memiliki peran yang berbeda di sekolah ini.',
            ],
            'teacher' => [
                'already_assigned' => 'Pengguna sudah menjadi guru di sekolah ini.',
                'different_role' => 'Pengguna sudah memiliki peran yang berbeda di sekolah ini.',
            ],
            'student' => [
                'already_assigned' => 'Pengguna sudah menjadi siswa di sekolah ini.',
                'different_role' => 'Pengguna sudah memiliki peran yang berbeda di sekolah ini.',
                'all_already_assigned' => 'Semua siswa yang dipilih sudah ditugaskan ke sekolah ini.',
            ],
        ],
        'classroom' => [
            'unauthorized' => 'Tidak diizinkan untuk :action ruang kelas ini',
            'student' => [
                'already_assigned' => 'Siswa sudah ditugaskan ke ruang kelas ini',
                'all_already_assigned' => 'Semua siswa yang dipilih sudah ditugaskan ke ruang kelas ini',
            ],
        ],
        'school_request' => [
            'already_processed' => 'Permintaan sekolah sudah diproses',
        ],
    ],
    'repositories' => [
        'user' => [
            'school_required' => 'ID sekolah diperlukan untuk intent ini',
        ],
    ],
    'validation' => [
        'permission' => [
            'invalid_format' => 'Format izin tidak valid. Harus: resource-action dimana action adalah salah satu dari: :actions',
        ],
    ],
    'generic' => [
        'not_found' => ':resource tidak ditemukan',
        'already_exists' => ':resource sudah ada',
        'in_use' => ':resource sedang digunakan dan tidak dapat diubah',
        'unauthorized' => 'Anda tidak diizinkan untuk :action :resource ini',
    ],
];
