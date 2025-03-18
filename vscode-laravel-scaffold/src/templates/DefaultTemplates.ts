import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * Default template strings for code generation loaded from stub files
 */
export class DefaultTemplates {
    /**
     * Map of template types to fallback template content
     */
    private static readonly fallbackTemplates = new Map<string, string>();

    /**
     * Load a stub file with proper priority:
     * 1. User-defined custom template paths
     * 2. Laravel project stubs directory
     * 3. Extension's own stubs directory
     * 4. Hardcoded fallback templates
     */
    private static loadStub(filename: string, category: 'backend' | 'frontend' = 'backend'): string {
        try {
            // Try to load from workspace directory if available
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspaceFolder) {
                // First check user config for custom template paths
                const config = vscode.workspace.getConfiguration('laravelScaffold');
                const templatePaths = config.get('templatePaths') as Record<string, string>;
                const templateType = filename.replace('.stub', '');
                
                if (templatePaths && templatePaths[templateType]) {
                    const customPath = templatePaths[templateType];
                    if (fs.existsSync(customPath)) {
                        console.log(`Using custom template from ${customPath}`);
                        return fs.readFileSync(customPath, 'utf8');
                    }
                }
                
                // Then try Laravel's stub directory (Laravel 8+ has predefined stubs)
                const laravelStubPath = path.join(workspaceFolder, 'stubs', filename);
                if (fs.existsSync(laravelStubPath)) {
                    console.log(`Using Laravel stub from ${laravelStubPath}`);
                    return fs.readFileSync(laravelStubPath, 'utf8');
                }
                
                // Try in the configured Laravel stubs path
                const scaffoldStubPath = path.join(workspaceFolder, 'stubs', 'scaffold', category, filename);
                if (fs.existsSync(scaffoldStubPath)) {
                    console.log(`Using scaffold stub from ${scaffoldStubPath}`);
                    return fs.readFileSync(scaffoldStubPath, 'utf8');
                }
            }
            
            // Try to use the stubs created in our extension directory
            const extensionPath = vscode.extensions.getExtension('laravel-scaffold')?.extensionPath 
                               || vscode.extensions.getExtension('your-publisher.laravel-scaffold')?.extensionPath
                               || __dirname; // Fallback to current directory
            
            if (extensionPath) {
                // Try VSCode extension stub paths
                const vscodeStubPath = path.join(extensionPath, 'stubs', category, filename);
                console.log(`Checking for stub at: ${vscodeStubPath}`);
                if (fs.existsSync(vscodeStubPath)) {
                    console.log(`Using extension stub from ${vscodeStubPath}`);
                    return fs.readFileSync(vscodeStubPath, 'utf8');
                }
                
                // If stubs haven't been found, try relative paths
                const relativeStubPath = path.join('..', '..', 'stubs', category, filename);
                const resolvedPath = path.resolve(__dirname, relativeStubPath);
                console.log(`Checking for stub at: ${resolvedPath}`);
                if (fs.existsSync(resolvedPath)) {
                    console.log(`Using relative stub from ${resolvedPath}`);
                    return fs.readFileSync(resolvedPath, 'utf8');
                }
            }
            
            // If we get here, the stub file wasn't found
            console.warn(`Stub file not found: ${filename} in category ${category}`);
            
            // Return empty string if no template was found
            return '';
            
        } catch (error) {
            console.error(`Failed to load stub file: ${filename}`, error);
            // Return empty string on error
            return '';
        }
    }

    // Backend templates
    static get model(): string {
        return this.loadStub('model.stub', 'backend');
    }

    static get migration(): string {
        return this.loadStub('migration.stub', 'backend');
    }

    static get factory(): string {
        return this.loadStub('factory.stub', 'backend');
    }

    static get seeder(): string {
        return this.loadStub('seeder.stub', 'backend');
    }

    static get repositoryInterface(): string {
        return this.loadStub('repository-interface.stub', 'backend');
    }

    static get repository(): string {
        return this.loadStub('repository.stub', 'backend');
    }

    static get serviceInterface(): string {
        return this.loadStub('service-interface.stub', 'backend');
    }

    static get service(): string {
        return this.loadStub('service.stub', 'backend');
    }

    static get resource(): string {
        return this.loadStub('resource.stub', 'backend');
    }

    static get storeRequest(): string {
        return this.loadStub('store-request.stub', 'backend');
    }

    static get updateRequest(): string {
        return this.loadStub('update-request.stub', 'backend');
    }

    static get controller(): string {
        return this.loadStub('controller.stub', 'backend');
    }

    static get apiController(): string {
        return this.loadStub('api-controller.stub', 'backend');
    }

    static get collection(): string {
        return this.loadStub('collection.stub', 'backend');
    }

    // Frontend templates
    static get tsModel(): string {
        return this.loadStub('model.stub', 'frontend');
    }

    static get tsResource(): string {
        return this.loadStub('resource.stub', 'frontend');
    }

    static get tsServiceHook(): string {
        return this.loadStub('service-hook.stub', 'frontend');
    }

    static get tsService(): string {
        return this.loadStub('service.stub', 'frontend');
    }
}
