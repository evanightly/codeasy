import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModelGenerator } from './generators/ModelGenerator';
import { CrudGenerator } from './generators/CrudGenerator';
import { LaravelProjectAnalyzer } from './utils/LaravelProjectAnalyzer';
import { SetupManager } from './utils/SetupManager';
import { InitializerGenerator } from './generators/InitializerGenerator'; // Add this import

/**
 * Ensure stubs directory exists
 */
async function ensureStubsExist(context: vscode.ExtensionContext): Promise<void> {
    // Create stubs directories if they don't exist
    const stubsDir = path.join(context.extensionPath, 'stubs');
    const backendDir = path.join(stubsDir, 'backend');
    const frontendDir = path.join(stubsDir, 'frontend');
    
    if (!fs.existsSync(stubsDir)) {
        fs.mkdirSync(stubsDir, { recursive: true });
    }
    
    if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
    }
    
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }
    
    // We'll copy the stub files from templates directory if they're missing
    console.log('Stubs directory structure created');
}

/**
 * Copy Laravel stubs if they exist
 */
async function copyLaravelStubs(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Create stubs directories if they don't exist
        const stubsDir = path.join(context.extensionPath, 'stubs');
        const backendDir = path.join(stubsDir, 'backend');
        const frontendDir = path.join(stubsDir, 'frontend');
        
        if (!fs.existsSync(stubsDir)) {
            fs.mkdirSync(stubsDir, { recursive: true });
        }
        
        if (!fs.existsSync(backendDir)) {
            fs.mkdirSync(backendDir, { recursive: true });
        }
        
        if (!fs.existsSync(frontendDir)) {
            fs.mkdirSync(frontendDir, { recursive: true });
        }
        
        // Get the workspace folder to look for Laravel stubs
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return;
        }
        
        // Check for Laravel stubs directory
        const laravelStubsPath = path.join(workspaceFolder, 'stubs');
        if (!fs.existsSync(laravelStubsPath)) {
            return;
        }
        
        // Define all backend stub files to copy
        const backendStubsToCopy = [
            'model.stub',
            'migration.stub',
            'controller.stub',
            'controller.api.stub',
            'factory.stub',
            'seeder.stub',
            'resource.stub',
            'collection.stub',
            'test.stub',
            'repository.stub',
            'repository-interface.stub',
            'service.stub',
            'service-interface.stub',
            'store-request.stub',
            'update-request.stub'
        ];
        
        // Define all frontend stub files to copy
        const frontendStubsToCopy = [
            'model.stub',
            'resource.stub',
            'service.stub',
            'service-hook.stub',
            'service-factory.stub',
            'interface-base.stub',
            'routes.stub',
            'form.component.stub',
            'index-page.stub',
            'resource-registry.stub'
        ];
        
        // Copy each backend stub file if it exists in Laravel project
        backendStubsToCopy.forEach(stubName => {
            const sourceFile = path.join(laravelStubsPath, stubName);
            const targetFile = path.join(backendDir, stubName);
            
            if (fs.existsSync(sourceFile)) {
                fs.copyFileSync(sourceFile, targetFile);
                console.log(`Copied Laravel ${stubName} to extension backend directory`);
            }
        });
        
        // Copy each frontend stub file if it exists in Laravel project
        frontendStubsToCopy.forEach(stubName => {
            const sourceFile = path.join(laravelStubsPath, stubName);
            const targetFile = path.join(frontendDir, stubName);
            
            if (fs.existsSync(sourceFile)) {
                fs.copyFileSync(sourceFile, targetFile);
                console.log(`Copied Laravel ${stubName} to extension frontend directory`);
            }
        });
        
        // Also check for stubs in scaffolding-specific locations
        const scaffoldBackendPath = path.join(workspaceFolder, 'stubs', 'scaffold', 'backend');
        const scaffoldFrontendPath = path.join(workspaceFolder, 'stubs', 'scaffold', 'frontend');
        const initializerPath = path.join(workspaceFolder, 'stubs', 'scaffold', 'initializer');
        
        // Copy scaffold backend stubs
        if (fs.existsSync(scaffoldBackendPath)) {
            fs.readdirSync(scaffoldBackendPath).forEach(file => {
                if (file.endsWith('.stub')) {
                    const sourceFile = path.join(scaffoldBackendPath, file);
                    const targetFile = path.join(backendDir, file);
                    fs.copyFileSync(sourceFile, targetFile);
                    console.log(`Copied scaffold backend ${file} to extension`);
                }
            });
        }
        
        // Copy scaffold frontend stubs
        if (fs.existsSync(scaffoldFrontendPath)) {
            fs.readdirSync(scaffoldFrontendPath).forEach(file => {
                if (file.endsWith('.stub')) {
                    const sourceFile = path.join(scaffoldFrontendPath, file);
                    const targetFile = path.join(frontendDir, file);
                    fs.copyFileSync(sourceFile, targetFile);
                    console.log(`Copied scaffold frontend ${file} to extension`);
                }
            });
        }
        
        // Copy initializer stubs if they exist (usually contains frontend base files)
        if (fs.existsSync(initializerPath)) {
            // Handle frontend initializer stubs
            const initializerFrontendPath = path.join(initializerPath, 'frontend');
            if (fs.existsSync(initializerFrontendPath)) {
                fs.readdirSync(initializerFrontendPath).forEach(file => {
                    if (file.endsWith('.stub')) {
                        const sourceFile = path.join(initializerFrontendPath, file);
                        const targetFile = path.join(frontendDir, file);
                        fs.copyFileSync(sourceFile, targetFile);
                        console.log(`Copied initializer frontend ${file} to extension`);
                    }
                });
            }

            // Handle backend initializer stubs
            const initializerBackendPath = path.join(initializerPath, 'backend');
            if (fs.existsSync(initializerBackendPath)) {
                fs.readdirSync(initializerBackendPath).forEach(file => {
                    if (file.endsWith('.stub')) {
                        const sourceFile = path.join(initializerBackendPath, file);
                        const targetFile = path.join(backendDir, file);
                        fs.copyFileSync(sourceFile, targetFile);
                        console.log(`Copied initializer backend ${file} to extension`);
                    }
                });
            }
        }
        
        console.log('Laravel stubs copied to extension directory');
    } catch (error) {
        console.error('Failed to copy Laravel stubs:', error);
    }
}

