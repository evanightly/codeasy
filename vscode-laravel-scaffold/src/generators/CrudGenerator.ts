import * as vscode from 'vscode';
import { ModelGenerator } from './ModelGenerator';
import { FileGenerator } from '../utils/FileGenerator';
import { TemplateProcessor } from '../utils/TemplateProcessor';
import { LaravelProjectAnalyzer } from '../utils/LaravelProjectAnalyzer';

export class CrudGenerator {
    private context: vscode.ExtensionContext;
    private fileGenerator: FileGenerator;
    private templateProcessor: TemplateProcessor;
    private projectAnalyzer: LaravelProjectAnalyzer;
    private modelGenerator: ModelGenerator;
    private panel: vscode.WebviewPanel | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.fileGenerator = new FileGenerator();
        this.templateProcessor = new TemplateProcessor();
        this.projectAnalyzer = new LaravelProjectAnalyzer();
        this.modelGenerator = new ModelGenerator(context);
    }

    public async showCrudDefinitionUI(): Promise<void> {
        // Create and show a webview panel for defining the CRUD
        this.panel = vscode.window.createWebviewPanel(
            'crudDefinition',
            'Define Laravel CRUD',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        // Set the HTML content for the webview - similar to model generator but with CRUD options
        this.panel.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'generateCrud':
                        await this.generateFiles(message.crudData);
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
            <title>Define CRUD</title>
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
                input, select, textarea {
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
                    flex-wrap: wrap;
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
            <h1>Generate Complete CRUD</h1>
            <div class="form-group">
                <label for="modelName">Model Name (singular):</label>
                <input type="text" id="modelName" placeholder="e.g. User, Product, Article">
            </div>
            
            <div class="form-group">
                <label for="tableName">Table Name (plural, leave empty for auto-generation):</label>
                <input type="text" id="tableName" placeholder="e.g. users, products, articles">
            </div>
            
            <div class="form-group">
                <label for="apiResource">API Resource Name:</label>
                <input type="text" id="apiResource" placeholder="e.g. /api/users, /api/products">
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
                    <div class="checkbox-item">
                        <input type="checkbox" class="attr-fillable" checked>
                        <label>Fillable</label>
                    </div>
                </div>
            </div>
            <button id="addAttribute">Add Attribute</button>
            
            <div class="form-group">
                <h2>Generate Files</h2>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateModel" checked>
                        <label for="generateModel">Model</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateMigration" checked>
                        <label for="generateMigration">Migration</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateFactory" checked>
                        <label for="generateFactory">Factory</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateSeeder" checked>
                        <label for="generateSeeder">Seeder</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateRepository" checked>
                        <label for="generateRepository">Repository</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateService" checked>
                        <label for="generateService">Service</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateRequests" checked>
                        <label for="generateRequests">Form Requests</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateController" checked>
                        <label for="generateController">Controller</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateApiController" checked>
                        <label for="generateApiController">API Controller</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateResource" checked>
                        <label for="generateResource">Resource</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateCollection" checked>
                        <label for="generateCollection">Resource Collection</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateTests" checked>
                        <label for="generateTests">Tests</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateFrontend" checked>
                        <label for="generateFrontend">Frontend TypeScript</label>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <h2>Frontend Files</h2>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateTypescriptModel" checked>
                        <label for="generateTypescriptModel">TS Model Interface</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateTypescriptResource" checked>
                        <label for="generateTypescriptResource">TS Resource Interface</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateServiceHook" checked>
                        <label for="generateServiceHook">API Service Hook</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateIndex" checked>
                        <label for="generateIndex">Index Page</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="generateForm" checked>
                        <label for="generateForm">Create/Edit Form</label>
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
                            <div class="checkbox-item">
                                <input type="checkbox" class="attr-fillable" checked>
                                <label>Fillable</label>
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
                                    fillable: row.querySelector('.attr-fillable').checked
                                });
                            }
                        });
                        
                        // Collect options for backend
                        const backendOptions = {
                            generateModel: document.getElementById('generateModel').checked,
                            generateMigration: document.getElementById('generateMigration').checked,
                            generateFactory: document.getElementById('generateFactory').checked,
                            generateSeeder: document.getElementById('generateSeeder').checked,
                            generateRepository: document.getElementById('generateRepository').checked,
                            generateService: document.getElementById('generateService').checked,
                            generateRequests: document.getElementById('generateRequests').checked,
                            generateController: document.getElementById('generateController').checked,
                            generateApiController: document.getElementById('generateApiController').checked,
                            generateResource: document.getElementById('generateResource').checked,
                            generateCollection: document.getElementById('generateCollection').checked,
                            generateTests: document.getElementById('generateTests').checked
                        };
                        
                        // Collect options for frontend
                        const frontendOptions = {
                            generateTypescriptModel: document.getElementById('generateTypescriptModel').checked,
                            generateTypescriptResource: document.getElementById('generateTypescriptResource').checked,
                            generateServiceHook: document.getElementById('generateServiceHook').checked,
                            generateIndex: document.getElementById('generateIndex').checked,
                            generateForm: document.getElementById('generateForm').checked
                        };
                        
                        // Send data to extension
                        vscode.postMessage({
                            command: 'generateCrud',
                            crudData: {
                                name: modelName,
                                tableName: document.getElementById('tableName').value,
                                apiResource: document.getElementById('apiResource').value,
                                attributes: attributes,
                                backendOptions: backendOptions,
                                frontendOptions: frontendOptions
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

    private async generateFiles(crudData: any): Promise<void> {
        try {
            const { name, tableName, apiResource, attributes, backendOptions, frontendOptions } = crudData;
            
            // Generate Backend Files
            if (backendOptions.generateModel) {
                await this.modelGenerator.generateModelFile(name, attributes, tableName);
            }
            
            if (backendOptions.generateMigration) {
                await this.generateMigrationFile(name, tableName, attributes);
            }
            
            if (backendOptions.generateFactory) {
                await this.generateFactoryFile(name, attributes);
            }

            if (backendOptions.generateSeeder) {
                await this.generateSeederFile(name);
            }
            
            if (backendOptions.generateRepository) {
                await this.generateRepositoryFiles(name, attributes);
            }
            
            if (backendOptions.generateService) {
                await this.generateServiceFiles(name);
            }
            
            if (backendOptions.generateRequests) {
                await this.generateRequestFiles(name, attributes);
            }
            
            if (backendOptions.generateController) {
                await this.generateControllerFile(name, attributes);
            }
            
            if (backendOptions.generateApiController) {
                await this.generateApiControllerFile(name, apiResource);
            }
            
            if (backendOptions.generateResource) {
                await this.generateResourceFile(name, attributes);
            }
            
            if (backendOptions.generateCollection) {
                await this.generateCollectionFile(name);
            }
            
            if (backendOptions.generateTests) {
                await this.generateTestFiles(name);
            }
            
            // Generate Frontend Files
            if (frontendOptions.generateTypescriptModel) {
                await this.generateTsModelFile(name, attributes);
            }
            
            if (frontendOptions.generateTypescriptResource) {
                await this.generateTsResourceFile(name, attributes);
            }
            
            if (frontendOptions.generateServiceHook) {
                await this.generateServiceHookFile(name, apiResource);
            }
            
            if (frontendOptions.generateIndex) {
                await this.generateIndexPage(name);
            }
            
            if (frontendOptions.generateForm) {
                await this.generateFormComponent(name, attributes);
            }
            
            vscode.window.showInformationMessage(`Successfully generated CRUD files for ${name}!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate CRUD files: ${error}`);
        }
    }

    // Implementation of individual file generation methods
    // These would use the templateProcessor and fileGenerator to create files
    
    private async generateMigrationFile(name: string, tableName: string, attributes: any[]): Promise<void> {
        const migrationTemplate = await this.templateProcessor.getMigrationTemplate(name, tableName, attributes);
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
        const migrationName = `${timestamp}_create_${tableName || this.pluralize(name.toLowerCase())}_table`;
        const migrationPath = await this.projectAnalyzer.getMigrationFilePath(migrationName);
        await this.fileGenerator.createFile(migrationPath, migrationTemplate);
    }
    
    private async generateFactoryFile(name: string, attributes: any[]): Promise<void> {
        const factoryTemplate = await this.templateProcessor.getFactoryTemplate(name, attributes);
        const factoryPath = await this.projectAnalyzer.getFactoryFilePath(name);
        await this.fileGenerator.createFile(factoryPath, factoryTemplate);
    }
    
    private async generateSeederFile(name: string): Promise<void> {
        const seederTemplate = await this.templateProcessor.getSeederTemplate(name);
        const seederPath = await this.projectAnalyzer.getSeederFilePath(name);
        await this.fileGenerator.createFile(seederPath, seederTemplate);
    }

    private async generateRepositoryFiles(name: string, attributes: any[] = []): Promise<void> {
        // Repository Interface
        const repositoryInterfaceTemplate = await this.templateProcessor.getRepositoryInterfaceTemplate(name);
        const repositoryInterfacePath = await this.projectAnalyzer.getRepositoryInterfaceFilePath(name);
        await this.fileGenerator.createFile(repositoryInterfacePath, repositoryInterfaceTemplate);
        
        // Repository Implementation
        const repositoryTemplate = await this.templateProcessor.getRepositoryTemplate(name, attributes);
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
    
    private async generateControllerFile(name: string, attributes: any[]): Promise<void> {
        const controllerTemplate = await this.templateProcessor.getControllerTemplate(name, attributes);
        const controllerPath = await this.projectAnalyzer.getControllerFilePath(name);
        await this.fileGenerator.createFile(controllerPath, controllerTemplate);
    }
    
    private async generateApiControllerFile(name: string, apiResource: string): Promise<void> {
        const apiControllerTemplate = await this.templateProcessor.getApiControllerTemplate(name, apiResource);
        const apiControllerPath = await this.projectAnalyzer.getApiControllerFilePath(name);
        await this.fileGenerator.createFile(apiControllerPath, apiControllerTemplate);
    }
    
    private async generateResourceFile(name: string, attributes: any[]): Promise<void> {
        const resourceTemplate = await this.templateProcessor.getResourceTemplate(name, attributes);
        const resourcePath = await this.projectAnalyzer.getResourceFilePath(name);
        await this.fileGenerator.createFile(resourcePath, resourceTemplate);
    }
    
    private async generateCollectionFile(name: string): Promise<void> {
        const collectionTemplate = await this.templateProcessor.getCollectionTemplate(name);
        const collectionPath = await this.projectAnalyzer.getCollectionFilePath(name);
        await this.fileGenerator.createFile(collectionPath, collectionTemplate);
    }
    
    private async generateTestFiles(name: string): Promise<void> {
        // Feature Test
        const featureTestTemplate = await this.templateProcessor.getFeatureTestTemplate(name);
        const featureTestPath = await this.projectAnalyzer.getFeatureTestFilePath(name);
        await this.fileGenerator.createFile(featureTestPath, featureTestTemplate);
        
        // Unit Test
        const unitTestTemplate = await this.templateProcessor.getUnitTestTemplate(name);
        const unitTestPath = await this.projectAnalyzer.getUnitTestFilePath(name);
        await this.fileGenerator.createFile(unitTestPath, unitTestTemplate);
    }
    
    private async generateTsModelFile(name: string, attributes: any[]): Promise<void> {
        const tsModelTemplate = await this.templateProcessor.getTsModelInterfaceTemplate(name, attributes);
        const tsModelPath = await this.projectAnalyzer.getTsModelInterfacePath(name);
        await this.fileGenerator.createFile(tsModelPath, tsModelTemplate);
    }
    
    private async generateTsResourceFile(name: string, attributes: any[]): Promise<void> {
        const tsResourceTemplate = await this.templateProcessor.getTsResourceInterfaceTemplate(name, attributes);
        const tsResourcePath = await this.projectAnalyzer.getTsResourceInterfacePath(name);
        await this.fileGenerator.createFile(tsResourcePath, tsResourceTemplate);
    }
    
    private async generateServiceHookFile(name: string, apiResource: string): Promise<void> {
        const serviceHookTemplate = await this.templateProcessor.getTsServiceHookTemplate(name, apiResource);
        const serviceHookPath = await this.projectAnalyzer.getTsServiceHookPath(name);
        await this.fileGenerator.createFile(serviceHookPath, serviceHookTemplate);
    }
    
    private async generateIndexPage(name: string): Promise<void> {
        const indexPageTemplate = await this.templateProcessor.getTsIndexPageTemplate(name);
        const indexPagePath = await this.projectAnalyzer.getTsIndexPagePath(name);
        await this.fileGenerator.createFile(indexPagePath, indexPageTemplate);
    }
    
    private async generateFormComponent(name: string, attributes: any[]): Promise<void> {
        const formComponentTemplate = await this.templateProcessor.getTsFormComponentTemplate(name, attributes);
        const formComponentPath = await this.projectAnalyzer.getTsFormComponentPath(name);
        await this.fileGenerator.createFile(formComponentPath, formComponentTemplate);
    }
    
    private async generateTsServiceFile(name: string): Promise<void> {
        const serviceTemplate = await this.templateProcessor.getTsServiceTemplate(name);
        const servicePath = await this.projectAnalyzer.getTsServicePath(name); // This line should now work
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
}
