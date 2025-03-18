import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Manages setting up and validating required directories and stub files
 */
export class SetupManager {
    /**
     * Ensure all necessary directories exist for Laravel scaffolding
     */
    static async ensureDirectoriesExist(): Promise<boolean> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return false;
            }

            // Ensure scaffold stubs directory exists
            const scaffoldStubsBackend = path.join(workspaceFolder, 'stubs', 'scaffold', 'backend');
            const scaffoldStubsFrontend = path.join(workspaceFolder, 'stubs', 'scaffold', 'frontend');

            if (!fs.existsSync(scaffoldStubsBackend)) {
                fs.mkdirSync(scaffoldStubsBackend, { recursive: true });
            }
            
            if (!fs.existsSync(scaffoldStubsFrontend)) {
                fs.mkdirSync(scaffoldStubsFrontend, { recursive: true });
            }
            
            return true;
        } catch (error) {
            console.error('Error ensuring directories exist:', error);
            vscode.window.showErrorMessage(`Failed to ensure directories: ${error}`);
            return false;
        }
    }

    /**
     * Initialize stubs by copying them from the extension to the workspace
     */
    static async initializeStubs(): Promise<boolean> {
        try {
            const extensionPath = vscode.extensions.getExtension('laravel-scaffold')?.extensionPath;
            if (!extensionPath) {
                vscode.window.showErrorMessage('Could not find extension path');
                return false;
            }

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return false;
            }

            // Ensure the project is initialized for stubs
            await this.ensureDirectoriesExist();

            // Source and target directories
            const backendStubsSource = path.join(extensionPath, 'stubs', 'backend');
            const backendStubsTarget = path.join(workspaceFolder, 'stubs', 'scaffold', 'backend');
            const frontendStubsSource = path.join(extensionPath, 'stubs', 'frontend');
            const frontendStubsTarget = path.join(workspaceFolder, 'stubs', 'scaffold', 'frontend');
            const initializerTarget = path.join(workspaceFolder, 'stubs', 'scaffold', 'initializer');
            const initializerFrontendTarget = path.join(initializerTarget, 'frontend');
            const initializerBackendTarget = path.join(initializerTarget, 'backend');
            
            // Create directories if they don't exist
            if (!fs.existsSync(initializerTarget)) {
                fs.mkdirSync(initializerTarget, { recursive: true });
            }
            if (!fs.existsSync(initializerFrontendTarget)) {
                fs.mkdirSync(initializerFrontendTarget, { recursive: true });
            }
            if (!fs.existsSync(initializerBackendTarget)) {
                fs.mkdirSync(initializerBackendTarget, { recursive: true });
            }
            
            // Copy backend and frontend stubs
            if (fs.existsSync(backendStubsSource)) {
                await this.copyDirectory(backendStubsSource, backendStubsTarget);
            }
            
            if (fs.existsSync(frontendStubsSource)) {
                await this.copyDirectory(frontendStubsSource, frontendStubsTarget);
            }
            
            // Copy specific files to initializer directories
            const initializerFiles = ['interface-base.stub', 'routes.stub', 'service-factory.stub'];
            
            for (const file of initializerFiles) {
                const sourcePath = path.join(frontendStubsSource, file);
                const targetPath = path.join(initializerFrontendTarget, file);
                
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, targetPath);
                }
            }
            
            vscode.window.showInformationMessage('Laravel scaffolding stubs initialized');
            return true;
        } catch (error) {
            console.error('Error initializing stubs:', error);
            vscode.window.showErrorMessage(`Failed to initialize stubs: ${error}`);
            return false;
        }
    }

    /**
     * Copy all files from source directory to target directory
     */
    private static async copyDirectory(source: string, target: string): Promise<void> {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        
        const entries = fs.readdirSync(source, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(source, entry.name);
            const destPath = path.join(target, entry.name);
            
            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}
