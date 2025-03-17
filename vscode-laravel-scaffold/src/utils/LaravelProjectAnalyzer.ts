import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs'; // Fix the fs/promises import

export class LaravelProjectAnalyzer {
    private rootPath: string;

    constructor() {
        this.rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
    }

    /**
     * Check if the current workspace is a Laravel project
     */
    public async isLaravelProject(): Promise<boolean> {
        try {
            // Check for artisan file, composer.json with laravel/framework dependency
            const artisanPath = path.join(this.rootPath, 'artisan');
            const composerPath = path.join(this.rootPath, 'composer.json');
            
            const artisanExists = await this.fileExists(artisanPath);
            if (!artisanExists) return false;
            
            const composerExists = await this.fileExists(composerPath);
            if (!composerExists) return false;
            
            // Check if composer.json contains laravel/framework
            const composerData = await fsPromises.readFile(composerPath, 'utf-8');
            const composerJson = JSON.parse(composerData);
            
            return composerJson.require && composerJson.require['laravel/framework'] !== undefined;
        } catch (error) {
            console.error('Error checking Laravel project: ', error);
            return false;
        }
    }

    /**
     * Check if file exists
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fsPromises.access(filePath); // Use fsPromises instead of fs/promises
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create directory if it doesn't exist
     */
    private async ensureDirectoryExists(directoryPath: string): Promise<void> {
        try {
            await fsPromises.access(directoryPath); // Use fsPromises instead of fs/promises
        } catch {
            await fsPromises.mkdir(directoryPath, { recursive: true }); // Use fsPromises instead of fs/promises
        }
    }

    /**
     * Get path to model file
     */
    public async getModelFilePath(name: string): Promise<string> {
        const modelPath = path.join(this.rootPath, 'app', 'Models');
        await this.ensureDirectoryExists(modelPath);
        return path.join(modelPath, `${this.toPascalCase(name)}.php`);
    }

    /**
     * Get path to migration file
     */
    public async getMigrationFilePath(name: string): Promise<string> {
        const migrationPath = path.join(this.rootPath, 'database', 'migrations');
        await this.ensureDirectoryExists(migrationPath);
        return path.join(migrationPath, `${name}.php`);
    }

    /**
     * Get path to factory file
     */
    public async getFactoryFilePath(name: string): Promise<string> {
        const factoryPath = path.join(this.rootPath, 'database', 'factories');
        await this.ensureDirectoryExists(factoryPath);
        return path.join(factoryPath, `${this.toPascalCase(name)}Factory.php`);
    }

    /**
     * Get path to seeder file
     */
    public async getSeederFilePath(name: string): Promise<string> {
        const seederPath = path.join(this.rootPath, 'database', 'seeders');
        await this.ensureDirectoryExists(seederPath);
        return path.join(seederPath, `${this.toPascalCase(name)}Seeder.php`);
    }

    /**
     * Get path to repository interface file
     */
    public async getRepositoryInterfaceFilePath(name: string): Promise<string> {
        const interfacePath = path.join(this.rootPath, 'app', 'Support', 'Interfaces', 'Repositories');
        await this.ensureDirectoryExists(interfacePath);
        return path.join(interfacePath, `${this.toPascalCase(name)}RepositoryInterface.php`);
    }

    /**
     * Get path to repository implementation file
     */
    public async getRepositoryFilePath(name: string): Promise<string> {
        const repoPath = path.join(this.rootPath, 'app', 'Repositories');
        await this.ensureDirectoryExists(repoPath);
        return path.join(repoPath, `${this.toPascalCase(name)}Repository.php`);
    }

    /**
     * Get path to service interface file
     */
    public async getServiceInterfaceFilePath(name: string): Promise<string> {
        const interfacePath = path.join(this.rootPath, 'app', 'Support', 'Interfaces', 'Services');
        await this.ensureDirectoryExists(interfacePath);
        return path.join(interfacePath, `${this.toPascalCase(name)}ServiceInterface.php`);
    }

    /**
     * Get path to service implementation file
     */
    public async getServiceFilePath(name: string): Promise<string> {
        const servicePath = path.join(this.rootPath, 'app', 'Services');
        await this.ensureDirectoryExists(servicePath);
        return path.join(servicePath, `${this.toPascalCase(name)}Service.php`);
    }

    /**
     * Get path to request file
     */
    public async getRequestFilePath(name: string, type: string): Promise<string> {
        const requestDir = path.join(this.rootPath, 'app', 'Http', 'Requests', this.toPascalCase(name));
        await this.ensureDirectoryExists(requestDir);
        return path.join(requestDir, `${type}${this.toPascalCase(name)}Request.php`);
    }

