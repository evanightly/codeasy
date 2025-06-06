<?php

return [
    'auth' => [
        'unauthorized' => 'Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.',
        'role' => [
            'required' => 'Der Benutzer muss die Rolle ":role" haben',
            'already_has' => 'Benutzer hat bereits die Rolle ":role"',
        ],
        'permission' => [
            'required' => 'Der Benutzer muss die Berechtigung ":permission" haben',
        ],
    ],
    'services' => [
        'school' => [
            'admin' => [
                'already_assigned' => 'Benutzer ist bereits Administrator dieser Schule.',
                'different_role' => 'Benutzer hat bereits eine andere Rolle in dieser Schule.',
            ],
            'teacher' => [
                'already_assigned' => 'Benutzer ist bereits Lehrer in dieser Schule.',
                'different_role' => 'Benutzer hat bereits eine andere Rolle in dieser Schule.',
            ],
            'student' => [
                'already_assigned' => 'Benutzer ist bereits Schüler in dieser Schule.',
                'different_role' => 'Benutzer hat bereits eine andere Rolle in dieser Schule.',
            ],
        ],
        'classroom' => [
            'unauthorized' => 'Nicht berechtigt, diesen Klassenraum zu :action',
            'student' => [
                'already_assigned' => 'Schüler ist bereits diesem Klassenraum zugewiesen',
            ],
        ],
        'school_request' => [
            'already_processed' => 'Schulanfrage wurde bereits bearbeitet',
        ],
    ],
    'repositories' => [
        'user' => [
            'school_required' => 'Schul-ID ist für diese Aktion erforderlich',
        ],
    ],
    'validation' => [
        'permission' => [
            'invalid_format' => 'Ungültiges Berechtigungsformat. Muss sein: ressource-aktion wobei aktion eine von: :actions ist',
        ],
    ],
    'generic' => [
        'not_found' => ':resource nicht gefunden',
        'already_exists' => ':resource existiert bereits',
        'in_use' => ':resource wird derzeit verwendet und kann nicht geändert werden',
        'unauthorized' => 'Sie sind nicht berechtigt, diese :resource zu :action',
    ],
];
