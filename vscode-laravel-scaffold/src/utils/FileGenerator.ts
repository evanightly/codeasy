import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateProcessor } from './TemplateProcessor';

export class FileGenerator {
    private basePath: string;
    private templateProcessor: TemplateProcessor;

    constructor() {
        // Initialize basePath to the first workspace folder or an empty string
        this.basePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.templateProcessor = new TemplateProcessor();
    }

    /**
     * Create a file at the specified path with the provided content
     */
    public async createFile(filePath: string, content: string): Promise<void> {
        try {
            // Ensure the directory exists
            await this.ensureDirectoryExists(path.dirname(filePath));

            // Check if file already exists
            if (fs.existsSync(filePath)) {
                const overwrite = await vscode.window.showWarningMessage(
                    `File ${path.basename(filePath)} already exists. Overwrite?`,
                    'Yes',
                    'No'
                );
                
                if (overwrite !== 'Yes') {
                    vscode.window.showInformationMessage(`Skipped creating ${path.basename(filePath)}`);
                    return;
                }
            }

            // Write file
            fs.writeFileSync(filePath, content);
            
            // Open the file in the editor
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

        } catch (error) {
            throw new Error(`Failed to create file at ${filePath}: ${error}`);
        }
    }

    public async generateStoreRequest(name: string, attributes: any[]): Promise<string> {
        const modelName = this.toPascalCase(name);
        
        // Create the directory structure for model-specific requests
        const requestDir = path.join(this.basePath, 'app', 'Http', 'Requests', modelName);
        if (!fs.existsSync(requestDir)) {
            fs.mkdirSync(requestDir, { recursive: true });
        }
        
        const filePath = path.join(requestDir, `Store${modelName}Request.php`);
        const content = await this.templateProcessor.getStoreRequestTemplate(name, attributes);
        
        await fs.promises.writeFile(filePath, content);
        return filePath;
    }

    public async generateUpdateRequest(name: string, attributes: any[]): Promise<string> {
        const modelName = this.toPascalCase(name);
        
        // Create the directory structure for model-specific requests
        const requestDir = path.join(this.basePath, 'app', 'Http', 'Requests', modelName);
        if (!fs.existsSync(requestDir)) {
            fs.mkdirSync(requestDir, { recursive: true });
        }
        
        const filePath = path.join(requestDir, `Update${modelName}Request.php`);
        const content = await this.templateProcessor.getUpdateRequestTemplate(name, attributes);
        
        await fs.promises.writeFile(filePath, content);
        return filePath;
    }

    /**
     * Create directory if it doesn't exist
     */
    private async ensureDirectoryExists(directoryPath: string): Promise<void> {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
    }

    // Convert string to PascalCase
    private toPascalCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }
}
