import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handles the initialization of the Laravel scaffold system
 */
export class InitializerGenerator {
    private context: vscode.ExtensionContext;
    private panel: vscode.WebviewPanel | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Show UI for initializing scaffold components
     */
    public async showInitializerUI(): Promise<void> {
        // Create and show a webview panel for setting up initialization
        this.panel = vscode.window.createWebviewPanel(
            'initializerSetup',
            'Initialize Laravel Scaffold',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        // Set the HTML content for the webview
        this.panel.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'initialize':
                        await this.initializeScaffold();
                        this.panel?.dispose();
                        return;
                    case 'cancel':
                        this.panel?.dispose();
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Get the HTML content for the webview
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Initialize Laravel Scaffold</title>
            <style>
                body {
                    padding: 20px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    padding: 8px 16px;
                    border: none;
                    cursor: pointer;
                    margin-right: 10px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .section {
                    margin-bottom: 30px;
                    padding: 15px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                }
                .section h2 {
                    margin-top: 0;
                }
            </style>
        </head>
        <body>
            <h1>Initialize Laravel Scaffold</h1>
            <p>This will create base files needed for the Laravel scaffolding system to work properly.</p>
            <p>These files include model interfaces, resource interfaces, service factories, and other helper files.</p>

            <div class="section">
                <h2>Base Files</h2>
                <p>The following base components will be created:</p>
                <ul>
                    <li>Model Interface - Base model interface that all models extend</li>
                    <li>Resource Interface - Base resource interface for API responses</li>
                    <li>Routes Constants - Constants file for application routes</li>
                    <li>Service Hooks Factory - Generic service factory for API requests</li>
                    <li>Various helper functions for breadcrumbs, error handling, etc.</li>
                </ul>
            </div>
            
            <div style="margin-top: 30px;">
                <button id="initializeButton">Initialize Project</button>
                <button id="cancelButton">Cancel</button>
            </div>
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Initialize button
                    document.getElementById('initializeButton').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'initialize'
                        });
                    });
                    
                    // Cancel button
                    document.getElementById('cancelButton').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'cancel'
                        });
                    });
                })();
            </script>
        </body>
        </html>`;
    }

    /**
     * Initialize the scaffold system
     */
    public async initializeScaffold(): Promise<void> {
        try {
            await this.createModelInterface();
            await this.createResourceInterface();
            await this.createOtherInterfaces();
            await this.createRoutesFile();
            await this.createFrontendHelpers();
            await this.createServiceFactory();
            vscode.window.showInformationMessage('Scaffold system initialized successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize scaffold system: ${error}`);
        }
    }

    /**
     * Read stub content from file
     */
    private async getStubContent(stubName: string, category: 'backend' | 'frontend' | 'initializer'): Promise<string> {
        try {
            // Base paths for different stub types
            const stubsDir = path.join(this.context.extensionPath, 'stubs');
            
            // Try different paths in priority order
            const paths = [
                // 1. First try in the initializer-specific directory with subcategories
                path.join(stubsDir, 'initializer', category, stubName),
                path.join(stubsDir, 'initializer', 'frontend', stubName), // Check initializer/frontend too
                path.join(stubsDir, 'initializer', 'backend', stubName),  // Check initializer/backend too
                // 2. Then try in the normal category directory
                path.join(stubsDir, category, stubName),
                // 3. Finally try in the root stubs directory
                path.join(stubsDir, stubName)
            ];
            
            for (const filePath of paths) {
                if (fs.existsSync(filePath)) {
                    return fs.readFileSync(filePath, 'utf8');
                }
            }
            
            // If file doesn't exist in any location, throw an error
            throw new Error(`Stub file not found: ${stubName} in category ${category}`);
        } catch (error) {
            console.error(`Error reading stub file ${stubName}:`, error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    /**
     * Create model interface file
     */
    private async createModelInterface(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const modelInterfacePath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Models', 'Model.ts');
        await this.ensureDirectoryExists(path.dirname(modelInterfacePath));
        
        const modelInterfaceContent = await this.getStubContent('model.interface.stub', 'frontend');
        await fs.promises.writeFile(modelInterfacePath, modelInterfaceContent);
        
        // Also create an index.ts file to export the Model interface
        const modelIndexPath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Models', 'index.ts');
        const indexContent = await this.getStubContent('models.index.stub', 'initializer');
        await fs.promises.writeFile(modelIndexPath, indexContent);
    }

    /**
     * Create resource interface file
     */
    private async createResourceInterface(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const resourceInterfacePath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Resources', 'Resource.ts');
        await this.ensureDirectoryExists(path.dirname(resourceInterfacePath));
        
        const resourceInterfaceContent = await this.getStubContent('resource.interface.stub', 'frontend');
        await fs.promises.writeFile(resourceInterfacePath, resourceInterfaceContent);
        
        // Also create an index.ts file to export the Resource interface
        const resourceIndexPath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Resources', 'index.ts');
        const indexContent = await this.getStubContent('resources.index.stub', 'initializer');
        await fs.promises.writeFile(resourceIndexPath, indexContent);
    }

    /**
     * Create other required interfaces
     */
    private async createOtherInterfaces(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const othersDir = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Others');
        await this.ensureDirectoryExists(othersDir);
        
        // Create ServiceFilterOptions interface
        const filterOptionsPath = path.join(othersDir, 'ServiceFilterOptions.ts');
        const filterOptionsContent = await this.getStubContent('service-filter-options.stub', 'frontend');
        await fs.promises.writeFile(filterOptionsPath, filterOptionsContent);
        
        // Create pagination interfaces
        const paginationMetaPath = path.join(othersDir, 'PaginateMeta.ts');
        const paginationMetaContent = await this.getStubContent('paginate-meta.stub', 'frontend');
        await fs.promises.writeFile(paginationMetaPath, paginationMetaContent);
        
        const paginationMetaLinkPath = path.join(othersDir, 'PaginateMetaLink.ts');
        const paginationMetaLinkContent = await this.getStubContent('paginate-meta-link.stub', 'frontend');
        await fs.promises.writeFile(paginationMetaLinkPath, paginationMetaLinkContent);
        
        const paginationResponsePath = path.join(othersDir, 'PaginateResponse.ts');
        const paginationResponseContent = await this.getStubContent('paginate-response.stub', 'frontend');
        await fs.promises.writeFile(paginationResponsePath, paginationResponseContent);
        
        // Create ServiceHooksFactory interface
        const hooksFactoryPath = path.join(othersDir, 'ServiceHooksFactory.ts');
        const hooksFactoryContent = await this.getStubContent('service-hooks-factory.stub', 'frontend');
        await fs.promises.writeFile(hooksFactoryPath, hooksFactoryContent);
        
        // Create breadcrumb interface
        const breadcrumbPath = path.join(othersDir, 'GenericBreadcrumbItem.ts');
        const breadcrumbContent = await this.getStubContent('generic-breadcrumb-item.stub', 'frontend');
        await fs.promises.writeFile(breadcrumbPath, breadcrumbContent);
        
        // Create index.ts for Others interfaces
        const indexPath = path.join(othersDir, 'index.ts');
        const indexContent = await this.getStubContent('others.index.stub', 'initializer');
        await fs.promises.writeFile(indexPath, indexContent);
    }

    /**
     * Create the routes file for frontend
     */
    private async createRoutesFile(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const routesPath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Constants', 'routes.ts');
        await this.ensureDirectoryExists(path.dirname(routesPath));
        
        const routesContent = await this.getStubContent('routes.stub', 'frontend');
        await fs.promises.writeFile(routesPath, routesContent);
    }

    /**
     * Create frontend helpers
     */
    private async createFrontendHelpers(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const helpersDir = path.join(workspaceFolder, 'resources', 'js', 'Helpers');
        await this.ensureDirectoryExists(helpersDir);
        
        // Create service hooks factory query key helper
        const queryKeyHelperPath = path.join(helpersDir, 'generateServiceHooksFactoryQueryKey.ts');
        const queryKeyHelperContent = await this.getStubContent('generate-service-hooks-factory-query-key.stub', 'frontend');
        await fs.promises.writeFile(queryKeyHelperPath, queryKeyHelperContent);
        
        // Create query error helper
        const queryErrorHelperPath = path.join(helpersDir, 'tanstackQueryHelpers.ts');
        const queryErrorHelperContent = await this.getStubContent('tanstack-query-helpers.stub', 'frontend');
        await fs.promises.writeFile(queryErrorHelperPath, queryErrorHelperContent);
        
        // Create breadcrumb helper
        const breadcrumbHelperPath = path.join(helpersDir, 'generateDynamicBreadcrumbs.ts');
        const breadcrumbHelperContent = await this.getStubContent('generate-dynamic-breadcrumbs.stub', 'frontend');
        await fs.promises.writeFile(breadcrumbHelperPath, breadcrumbHelperContent);
        
        // Create index.ts for helpers
        const indexPath = path.join(helpersDir, 'index.ts');
        const indexContent = await this.getStubContent('helpers.index.stub', 'initializer');
        await fs.promises.writeFile(indexPath, indexContent);
    }

    /**
     * Create service factory
     */
    private async createServiceFactory(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const serviceDir = path.join(workspaceFolder, 'resources', 'js', 'Services');
        await this.ensureDirectoryExists(serviceDir);
        
        const serviceFactoryPath = path.join(serviceDir, 'serviceHooksFactory.ts');
        const serviceFactoryContent = await this.getStubContent('service-factory.stub', 'frontend');
        await fs.promises.writeFile(serviceFactoryPath, serviceFactoryContent);
    }

    /**
     * Ensure that a directory exists, creating it if necessary
     */
    private async ensureDirectoryExists(directoryPath: string): Promise<void> {
        try {
            await fs.promises.access(directoryPath);
        } catch (error) {
            // Directory doesn't exist, create it
            await fs.promises.mkdir(directoryPath, { recursive: true });
        }
    }
}