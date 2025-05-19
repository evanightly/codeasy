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
    'student_course_cognitive_classification' => [
        'index' => [
            'title' => 'Kognitive Kursklassifikationen der Studenten',
        ],
        'show' => [
            'title' => 'Kognitive Klassifikationsdetails',
        ],
        'sections' => [
            'classifications' => 'Kognitive Kursklassifikationen',
            'classification_info' => 'Klassifikationsinformationen',
            'material_classifications' => 'Materialklassifikationen',
            'details' => 'Klassifikationsdetails',
        ],
        'descriptions' => [
            'classifications' => 'Kognitive Klassifikationen der Studenten nach Kursen anzeigen und verwalten',
            'classification_info' => 'Grundlegende Informationen zur Klassifikation',
            'material_classifications' => 'Klassifikationsergebnisse für einzelne Lernmaterialien',
        ],
        'fields' => [
            'student' => 'Student',
            'course' => 'Kurs',
            'classification_type' => 'Klassifikationsmethode',
            'classification_level' => 'Kognitive Stufe',
            'classification_score' => 'Punktzahl',
            'classified_at' => 'Klassifikationsdatum',
            'recommendations' => 'Empfehlungen',
        ],
        'columns' => [
            'student' => 'Student',
            'course' => 'Kurs',
            'classification_type' => 'Methode',
            'classification_level' => 'Stufe',
            'classification_score' => 'Punktzahl',
            'classified_at' => 'Datum',
            'material' => 'Material',
            'actions' => 'Aktionen',
        ],
        'buttons' => [
            'export_excel' => 'Nach Excel exportieren',
            'view_report' => 'Bericht anzeigen',
            'generate_report' => 'Bericht generieren',
            'back' => 'Zurück zur Liste',
        ],
        'placeholders' => [
            'select_course' => 'Kurs auswählen',
            'select_classification_type' => 'Klassifikationsmethode auswählen',
        ],
        'dialogs' => [
            'report' => [
                'title' => 'Kursbericht generieren',
                'description' => 'Wählen Sie einen Kurs aus, um den Bericht zur kognitiven Klassifikation anzuzeigen',
            ],
            'delete' => [
                'title' => 'Klassifikation löschen',
                'description' => 'Sind Sie sicher, dass Sie diese Klassifikation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
            ],
        ],
        'messages' => [
            'no_material_classifications' => 'Keine Materialklassifikationen für diesen Kurs gefunden',
            'no_course_classifications' => 'Keine Kursklassifikationen gefunden',
            'deleting' => 'Klassifikation wird gelöscht...',
            'delete_success' => 'Klassifikation erfolgreich gelöscht',
            'delete_error' => 'Fehler beim Löschen der Klassifikation',
        ],
    ],
];