/**
 * Copy stub files to the extension's stubs directory
 */
async function createDefaultStubFiles(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Create stubs directories
        const stubsDir = path.join(context.extensionPath, 'stubs');
        const backendDir = path.join(stubsDir, 'backend');
        const frontendDir = path.join(stubsDir, 'frontend');
        
        if (!fs.existsSync(stubsDir)) {
            fs.mkdirSync(stubsDir, { recursive: true });
        }
        
        if (!fs.existsSync(backendDir)) {
            fs.mkdirSync(backendDir, { recursive: true });
        }
        
        if (!fs.existsSync(frontendDir)) {
            fs.mkdirSync(frontendDir, { recursive: true });
        }
        
        // Define base stubs that should always exist
        const stubs = {
            // Backend stubs
            'backend/model.stub': `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class {{modelName}} extends Model
{
    use HasFactory;
    
    {{#if tableName}}protected $table = '{{tableName}}';{{/if}}
    
    protected $fillable = [
        {{fillable}}
    ];
    
    {{#if hasCasts}}
    protected $casts = [
        {{casts}}
    ];
    {{/if}}
}
`,
            'backend/migration.stub': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('{{tableName}}', function (Blueprint $table) {
            $table->id();
            {{migrationFields}}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('{{tableName}}');
    }
};
`,
            // Add more backend stubs as needed
            
            // Frontend stubs
            'frontend/model.stub': `export interface {{modelName}} {
    id: number;
{{tsAttributes}}
    created_at?: string;
    updated_at?: string;
}
`
            // Add more frontend stubs as needed
        };
        
        // Create all the stub files
        for (const [stubPath, content] of Object.entries(stubs)) {
            const fullPath = path.join(stubsDir, stubPath);
            
            // Ensure directory exists (for nested paths)
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Only write if file doesn't exist
            if (!fs.existsSync(fullPath)) {
                fs.writeFileSync(fullPath, content);
                console.log(`Created stub file: ${fullPath}`);
            }
        }
        
        console.log('Default stub files created successfully');
    } catch (error) {
        console.error('Failed to create default stub files:', error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    // Create default stub files (guaranteed minimum set)
    createDefaultStubFiles(context).catch(error => {
        console.error('Failed to create default stub files:', error);
    });

    // Ensure stubs exist when extension is activated
    ensureStubsExist(context).catch(error => {
        console.error('Failed to create stubs directory structure:', error);
    });

    // Copy Laravel stubs to extension directory if available
    copyLaravelStubs(context).catch(error => {
        console.error('Failed to copy Laravel stubs:', error);
    });

    const modelGenerator = new ModelGenerator(context);
    const crudGenerator = new CrudGenerator(context);
    const projectAnalyzer = new LaravelProjectAnalyzer();
    const initializerGenerator = new InitializerGenerator(context); // Add this line

    // Check if we're in a Laravel project
    projectAnalyzer.isLaravelProject().then(isLaravel => {
        if (!isLaravel) {
            vscode.window.showWarningMessage('This doesn\'t appear to be a Laravel project. Some features may not work correctly.');
        }
    });

    // Register the model generator command
    let modelDisposable = vscode.commands.registerCommand('laravelScaffold.generateModel', async () => {
        await modelGenerator.showModelDefinitionUI();
    });

    // Register the CRUD generator command
    let crudDisposable = vscode.commands.registerCommand('laravelScaffold.generateCRUD', async () => {
        await crudGenerator.showCrudDefinitionUI();
    });

    // Register the initialization command
    let initDisposable = vscode.commands.registerCommand('laravelScaffold.initializeStubs', async () => {
        await SetupManager.initializeStubs();
    });

    // Register the scaffold initialization command for new projects
    let initScaffoldDisposable = vscode.commands.registerCommand('laravelScaffold.initializeScaffold', async () => {
        await initializerGenerator.showInitializerUI();
    });

    context.subscriptions.push(modelDisposable, crudDisposable, initDisposable, initScaffoldDisposable);
}

export function deactivate() {}
