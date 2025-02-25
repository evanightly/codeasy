<?php

return [
    'login' => [
        'title' => 'Willkommen zurück!',
        'fields' => [
            'identifier' => 'E-Mail oder Mitarbeiter-ID',
            'password' => 'Passwort',
            'remember' => 'Angemeldet bleiben',
        ],
        'buttons' => [
            'forgot_password' => 'Passwort vergessen?',
            'sign_in' => 'Anmelden',
        ],
    ],
    'user' => [
        'common' => [
            'fields' => [
                'name' => 'Name',
                'email' => 'E-Mail',
                'username' => 'Benutzername',
                'password' => 'Passwort',
                'password_confirmation' => 'Passwort bestätigen',
                'roles' => 'Rollen',
                'avatar' => 'Profilbild',
            ],
            'placeholders' => [
                'name' => 'Name eingeben',
                'email' => 'E-Mail eingeben',
                'username' => 'Benutzername eingeben',
                'password' => 'Passwort eingeben',
                'password_confirmation' => 'Passwort bestätigen',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Name ist erforderlich',
                    'min' => 'Name muss mindestens :min Zeichen lang sein',
                ],
                'email' => [
                    'required' => 'E-Mail ist erforderlich',
                    'invalid' => 'E-Mail ist ungültig',
                ],
                'username' => [
                    'required' => 'Benutzername ist erforderlich',
                ],
                'password' => [
                    'required' => 'Passwort ist erforderlich',
                    'min' => 'Passwort muss mindestens :min Zeichen lang sein',
                ],
                'password_confirmation' => [
                    'match' => 'Passwörter stimmen nicht überein',
                ],
            ],
            'messages' => [
                'not_found' => 'Benutzer nicht gefunden',
                'pending' => [
                    'create' => 'Benutzer wird erstellt...',
                    'update' => 'Benutzer wird aktualisiert...',
                    'delete' => 'Benutzer wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Benutzer erfolgreich erstellt',
                    'update' => 'Benutzer erfolgreich aktualisiert',
                    'delete' => 'Benutzer erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen des Benutzers',
                    'update' => 'Fehler beim Aktualisieren des Benutzers',
                    'delete' => 'Fehler beim Löschen des Benutzers',
                ],
            ],
        ],
        'index' => [
            'title' => 'Benutzer',
            'actions' => [
                'create' => 'Benutzer erstellen',
                'edit' => 'Benutzer bearbeiten',
                'delete' => 'Benutzer löschen',
            ],
            'columns' => [
                'name' => 'Name',
                'username' => 'Benutzername',
                'email' => 'E-Mail',
                'roles' => 'Rollen',
                'actions' => 'Aktionen',
            ],
        ],
        'create' => [
            'title' => 'Benutzer erstellen',
            'buttons' => [
                'create' => 'Erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Benutzer bearbeiten: :name',
            'fields' => [
                'password' => 'Neues Passwort (optional)',
                'roles' => 'Rollen',
            ],
            'buttons' => [
                'update' => 'Aktualisieren',
            ],
        ],
        'filters' => [
            'roles' => [
                'title' => 'Rollen',
                'options' => [
                    'teacher' => 'Lehrer',
                    'student' => 'Student',
                    'school_admin' => 'Schuladministrator',
                    'super_admin' => 'Superadministrator',
                ],
            ],
        ],
    ],
];
