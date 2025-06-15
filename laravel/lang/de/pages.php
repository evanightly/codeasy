<?php

return [
    'common' => [
        'columns' => [
            'created_at' => 'Erstellt am',
            'updated_at' => 'Aktualisiert am',
            'timestamps' => 'Zeitinformationen',
        ],
    ],
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
    'auth' => [
        'login' => [
            'title' => 'Willkommen zurück',
            'subtitle' => 'Meistern Sie Data Science mit KI-gestützter Lernplattform',
            'description' => 'Erleben Sie personalisiertes Lernen mit Bloom\'s Taxonomie',
            'hero_title' => 'Codeasy',
            'fields' => [
                'identifier' => 'E-Mail oder Benutzername',
                'password' => 'Passwort',
                'remember' => 'Angemeldet bleiben',
            ],
            'buttons' => [
                'next' => 'Weiter',
                'back' => 'Zurück',
                'sign_in' => 'Anmelden',
                'sign_up' => 'Registrieren',
                'forgot_password' => 'Passwort vergessen?',
                'dont_have_account' => 'Noch kein Konto?',
            ],
            'messages' => [
                'authenticating' => 'Authentifizierung...',
                'success' => 'Erfolgreich angemeldet!',
                'error' => 'Ungültige Anmeldedaten',
            ],
            'features' => [
                'ai_assessment' => 'KI-gestützte kognitive Bewertung',
                'personalized_learning' => 'Adaptive Lernpfade',
                'real_world_projects' => 'Praktische Projekte',
            ],
            'placeholders' => [
                'identifier' => 'Geben Sie Ihre E-Mail oder Ihren Benutzernamen ein',
                'password' => 'Geben Sie Ihr Passwort ein',
            ],
            'ui' => [
                'welcome_back_header' => 'Willkommen zurück',
                'continue_journey' => 'Setzen Sie Ihre Lernreise fort',
                'verifying_credentials' => 'Bitte warten Sie, während wir Ihre Anmeldedaten überprüfen...',
                'toggle_dark_mode' => 'Dunklen Modus umschalten',
                'switch_to_light' => 'Zum hellen Modus wechseln',
                'switch_to_dark' => 'Zum dunklen Modus wechseln',
            ],
        ],
        'register' => [
            'title' => 'Konto erstellen',
            'subtitle' => 'Beginnen Sie Ihre Data Science-Reise mit personalisiertem Lernen',
            'description' => 'Erstellen Sie Ihr Konto und entdecken Sie die Kraft der KI-gesteuerten Bildung',
            'hero_title' => 'Bei Codeasy anmelden',
            'fields' => [
                'name' => 'Name',
                'email' => 'E-Mail',
                'role' => 'Rolle',
                'school' => 'Schule',
                'password' => 'Passwort',
                'password_confirmation' => 'Passwort bestätigen',
                'already_registered' => 'Bereits registriert?',
                'select_role' => 'Rolle auswählen',
                'select_school' => 'Schule auswählen',
                'reset_role' => 'Auswahl löschen',
            ],
            'buttons' => [
                'register' => 'Registrieren',
            ],
            'messages' => [
                'pending' => 'Konto wird erstellt...',
                'success' => 'Konto erfolgreich erstellt!',
                'error' => 'Es gab ein Problem beim Erstellen Ihres Kontos',
            ],
            'features' => [
                'intelligent_assessment' => 'Intelligente Bewertung & Feedback',
                'progress_tracking' => 'Fortschrittsverfolgung & Analytics',
                'comprehensive_materials' => 'Umfassende Lernmaterialien',
            ],
            'placeholders' => [
                'name' => 'Geben Sie Ihren vollständigen Namen ein',
                'email' => 'Geben Sie Ihre E-Mail-Adresse ein',
                'password' => 'Erstellen Sie ein sicheres Passwort',
                'password_confirmation' => 'Bestätigen Sie Ihr Passwort',
            ],
            'ui' => [
                'get_started' => 'Loslegen',
                'create_account_subtitle' => 'Erstellen Sie Ihr Konto, um mit dem Lernen zu beginnen',
                'toggle_dark_mode' => 'Dunklen Modus umschalten',
                'switch_to_light' => 'Zum hellen Modus wechseln',
                'switch_to_dark' => 'Zum dunklen Modus wechseln',
            ],
        ],
        'verify_email' => [
            'resend_button' => 'Verifizierungs-E-Mail erneut senden',
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
                'profile_image' => 'Profilbild',
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
                    'min' => 'Der Name muss mindestens :min Zeichen lang sein',
                ],
                'email' => [
                    'required' => 'E-Mail ist erforderlich',
                    'invalid' => 'Die E-Mail ist ungültig',
                ],
                'username' => [
                    'required' => 'Benutzername ist erforderlich',
                ],
                'password' => [
                    'required' => 'Passwort ist erforderlich',
                    'min' => 'Das Passwort muss mindestens :min Zeichen lang sein',
                ],
                'password_confirmation' => [
                    'match' => 'Die Passwortbestätigung stimmt nicht überein',
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
                'import_students' => 'Schüler importieren',
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
            'fields' => [
                'password' => 'Passwort',
                'avatar_help' => 'Dateien hierher ziehen oder klicken, um sie hochzuladen',
            ],
            'buttons' => [
                'create' => 'Benutzer erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Benutzer bearbeiten: :name',
            'fields' => [
                'password' => 'Neues Passwort (optional)',
                'roles' => 'Rollen',  // Fehlende Übersetzung hinzugefügt
            ],
            'buttons' => [
                'update' => 'Benutzer aktualisieren',  // Fehlende Übersetzung hinzugefügt
            ],
        ],
        'show' => [
            'title' => 'Benutzerdetails: :name',
            'no_username' => 'Kein Benutzername festgelegt',
            'no_roles' => 'Keine Rollen diesem Benutzer zugewiesen',
            'sections' => [
                'information' => 'Informationen',
                'contact_information' => 'Kontaktinformationen',
                'roles' => 'Rollen',
                'timestamps' => 'Zeitinformationen',
            ],
        ],
        'filters' => [
            'roles' => [
                'title' => 'Rollen',
                'options' => [
                    'teacher' => 'Lehrer',
                    'student' => 'Schüler',
                    'school_admin' => 'Schuladmin',
                    'super_admin' => 'Superadmin',
                ],
            ],
        ],
        'import' => [
            'upload_title' => 'Datei für Schülerupload',
            'title' => 'Schüler importieren',
            'description' => 'Laden Sie eine CSV- oder Excel-Datei hoch, um Schüler in Bulk zu importieren. Stellen Sie sicher, dass Ihre Datei das erforderliche Format hat.',
            'download_excel_template' => 'Excel-Vorlage herunterladen',
            'download_csv_template' => 'CSV-Vorlage herunterladen',
            'template_description' => 'Laden Sie eine Vorlagendatei herunter, um das erforderliche Format für den Import von Schülern zu sehen.',
            'buttons' => [
                'cancel' => 'Abbrechen',
                'preview' => 'Vorschau',
                'confirm_import' => 'Import bestätigen',
            ],
            'previewing' => 'Datei wird für Vorschau gescannt...',
            'preview_error' => 'Beim Erstellen der Vorschau der Datei ist ein Fehler aufgetreten. Bitte überprüfen Sie das Format und versuchen Sie es erneut.',
            'preview_success' => 'Dateivorschau erfolgreich. Überprüfen Sie die unten angezeigten Daten vor dem Import.',
            'import_error' => 'Beim Importieren der Datei ist ein Fehler aufgetreten. Bitte überprüfen Sie das Format und versuchen Sie es erneut.',
            'import_success' => 'Datei erfolgreich importiert.',
            'importing' => 'Schüler werden importiert, bitte warten...',
            'preview' => [
                'title' => 'Importierte Schüler vorschauen',
                'description' => 'Überprüfen Sie die Daten vor dem Import. Stellen Sie sicher, dass alle Informationen korrekt sind.',
                'stats' => 'Vorschau-Statistiken',
                'students_list' => 'Schülerliste',
                'student_count' => 'Gesamtzahl der Schüler: :count',
            ],
        ],
    ],
    'permission' => [
        'edit' => [
            'title' => 'Berechtigung bearbeiten',
        ],
        'common' => [
            'fields' => [
                'name' => 'Berechtigungsname',
                'group' => 'Gruppe',
            ],
            'placeholders' => [
                'name' => 'z.B. users-create, roles-read',
            ],
            'help_texts' => [
                'name_format' => 'Der Berechtigungsname muss im Format: ressourcen-aktion vorliegen',
                'valid_actions' => 'Gültige Aktionen: :actions',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Der Berechtigungsname ist erforderlich',
                    'format' => 'Ungültiges Berechtigungsformat. Muss sein: ressourcen-aktion, wobei die Aktion eine der folgenden ist: :actions',
                ],
            ],
            'messages' => [
                'not_found' => 'Berechtigung nicht gefunden',
                'pending' => [
                    'create' => 'Berechtigung wird erstellt...',
                    'update' => 'Berechtigung wird aktualisiert...',
                    'delete' => 'Berechtigung wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Berechtigung erfolgreich erstellt',
                    'update' => 'Berechtigung erfolgreich aktualisiert',
                    'delete' => 'Berechtigung erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen der Berechtigung',
                    'update' => 'Fehler beim Aktualisieren der Berechtigung',
                    'delete' => 'Fehler beim Löschen der Berechtigung',
                ],
            ],
        ],
        'index' => [
            'title' => 'Berechtigungen',
            'actions' => [
                'create' => 'Berechtigung erstellen',
                'edit' => 'Berechtigung bearbeiten',
                'delete' => 'Berechtigung löschen',
            ],
            'columns' => [
                'name' => 'Name',
                'group' => 'Gruppe',
                'actions' => 'Aktionen',
            ],
        ],
        'create' => [
            'title' => 'Berechtigung erstellen',
            'buttons' => [
                'create' => 'Berechtigung erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Berechtigung bearbeiten: :name',
            'buttons' => [
                'update' => 'Berechtigung aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Berechtigungsdetails: :name',
            'no_roles' => 'Keine Rollen dieser Berechtigung zugewiesen',
            'fields' => [
                'guard_name' => 'Guard-Name',
                'action' => 'Aktion',
            ],
            'sections' => [
                'information' => 'Informationen',
                'roles' => 'Zugewiesene Rollen',
                'timestamps' => 'Zeitinformationen',
            ],
        ],
    ],
    'role' => [
        'common' => [
            'fields' => [
                'name' => 'Rollenname',
                'guard_name' => 'Guard-Name',
                'permissions' => 'Berechtigungen',
            ],
            'placeholders' => [
                'name' => 'Rollenname eingeben',
                'guard_name' => 'web',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Der Rollenname ist erforderlich',
                ],
            ],
            'messages' => [
                'not_found' => 'Rolle nicht gefunden',
                'pending' => [
                    'create' => 'Rolle wird erstellt...',
                    'update' => 'Rolle wird aktualisiert...',
                    'delete' => 'Rolle wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Rolle erfolgreich erstellt',
                    'update' => 'Rolle erfolgreich aktualisiert',
                    'delete' => 'Rolle erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen der Rolle',
                    'update' => 'Fehler beim Aktualisieren der Rolle',
                    'delete' => 'Fehler beim Löschen der Rolle',
                ],
            ],
        ],
        'index' => [
            'title' => 'Rollen',
            'actions' => [
                'create' => 'Rolle erstellen',
                'edit' => 'Rolle bearbeiten',
                'delete' => 'Rolle löschen',
            ],
            'columns' => [
                'name' => 'Name',
                'guard_name' => 'Guard',
                'users' => 'Benutzer',
                'actions' => 'Aktionen',
            ],
        ],
        'create' => [
            'title' => 'Rolle erstellen',
            'buttons' => [
                'create' => 'Rolle erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Rolle bearbeiten: :name',
            'buttons' => [
                'update' => 'Rolle aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Roldetails: :name',
            'no_permissions' => 'Keine Berechtigungen dieser Rolle zugewiesen',
            'no_users' => 'Keine Benutzer dieser Rolle zugewiesen',
            'sections' => [
                'information' => 'Informationen',
                'permissions' => 'Berechtigungen',
                'users' => 'Benutzer',
                'timestamps' => 'Zeitinformationen',
            ],
        ],
    ],
    'school' => [
        'common' => [
            'fields' => [
                'name' => 'Schulname',
                'address' => 'Adresse',
                'city' => 'Stadt',
                'state' => 'Bundesland',
                'zip' => 'PLZ',
                'phone' => 'Telefon',
                'email' => 'E-Mail',
                'website' => 'Webseite',
                'active' => 'Aktivitätsstatus',
            ],
            'placeholders' => [
                'name' => 'Schulname eingeben',
                'address' => 'Schuladresse eingeben',
                'city' => 'Stadt eingeben',
                'state' => 'Bundesland eingeben',
                'zip' => 'PLZ eingeben',
                'phone' => 'Telefonnummer eingeben',
                'email' => 'Schul-E-Mail eingeben',
                'website' => 'Schul-Webseite eingeben',
                'select_user' => 'Benutzer auswählen',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Der Schulname ist erforderlich',
                ],
                'address' => [
                    'required' => 'Adresse ist erforderlich',
                ],
                'email' => [
                    'invalid' => 'Ungültiges E-Mail-Format',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Schule wird erstellt...',
                    'update' => 'Schule wird aktualisiert...',
                    'delete' => 'Schule wird gelöscht...',
                    'assign_admin' => 'Administrator wird zugewiesen...',
                    'unassign_admin' => 'Administrator wird entfernt...',
                    'assign_student' => 'Schüler werden zugewiesen...',
                    'unassign_student' => 'Schüler werden entfernt...',
                ],
                'success' => [
                    'create' => 'Schule erfolgreich erstellt',
                    'update' => 'Schule erfolgreich aktualisiert',
                    'delete' => 'Schule erfolgreich gelöscht',
                    'assign_admin' => 'Administrator erfolgreich zugewiesen',
                    'unassign_admin' => 'Administrator erfolgreich entfernt',
                    'assign_student' => 'Schüler erfolgreich zugewiesen',
                    'unassign_student' => 'Schüler erfolgreich entfernt',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen der Schule',
                    'update' => 'Fehler beim Aktualisieren der Schule',
                    'delete' => 'Fehler beim Löschen der Schule',
                    'assign_admin' => 'Fehler beim Zuweisen des Administrators',
                    'unassign_admin' => 'Fehler beim Entfernen des Administrators',
                    'assign_student' => 'Fehler beim Zuweisen der Schüler',
                    'unassign_student' => 'Fehler beim Entfernen der Schüler',
                ],
            ],
            'sections' => [
                'information' => 'Schulinformationen',
                'contact_information' => 'Kontaktinformationen',
                'administrators' => 'Administratoren',
                'teachers' => 'Lehrer',
                'students' => 'Schüler',
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
            'empty_states' => [
                'no_administrators' => 'Keine Administratoren zugewiesen',
                'no_teachers' => 'Keine Lehrer zugewiesen',
                'no_students' => 'Keine Schüler eingeschrieben',
            ],
        ],
        'index' => [
            'title' => 'Schulen',
            'actions' => [
                'create' => 'Schule erstellen',
                'show' => 'Details anzeigen',
                'edit' => 'Schule bearbeiten',
                'delete' => 'Schule löschen',
                'assign_admin' => 'Administrator zuweisen',
                'assign_student' => 'Schüler zuweisen',
            ],
            'columns' => [
                'name' => 'Name',
                'address' => 'Adresse',
                'city' => 'Stadt',
                'phone' => 'Telefon',
                'email' => 'E-Mail',
                'actions' => 'Aktionen',
            ],
        ],
        'create' => [
            'title' => 'Schule erstellen',
            'buttons' => [
                'create' => 'Schule erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Schule bearbeiten: :name',
            'buttons' => [
                'update' => 'Schule aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Schuldaten: :name',
            'buttons' => [
                'back' => 'Zurück zu den Schulen',
            ],
        ],
        'assign_admin' => [
            'title' => 'Schuladministrator zuweisen',
            'description' => 'Wählen Sie einen Benutzer aus, der als Schuladministrator zugewiesen werden soll',
            'buttons' => [
                'assign' => 'Administrator zuweisen',
                'cancel' => 'Abbrechen',
            ],
        ],
        'assign_student' => [
            'title' => 'Schüler zuweisen',
            'description' => 'Wählen Sie Schüler aus, die dieser Schule zugewiesen werden sollen',
            'buttons' => [
                'assign' => 'Schüler zuweisen',
            ],
        ],
        'assign_student' => [
            'title' => 'Schüler zuweisen',
            'description' => 'Wählen Sie einen Schüler aus, der dieser Schule zugewiesen werden soll',
            'buttons' => [
                'assign' => 'Schüler zuweisen',
            ],
        ],
    ],
    'school_request' => [
        'common' => [
            'fields' => [
                'school' => 'Schule',
                'user' => 'Benutzer',
                'message' => 'Nachricht',
                'status' => 'Status',
                'created_at' => 'Erstellt am',
            ],
            'placeholders' => [
                'school' => 'Wählen Sie eine Schule aus',
                'message' => 'Geben Sie Ihre Anfrage ein',
            ],
            'default_messages' => [
                'student' => 'Anfrage zur Registrierung als Schüler',
                'teacher' => 'Anfrage zur Registrierung als Lehrer',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'Die Schule ist erforderlich',
                ],
                'user_id' => [
                    'required' => 'Der Benutzer ist erforderlich',
                ],
                'message' => [
                    'required' => 'Die Nachricht ist erforderlich',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Anfrage wird erstellt...',
                    'update' => 'Anfrage wird aktualisiert...',
                    'delete' => 'Anfrage wird gelöscht...',
                    'approve' => 'Anfrage wird genehmigt...',
                    'reject' => 'Anfrage wird abgelehnt...',
                ],
                'success' => [
                    'create' => 'Anfrage erfolgreich erstellt',
                    'update' => 'Anfrage erfolgreich aktualisiert',
                    'delete' => 'Anfrage erfolgreich gelöscht',
                    'approve' => 'Anfrage erfolgreich genehmigt',
                    'reject' => 'Anfrage erfolgreich abgelehnt',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen der Anfrage',
                    'update' => 'Fehler beim Aktualisieren der Anfrage',
                    'delete' => 'Fehler beim Löschen der Anfrage',
                    'approve' => 'Fehler beim Genehmigen der Anfrage',
                    'reject' => 'Fehler beim Ablehnen der Anfrage',
                    'already_requested' => 'Sie haben bereits eine Anfrage für diese Schule gestellt, die aussteht oder genehmigt wurde',
                ],
            ],
            'status' => [
                'pending' => 'Ausstehend',
                'approved' => 'Genehmigt',
                'rejected' => 'Abgelehnt',
            ],
        ],
        'index' => [
            'title' => 'Schulanfragen',
            'buttons' => [
                'create' => 'Anfrage erstellen',
            ],
            'columns' => [
                'school' => 'Schule',
                'message' => 'Nachricht',
                'status' => 'Status',
                'created_at' => 'Erstellt am',
                'actions' => 'Aktionen',
            ],
            'empty_state' => 'Keine Schulanfragen gefunden',
        ],
        'create' => [
            'title' => 'Schulanfrage erstellen',
            'buttons' => [
                'create' => 'Anfrage absenden',
            ],
        ],
        'edit' => [
            'title' => 'Schulanfrage bearbeiten',
            'buttons' => [
                'update' => 'Anfrage aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Schulanfragedetails',
            'buttons' => [
                'approve' => 'Genehmigen',
                'reject' => 'Ablehnen',
                'back' => 'Zurück zu den Anfragen',
            ],
        ],
    ],
    'student_course_cognitive_classification' => [
        'index' => [
            'title' => 'Kognitive Klassifikationen von Schülerkursen',
        ],
        'show' => [
            'title' => 'Details zur kognitiven Klassifikation',
        ],
        'sections' => [
            'classifications' => 'Kurskognitive Klassifikationen',
            'classification_info' => 'Klassifikationsinformationen',
            'material_classifications' => 'Materialklassifikationen',
            'details' => 'Klassifikationsdetails',
        ],
        'descriptions' => [
            'classifications' => 'Anzeigen und Verwalten der kognitiven Klassifikationen von Schülern nach Kurs',
            'classification_info' => 'Grundlegende Informationen zur Klassifikation',
            'material_classifications' => 'Klassifikationsergebnisse für einzelne Lernmaterialien',
        ],
        'fields' => [
            'student' => 'Schüler',
            'course' => 'Kurs',
            'classification_type' => 'Klassifikationsmethode',
            'classification_level' => 'Kognitives Niveau',
            'classification_score' => 'Punktzahl',
            'classified_at' => 'Klassifikationsdatum',
            'recommendations' => 'Empfehlungen',
        ],
        'columns' => [
            'student' => 'Schüler',
            'course' => 'Kurs',
            'classification_type' => 'Methode',
            'classification_level' => 'Niveau',
            'classification_score' => 'Punktzahl',
            'classified_at' => 'Datum',
            'material' => 'Material',
            'actions' => 'Aktionen',
        ],
        'buttons' => [
            'export_excel' => 'Nach Excel exportieren',
            'view_report' => 'Bericht anzeigen',
            'generate_report' => 'Bericht erstellen',
            'back' => 'Zurück zur Liste',
        ],
        'placeholders' => [
            'select_course' => 'Wählen Sie einen Kurs aus',
            'select_classification_type' => 'Wählen Sie die Klassifikationsmethode aus',
        ],
        'dialogs' => [
            'report' => [
                'title' => 'Kursbericht erstellen',
                'description' => 'Wählen Sie einen Kurs aus, um den Bericht zur kognitiven Klassifikation anzuzeigen',
            ],
            'delete' => [
                'title' => 'Klassifikation löschen',
                'description' => 'Sind Sie sicher, dass Sie diese Klassifikation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
            ],
            'export' => [
                'title' => 'Klassifikationen exportieren',
                'description' => 'Wählen Sie die Klassifikationen aus, die Sie exportieren möchten. Sie können alle oder nur bestimmte Klassifikationen auswählen.',
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
    'classroom' => [
        'common' => [
            'fields' => [
                'school' => 'Schule',
                'name' => 'Klassenraumname',
                'description' => 'Beschreibung',
                'grade' => 'Klasse',
                'year' => 'Schuljahr',
                'active' => 'Aktivitätsstatus',
                'status' => 'Status',
                'students' => 'Schüler',
                'student' => 'Schüler',
            ],
            'placeholders' => [
                'school' => 'Wählen Sie eine Schule aus',
                'name' => 'Klassenraumname eingeben',
                'description' => 'Klassenraumbeschreibung eingeben',
                'grade' => 'Klasse auswählen',
                'year' => 'Schuljahr eingeben',
                'active' => 'Aktivitätsstatus auswählen',
                'status' => 'Status auswählen',
                'students' => 'Schüler auswählen',
                'student' => 'Schüler auswählen',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'Die Schule ist erforderlich',
                ],
                'name' => [
                    'required' => 'Der Klassenraumname ist erforderlich',
                ],
                'grade' => [
                    'required' => 'Die Klasse ist erforderlich',
                ],
                'year' => [
                    'required' => 'Das Schuljahr ist erforderlich',
                ],
                'students' => [
                    'required' => 'Bitte wählen Sie mindestens einen Schüler aus',
                ],
                'student_id' => [
                    'required' => 'Bitte wählen Sie einen Schüler aus',
                ],
            ],
            'messages' => [
                'not_found' => 'Klassenraum nicht gefunden',
                'pending' => [
                    'create' => 'Klassenraum wird erstellt...',
                    'update' => 'Klassenraum wird aktualisiert...',
                    'delete' => 'Klassenraum wird gelöscht...',
                    'assign_student' => 'Schüler werden zugewiesen...',
                    'remove_student' => 'Schüler wird entfernt...',
                ],
                'success' => [
                    'create' => 'Klassenraum erfolgreich erstellt',
                    'update' => 'Klassenraum erfolgreich aktualisiert',
                    'delete' => 'Klassenraum erfolgreich gelöscht',
                    'assign_student' => 'Schüler erfolgreich zugewiesen',
                    'remove_student' => 'Schüler erfolgreich entfernt',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen des Klassenraums',
                    'update' => 'Fehler beim Aktualisieren des Klassenraums',
                    'delete' => 'Fehler beim Löschen des Klassenraums',
                    'unauthorized' => 'Sie sind nicht berechtigt, Klassenräume in dieser Schule zu verwalten',
                    'assign_student' => 'Fehler beim Zuweisen von Schülern',
                    'remove_student' => 'Fehler beim Entfernen des Schülers',
                ],
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
        ],
        'index' => [
            'title' => 'Klassenräume',
            'buttons' => [
                'create' => 'Klassenraum erstellen',
            ],
            'search_placeholder' => 'Nach Klassenräumen suchen...',
            'empty_state' => 'Keine Klassenräume gefunden',
        ],
        'create' => [
            'title' => 'Klassenraum erstellen',
            'buttons' => [
                'create' => 'Klassenraum erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Klassenraum bearbeiten',
            'buttons' => [
                'update' => 'Klassenraum aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Klassenraumdetails',
            'sections' => [
                'information' => 'Informationen',
                'students' => 'Schüler',
            ],
            'student_columns' => [
                'name' => 'Name',
                'email' => 'E-Mail',
                'actions' => 'Aktionen',
            ],
            'buttons' => [
                'assign_student' => 'Schüler zuweisen',
            ],
            'empty_states' => [
                'no_students' => 'Keine Schüler diesem Klassenraum zugewiesen',
            ],
            'dialogs' => [
                'assign_student' => [
                    'title' => 'Schüler zuweisen',
                    'description' => 'Wählen Sie Schüler aus, die diesem Klassenraum zugewiesen werden sollen',
                    'buttons' => [
                        'assign' => 'Schüler zuweisen',
                    ],
                ],
            ],
        ],
    ],
    'course' => [
        'common' => [
            'fields' => [
                'name' => 'Kursname',
                'description' => 'Beschreibung',
                'classroom' => 'Klassenraum',
                'teacher' => 'Lehrer',
                'active' => 'Aktivitätsstatus',
                'status' => 'Status',
                'workspace_lock_timeout' => 'Arbeitsbereichs-Sperrzeit',
            ],
            'placeholders' => [
                'name' => 'Kursname eingeben',
                'description' => 'Kursbeschreibung eingeben',
                'classroom' => 'Wählen Sie einen Klassenraum aus',
                'teacher' => 'Wählen Sie einen Lehrer aus',
                'timeout_value' => 'Geben Sie den Timeout-Wert ein',
            ],
            'time_units' => [
                'minutes' => 'Minuten',
                'hours' => 'Stunden',
                'days' => 'Tage',
                'months' => 'Monate',
            ],
            'help' => [
                'workspace_lock_timeout' => 'Wie lange Schüler warten müssen, bevor sie nach Abschluss aller Fragen in einem Material einen neuen Versuch starten können. Auf 0 setzen, um sofortige Wiederholungen zu ermöglichen.',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Der Kursname ist erforderlich',
                ],
                'class_room_id' => [
                    'required' => 'Der Klassenraum ist erforderlich',
                ],
                'teacher_id' => [
                    'required' => 'Der Lehrer ist erforderlich',
                ],
            ],
            'messages' => [
                'not_found' => 'Kurs nicht gefunden',
                'pending' => [
                    'create' => 'Kurs wird erstellt...',
                    'update' => 'Kurs wird aktualisiert...',
                    'delete' => 'Kurs wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Kurs erfolgreich erstellt',
                    'update' => 'Kurs erfolgreich aktualisiert',
                    'delete' => 'Kurs erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen des Kurses',
                    'update' => 'Fehler beim Aktualisieren des Kurses',
                    'delete' => 'Fehler beim Löschen des Kurses',
                ],
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
            'sections' => [
                'details' => 'Kursdetails',
                'information' => 'Informationen',
                'timestamps' => 'Zeitinformationen',
            ],
            'not_assigned' => 'Nicht zugewiesen',
        ],
        'index' => [
            'title' => 'Kurse',
            'buttons' => [
                'create' => 'Kurs erstellen',
            ],
            'search_placeholder' => 'Nach Kursen suchen...',
            'empty_state' => 'Keine Kurse gefunden',
        ],
        'create' => [
            'title' => 'Kurs erstellen',
            'buttons' => [
                'create' => 'Kurs erstellen',
            ],
        ],
        'edit' => [
            'title' => 'Kurs bearbeiten',
            'buttons' => [
                'update' => 'Kurs aktualisieren',
            ],
        ],
        'show' => [
            'title' => 'Kursdetails',
            'sections' => [
                'information' => 'Informationen',
                'learning_materials' => 'Lernmaterialien',
                'locked_students' => 'Gesperrte Schüler',
            ],
            'locked_students' => [
                'title' => 'Verwaltung gesperrter Schüler',
                'description' => 'Verwalten Sie Schüler, deren Arbeitsbereiche aufgrund des Abschlusses aller Fragen in den Materialien gesperrt sind.',
                'loading' => 'Laden gesperrter Schüler...',
                'no_locked_students' => 'Keine gesperrten Schüler',
                'no_locked_students_description' => 'Derzeit sind keine Schüler mit gesperrten Arbeitsbereichen in diesem Kurs vorhanden.',
                'columns' => [
                    'student' => 'Schüler',
                    'material' => 'Material',
                    'locked_at' => 'Gesperrt am',
                    'unlock_at' => 'Entsperren am',
                    'status' => 'Status',
                    'actions' => 'Aktionen',
                ],
                'status' => [
                    'locked' => 'Gesperrt',
                    'can_reattempt' => 'Kann erneut versucht werden',
                ],
                'actions' => [
                    'unlock' => 'Arbeitsbereich entsperren',
                ],
                'unlock_now' => 'Jetzt verfügbar',
            ],
        ],
        'import' => [
            'title' => 'Kurse importieren',
            'description' => 'Importieren Sie Kurse aus einer Excel-Datei oder einem ZIP-Archiv, das Excel- und zugehörige Dateien enthält',
            'upload_title' => 'Kursimportdatei hochladen',
            'download_template' => 'Vorlage herunterladen',
            'drag_drop' => 'Ziehen Sie Ihre Excel-Datei oder ZIP-Archiv hierher oder klicken Sie, um zu durchsuchen',
            'supported_formats' => 'Unterstützt werden .xlsx, .xls und .zip-Dateien bis zu 50 MB',
            'stats' => 'Importiert: {courses} Kurse, {materials} Materialien, {questions} Fragen, {testCases} Testfälle',
            'errors' => 'Fehler:',
            'instructions_title' => 'Anleitungen',
            'instructions' => [
                'download' => 'Laden Sie die Vorlage herunter und fügen Sie Ihre Kursdaten ein',
                'identifiers' => 'Sie können anstelle von IDs die Klassennamen und Lehrer-E-Mails verwenden',
                'materials' => 'Materialien müssen Kurse nach Namen referenzieren',
                'questions' => 'Fragen müssen Materialien nach Titel referenzieren und den Kursnamen enthalten',
                'test_cases' => 'Testfälle müssen Fragen nach Titel referenzieren und den Materialtitel sowie den Kursnamen enthalten',
                'order' => 'Blätter in folgender Reihenfolge ausfüllen: Kurse → Materialien → Fragen → Testfälle',
                'backup' => 'Bewahren Sie eine Sicherungskopie Ihrer Excel-Datei und Anhänge auf',
                'zip_use' => 'Für Datei-Anhänge verwenden Sie eine ZIP-Datei, die sowohl Excel- als auch Referenzdateien enthält',
                'file_references' => 'Fügen Sie in Excel Dateipfade relativ zum ZIP-Stammverzeichnis hinzu (z.B. "materials/lecture1.pdf")',
                'file_handling' => 'Alle Dateien werden gespeichert und sind für Schüler zugänglich, ohne dass Pfade angegeben werden müssen',
            ],
            'buttons' => [
                'import' => 'Kurse importieren',
                'open_import' => 'Importieren',
            ],
            'downloading_template' => 'Vorlage wird heruntergeladen...',
            'download_success' => 'Vorlage erfolgreich heruntergeladen',
            'download_error' => 'Fehler beim Herunterladen der Vorlage',
            'importing' => 'Kurse werden importiert...',
            'import_success' => 'Kurse erfolgreich importiert',
            'import_error' => 'Fehler beim Importieren der Kurse',
            'validation' => [
                'file_required' => 'Bitte wählen Sie eine Datei zum Importieren aus',
                'file_type' => 'Es werden nur .xlsx, .xls und .zip-Dateien akzeptiert',
                'file_size' => 'Die Dateigröße darf 50 MB nicht überschreiten',
            ],
            'zip' => [
                'title' => 'ZIP-Archiv-Import',
                'description' => 'Laden Sie eine ZIP-Datei hoch, die Ihre Excel-Datei und die referenzierten Materialien enthält',
                'instructions' => 'Die ZIP-Datei sollte eine Excel-Datei und alle in den Excel-Blättern referenzierten Dateien enthalten',
                'structure' => 'Organisieren Sie Ihre Dateien in Ordnern innerhalb der ZIP-Datei für eine bessere Verwaltung',
                'example' => 'Beispiel: Legen Sie PDF-Materialien in einen Ordner "materials" und referenzieren Sie sie als "materials/file.pdf"',
                'error' => [
                    'no_excel' => 'Keine Excel-Datei im ZIP-Archiv gefunden',
                    'missing_file' => 'Referenzierte Datei nicht im ZIP-Archiv gefunden: {file}',
                    'extraction' => 'Fehler beim Entpacken der ZIP-Datei: {error}',
                ],
                'file_handling' => [
                    'title' => 'Dateihandhabung',
                    'description' => 'Dateien werden mit eindeutigen Namen gespeichert, um Konflikte zu vermeiden',
                    'note' => 'Beim Referenzieren von Dateien in Excel geben Sie einfach den relativen Pfad innerhalb des ZIP-Archivs an',
                    'example' => 'Zum Beispiel verwenden Sie "materials/lecture1.pdf", um auf diese Datei innerhalb Ihres ZIPs zuzugreifen',
                    'storage' => 'Alle hochgeladenen Dateien sind für Schüler zugänglich, ohne dass Pfade angegeben werden müssen',
                ],
            ],
            'preview_dialog' => [
                'title' => 'Importvorschau',
                'description' => 'Bitte überprüfen Sie die Daten, die importiert werden sollen, bevor Sie fortfahren',
                'tabs' => [
                    'summary' => 'Zusammenfassung',
                    'pdf_content' => 'PDF-Inhalt',
                    'courses' => 'Kurse',
                    'materials' => 'Materialien',
                ],
                'excel_content' => 'Excel-Inhalt',
                'courses' => 'Kurse',
                'materials' => 'Materialien',
                'questions' => 'Fragen',
                'test_cases' => 'Testfälle',
                'pdf_content' => 'PDF-Inhalt',
                'pdf_files' => 'PDF-Dateien',
                'detected_questions' => 'Erkannte Fragen',
                'detected_test_cases' => 'Erkannte Testfälle',
                'no_pdf_content' => 'Keine Fragen aus PDF-Dateien erkannt',
                'no_courses' => 'Keine Kurse in der Importdatei gefunden',
                'no_materials' => 'Keine Materialien in der Importdatei gefunden',
                'cancel' => 'Abbrechen',
                'confirm' => 'Jetzt importieren',
                'importing' => 'Importieren...',
            ],
            'previewing' => 'Analysiere Importdatei...',
            'preview_success' => 'Vorschau erfolgreich erstellt',
            'preview_error' => 'Fehler beim Erstellen der Vorschau',
            'download_material_template' => 'Download Materialvorlage',
            'downloading_material_template' => 'Materialvorlage wird heruntergeladen...',
            'download_material_success' => 'Materialvorlage erfolgreich heruntergeladen',
            'download_material_error' => 'Fehler beim Herunterladen der Materialvorlage',
        ],
    ],
    'learning_material' => [
        'common' => [
            'fields' => [
                'title' => 'Titel',
                'description' => 'Beschreibung',
                'type' => 'Typ',
                'order' => 'Reihenfolge',
                'file' => 'Datei',
                'file_extension' => 'Dateierweiterung',
                'status' => 'Status',
                'active' => 'Aktivitätsstatus',
                'course' => 'Kurs',
            ],
            'placeholders' => [
                'title' => 'Titel eingeben',
                'description' => 'Beschreibung eingeben',
                'type' => 'Typ auswählen',
                'file_extension' => 'Dateierweiterung eingeben',
            ],
            'types' => [
                'article' => 'Artikel',
                'quiz' => 'Quiz',
                'live_code' => 'Live-Coding',
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
            'sections' => [
                'details' => 'Materialdetails',
                'timestamps' => 'Zeitinformationen',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Der Titel ist erforderlich',
                ],
                'course_id' => [
                    'required' => 'Der Kurs ist erforderlich',
                ],
                'type' => [
                    'required' => 'Der Materialtyp ist erforderlich',
                ],
                'order_number' => [
                    'required' => 'Die Reihenfolgenummer ist erforderlich',
                ],
            ],
            'messages' => [
                'not_found' => 'Lernmaterial nicht gefunden',
                'pending' => [
                    'create' => 'Lernmaterial wird erstellt...',
                    'update' => 'Lernmaterial wird aktualisiert...',
                    'delete' => 'Lernmaterial wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Lernmaterial erfolgreich erstellt',
                    'update' => 'Lernmaterial erfolgreich aktualisiert',
                    'delete' => 'Lernmaterial erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen des Lernmaterials',
                    'update' => 'Fehler beim Aktualisieren des Lernmaterials',
                    'delete' => 'Fehler beim Löschen des Lernmaterials',
                ],
            ],
            'no_course' => 'Kein Kurs zugewiesen',
        ],
        'index' => [
            'title' => 'Lernmaterialien',
            'buttons' => [
                'create' => 'Material hinzufügen',
            ],
            'search_placeholder' => 'Nach Materialien suchen...',
            'empty_state' => 'Keine Lernmaterialien gefunden',
        ],
        'create' => [
            'title' => 'Lernmaterial erstellen',
            'buttons' => [
                'create' => 'Material erstellen',
            ],
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Vorschau für diesen Dateityp nicht verfügbar',
        ],
        'edit' => [
            'title' => 'Lernmaterial bearbeiten',
            'buttons' => [
                'update' => 'Material aktualisieren',
            ],
            'current_file' => 'Aktuelle Datei',
            'new_file_preview' => 'Neue Dateivorschau',
            'current_file_preview' => 'Aktuelle Dateivorschau',
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Vorschau für diesen Dateityp nicht verfügbar',
        ],
        'show' => [
            'title' => 'Details zum Lernmaterial',
            'sections' => [
                'information' => 'Informationen',
                'details' => 'Materialdetails',
                'questions' => 'Fragen',
            ],
            'file_info' => 'Datei: :name (:extension)',
            'view_file' => 'Datei anzeigen',
            'full_pdf_link' => 'Gesamtes PDF anzeigen',
        ],
    ],
    'learning_material_question' => [
        'common' => [
            'fields' => [
                'title' => 'Fragentitel',
                'description' => 'Fragenbeschreibung',
                'type' => 'Fragentyp',
                'order' => 'Reihenfolge',
                'clue' => 'Hinweis/Hinweis',
                'pre_code' => 'Vordefinierter Code',
                'example_code' => 'Beispiel-Lösungscode',
                'file' => 'Fragen-Datei',
                'file_extension' => 'Dateierweiterung',
                'status' => 'Status',
                'active' => 'Aktivitätsstatus',
            ],
            'placeholders' => [
                'title' => 'Fragentitel eingeben',
                'description' => 'Fragenbeschreibung oder -anweisungen eingeben',
                'clue' => 'Hinweis oder Hinweis für Schüler eingeben',
                'pre_code' => 'Starter-Code für Schüler eingeben',
                'example_code' => 'Beispiel-Lösungscode eingeben',
            ],
            'help' => [
                'clue' => 'Geben Sie einen Hinweis, den die Schüler sehen können, wenn sie feststecken',
                'pre_code' => 'Geben Sie Starter-Code an, der vorab für Schüler geladen wird',
                'example_code' => 'Geben Sie eine Beispiel-Lösung an, die als Referenz verwendet werden kann',
                'question_file' => 'Laden Sie eine PDF- oder Bilddatei mit den Einzelheiten oder visuellen Elementen der Frage hoch',
                'starter_code' => null, // Diese Zeile entfernen oder auskommentieren
            ],
            'types' => [
                'quiz' => 'Quizfrage',
                'live_code' => 'Live-Coding-Übung',
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Der Fragentitel ist erforderlich',
                ],
                'description' => [
                    'required' => 'Der Inhalt der Frage ist erforderlich',
                ],
                'material_id' => [
                    'required' => 'Das Lernmaterial ist erforderlich',
                ],
                'order_number' => [
                    'required' => 'Die Reihenfolgenummer ist erforderlich',
                ],
            ],
            'messages' => [
                'not_found' => 'Frage nicht gefunden',
                'pending' => [
                    'create' => 'Frage wird erstellt...',
                    'update' => 'Frage wird aktualisiert...',
                    'delete' => 'Frage wird gelöscht...',
                ],
                'success' => [
                    'create' => 'Frage erfolgreich erstellt',
                    'update' => 'Frage erfolgreich aktualisiert',
                    'delete' => 'Frage erfolgreich gelöscht',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen der Frage',
                    'update' => 'Fehler beim Aktualisieren der Frage',
                    'delete' => 'Fehler beim Löschen der Frage',
                ],
            ],
            'actions' => [
                'manage_test_cases' => 'Testfälle verwalten',
            ],
        ],
        'index' => [
            'title' => 'Fragen',
            'buttons' => [
                'create' => 'Frage hinzufügen',
            ],
            'empty_state' => 'Keine Fragen gefunden',
        ],
        'create' => [
            'title' => 'Frage erstellen',
            'buttons' => [
                'create' => 'Frage erstellen',
            ],
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Vorschau für diesen Dateityp nicht verfügbar',
            'test_cases' => [
                'note' => 'Testfälle für Live-Coding',
                'description' => 'Für Live-Coding-Fragen können Sie Testfälle nach der Erstellung der Frage hinzufügen.',
                'add_later' => 'Sie können Testfälle später auf der Detailseite der Frage hinzufügen.',
            ],
        ],
        'edit' => [
            'title' => 'Frage bearbeiten',
            'buttons' => [
                'update' => 'Frage aktualisieren',
            ],
            'current_file' => 'Aktuelle Fragen-Datei',
            'new_file_preview' => 'Neue Dateivorschau',
            'current_file_preview' => 'Aktuelle Dateivorschau',
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Keine Vorschau für diesen Dateityp verfügbar',
            'test_cases' => [
                'title' => 'Testfälle',
                'description' => 'Sie können Testfälle für diese Live-Coding-Frage verwalten',
                'manage_button' => 'Testfälle verwalten',
            ],
        ],
        'show' => [
            'title' => 'Fragedetails',
            'question_file' => 'Fragen-Datei',
            'sections' => [
                'information' => 'Informationen',
                'test_cases' => 'Testfälle',
            ],
        ],
    ],
    'learning_material_question_test_case' => [
        'common' => [
            'fields' => [
                'description' => 'Testbeschreibung',
                'input' => 'Eingabe',
                'output' => 'Ausgabe',
                'expected_output' => 'Erwartete Ausgabe',
                'output_type' => 'Ausgabeformat',
                'hidden' => 'Versteckter Test',
                'active' => 'Aktivitätsstatus',
                'explanation' => 'Erklärung',
                'status' => 'Status',
                'language' => 'Programmiersprache',
                'visibility' => 'Sichtbarkeit',
            ],
            'help' => [
                'description' => 'Beschreiben Sie, was dieser Testfall überprüft',
                'input' => 'Geben Sie Code oder Beispiel-Eingaben zum Testen der Frage ein',
                'expected_output' => 'Laden Sie eine PDF- oder Bilddatei hoch, die die erwartete Ausgabe für diesen Testfall zeigt',
                'hidden' => 'Versteckte Tests sind nur für Lehrer sichtbar und werden zur Bewertung verwendet',
                'language' => 'Wählen Sie die Programmiersprache für diesen Testfall aus',
            ],
            'validations' => [
                'description' => [
                    'required' => 'Die Testbeschreibung ist erforderlich',
                ],
            ],
            'status' => [
                'active' => 'Aktiv',
                'inactive' => 'Inaktiv',
            ],
            'visibility' => [
                'hidden' => 'Versteckt',
                'visible' => 'Sichtbar',
            ],
            'messages' => [
                'not_found' => 'Testfall nicht gefunden',
                'pending' => [
                    'create' => 'Testfall wird erstellt...',
                    'update' => 'Testfall wird aktualisiert...',
                    'delete' => 'Testfall wird gelöscht...',
                    'toggle' => 'Sichtbarkeit des Testfalls wird aktualisiert...',
                ],
                'success' => [
                    'create' => 'Testfall erfolgreich erstellt',
                    'update' => 'Testfall erfolgreich aktualisiert',
                    'delete' => 'Testfall erfolgreich gelöscht',
                    'toggle' => 'Sichtbarkeit des Testfalls erfolgreich aktualisiert',
                ],
                'error' => [
                    'create' => 'Fehler beim Erstellen des Testfalls',
                    'update' => 'Fehler beim Aktualisieren des Testfalls',
                    'delete' => 'Fehler beim Löschen des Testfalls',
                    'toggle' => 'Fehler beim Aktualisieren der Sichtbarkeit des Testfalls',
                ],
            ],
            'placeholders' => [
                'language' => 'Sprache auswählen',
                'input' => 'Eingabewerte für den Testfall eingeben',
                'expected_output' => 'Erwartete Ausgabe eingeben',
                'description' => 'Beschreibung des Testfalls eingeben',
            ],
            'confirmations' => [
                'toggle_visibility' => [
                    'title' => 'Änderung der Sichtbarkeit bestätigen',
                    'message' => 'Sind Sie sicher, dass Sie die Sichtbarkeit dieses Testfalls ändern möchten?',
                    'show' => 'jetzt',
                    'hide' => 'nicht mehr',
                    'confirm' => 'Ja, Sichtbarkeit ändern',
                    'cancel' => 'Abbrechen',
                ],
                'delete' => [
                    'title' => 'Löschung bestätigen',
                    'message' => 'Sind Sie sicher, dass Sie diesen Testfall löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                    'confirm' => 'Ja, löschen',
                    'cancel' => 'Abbrechen',
                ],
            ],
            'confirmation' => [
                'toggle' => [
                    'title' => 'Änderung der Sichtbarkeit bestätigen',
                    'message' => 'Sind Sie sicher, dass Sie die Sichtbarkeit dieses Testfalls ändern möchten?',
                ],
            ],
            'sections' => [
                'details' => 'Testfall-Details',
            ],
            'debug_section' => [
                'title' => 'Testfall-Debugging',
                'description' => 'Debuggen Sie Ihren Testfall, indem Sie ihn gegen den Beispielcode ausführen. Verwenden Sie "student_code" in Ihrem Testfall, um auf den zu testenden Code zuzugreifen.',
            ],
            'debug_dialog' => [
                'title' => 'Testfall debuggen',
            ],
            'actions' => [
                'create' => 'Testfall erstellen',
                'edit' => 'Testfall bearbeiten',
                'delete' => 'Testfall löschen',
                'make_visible' => 'Sichtbar machen',
                'make_hidden' => 'Verstecken',
                'toggle_status' => 'Status umschalten',
                'debug' => 'Testfall debuggen',
            ],
        ],
        'no_test_cases' => [
            'title' => 'Keine Testfälle gefunden',
            'message' => 'Es gibt noch keine Testfälle für diese Lernmaterialfrage. Erstellen Sie einen Testfall, um zu beginnen.',
            'add_button' => 'Testfall hinzufügen',
        ],
        'index' => [
            'title' => 'Testfälle',
            'buttons' => [
                'create' => 'Testfall hinzufügen',
            ],
            'empty_state' => 'Keine Testfälle gefunden',
        ],
        'create' => [
            'title' => 'Testfall erstellen',
            'buttons' => [
                'create' => 'Testfall erstellen',
            ],
            'file_preview' => 'Dateivorschau',
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Keine Vorschau für diesen Dateityp verfügbar',
        ],
        'edit' => [
            'title' => 'Testfall bearbeiten',
            'buttons' => [
                'update' => 'Testfall aktualisieren',
            ],
            'current_file' => 'Aktuelle Datei',
            'new_file_preview' => 'Neue Dateivorschau',
            'current_file_preview' => 'Aktuelle Dateivorschau',
            'preview' => 'Dateivorschau',
            'no_preview_available' => 'Keine Vorschau für diesen Dateityp verfügbar',
        ],
        'show' => [
            'title' => 'Testfalldetails',
            'hidden' => 'Versteckt',
            'visible' => 'Sichtbar',
            'expected_output_file' => 'Erwartete Ausgabedatei',
            'sections' => [
                'details' => 'Testfall-Details',
            ],
        ],
        'import' => [
            'title' => 'Testfälle importieren',
            'description' => 'CSV- oder Excel-Datei hochladen, um Testfälle in großen Mengen zu importieren',
            'template' => [
                'title' => 'Vorlage herunterladen',
                'description' => 'Eine Vorlagendatei mit dem korrekten Format herunterladen',
            ],
            'preview' => [
                'title' => 'Import-Vorschau',
                'total_rows' => 'Gesamte Zeilen: :count',
                'row_number' => 'Zeile #',
            ],
            'buttons' => [
                'download_csv' => 'CSV-Vorlage herunterladen',
                'download_excel' => 'Excel-Vorlage herunterladen',
                'preview' => 'Vorschau',
                'back' => 'Zurück',
                'confirm_import' => 'Import bestätigen',
                'import' => 'Importieren',
                'cancel' => 'Abbrechen',
            ],
            'messages' => [
                'downloading_template' => 'Vorlage wird heruntergeladen...',
                'download_success' => 'Vorlage erfolgreich heruntergeladen',
                'download_error' => 'Fehler beim Herunterladen der Vorlage',
                'previewing' => 'Importdatei wird analysiert...',
                'preview_success' => 'Vorschau erfolgreich geladen',
                'preview_error' => 'Fehler beim Anzeigen der Dateivorschau',
                'importing' => 'Testfälle werden importiert...',
                'import_success' => 'Testfälle erfolgreich importiert',
                'import_error' => 'Fehler beim Importieren der Testfälle',
            ],
            'upload' => [
                'title' => 'Testfälle hochladen',
            ],
        ],
    ],
    'profile' => [
        'edit' => [
            'title' => 'Profileinstellungen',
            'tabs' => [
                'profile' => 'Profil',
                'password' => 'Passwort',
                'danger' => 'Gefahrenzone',
            ],
        ],
        'sections' => [
            'information' => 'Profilinformationen',
            'password' => 'Passwort aktualisieren',
            'delete_account' => 'Konto löschen',
        ],
        'descriptions' => [
            'information' => 'Aktualisieren Sie die Profilinformationen und die E-Mail-Adresse Ihres Kontos.',
            'password' => 'Stellen Sie sicher, dass Ihr Konto ein langes, zufälliges Passwort verwendet, um sicher zu bleiben.',
            'delete_account' => 'Sobald Ihr Konto gelöscht ist, werden alle Ressourcen und Daten dauerhaft gelöscht.',
        ],
        'fields' => [
            'name' => 'Name',
            'username' => 'Benutzername',
            'email' => 'E-Mail',
            'current_password' => 'Aktuelles Passwort',
            'new_password' => 'Neues Passwort',
            'confirm_password' => 'Passwort bestätigen',
            'password' => 'Passwort',
        ],
        'validations' => [
            'name' => [
                'required' => 'Name ist erforderlich',
            ],
            'username' => [
                'required' => 'Benutzername ist erforderlich',
            ],
            'email' => [
                'required' => 'E-Mail ist erforderlich',
                'invalid' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            ],
            'current_password' => [
                'required' => 'Aktuelles Passwort ist erforderlich',
            ],
            'password' => [
                'min' => 'Das Passwort muss mindestens 8 Zeichen lang sein',
                'required' => 'Passwort ist erforderlich',
                'required_for_deletion' => 'Das Passwort ist erforderlich, um die Kontolöschung zu bestätigen',
            ],
            'password_confirmation' => [
                'required' => 'Bitte bestätigen Sie Ihr Passwort',
                'match' => 'Die Passwortbestätigung stimmt nicht überein',
            ],
        ],
        'buttons' => [
            'save' => 'Speichern',
            'delete_account' => 'Konto löschen',
            'cancel' => 'Abbrechen',
            'confirm_delete' => 'Konto löschen',
        ],
        'messages' => [
            'success' => [
                'update' => 'Profil erfolgreich aktualisiert',
                'password' => 'Passwort erfolgreich aktualisiert',
                'delete' => 'Konto erfolgreich gelöscht',
            ],
            'error' => [
                'update' => 'Fehler beim Aktualisieren Ihres Profils',
                'password' => 'Fehler beim Aktualisieren Ihres Passworts',
                'delete' => 'Fehler beim Löschen Ihres Kontos',
            ],
        ],
        'verification' => [
            'title' => 'E-Mail-Verifizierung',
            'message' => 'Ihre E-Mail-Adresse ist nicht verifiziert.',
            'resend_link' => 'Hier klicken, um die Bestätigungs-E-Mail erneut zu senden',
            'sent' => 'Ein neuer Bestätigungslink wurde an Ihre E-Mail-Adresse gesendet.',
        ],
        'upload' => [
            'label' => 'Ziehen Sie Ihr Profilbild per Drag & Drop hierher oder <span class="filepond--label-action">Durchsuchen</span>',
            'hint' => 'Empfohlen: Quadratisches Bild, max. 1 MB (.jpg, .png)',
        ],
        'warnings' => [
            'delete_account' => 'Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird Ihr Konto und alle zugehörigen Daten dauerhaft gelöscht.',
        ],
        'delete_dialog' => [
            'title' => 'Sind Sie sicher?',
            'description' => 'Sobald Ihr Konto gelöscht ist, werden alle Ressourcen und Daten dauerhaft gelöscht. Bitte geben Sie Ihr Passwort ein, um zu bestätigen, dass Sie Ihr Konto dauerhaft löschen möchten.',
        ],
    ],
    'student_courses' => [
        'common' => [
            'fields' => [
                'name' => 'Name',
                'classroom' => 'Klassenraum',
                'description' => 'Beschreibung',
                'progress' => 'Fortschritt',
                'progress_label' => 'Abgeschlossene Fragen',
            ],
        ],
        'index' => [
            'title' => 'Meine Kurse',
            'progress' => 'Fortschritt',
            'progress_label' => 'Abgeschlossene Fragen',
        ],
        'show' => [
            'title' => 'Kursdetails',
        ],
        'actions' => [
            'back_to_list' => 'Zurück zur Liste',
            'back_to_home' => 'Zurück zur Startseite',
            'back_to_dashboard' => 'Zurück zum Dashboard',
            'back_to_courses' => 'Zurück zu den Kursen',
            'back_to_course' => 'Zurück zum Kurs',
            'back_to_material' => 'Zurück zum Material',
        ],
    ],

    'student_materials' => [
        'common' => [
            'fields' => [
                'title' => 'Titel',
                'type' => 'Typ',
                'description' => 'Beschreibung',
            ],
        ],
        'index' => [
            'title' => 'Lernmaterialien',
        ],
        'show' => [
            'title' => 'Materialdetails',
            'progress' => 'Ihr Fortschritt',
            'questions' => 'Fragen',
            'completed' => ':count von :total Fragen abgeschlossen',
            'completed_label' => 'Abgeschlossen',
            'in_progress' => 'In Bearbeitung',
            'score' => 'Punktzahl',
            'continue' => 'Fortsetzen',
            'start' => 'Start',
            'next_material' => 'Nächstes Material',
        ],
    ],

    'student_questions' => [
        'workspace' => [
            'question' => 'Frage',
            'time' => 'Zeit',
            'time_spent' => 'Aufgewendete Zeit',
            'view_image' => 'Fragenbild',
            'clue' => 'Hinweis',
            'test_cases' => 'Testfälle',
            'code' => 'Code',
            'output' => 'Ausgabe',
            'run' => 'Code ausführen',
            'running' => 'Wird ausgeführt',
            'next' => 'Nächste Frage',
            'previous' => 'Vorherige Frage',
            'run_first' => 'Sie müssen Ihren Code mindestens einmal ausführen, um fortzufahren',
            'completed' => 'Abgeschlossen',
            'no_output_yet' => 'Noch keine Ausgabe. Führen Sie Ihren Code aus, um die Ergebnisse zu sehen.',
            'test_results' => 'Testergebnisse',
            'passed' => ' bestanden',
            'success' => [
                'title' => 'Herzlichen Glückwunsch!',
                'description' => 'Alle Tests wurden erfolgreich bestanden.',
            ],
            'error' => [
                'title' => 'Fehler beim Ausführen des Codes',
                'description' => 'Es gab ein Problem beim Ausführen Ihres Codes. Bitte überprüfen Sie auf Fehler.',
            ],
            'view_material' => 'Material anzeigen',
            'side_by_side_view' => 'Nebeneinanderansicht',
            'stacked_view' => 'Gestapelte Ansicht',
            'locked' => [
                'title' => 'Arbeitsbereich gesperrt',
                'description' => 'Ihr Arbeitsbereich wurde gesperrt, da Sie alle Fragen in diesem Material abgeschlossen haben. Sie können es nach der Entsperrzeit oder nach Genehmigung durch den Lehrer erneut versuchen.',
                'cannot_run' => 'Code kann nicht ausgeführt werden, während der Arbeitsbereich gesperrt ist',
                'button' => 'Gesperrt',
                'notification' => 'Der Arbeitsbereich wurde aufgrund des Abschlusses aller Fragen gesperrt',
                'unlock_in' => 'Wird entsperrt in',
                'unlock_now' => 'Jetzt entsperren',
                'reattempt' => 'Erneut versuchen',
                'answer_locked' => 'Antwort ist gesperrt. Code kann nicht ausgeführt werden.',
                'answer_locked_button' => 'Antwort gesperrt',
            ],
            'reattempt' => [
                'success' => 'Arbeitsbereich erfolgreich zurückgesetzt! Sie können es jetzt erneut versuchen.',
                'error' => 'Fehler beim Zurücksetzen des Arbeitsbereichs. Bitte versuchen Sie es erneut.',
            ],
            'test_cases_revealed' => 'Zusätzliche Testfälle wurden aufgedeckt, um Ihnen beim Debuggen Ihres Codes zu helfen!',
            'progressive_revelation' => [
                'failed_attempts_label' => 'Fehlgeschlagene Versuche',
                'attempts_remaining' => 'weitere Versuche, bis zusätzliche Testfälle aufgedeckt werden',
                'all_revealed' => 'Alle zusätzlichen Testfälle wurden aufgedeckt',
                'test_case_revealed' => 'Testfall aufgedeckt',
            ],
            'mark_as_done' => [
                'button' => 'Als erledigt markieren',
                'success' => 'Frage erfolgreich als erledigt markiert!',
                'error' => 'Fehler beim Markieren der Frage als erledigt. Bitte versuchen Sie es erneut.',
                'dialog' => [
                    'title' => 'Frage als erledigt markieren',
                    'description' => 'Sind Sie sicher, dass Sie diese Frage als erledigt markieren möchten? Nach der Markierung können Sie Ihren Code nicht mehr ändern, es sei denn, Sie erlauben erneute Versuche.',
                    'warning_title' => 'Wichtige Hinweise',
                    'warning_description' => 'Das Markieren als erledigt wird Ihre aktuelle Lösung finalisieren. Sie können später bei Bedarf erneute Versuche erlauben.',
                    'cancel' => 'Abbrechen',
                    'continue' => 'Weiter ohne Markierung',
                    'mark_done' => 'Als erledigt markieren',
                ],
            ],
            'allow_reattempt' => [
                'button' => 'Erneut versuchen',
                'success' => 'Erneuter Versuch erfolgreich erlaubt! Die Seite wird aktualisiert.',
                'error' => 'Fehler beim Erlauben des erneuten Versuchs. Bitte versuchen Sie es erneut.',
            ],
            'allow_reattempt_all' => [
                'button' => 'Alle Fragen erneut versuchen',
                'success' => 'Erneuter Versuch für alle Fragen erfolgreich erlaubt! Die Seite wird aktualisiert.',
                'error' => 'Fehler beim Erlauben des erneuten Versuchs für alle Fragen. Bitte versuchen Sie es erneut.',
                'dialog' => [
                    'title' => 'Alle Fragen erneut versuchen',
                    'description' => 'Sind Sie sicher, dass Sie alle Fragen in diesem Material für einen erneuten Versuch zurücksetzen möchten? Dadurch werden alle abgeschlossenen Fragen als nicht erledigt markiert.',
                    'warning_title' => 'Wichtige Hinweise',
                    'warning_description' => 'Diese Aktion setzt den Abschlussstatus aller Fragen in diesem Material zurück.',
                    'cancel' => 'Abbrechen',
                    'confirm' => 'Alle erneut versuchen',
                ],
            ],
            'close' => 'Schließen',
            'description' => 'Beschreibung',
            'material_file' => 'Materialdatei',
            'expand_material' => 'Material erweitern',
            'hide_material' => 'Material ausblenden',
            'show_material' => 'Material anzeigen',
            'resize_panel' => 'Panel in der Größe ändern',
            'drag_panel' => 'Header ziehen, um Panel zu verschieben',
        ],
    ],
    'dashboard' => [
        'common' => [
            'title' => 'Dashboard',
            'loading' => 'Lade Dashboard-Daten...',
            'no_data' => 'Keine Daten verfügbar',
            'chart_titles' => [
                'bar_chart' => 'Balkendiagramm',
                'pie_chart' => 'Kreisdiagramm',
                'line_chart' => 'Liniendiagramm',
                'area_chart' => 'Flächendiagramm',
                'radar_chart' => 'Radar-Diagramm',
                'radial_chart' => 'Radiales Diagramm',
            ],
        ],
        'student' => [
            'title' => 'Schüler-Dashboard',
            'subtitle' => 'Hier können Sie Ihren Lernfortschritt einsehen',
            'latest_work_progress' => [
                'title' => 'Neuester Lernfortschritt',
                'description' => 'Setzen Sie das Lernen von dort fort, wo Sie aufgehört haben',
                'loading' => 'Lade Daten...',
                'no_progress' => 'Noch kein Lernfortschritt vorhanden.',
                'course_label' => 'Kurs:',
                'material_label' => 'Material:',
                'current_question_label' => 'Aktueller Fragenfortschritt:',
                'continue_button' => 'Aktuelle Frage fortsetzen',
                'skip_button' => 'Zur nächsten Frage springen',
                'start_next_button' => 'Nächste Frage starten',
            ],
            'cognitive_classification' => [
                'title' => 'Kognitive Klassifikation',
                'description' => 'Kognitives Verständnisniveau basierend auf der Bloom\'schen Taxonomie',
                'loading' => 'Lade Kursdaten...',
                'no_courses' => 'Noch in keinen Kursen eingeschrieben.',
                'classification_history_title' => 'Klassifikationshistorie -',
                'classification_history_subtitle' => 'Entwicklung des kognitiven Niveaus und Lerntrends im Laufe der Zeit anzeigen',
                'card' => [
                    'click_for_details' => 'Klicken Sie, um die detaillierte Historie anzuzeigen',
                    'loading' => 'Laden...',
                    'no_classification' => 'Keine Klassifikation vorhanden',
                    'last_classified' => 'Zuletzt:',
                ],
            ],
            'charts' => [
                'learning_progress' => [
                    'title' => 'Lernfortschritt (Flächendiagramm)',
                    'description' => 'Seit dem ersten Beitritt',
                ],
                'cognitive_level' => [
                    'title' => 'Bloom\'s kognitive Ebenen (Kreis)',
                    'description' => 'Klassifikationsergebnisse',
                ],
                'module_progress' => [
                    'title' => 'Unvollendete Module (Balken)',
                    'description' => 'Persönlicher Modulfortschritt',
                    'footer' => '1 = Abgeschlossen, 0 = Noch nicht',
                ],
            ],
        ],
        'school_admin' => [
            'title' => 'Übersicht Schuladmin',
            'subtitle' => 'Zusammenfassungs-Dashboard für Schulen',
            'charts' => [
                'population' => [
                    'title' => 'Schulbevölkerung (Balkendiagramm)',
                    'description' => 'Mitarbeiter, Lehrer, Schüler',
                    'footer' => 'Aktuelle Statistiken',
                ],
                'facilities' => [
                    'title' => 'Schulressourcen (Kreis)',
                    'description' => 'Labore, Projektoren usw.',
                    'items_label' => 'Artikel',
                ],
                'class_development' => [
                    'title' => 'Klassenentwicklung (Radar)',
                    'description' => 'Januar vs Juni',
                ],
                'level_performance' => [
                    'title' => 'Notenleistung (Radiales Diagramm)',
                    'description' => 'Grundschule, Mittelschule, Oberschule',
                ],
            ],
        ],
        'teacher' => [
            'title' => 'Lehrer-Dashboard',
            'subtitle' => 'Übersicht über Kurs- und Schülerfortschritte',
            'chart_titles' => [
                'class_scores' => 'Klassennoten',
                'class_scores_description' => 'Durchschnittsnoten nach Klasse',
                'module_completion' => 'Modulabschluss',
                'module_completion_description' => 'Status des Modulabschlusses',
                'subject_mastery' => 'Fachbeherrschung',
                'subject_mastery_description' => 'Beherrschungsgrad nach Fach',
                'top_students' => 'Top-Schüler',
                'top_students_description' => 'Basierend auf dem Fortschritt',
                'bloom_taxonomy' => 'Verteilung der Bloom\'s Taxonomie',
                'bloom_taxonomy_description' => 'Verteilung der kognitiven Ebenen',
                'question_difficulty' => 'Fragen Schwierigkeit',
                'question_difficulty_description' => 'Verteilung leicht/mittel/schwer',
                'student_progress' => 'Schülerfortschritt',
                'student_progress_description' => 'Übersicht über den Abschlussstatus',
                'time_spent' => 'Zeitaufwand Analyse',
                'time_spent_description' => 'Durchschnittliche Zeit pro Modul',
            ],
            'labels' => [
                'completed' => 'Abgeschlossen',
                'in_progress' => 'In Bearbeitung',
                'not_started' => 'Nicht gestartet',
                'top_student' => 'Bester Schüler',
                'class_average' => 'Klassendurchschnitt',
                'expected' => 'Erwartet',
                'actual' => 'Tatsächlich',
                'students' => 'Schüler',
                'modules' => 'Module',
                'questions' => 'Fragen',
                'easy' => 'Leicht',
                'medium' => 'Mittel',
                'hard' => 'Schwer',
            ],
            'taxonomy_levels' => [
                'remember' => 'Erinnern',
                'understand' => 'Verstehen',
                'apply' => 'Anwenden',
                'analyze' => 'Analysieren',
                'evaluate' => 'Bewerten',
                'create' => 'Erschaffen',
            ],
            'stats' => [
                'total_students' => 'Insgesamt Schüler',
                'active_students' => 'Aktive Schüler',
                'total_courses' => 'Insgesamt Kurse',
                'total_materials' => 'Insgesamt Materialien',
                'total_questions' => 'Insgesamt Fragen',
                'average_score' => 'Durchschnittliche Punktzahl',
                'completion_rate' => 'Abschlussquote',
                'pass_rate' => 'Bestehensquote',
            ],
            'latest_progress' => [
                'title' => 'Neuester Schülerfortschritt',
                'description' => 'Aktuelle Schüleraktivitäten und Fortschrittsupdates',
                'labels' => [
                    'course' => 'Kurs',
                    'material' => 'Material',
                    'question' => 'Frage',
                    'score' => 'Punktzahl',
                    'time_spent' => 'Verbrachte Zeit',
                    'students' => 'Schüler',
                    'recent_activity' => 'Aktuelle Aktivität',
                ],
                'status' => [
                    'completed' => 'Abgeschlossen',
                    'in_progress' => 'In Bearbeitung',
                    'started' => 'Gestartet',
                ],
                'no_activity' => [
                    'title' => 'Keine aktuelle Aktivität',
                    'description' => 'Keine aktuelle Schüleraktivität anzuzeigen.',
                ],
                'showing_recent' => ':count neueste Aktivitäten anzeigen (von :total gesamt)',
                'showing_recent_for_course' => ':count neueste Aktivitäten anzeigen für :course',
                'tabs' => [
                    'overview' => 'Übersicht',
                    'courses' => 'Kurse',
                ],
                'dialog' => [
                    'course_progress_title' => 'Kursfortschritt',
                ],
            ],
        ],
        'admin' => [
            'title' => 'Admin-Übersicht',
            'subtitle' => 'Dashboard-Zusammenfassung für Administratoren',
            'charts' => [
                'users_bar' => [
                    'title' => 'Benutzer (Balkendiagramm)',
                    'description' => 'Wachstum der letzten 6 Monate',
                    'footer' => 'Tendenz steigend',
                ],
                'user_roles_pie' => [
                    'title' => 'Benutzerrollen (Kreisdiagramm)',
                    'description' => 'Admin / Lehrer / Schüler',
                    'total_label' => 'gesamt',
                ],
                'site_visits_line' => [
                    'title' => 'Besuche der Webseite (Liniendiagramm)',
                    'description' => 'Daten der letzten Woche',
                ],
                'radar_example' => [
                    'title' => 'Beispiel für ein Radar-Diagramm',
                    'description' => 'Januar vs Juni',
                ],
            ],
        ],
        'student_tracking' => [
            'title' => 'System zur Verfolgung von Schüleraufgaben',
            'description' => 'Verfolgen Sie den Fortschritt der Schüler durch Kurse, Materialien und Fragen',
            'no_data' => [
                'title' => 'Keine Daten verfügbar',
                'description' => 'Derzeit sind keine Daten zum Fortschritt der Schüler verfügbar.',
            ],
            'no_courses' => [
                'title' => 'Keine verfügbaren Kurse',
                'subtitle' => 'Bitte später erneut überprüfen.',
                'description' => 'Derzeit sind keine Kurse zur Verfolgung verfügbar.',
            ],
            'loading' => [
                'dashboard_data' => 'Lade Dashboard-Daten...',
                'progress_data' => 'Lade Fortschrittsdaten der Schüler...',
                'course_details' => 'Lade Kursdetails...',
                'student_details' => 'Lade Schülerdetails...',
            ],
            'tabs' => [
                'overview' => 'Übersicht',
                'courses' => 'Kurse',
                'students' => 'Schüler',
            ],
            'sections' => [
                'learning_materials' => 'Lernmaterialien',
                'course_completion' => 'Übersicht über den Kursabschluss',
                'top_students' => 'Top-leistende Schüler',
            ],
            'stats' => [
                'total_courses' => 'Insgesamt Kurse',
                'total_students' => 'Insgesamt Schüler',
                'completed_courses' => 'Abgeschlossene Kurse',
            ],
            'labels' => [
                'students' => 'Schüler',
                'materials' => 'Materialien',
                'avg_completion' => 'Durchs. Abschluss',
                'questions' => 'Fragen',
                'complete' => 'Abgeschlossen',
                'courses' => 'Kurse',
                'enrolled_in' => 'Eingeschrieben in',
                'students_enrolled' => 'Schüler eingeschrieben',
            ],
            'columns' => [
                'student' => 'Schüler',
                'completed' => 'Abgeschlossen',
                'progress' => 'Fortschritt',
                'status' => 'Status',
                'material' => 'Material',
                'courses' => 'Kurse',
                'avg_score' => 'Durchs. Punktzahl',
                'student_name' => 'Schülername',
                'actions' => 'Aktionen',
            ],
            'status' => [
                'complete' => 'Abgeschlossen',
                'in_progress' => 'In Bearbeitung',
                'not_started' => 'Nicht gestartet',
            ],
            'actions' => [
                'view_details' => 'Details anzeigen',
                'view_progress' => 'Fortschritt anzeigen',
            ],
            'instructions' => [
                'click_student' => 'Klicken Sie auf einen Schüler, um dessen detaillierten Fortschritt über alle Kurse und Materialien hinweg anzuzeigen.',
            ],
            'dialogs' => [
                'course_details' => [
                    'title' => 'Kursdetails: :name',
                    'description' => 'Fortschritt des Schülers für jedes Lernmaterial',
                ],
                'student_progress' => [
                    'title' => 'Schülerfortschritt: :name',
                    'description' => 'Detaillierter Fortschritt über alle Kurse und Materialien',
                ],
            ],
        ],
    ],
    'student_cognitive_classification' => [
        'index' => [
            'title' => 'Kognitive Klassifikationen von Schülern',
        ],
        'create' => [
            'title' => 'Kognitive Klassifikation für Schüler erstellen',
        ],
        'edit' => [
            'title' => 'Kognitive Klassifikation für Schüler bearbeiten',
        ],
        'show' => [
            'title' => 'Details zur kognitiven Klassifikation von Schülern',
        ],
        'columns' => [
            'student' => 'Schüler',
            'course' => 'Kurs',
            'classification_type' => 'Klassifikationstyp',
            'classification_level' => 'Klassifikationsniveau',
            'classification_score' => 'Klassifikationspunktzahl',
            'classified_at' => 'Klassifiziert am',
        ],
        'fields' => [
            'user_id' => 'Schüler',
            'course_id' => 'Kurs',
            'course' => 'Kurs',
            'classification_type' => 'Klassifikationstyp',
            'classification_level' => 'Klassifikationsniveau',
            'classification_score' => 'Klassifikationspunktzahl',
            'raw_data' => 'Rohdaten',
            'classified_at' => 'Klassifiziert am',
            'export_format' => 'Exportformat',
            'include_classification' => 'Klassifikationsergebnisse einbeziehen',
            'include_classification_description' => 'Klassifikationsergebnisse in das Exportblatt einfügen',
        ],
        'placeholders' => [
            'select_student' => 'Wählen Sie einen Schüler aus',
            'select_course' => 'Wählen Sie einen Kurs aus',
            'select_classification_type' => 'Wählen Sie den Klassifikationstyp aus',
            'select_export_format' => 'Wählen Sie das Exportformat aus',
        ],
        'export_formats' => [
            'raw' => 'Rohdatenformat',
            'ml_tool' => 'ML-Tool-Format (RapidMiner)',
        ],
        'buttons' => [
            'run_classification' => 'Klassifikation ausführen',
            'start_classification' => 'Klassifikation starten',
            'export_excel' => 'Klassifikationen exportieren',
            'export_raw_data' => 'Rohdaten exportieren',
            'start_export' => 'Export starten',
        ],
        'dialogs' => [
            'classification' => [
                'title' => 'Kognitive Klassifikation ausführen',
                'description' => 'Wählen Sie einen Kurs und einen Klassifikationstyp aus, um den Prozess der kognitiven Klassifikation für alle Schüler im Kurs auszuführen.',
            ],
            'export' => [
                'title' => 'Klassifikationen exportieren',
                'description' => 'Dies exportiert alle Klassifikationsdaten in eine Excel-Datei',
            ],
            'export_raw_data' => [
                'title' => 'Rohklassifikationsdaten exportieren',
                'description' => 'Dies exportiert die Rohdaten der Schüler, die für die Klassifikation verwendet werden, in eine Excel-Datei. Wählen Sie einen Kurs aus, um die Daten zu exportieren.',
            ],
            'delete' => [
                'title' => 'Klassifikation löschen',
                'description' => 'Sind Sie sicher, dass Sie diese Klassifikation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
            ],
        ],
        'messages' => [
            'classification_running' => 'Klassifikationsprozess wird ausgeführt...',
            'classification_success' => 'Klassifikation erfolgreich abgeschlossen',
            'classification_error' => 'Fehler bei der Ausführung der Klassifikation',
            'export_started' => 'Export gestartet. Ihr Download beginnt in Kürze.',
            'raw_data_export_started' => 'Rohdatenexport gestartet. Ihr Download beginnt in Kürze.',
            'deleting' => 'Klassifikation wird gelöscht...',
            'delete_success' => 'Klassifikation erfolgreich gelöscht',
            'delete_error' => 'Fehler beim Löschen der Klassifikation',
        ],
        'sections' => [
            'classifications' => 'Kognitive Klassifikationen',
        ],
        'descriptions' => [
            'classifications' => 'Alle kognitiven Klassifikationen der Schüler im System anzeigen',
        ],
        'classification_types' => [
            'topsis' => 'TOPSIS-Methode',
            'fuzzy' => 'Fuzzy-Logik',
            'neural' => 'Neurales Netzwerk',
        ],
    ],
    'test_case_change_tracker' => [
        'index' => [
            'title' => 'Änderungsverfolgung für Testfälle',
        ],
        'sections' => [
            'upcoming' => 'Bevorstehende Neuerstellungen',
            'history' => 'Ausführungshistorie',
        ],
        'tabs' => [
            'upcoming' => 'Bevorstehend',
            'history' => 'Historie',
        ],
        'columns' => [
            'course' => 'Kurs',
            'material' => 'Lernmaterial',
            'question' => 'Frage',
            'change_type' => 'Änderungsart',
            'affected_students' => 'Betroffene Schüler',
            'time_remaining' => 'Verbleibende Zeit',
            'actions' => 'Aktionen',
            'status' => 'Status',
            'scheduled_at' => 'Geplant für',
            'completed_at' => 'Abgeschlossen am',
        ],
        'change_types' => [
            'created' => 'Erstellt',
            'updated' => 'Aktualisiert',
            'deleted' => 'Gelöscht',
        ],
        'status' => [
            'pending' => 'Ausstehend',
            'in_progress' => 'In Bearbeitung',
            'completed' => 'Abgeschlossen',
            'failed' => 'Fehlgeschlagen',
            'imminent' => 'Bevorstehend',
        ],
        'buttons' => [
            'execute_now' => 'Jetzt ausführen',
        ],
        'stats' => [
            'pending' => 'Ausstehende Neuerstellungen',
            'completed' => 'Abgeschlossene Neuerstellungen',
            'failed' => 'Fehlgeschlagene Neuerstellungen',
            'pending_description' => 'Auf die Neuerstellung wartende Testfalländerungen',
            'completed_description' => 'Erfolgreich abgeschlossene Neuerstellungen',
            'failed_description' => 'Neuerstellungen, bei denen Fehler aufgetreten sind',
        ],
        'labels' => [
            'total' => 'gesamt',
            'passed' => 'bestanden',
            'failed' => 'fehlgeschlagen',
        ],
        'messages' => [
            'pending' => [
                'execute' => 'Validierung des Schülercodes wird ausgeführt...',
            ],
            'success' => [
                'execute' => 'Ausführung erfolgreich in die Warteschlange gestellt',
            ],
            'error' => [
                'execute' => 'Fehler beim Hinzufügen zur Ausführungsliste',
            ],
        ],
    ],

    'classification' => [
        'dialog' => [
            'title' => 'Klassifikationsdetails',
            'description' => 'Detaillierte Schritte des Klassifikationsprozesses',
        ],
        'material_dialog' => [
            'title' => 'Details zur Materialklassifikation',
            'description' => 'Detaillierte Informationen zur kognitiven Klassifikation des Materials',
        ],
        'course_dialog' => [
            'title' => 'Details zur Kursklassifikation',
            'description' => 'Detaillierte Informationen zur kognitiven Klassifikation des Kurses',
        ],
        'report_dialog' => [
            'title' => 'Bericht zur kognitiven Klassifikation',
        ],
        'cards' => [
            'benefit_criteria' => 'Nutzenkriterien',
            'cost_criteria' => 'Kostenkriterien',
            'classification_result' => 'Klassifikationsergebnis',
            'rule_base_mapping' => 'Regelbasiskartierung',
            'calculation_process' => 'Berechnungsprozess',
            'classification_overview' => 'Klassifikationsübersicht',
            'material_details' => 'Materialdetails',
            'material_classification' => 'Materialklassifikation',
            'recommendations' => 'Empfehlungen',
            'areas_for_improvement' => 'Verbesserungsbereiche',
            'question_performance' => 'Fragenleistung',
            'additional_information' => 'Zusätzliche Informationen',
            'test_case_metrics' => 'Testfallmetriken',
            'classification_history_memory' => 'Klassifikationshistorie (Speichertest)',
        ],
        'section_headers' => [
            'column_sums' => 'Spaltensummen',
            'normalized_matrix' => 'Normalisierte Matrix',
            'weights' => 'Gewichte',
            'weighted_matrix' => 'Gewichtete Matrix',
            'ideal_solutions' => 'Ideallösungen',
            'performance_scores' => 'Leistungswerte',
            'final_score' => 'Endpunktzahl',
            'final_level' => 'Endniveau',
            'material_classifications' => 'Materialklassifikationen',
            'calculation_details' => 'Berechnungsdetails',
            'students_by_level' => 'Schüler nach Niveau',
            'cognitive_classification_report' => 'Bericht zur kognitiven Klassifikation',
        ],
        'labels' => [
            'benefits' => 'Nutzen:',
            'costs' => 'Kosten:',
            'course' => 'Kurs:',
            'benefit_up' => 'Nutzen ↑',
            'cost_down' => 'Kosten ↓',
            'overall_test_case_completion' => 'Gesamte Testfallabschlüsse',
            'no_test_case_metrics' => 'Keine Testfallmetriken verfügbar.',
            'not_specified' => 'Nicht angegeben',
            'unknown_student' => 'Unbekannter Schüler',
            'unknown_material' => 'Unbekanntes Material',
        ],
        'table_headers' => [
            'material' => 'Material',
            'material_name' => 'Materialname',
            'solution' => 'Lösung',
            'alternative' => 'Alternative',
            'performance_score' => 'Leistungsbewertung (Ci)',
            'level' => 'Niveau',
            'score_range' => 'Punktbereich',
            'score' => 'Punktzahl',
            'question' => 'Frage',
            'completed' => 'Abgeschlossen',
            'total' => 'Gesamt',
            'completion_rate' => 'Abschlussquote',
            'compiles' => 'Kompliziert',
            'time_min' => 'Zeit (min)',
            'complete' => 'Vollständig',
            'trial' => 'Versuch',
            'variables' => 'Variablen',
            'functions' => 'Funktionen',
            'test_cases' => 'Testfälle',
            'compile_count' => 'Kompilierungsanzahl',
            'coding_time' => 'Codierungszeit',
            'trial_status' => 'Versuchsstatus',
            'completion_status' => 'Abschlussstatus',
            'variable_count' => 'Variablenanzahl',
            'function_count' => 'Funktionsanzahl',
            'test_case_rate' => 'Testfallquote',
        ],
        'status' => [
            'loading' => 'Lade Klassifikationsdetails...',
            'error_title' => 'Fehler',
            'error_message' => 'Fehler beim Laden der Klassifikationsdetails',
            'material_error' => 'Fehler beim Laden der Materialklassifikationsdetails. Bitte erneut versuchen.',
            'material_error_failed' => 'Fehler beim Laden der Materialklassifikationsdetails',
        ],
    ],

    // Permission Messages
    'permission' => [
        'messages' => [
            'loading' => 'Berechtigung wird aktualisiert...',
            'success' => 'Berechtigung erfolgreich aktualisiert',
            'error' => 'Ein Fehler ist beim Aktualisieren der Berechtigung aufgetreten',
        ],
    ],

    // Sandbox
    'sandbox' => [
        'buttons' => [
            'submit' => 'Einreichen',
        ],
    ],

    'welcome' => [
        'meta' => [
            'title' => 'Codeasy - Python und Data Science Lernen',
            'description' => 'Codeasy ist eine Python-Lernplattform für Data Science mit automatischer kognitiver Analyse basierend auf der Bloom\'schen Taxonomie.',
            'og_title' => 'Codeasy - Python und Data Science Lernen',
            'og_description' => 'Interaktive Lernplattform mit Autograding und automatischer kognitiver Analyse.',
        ],
        'navbar' => [
            'brand' => 'Codeasy',
            'navigation' => [
                'features' => 'Features',
                'how_it_works' => 'Wie es funktioniert',
                'testimonials' => 'Testimonials',
                'manual_book' => 'Handbuch',
                'questionnaire' => 'Fragebogen',
                'dashboard' => 'Dashboard',
                'login' => 'Anmelden',
                'get_started' => 'Loslegen',
            ],
            'aria' => [
                'toggle_navigation' => 'Navigation umschalten',
            ],
        ],
        'hero' => [
            'badge' => 'Powered by Machine Learning',
            'title' => 'Data Science Lernsystem',
            'rotating_words' => [
                'data_science' => 'Data Science',
                'data_analytics' => 'Datenanalyse',
                'business_intelligence' => 'Business Intelligence',
            ],
            'subtitle' => 'Verbessern Sie Ihr Verständnis der Python-Programmierung für Data Science mit Autograding-System und automatischer kognitiver Analyse basierend auf der Bloom\'schen Taxonomie.',
            'cta' => [
                'get_started' => 'Loslegen',
                'try_sandbox' => 'Sandbox testen',
            ],
            'code_editor' => [
                'filename' => 'cognitive_analysis.py',
                'language' => 'Python • Machine Learning',
                'comments' => [
                    'load_data' => '# Schülerdaten laden',
                    'extract_features' => '# Features aus Schüler-Code-Submissions extrahieren',
                    'extract_labels' => '# Bestehende kognitive Stufen-Labels für Training extrahieren',
                    'split_data' => '# Daten für Training und Testing aufteilen',
                    'train_classifier' => '# Kognitiven Stufen-Klassifikator trainieren',
                    'predict_levels' => '# Kognitive Stufen vorhersagen',
                    'output_accuracy' => '# Modellgenauigkeit und Verteilung ausgeben',
                ],
                'bloom_levels' => [
                    'remembering' => 'Erinnern',
                    'understanding' => 'Verstehen',
                    'applying' => 'Anwenden',
                    'analyzing' => 'Analysieren',
                    'evaluating' => 'Bewerten',
                    'creating' => 'Erschaffen',
                ],
                'output' => [
                    'model_accuracy' => 'Modellgenauigkeit:',
                    'cognitive_distribution' => 'Kognitive Stufenverteilung:',
                ],
                'legend' => [
                    'title' => 'Kognitive Stufenanalyse',
                    'auto_generated' => 'Automatisch generiert',
                    'analysis_result' => 'Echtzeitanalyse zeigt 85% Genauigkeit in der kognitiven Stufenklassifikation',
                    'levels' => [
                        'remembering' => 'Erinnern',
                        'understanding' => 'Verstehen',
                        'applying' => 'Anwenden',
                        'analyzing' => 'Analysieren',
                        'evaluating' => 'Bewerten',
                        'creating' => 'Erschaffen',
                    ],
                ],
            ],
        ],
        'cognitive_analysis' => [
            'title' => 'Echtzeit kognitive Analyse',
            'subtitle' => 'Basierend auf der Bloom\'schen Taxonomie',
            'levels' => [
                'remembering' => 'Erinnern',
                'understanding' => 'Verstehen',
                'applying' => 'Anwenden',
                'analyzing' => 'Analysieren',
                'evaluating' => 'Bewerten',
                'creating' => 'Erschaffen',
            ],
        ],
        'features' => [
            'badge' => 'Plattform-Features',
            'title' => 'Plattform-Features',
            'subtitle' => 'Komplette Lernlösung für Python Data Science',
            'cards' => [
                'autograding' => [
                    'title' => 'Automatische Bewertung',
                    'description' => 'Sofortiges Feedback zu Ihrem Python-Code mit umfassenden Testfällen',
                ],
                'cognitive_analysis' => [
                    'title' => 'Kognitive Analyse',
                    'description' => 'Echtzeitbewertung des Lernfortschritts basierend auf der Bloom\'schen Taxonomie',
                ],
                'skkni_curriculum' => [
                    'title' => 'SKKNI Curriculum',
                    'description' => 'Curriculum basierend auf den indonesischen nationalen Arbeitskompetenznormen für Data Science',
                ],
            ],
            'items' => [
                'autograding' => [
                    'title' => 'Automatische Bewertung',
                    'description' => 'Sofortiges Feedback zu Ihrem Python-Code mit umfassenden Testfällen',
                ],
                'cognitive_analysis' => [
                    'title' => 'Kognitive Analyse',
                    'description' => 'Echtzeitbewertung des Lernfortschritts basierend auf der Bloom\'schen Taxonomie',
                ],
                'interactive_learning' => [
                    'title' => 'Interaktives Lernen',
                    'description' => 'Praktische Programmierübungen mit Live-Code-Ausführung',
                ],
                'progress_tracking' => [
                    'title' => 'Fortschrittsverfolgung',
                    'description' => 'Detaillierte Analysen zur Lernreise und Fähigkeitsentwicklung',
                ],
                'adaptive_system' => [
                    'title' => 'Adaptives System',
                    'description' => 'Personalisierter Lernpfad basierend auf individueller Leistung',
                ],
                'real_time_feedback' => [
                    'title' => 'Echtzeit-Feedback',
                    'description' => 'Sofortige Antworten auf Code-Submissions und Problemlösung',
                ],
            ],
        ],
        'how_it_works' => [
            'badge' => 'Einfacher Prozess',
            'title' => 'Wie Codeasy funktioniert',
            'subtitle' => 'Einfache Schritte zur Beherrschung von Data Science',
            'steps' => [
                'choose_material' => [
                    'title' => 'Lernmaterial auswählen',
                    'description' => 'Wählen Sie aus unserem umfassenden Python- und Data Science-Curriculum basierend auf SKKNI-Standards',
                ],
                'learn_concepts' => [
                    'title' => 'Kernkonzepte lernen',
                    'description' => 'Studieren Sie theoretische Grundlagen mit interaktiven Beispielen und realen Anwendungen',
                ],
                'coding_practice' => [
                    'title' => 'Coding üben',
                    'description' => 'Schreiben und führen Sie Python-Code in unserer integrierten Entwicklungsumgebung aus',
                ],
                'cognitive_analysis' => [
                    'title' => 'Kognitive Analyse erhalten',
                    'description' => 'Erhalten Sie detaillierte Bewertung Ihres Verständnisniveaus basierend auf der Bloom\'schen Taxonomie',
                ],
            ],
        ],
        'statistics' => [
            'badge' => 'Plattform-Impact',
            'title' => 'Qualitätsvolle Data Science Talente schaffen',
            'subtitle' => 'Schließen Sie sich Tausenden von Lernenden aus verschiedenen Bildungseinrichtungen in Indonesien an',
            'stats' => [
                'active_students' => [
                    'number' => '10.000+',
                    'label' => 'Aktive Lernende',
                ],
                'institutions' => [
                    'number' => '150+',
                    'label' => 'Bildungseinrichtungen',
                ],
                'completion_rate' => [
                    'number' => '95%',
                    'label' => 'Abschlussquote',
                ],
                'industry_absorption' => [
                    'number' => '86%',
                    'label' => 'Alumni in der Industrie',
                ],
            ],
        ],
        'testimonials' => [
            'badge' => 'Testimonials',
            'title' => 'Was Schüler sagen',
            'subtitle' => 'Feedback aus unserer Lerngemeinschaft',
            'reviews' => [
                'student_1' => [
                    'name' => 'Sarah Johnson',
                    'role' => 'Informatik-Studentin',
                    'quote' => 'Codeasy hat mir geholfen, Data Science-Konzepte besser zu verstehen als jede andere Plattform. Die kognitive Analyse ist unglaublich hilfreich.',
                ],
                'instructor_1' => [
                    'name' => 'Dr. Ahmad Rahman',
                    'role' => 'Data Science Instruktor',
                    'quote' => 'Das Autograding-System bietet sofortiges Feedback, das den Lernprozess meiner Schüler erheblich beschleunigt hat.',
                ],
                'student_2' => [
                    'name' => 'Maria Garcia',
                    'role' => 'Business Analytics Studentin',
                    'quote' => 'Ich liebe es, wie sich die Plattform an mein Lerntempo anpasst und personalisierte Herausforderungen bietet.',
                ],
            ],
            'items' => [
                'testimonial_1' => [
                    'content' => 'Codeasy hat mir geholfen, Data Science-Konzepte besser zu verstehen als jede andere Plattform. Die kognitive Analyse ist unglaublich hilfreich.',
                    'author' => 'Sarah Johnson',
                    'role' => 'Informatik-Studentin',
                ],
                'testimonial_2' => [
                    'content' => 'Das Autograding-System bietet sofortiges Feedback, das meinen Lernprozess erheblich beschleunigt hat.',
                    'author' => 'Ahmad Rahman',
                    'role' => 'Data Science Enthusiast',
                ],
                'testimonial_3' => [
                    'content' => 'Ich liebe es, wie sich die Plattform an mein Lerntempo anpasst und personalisierte Herausforderungen bietet.',
                    'author' => 'Maria Garcia',
                    'role' => 'Business Analytics Studentin',
                ],
            ],
        ],
        'partners' => [
            'badge' => 'Unsere Partner',
            'title' => 'Vertraut von führenden Institutionen',
            'placeholder' => 'Partner-Logo',
        ],
        'cta' => [
            'badge' => 'Loslegen',
            'title' => 'Bereit zum Lernen?',
            'subtitle' => 'Schließen Sie sich Tausenden von Schülern an, die Data Science mit Codeasy meistern',
            'buttons' => [
                'register_now' => 'Jetzt registrieren',
                'learn_more' => 'Mehr erfahren',
            ],
            'button' => 'Jetzt loslegen',
        ],
        'footer' => [
            'brand' => 'Codeasy',
            'description' => 'Die nächste Generation von Data Scientists mit KI-gestützter Lernplattform und kognitiver Analyse stärken.',
            'sections' => [
                'platform' => [
                    'title' => 'Plattform',
                    'links' => [
                        'features' => 'Features',
                        'courses' => 'Kurse',
                        'pricing' => 'Preise',
                    ],
                ],
                'company' => [
                    'title' => 'Unternehmen',
                    'links' => [
                        'about_us' => 'Über uns',
                        'blog' => 'Blog',
                        'careers' => 'Karriere',
                    ],
                ],
                'legal' => [
                    'title' => 'Rechtliches',
                    'links' => [
                        'privacy_policy' => 'Datenschutzrichtlinie',
                        'terms_of_service' => 'Nutzungsbedingungen',
                    ],
                ],
            ],
            'copyright' => '© :year Codeasy. Alle Rechte vorbehalten.',
            'links' => [
                'privacy' => 'Datenschutzrichtlinie',
                'terms' => 'Nutzungsbedingungen',
                'contact' => 'Kontakt',
            ],
        ],
    ],
];