    /**
     * Get path to controller file
     */
    public async getControllerFilePath(name: string): Promise<string> {
        const controllerPath = path.join(this.rootPath, 'app', 'Http', 'Controllers');
        await this.ensureDirectoryExists(controllerPath);
        return path.join(controllerPath, `${this.toPascalCase(name)}Controller.php`);
    }

    /**
     * Get path to API controller file
     */
    public async getApiControllerFilePath(name: string): Promise<string> {
        const apiControllerPath = path.join(this.rootPath, 'app', 'Http', 'Controllers', 'Api');
        await this.ensureDirectoryExists(apiControllerPath);
        return path.join(apiControllerPath, `${this.toPascalCase(name)}Controller.php`);
    }

    /**
     * Get path to resource file
     */
    public async getResourceFilePath(name: string): Promise<string> {
        const resourcePath = path.join(this.rootPath, 'app', 'Http', 'Resources');
        await this.ensureDirectoryExists(resourcePath);
        return path.join(resourcePath, `${this.toPascalCase(name)}Resource.php`);
    }

    /**
     * Get path to resource collection file
     */
    public async getCollectionFilePath(name: string): Promise<string> {
        const collectionPath = path.join(this.rootPath, 'app', 'Http', 'Resources');
        await this.ensureDirectoryExists(collectionPath);
        return path.join(collectionPath, `${this.toPascalCase(name)}Collection.php`);
    }

    /**
     * Get path to feature test file
     */
    public async getFeatureTestFilePath(name: string): Promise<string> {
        const featureTestPath = path.join(this.rootPath, 'tests', 'Feature');
        await this.ensureDirectoryExists(featureTestPath);
        return path.join(featureTestPath, `${this.toPascalCase(name)}Test.php`);
    }

    /**
     * Get path to unit test file
     */
    public async getUnitTestFilePath(name: string): Promise<string> {
        const unitTestPath = path.join(this.rootPath, 'tests', 'Unit');
        await this.ensureDirectoryExists(unitTestPath);
        return path.join(unitTestPath, `${this.toPascalCase(name)}Test.php`);
    }

    /**
     * Get path to TypeScript model interface file
     */
    public async getTsModelInterfacePath(name: string): Promise<string> {
        const modelInterfacePath = path.join(this.rootPath, 'resources', 'js', 'Support', 'Interfaces', 'Models');
        await this.ensureDirectoryExists(modelInterfacePath);
        return path.join(modelInterfacePath, `${this.toPascalCase(name)}.ts`);
    }

    /**
     * Get path to TypeScript resource interface file
     */
    public async getTsResourceInterfacePath(name: string): Promise<string> {
        const resourceInterfacePath = path.join(this.rootPath, 'resources', 'js', 'Support', 'Interfaces', 'Resources');
        await this.ensureDirectoryExists(resourceInterfacePath);
        return path.join(resourceInterfacePath, `${this.toPascalCase(name)}Resource.ts`);
    }

    /**
     * Get path to TypeScript service hook file
     */
    public async getTsServiceHookPath(name: string): Promise<string> {
        const serviceHookPath = path.join(this.rootPath, 'resources', 'js', 'Services');
        await this.ensureDirectoryExists(serviceHookPath);
        return path.join(serviceHookPath, `${this.toCamelCase(name)}ServiceHook.ts`);
    }

    /**
     * Get path to TypeScript service file
     */
    public async getTsServicePath(name: string): Promise<string> {
        const servicePath = path.join(this.rootPath, 'resources', 'js', 'Services');
        await this.ensureDirectoryExists(servicePath);
        return path.join(servicePath, `${this.toPascalCase(name)}Service.ts`);
    }

    /**
     * Get path to TypeScript index page file
     */
    public async getTsIndexPagePath(name: string): Promise<string> {
        const indexPath = path.join(this.rootPath, 'resources', 'js', 'Pages', this.toPascalCase(name));
        await this.ensureDirectoryExists(indexPath);
        return path.join(indexPath, 'Index.tsx');
    }

    /**
     * Get path to TypeScript form component file
     */
    public async getTsFormComponentPath(name: string): Promise<string> {
        const formPath = path.join(this.rootPath, 'resources', 'js', 'Pages', this.toPascalCase(name), 'Partials');
        await this.ensureDirectoryExists(formPath);
        return path.join(formPath, `${this.toPascalCase(name)}Form.tsx`);
    }

    /**
     * Convert string to PascalCase
     */
    private toPascalCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }

    /**
     * Convert string to camelCase
     */
    private toCamelCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c, i) => i === 0 && c ? c.toLowerCase() : c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }
}
