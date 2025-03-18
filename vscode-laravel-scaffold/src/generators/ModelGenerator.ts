import * as vscode from 'vscode';
import { FileGenerator } from '../utils/FileGenerator';
import { TemplateProcessor } from '../utils/TemplateProcessor';
import { LaravelProjectAnalyzer } from '../utils/LaravelProjectAnalyzer';

export class ModelGenerator {
    private context: vscode.ExtensionContext;
    private fileGenerator: FileGenerator;
    private templateProcessor: TemplateProcessor;
    private projectAnalyzer: LaravelProjectAnalyzer;
    private panel: vscode.WebviewPanel | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.fileGenerator = new FileGenerator();
        this.templateProcessor = new TemplateProcessor();
        this.projectAnalyzer = new LaravelProjectAnalyzer();
    }

    public async showModelDefinitionUI(): Promise<void> {
        // Create and show a webview panel for defining the model
        this.panel = vscode.window.createWebviewPanel(
            'modelDefinition',
            'Define Laravel Model',
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
                    case 'generateModel':
                        await this.generateFiles(message.modelData);
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

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Define Model</title>
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
                input, select {
                    width: 100%;
                    padding: 5px;
                    box-sizing: border-box;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
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
                .attributes-container {
                    margin-top: 20px;
                    border: 1px solid var(--vscode-panel-border);
                    padding: 10px;
                }
                .attribute-row {
                    display: flex;
                    margin-bottom: 10px;
                    gap: 10px;
                }
                .checkbox-group {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                }
                .checkbox-item {
                    display: flex;
                    align-items: center;
                }
                .checkbox-item input {
                    width: auto;
                    margin-right: 5px;
                }
            </style>
        </head>
        <body>
            <h1>Define Your Laravel Model</h1>
            <div class="form-group">
                <label for="modelName">Model Name (singular):</label>
                <input type="text" id="modelName" placeholder="e.g. User, Product, Article">
            </div>
            
            <div class="form-group">
                <label for="tableName">Table Name (plural, leave empty for auto-generation):</label>
                <input type="text" id="tableName" placeholder="e.g. users, products, articles">
            </div>
            
            <h2>Model Attributes</h2>
            <div id="attributesContainer" class="attributes-container">
                <div class="attribute-row">
                    <input type="text" placeholder="Attribute name" class="attr-name">
                    <select class="attr-type">
                        <option value="string">String</option>
                        <option value="integer">Integer</option>
                        <option value="bigInteger">Big Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="dateTime">DateTime</option>
                        <option value="decimal">Decimal</option>
                        <option value="float">Float</option>
                        <option value="text">Text</option>
                        <option value="json">JSON</option>
                    </select>
                    <input type="text" placeholder="Default value" class="attr-default">
                    <div class="checkbox-item">
                        <input type="checkbox" class="attr-nullable">
                        <label>Nullable</label>
                    </div>
                </div>
            </div>
            <button id="addAttribute">Add Attribute</button>
            
            <div class="form-group">
                <h2>Generate Additional Files</h2>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateMigration" checked>
                        <label for="generateMigration">Migration</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateFactory">
                        <label for="generateFactory">Factory</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateSeeder">
                        <label for="generateSeeder">Seeder</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateRepository">
                        <label for="generateRepository">Repository</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateService">
                        <label for="generateService">Service</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateRequests">
                        <label for="generateRequests">Form Requests</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateFrontend">
                        <label for="generateFrontend">Frontend TypeScript</label>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 30px;">
                <button id="generateButton">Generate</button>
                <button id="cancelButton">Cancel</button>
            </div>
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Add attribute button
                    document.getElementById('addAttribute').addEventListener('click', () => {
                        const container = document.getElementById('attributesContainer');
                        const newRow = document.createElement('div');
                        newRow.className = 'attribute-row';
                        newRow.innerHTML = \`
                            <input type="text" placeholder="Attribute name" class="attr-name">
                            <select class="attr-type">
                                <option value="string">String</option>
                                <option value="integer">Integer</option>
                                <option value="bigInteger">Big Integer</option>
                                <option value="boolean">Boolean</option>
                                <option value="date">Date</option>
                                <option value="dateTime">DateTime</option>
                                <option value="decimal">Decimal</option>
                                <option value="float">Float</option>
                                <option value="text">Text</option>
                                <option value="json">JSON</option>
                            </select>
                            <input type="text" placeholder="Default value" class="attr-default">
                            <div class="checkbox-item">
                                <input type="checkbox" class="attr-nullable">
                                <label>Nullable</label>
                            </div>
                        \`;
                        container.appendChild(newRow);
                    });
                    
                    // Generate button
                    document.getElementById('generateButton').addEventListener('click', () => {
                        const modelName = document.getElementById('modelName').value;
                        if (!modelName) {
                            alert('Model name is required');
                            return;
                        }
                        
                        // Collect attributes
                        const attributes = [];
                        const rows = document.querySelectorAll('.attribute-row');
                        rows.forEach(row => {
                            const name = row.querySelector('.attr-name').value;
                            if (name) {
                                attributes.push({
                                    name: name,
                                    type: row.querySelector('.attr-type').value,
                                    default: row.querySelector('.attr-default').value,
                                    nullable: row.querySelector('.attr-nullable').checked,
                                });
                            }
                        });
                        
                        // Collect options
                        const options = {
                            generateMigration: document.getElementById('generateMigration').checked,
                            generateFactory: document.getElementById('generateFactory').checked,
                            generateSeeder: document.getElementById('generateSeeder').checked,
                            generateRepository: document.getElementById('generateRepository').checked,
                            generateService: document.getElementById('generateService').checked,
                            generateRequests: document.getElementById('generateRequests').checked,
                            generateFrontend: document.getElementById('generateFrontend').checked,
                        };
                        
                        // Send data to extension
                        vscode.postMessage({
                            command: 'generateModel',
                            modelData: {
                                name: modelName,
                                tableName: document.getElementById('tableName').value,
                                attributes: attributes,
                                options: options
                            }
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

    private async generateFiles(modelData: any): Promise<void> {
        try {
            const { name, tableName, attributes, options } = modelData;
            
            // Generate Model
            await this.generateModelFile(name, attributes, tableName);
            
            // Generate additional files based on options
            if (options.generateMigration) {
                await this.generateMigrationFile(name, tableName, attributes);
            }
            
            if (options.generateFactory) {
                await this.generateFactoryFile(name, attributes);
            }
            
            if (options.generateRepository) {
                await this.generateRepositoryFiles(name);
            }
            
            if (options.generateService) {
                await this.generateServiceFiles(name);
            }
            
            if (options.generateRequests) {
                await this.generateRequestFiles(name, attributes);
            }
            
            if (options.generateFrontend) {
                await this.generateFrontendFiles(name, attributes);
            }
            
            vscode.window.showInformationMessage(`Successfully generated files for ${name} model!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate files: ${error}`);
        }
    }

    // Change from private to public to allow access from CrudGenerator
    public async generateModelFile(name: string, attributes: any[], tableName?: string): Promise<void> {
        const modelTemplate = await this.templateProcessor.getModelTemplate(name, attributes, tableName);
        const modelPath = await this.projectAnalyzer.getModelFilePath(name);
        await this.fileGenerator.createFile(modelPath, modelTemplate);
    }

    private async generateMigrationFile(name: string, tableName: string, attributes: any[]): Promise<void> {
        const migrationTemplate = await this.templateProcessor.getMigrationTemplate(name, tableName, attributes);
        
        // Generate proper timestamp for migration file
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const timestamp = `${year}_${month}_${day}_${hours}${minutes}${seconds}`;
        const migrationName = `${timestamp}_create_${tableName || this.pluralize(name.toLowerCase())}_table`;
        
        const migrationPath = await this.projectAnalyzer.getMigrationFilePath(migrationName);
        await this.fileGenerator.createFile(migrationPath, migrationTemplate);
    }

    private async generateFactoryFile(name: string, attributes: any[]): Promise<void> {
        const factoryTemplate = await this.templateProcessor.getFactoryTemplate(name, attributes);
        const factoryPath = await this.projectAnalyzer.getFactoryFilePath(name);
        await this.fileGenerator.createFile(factoryPath, factoryTemplate);
    }

    private async generateRepositoryFiles(name: string): Promise<void> {
        // Repository Interface
        const repositoryInterfaceTemplate = await this.templateProcessor.getRepositoryInterfaceTemplate(name);
        const repositoryInterfacePath = await this.projectAnalyzer.getRepositoryInterfaceFilePath(name);
        await this.fileGenerator.createFile(repositoryInterfacePath, repositoryInterfaceTemplate);
        
        // Repository Implementation
        const repositoryTemplate = await this.templateProcessor.getRepositoryTemplate(name);
        const repositoryPath = await this.projectAnalyzer.getRepositoryFilePath(name);
        await this.fileGenerator.createFile(repositoryPath, repositoryTemplate);
    }

    private async generateServiceFiles(name: string): Promise<void> {
        // Service Interface
        const serviceInterfaceTemplate = await this.templateProcessor.getServiceInterfaceTemplate(name);
        const serviceInterfacePath = await this.projectAnalyzer.getServiceInterfaceFilePath(name);
        await this.fileGenerator.createFile(serviceInterfacePath, serviceInterfaceTemplate);
        
        // Service Implementation
        const serviceTemplate = await this.templateProcessor.getServiceTemplate(name);
        const servicePath = await this.projectAnalyzer.getServiceFilePath(name);
        await this.fileGenerator.createFile(servicePath, serviceTemplate);
    }

    private async generateRequestFiles(name: string, attributes: any[]): Promise<void> {
        // Store Request
        const storeRequestTemplate = await this.templateProcessor.getStoreRequestTemplate(name, attributes);
        const storeRequestPath = await this.projectAnalyzer.getRequestFilePath(name, 'Store');
        await this.fileGenerator.createFile(storeRequestPath, storeRequestTemplate);
        
        // Update Request
        const updateRequestTemplate = await this.templateProcessor.getUpdateRequestTemplate(name, attributes);
        const updateRequestPath = await this.projectAnalyzer.getRequestFilePath(name, 'Update');
        await this.fileGenerator.createFile(updateRequestPath, updateRequestTemplate);
    }

    private async generateFrontendFiles(name: string, attributes: any[]): Promise<void> {
        // TypeScript Model Interface
        const modelInterfaceTemplate = await this.templateProcessor.getTsModelInterfaceTemplate(name, attributes);
        const modelInterfacePath = await this.projectAnalyzer.getTsModelInterfacePath(name);
        await this.fileGenerator.createFile(modelInterfacePath, modelInterfaceTemplate);
        
        // TypeScript Resource Interface
        const resourceInterfaceTemplate = await this.templateProcessor.getTsResourceInterfaceTemplate(name, attributes);
        const resourceInterfacePath = await this.projectAnalyzer.getTsResourceInterfacePath(name);
        await this.fileGenerator.createFile(resourceInterfacePath, resourceInterfaceTemplate);
        
        // TypeScript Service
        const serviceTemplate = await this.templateProcessor.getTsServiceTemplate(name);
        const servicePath = await this.projectAnalyzer.getTsServicePath(name);
        await this.fileGenerator.createFile(servicePath, serviceTemplate);
    }

    // Simple pluralization for English nouns
    private pluralize(word: string): string {
        if (word.endsWith('y')) {
            return word.slice(0, -1) + 'ies';
        } else if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
                  word.endsWith('ch') || word.endsWith('sh')) {
            return word + 'es';
        } else {
            return word + 's';
        }
    }

    // Find the section where attributes are collected and add special handling for boolean type
    private async collectAttributes(): Promise<any[]> {
        const attributes: any[] = [];
        let continueAdding = true;

        while (continueAdding) {
            // Get attribute name
            const attributeName = await vscode.window.showInputBox({
                prompt: 'Enter attribute name (leave empty to finish)',
                placeHolder: 'Attribute name'
            });

            // If no name provided, stop adding attributes
            if (!attributeName) {
                continueAdding = false;
                continue;
            }

            // Get attribute type
            const attributeType = await vscode.window.showQuickPick([
                { label: 'string', description: 'String type' },
                { label: 'integer', description: 'Integer type' },
                { label: 'bigInteger', description: 'Big Integer type' },
                { label: 'boolean', description: 'Boolean type' },
                { label: 'date', description: 'Date type' },
                { label: 'dateTime', description: 'DateTime type' },
                { label: 'decimal', description: 'Decimal type' },
                { label: 'float', description: 'Float type' },
                { label: 'text', description: 'Text type' },
                { label: 'json', description: 'JSON type' },
            ], { placeHolder: 'Select attribute type' });

            if (!attributeType) {
                return attributes; // User cancelled
            }

            // Is attribute nullable?
            const isNullable = await vscode.window.showQuickPick([
                { label: 'No', description: 'Not nullable' },
                { label: 'Yes', description: 'Nullable' }
            ], { placeHolder: 'Is attribute nullable?' });

            // Handle default value differently for boolean
            let defaultValue = '';
            
            if (attributeType.label === 'boolean') {
                // For boolean, present true/false dropdown
                const boolDefault = await vscode.window.showQuickPick([
                    { label: 'false', description: 'Boolean false' },
                    { label: 'true', description: 'Boolean true' },
                    { label: '', description: 'No default' }
                ], { placeHolder: 'Select default value' });
                
                defaultValue = boolDefault ? boolDefault.label : '';
            } else {
                // For other types, use text input as before
                defaultValue = await vscode.window.showInputBox({
                    prompt: `Default value for ${attributeName} (leave empty for no default)`,
                    placeHolder: 'Default value'
                }) || '';
            }

            // Add attribute to collection
            attributes.push({
                name: attributeName,
                type: attributeType.label,
                nullable: isNullable?.label === 'Yes',
                default: defaultValue,
                fillable: true
            });
        }

        return attributes;
    }
}
