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
     * Create model interface file
     */
    private async createModelInterface(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const modelInterfacePath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Models', 'Model.ts');
        await this.ensureDirectoryExists(path.dirname(modelInterfacePath));
        
        const modelInterfaceContent = `/**
 * Base model interface that all models should extend
 */
export interface Model {
    id: number;
    created_at?: string;
    updated_at?: string;
}`;

        await fs.promises.writeFile(modelInterfacePath, modelInterfaceContent);
        
        // Also create an index.ts file to export the Model interface
        const modelIndexPath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Models', 'index.ts');
        await fs.promises.writeFile(modelIndexPath, `export * from './Model';\n`);
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
        
        const resourceInterfaceContent = `import { Model } from '../Models/Model';

/**
 * Base resource interface that all API resources should extend
 */
export interface Resource<T extends Model = Model> {
    data: T;
}`;

        await fs.promises.writeFile(resourceInterfacePath, resourceInterfaceContent);
        
        // Also create an index.ts file to export the Resource interface
        const resourceIndexPath = path.join(workspaceFolder, 'resources', 'js', 'Support', 'Interfaces', 'Resources', 'index.ts');
        await fs.promises.writeFile(resourceIndexPath, `export * from './Resource';\n`);
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
        const filterOptionsContent = `/**
 * Options for filtering API requests
 */
export interface ServiceFilterOptions {
    page?: number;
    per_page?: number | 'all';
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    [key: string]: any;
}`;
        await fs.promises.writeFile(filterOptionsPath, filterOptionsContent);
        
        // Create pagination interfaces
        const paginationMetaPath = path.join(othersDir, 'PaginateMeta.ts');
        const paginationMetaContent = `import { PaginateMetaLink } from './PaginateMetaLink';

export interface PaginateMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginateMetaLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}`;
        await fs.promises.writeFile(paginationMetaPath, paginationMetaContent);
        
        const paginationMetaLinkPath = path.join(othersDir, 'PaginateMetaLink.ts');
        const paginationMetaLinkContent = `export interface PaginateMetaLink {
    url: string | null;
    label: string;
    active: boolean;
}`;
        await fs.promises.writeFile(paginationMetaLinkPath, paginationMetaLinkContent);
        
        const paginationResponsePath = path.join(othersDir, 'PaginateResponse.ts');
        const paginationResponseContent = `import { PaginateMeta } from './PaginateMeta';

export interface PaginateResponse<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginateMeta;
}`;
        await fs.promises.writeFile(paginationResponsePath, paginationResponseContent);
        
        // Create ServiceHooksFactory interface
        const hooksFactoryPath = path.join(othersDir, 'ServiceHooksFactory.ts');
        const hooksFactoryContent = `import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { ServiceFilterOptions } from './ServiceFilterOptions';
import { PaginateResponse } from './PaginateResponse';
import { Resource } from '../Resources/Resource';

export interface ServiceHooksFactory<TData, TResource, TPayload = Partial<TData>> {
    // Query hooks
    useGetAll: (options?: ServiceFilterOptions) => UseQueryResult<TData[], Error>;
    useGetPaginated: (options?: ServiceFilterOptions) => UseQueryResult<PaginateResponse<TData>, Error>;
    useGetById: (id: number) => UseQueryResult<TData, Error>;
    
    // Mutation hooks
    useCreate: () => UseMutationResult<Resource<TData>, Error, TPayload>;
    useUpdate: (id: number) => UseMutationResult<Resource<TData>, Error, TPayload>;
    useDelete: () => UseMutationResult<void, Error, number>;
}`;
        await fs.promises.writeFile(hooksFactoryPath, hooksFactoryContent);
        
        // Create breadcrumb interface
        const breadcrumbPath = path.join(othersDir, 'GenericBreadcrumbItem.ts');
        const breadcrumbContent = `export interface GenericBreadcrumbItem {
    title: string;
    href?: string;
    active?: boolean;
}`;
        await fs.promises.writeFile(breadcrumbPath, breadcrumbContent);
        
        // Create index.ts for Others interfaces
        const indexPath = path.join(othersDir, 'index.ts');
        const indexContent = `export * from './GenericBreadcrumbItem';
export * from './PaginateMeta';
export * from './PaginateMetaLink';
export * from './PaginateResponse';
export * from './ServiceFilterOptions';
export * from './ServiceHooksFactory';
`;
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
        
        const routesContent = `/**
 * Route constants used throughout the application
 */
export const ROUTES = {
    // Dashboard
    DASHBOARD: 'dashboard',
    
    // Auth
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
    
    // Add your model routes here as you create them
    // Example: USERS: 'users',
};`;

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
        const queryKeyHelperContent = `import { ServiceFilterOptions } from '@/Support/Interfaces/Others';

/**
 * Generate a unique query key for tanstack query based on endpoint and options
 */
export function generateServiceHooksFactoryQueryKey(
    endpoint: string,
    options?: ServiceFilterOptions,
    suffix?: string | number
): (string | Record<string, any> | number | undefined)[] {
    const queryKey = [endpoint];
    
    if (options) {
        queryKey.push(options);
    }
    
    if (suffix !== undefined) {
        queryKey.push(suffix);
    }
    
    return queryKey;
}`;
        await fs.promises.writeFile(queryKeyHelperPath, queryKeyHelperContent);
        
        // Create query error helper
        const queryErrorHelperPath = path.join(helpersDir, 'tanstackQueryHelpers.ts');
        const queryErrorHelperContent = `/**
 * Extract error message from API error responses
 */
export function getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    
    if (error.message) {
        return error.message;
    }
    
    return 'An unknown error occurred';
}`;
        await fs.promises.writeFile(queryErrorHelperPath, queryErrorHelperContent);
        
        // Create breadcrumb helper
        const breadcrumbHelperPath = path.join(helpersDir, 'generateDynamicBreadcrumbs.ts');
        const breadcrumbHelperContent = `import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { ROUTES } from '@/Support/Constants/routes';

/**
 * Generate breadcrumb items for a route
 */
export function generateDynamicBreadcrumbs(
    baseRoute: string, 
    currentPage: 'index' | 'create' | 'edit' | 'show',
    entityName?: string,
    entityId?: number
): GenericBreadcrumbItem[] {
    const breadcrumbs: GenericBreadcrumbItem[] = [
        { title: 'Dashboard', href: route(ROUTES.DASHBOARD) },
        { title: baseRoute.charAt(0).toUpperCase() + baseRoute.slice(1), href: route(baseRoute + '.index') }
    ];
    
    switch (currentPage) {
        case 'create':
            breadcrumbs.push({ title: 'Create', active: true });
            break;
        case 'edit':
            breadcrumbs.push({ title: \`Edit \${entityName || ''}\`, active: true });
            break;
        case 'show':
            breadcrumbs.push({ title: entityName || \`#\${entityId}\`, active: true });
            break;
    }
    
    return breadcrumbs;
}`;
        await fs.promises.writeFile(breadcrumbHelperPath, breadcrumbHelperContent);
        
        // Create index.ts for helpers
        const indexPath = path.join(helpersDir, 'index.ts');
        const indexContent = `export * from './generateServiceHooksFactoryQueryKey';
export * from './tanstackQueryHelpers';
export * from './generateDynamicBreadcrumbs';
`;
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
        const serviceFactoryContent = `import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceFilterOptions, ServiceHooksFactory } from '@/Support/Interfaces/Others';
import { generateServiceHooksFactoryQueryKey } from '@/Helpers';
import { getErrorMessage } from '@/Helpers/tanstackQueryHelpers';

/**
 * Generic service hooks factory to create API service hooks
 */
export function createServiceHooks<TData, TResource, TPayload = Partial<TData>>(
    apiEndpoint: string
): ServiceHooksFactory<TData, TResource, TPayload> {
    return {
        useGetAll: (options?: ServiceFilterOptions) => {
            return useQuery({
                queryKey: generateServiceHooksFactoryQueryKey(apiEndpoint, options),
                queryFn: async () => {
                    const params = options || {};
                    const response = await axios.get(apiEndpoint, { params });
                    return response.data.data;
                },
                meta: {
                    errorMessage: 'Failed to fetch data'
                }
            });
        },
        
        useGetPaginated: (options?: ServiceFilterOptions) => {
            return useQuery({
                queryKey: generateServiceHooksFactoryQueryKey(apiEndpoint, options),
                queryFn: async () => {
                    const params = options || {};
                    const response = await axios.get(apiEndpoint, { params });
                    return response.data;
                },
                meta: {
                    errorMessage: 'Failed to fetch paginated data'
                }
            });
        },
        
        useGetById: (id: number) => {
            return useQuery({
                queryKey: generateServiceHooksFactoryQueryKey(apiEndpoint, undefined, id),
                queryFn: async () => {
                    const response = await axios.get(\`\${apiEndpoint}/\${id}\`);
                    return response.data.data;
                },
                meta: {
                    errorMessage: \`Failed to fetch item #\${id}\`
                }
            });
        },
        
        useCreate: () => {
            const queryClient = useQueryClient();
            
            return useMutation({
                mutationFn: async (payload: TPayload) => {
                    const response = await axios.post(apiEndpoint, payload);
                    return response.data;
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
                },
                onError: (error) => {
                    console.error('Create error:', getErrorMessage(error));
                }
            });
        },
        
        useUpdate: (id: number) => {
            const queryClient = useQueryClient();
            
            return useMutation({
                mutationFn: async (payload: TPayload) => {
                    const response = await axios.put(\`\${apiEndpoint}/\${id}\`, payload);
                    return response.data;
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
                    queryClient.invalidateQueries({ queryKey: generateServiceHooksFactoryQueryKey(apiEndpoint, undefined, id) });
                },
                onError: (error) => {
                    console.error('Update error:', getErrorMessage(error));
                }
            });
        },
        
        useDelete: () => {
            const queryClient = useQueryClient();
            
            return useMutation({
                mutationFn: async (id: number) => {
                    await axios.delete(\`\${apiEndpoint}/\${id}\`);
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
                },
                onError: (error) => {
                    console.error('Delete error:', getErrorMessage(error));
                }
            });
        }
    };
}`;

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