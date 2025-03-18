import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateHelper } from './helpers/TemplateHelper';
import { DefaultTemplates } from '../templates/DefaultTemplates';

/**
 * Attribute structure used throughout the template system
 */
export interface AttributeDefinition {
    name: string;
    type: string;
    nullable?: boolean;
    default?: string;
    fillable?: boolean;
}

/**
 * Type definitions for template paths
 */
type TemplateType = 
    'model' | 'migration' | 'factory' | 'seeder' | 
    'controller' | 'apiController' | 'repository' | 'repositoryInterface' | 
    'service' | 'serviceInterface' | 'resource' | 'storeRequest' | 'updateRequest' | 
    'collection' | 'tsModel' | 'tsResource' | 'tsServiceHook' | 'tsService';

/**
 * Processes templates for code generation
 */
export class TemplateProcessor {
    // Store template paths for quick lookup
    private readonly templatePaths: Record<TemplateType, string> = {
        // Backend stubs
        'model': 'stubs/scaffold/backend/model.stub',
        'migration': 'stubs/scaffold/backend/migration.stub',
        'factory': 'stubs/scaffold/backend/factory.stub',
        'seeder': 'stubs/scaffold/backend/seeder.stub',
        'controller': 'stubs/scaffold/backend/controller.stub',
        'apiController': 'stubs/scaffold/backend/controller.api.stub',
        'repository': 'stubs/scaffold/backend/repository.stub',
        'repositoryInterface': 'stubs/scaffold/backend/repository.interface.stub',
        'service': 'stubs/scaffold/backend/service.stub',
        'serviceInterface': 'stubs/scaffold/backend/service.interface.stub',
        'resource': 'stubs/scaffold/backend/resource.stub',
        'storeRequest': 'stubs/scaffold/backend/store.request.stub',
        'updateRequest': 'stubs/scaffold/backend/update.request.stub',
        'collection': 'stubs/scaffold/backend/collection.stub',
        
        // Frontend stubs
        'tsModel': 'stubs/scaffold/frontend/model.stub',
        'tsResource': 'stubs/scaffold/frontend/resource.stub',
        'tsServiceHook': 'stubs/scaffold/frontend/service.hook.stub',
        'tsService': 'stubs/scaffold/frontend/service.stub',
    };

    /**
     * Read custom template from config
     */
    private async readCustomTemplate(templateType: string, ...args: any[]): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('laravelScaffold');
        const templatePaths = config.get('templatePaths') as Record<string, string>;

        if (templatePaths && templatePaths[templateType]) {
            try {
                const templatePath = templatePaths[templateType];
                
                if (fs.existsSync(templatePath)) {
                    let content = fs.readFileSync(templatePath, 'utf8');
                    // Process basic template variables
                    return this.processBasicVariables(content, args[0], args[1], args[2]);
                }
            } catch (error) {
                console.error(`Error reading custom template for ${templateType}:`, error);
            }
        }

        return null; // No custom template found or error occurred
    }

    /**
     * Process basic template variables without attribute processing
     */
    private processBasicVariables(content: string, name: string, attributes?: AttributeDefinition[], tableName?: string): string {
        const modelName = TemplateHelper.toPascalCase(name);
        const modelVariable = TemplateHelper.toCamelCase(name);
        const pluralName = TemplateHelper.pluralize(name);
        const pluralCamelName = TemplateHelper.toCamelCase(pluralName);
        const tableNameVal = tableName || TemplateHelper.toSnakeCase(pluralName);
        const routeName = TemplateHelper.toSnakeCase(pluralName);
        
        return content
            .replace(/\{\{\s*name\s*\}\}/g, name)
            .replace(/\{\{\s*modelName\s*\}\}/g, modelName)
            .replace(/\{\{\s*modelNamePlural\s*\}\}/g, TemplateHelper.toPascalCase(pluralName))
            .replace(/\{\{\s*modelVariable\s*\}\}/g, modelVariable)
            .replace(/\{\{\s*modelVariablePlural\s*\}\}/g, pluralCamelName)
            .replace(/\{\{\s*tableName\s*\}\}/g, tableNameVal)
            .replace(/\{\{\s*routeName\s*\}\}/g, routeName);
    }

    /**
     * Read Laravel stub file
     */
    private async readStubFile(stubType: TemplateType): Promise<string | null> {
        try {
            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                console.log(`No workspace folder found when trying to load ${stubType} stub`);
                return null;
            }

            const stubPath = this.templatePaths[stubType];
            if (!stubPath) {
                console.log(`No stub path defined for ${stubType}`);
                return null;
            }

            // Try to read from '/laravel' directory first (common Laravel project root)
            const laravelPath = path.join(workspaceFolder, 'laravel', stubPath);
            if (fs.existsSync(laravelPath)) {
                console.log(`Found ${stubType} stub at ${laravelPath}`);
                return fs.readFileSync(laravelPath, 'utf-8');
            }

            // Then try project root (for projects where Laravel is at the root)
            const projectRootPath = path.join(workspaceFolder, stubPath);
            if (fs.existsSync(projectRootPath)) {
                console.log(`Found ${stubType} stub at ${projectRootPath}`);
                return fs.readFileSync(projectRootPath, 'utf-8');
            }

            console.log(`Stub file for ${stubType} not found at either ${laravelPath} or ${projectRootPath}`);
            return null;
        } catch (error) {
            console.error(`Error reading stub file for ${stubType}:`, error);
            return null;
        }
    }

    /**
     * Process template with all variables including attribute-based content
     */
    private async processTemplateWithVariables(template: string, name: string, attributes: AttributeDefinition[] = [], tableName?: string): Promise<string> {
        if (!template) {
            return '';
        }

        let processedTemplate = this.processBasicVariables(template, name, attributes, tableName);
        
        // Process attributes if provided
        if (attributes && attributes.length > 0) {
            // Process fillable attributes
            const fillable = attributes
                .filter(attr => attr.fillable !== false)
                .map(attr => `'${attr.name}'`)
                .join(',\n        ');
            processedTemplate = processedTemplate.replace(/\{\{\s*fillable\s*\}\}/g, fillable);
            
            // Process casts
            const castableTypes = ['boolean', 'integer', 'float', 'decimal', 'date', 'dateTime', 'json'];
            
            const castableAttributes = attributes.filter(attr => castableTypes.includes(attr.type));
            const hasCasts = castableAttributes.length > 0;
            
            const casts = castableAttributes
                .map(attr => `'${attr.name}' => '${TemplateHelper.getPhpType(attr.type)}'`)
                .join(',\n        ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*casts\s*\}\}/g, casts);
            
            // Process migration fields
            const migrationFields = attributes.map(attr => {
                let field = `$table->${attr.type}('${attr.name}')`;
                if (attr.nullable) {
                    field += '->nullable()';
                }
                if (attr.default !== undefined && attr.default !== '') {
                    if (attr.type === 'boolean') {
                        field += `->default(${attr.default})`;
                    } else if (['integer', 'bigInteger', 'decimal', 'float'].includes(attr.type)) {
                        field += `->default(${attr.default})`;
                    } else {
                        field += `->default('${attr.default}')`;
                    }
                }
                return field + ';';
            }).join('\n            ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*migrationFields\s*\}\}/g, migrationFields);
            
            // Process resource attributes
            const resourceAttributes = attributes.map(attr => {
                return `'${attr.name}' => $this->${attr.name},`;
            }).join('\n            ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*resourceAttributes\s*\}\}/g, resourceAttributes);
            
            // Process typescript attributes
            const tsAttributes = attributes.map(attr => {
                const tsType = TemplateHelper.getTsType(attr.type);
                const nullable = attr.nullable ? '?' : '';
                return `    ${attr.name}${nullable}: ${tsType};`;
            }).join('\n');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*tsAttributes\s*\}\}/g, tsAttributes);
            
            // Process validation rules
            const storeRules = attributes.map(attr => {
                const rules = [];
                if (!attr.nullable) {
                    rules.push('required');
                } else {
                    rules.push('nullable');
                }
                
                switch (attr.type) {
                    case 'string': rules.push('string', 'max:255'); break;
                    case 'integer': case 'bigInteger': rules.push('integer'); break;
                    case 'decimal': case 'float': rules.push('numeric'); break;
                    case 'boolean': rules.push('boolean'); break;
                    case 'date': case 'dateTime': rules.push('date'); break;
                    case 'json': rules.push('array'); break;
                    case 'text': rules.push('string'); break;
                }
                
                return `'${attr.name}' => ['${rules.join("', '")}'],`;
            }).join('\n            ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*storeRules\s*\}\}/g, storeRules);
            
            // Update rules are similar but with 'sometimes'
            const updateRules = attributes.map(attr => {
                const rules = ['sometimes'];
                if (!attr.nullable) {
                    rules.push('required');
                } else {
                    rules.push('nullable');
                }
                
                switch (attr.type) {
                    case 'string': rules.push('string', 'max:255'); break;
                    case 'integer': case 'bigInteger': rules.push('integer'); break;
                    case 'decimal': case 'float': rules.push('numeric'); break;
                    case 'boolean': rules.push('boolean'); break;
                    case 'date': case 'dateTime': rules.push('date'); break;
                    case 'json': rules.push('array'); break;
                    case 'text': rules.push('string'); break;
                }
                
                return `'${attr.name}' => ['${rules.join("', '")}'],`;
            }).join('\n            ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*updateRules\s*\}\}/g, updateRules);
            
            // Process factory definitions
            const factoryDefinitions = attributes.map(attr => {
                switch (attr.type) {
                    case 'string': return `'${attr.name}' => fake()->words(3, true),`;
                    case 'integer': case 'bigInteger': return `'${attr.name}' => fake()->numberBetween(1, 1000),`;
                    case 'decimal': case 'float': return `'${attr.name}' => fake()->randomFloat(2, 1, 1000),`;
                    case 'boolean': return `'${attr.name}' => fake()->boolean(),`;
                    case 'date': return `'${attr.name}' => fake()->date(),`;
                    case 'dateTime': return `'${attr.name}' => fake()->dateTime(),`;
                    case 'text': return `'${attr.name}' => fake()->paragraph(),`;
                    case 'json': return `'${attr.name}' => ['data' => fake()->word()],`;
                    default: return `'${attr.name}' => fake()->word(),`;
                }
            }).join('\n            ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*factoryDefinitions\s*\}\}/g, factoryDefinitions);
            
            // Process column names for repository filters
            const columnNames = attributes
                .map(attr => `'${attr.name}'`)
                .join(', ');
            
            processedTemplate = processedTemplate.replace(/\{\{\s*columnNames\s*\}\}/g, columnNames);
        }
        
        // Process conditional blocks
        processedTemplate = this.processConditionalBlocks(processedTemplate, {
            tableName: !!tableName,
            hasCasts: attributes.some(attr => ['boolean', 'integer', 'float', 'decimal', 'date', 'dateTime', 'json'].includes(attr.type))
        });
        
        return processedTemplate;
    }

    /**
     * Process conditional blocks in templates like {{#if condition}}content{{/if}}
     */
    private processConditionalBlocks(template: string, variables: Record<string, boolean>): string {
        // Handle #if blocks
        const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        return template.replace(ifRegex, (match, condition, content) => {
            if (variables[condition]) {
                return content.trim();
            }
            return '';
        });
    }

    /**
     * Get default template for the specified type
     */
    private getDefaultTemplate(type: TemplateType): string {
        return DefaultTemplates[type] || '';
    }

    /**
     * Unified template retrieval method
     * Tries custom template -> stub file -> default template in that order
     */
    private async getTemplate(type: TemplateType, name: string, attributes: AttributeDefinition[] = [], tableName?: string): Promise<string> {
        // First try custom template from settings
        const customTemplate = await this.readCustomTemplate(type, name, attributes, tableName);
        if (customTemplate) {
            console.log(`Using custom template for ${type}`);
            return customTemplate;
        }
        
        // Then try stub file
        const stubTemplate = await this.readStubFile(type);
        if (stubTemplate) {
            console.log(`Using stub template for ${type}`);
            return this.processTemplateWithVariables(stubTemplate, name, attributes, tableName);
        }
        
        // Fall back to default template
        console.log(`Using default template for ${type}`);
        return this.processTemplateWithVariables(this.getDefaultTemplate(type), name, attributes, tableName);
    }

    // Public template retrieval methods
    public async getModelTemplate(name: string, attributes: AttributeDefinition[], tableName?: string): Promise<string> {
        return this.getTemplate('model', name, attributes, tableName);
    }
    
    public async getMigrationTemplate(name: string, tableName: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('migration', name, attributes, tableName);
    }
    
    public async getFactoryTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('factory', name, attributes);
    }
    
    public async getSeederTemplate(name: string): Promise<string> {
        return this.getTemplate('seeder', name);
    }
    
    public async getRepositoryInterfaceTemplate(name: string): Promise<string> {
        return this.getTemplate('repositoryInterface', name);
    }
    
    public async getRepositoryTemplate(name: string, attributes: AttributeDefinition[] = []): Promise<string> {
        return this.getTemplate('repository', name, attributes);
    }
    
    public async getServiceInterfaceTemplate(name: string): Promise<string> {
        return this.getTemplate('serviceInterface', name);
    }
    
    public async getServiceTemplate(name: string): Promise<string> {
        return this.getTemplate('service', name);
    }
    
    public async getStoreRequestTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('storeRequest', name, attributes);
    }
    
    public async getUpdateRequestTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('updateRequest', name, attributes);
    }
    
    public async getResourceTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('resource', name, attributes);
    }
    
    public async getCollectionTemplate(name: string): Promise<string> {
        return this.getTemplate('collection', name);
    }
    
    public async getControllerTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('controller', name, attributes);
    }
    
    public async getApiControllerTemplate(name: string, apiResource?: string): Promise<string> {
        // We need to process apiResource separately since it's not a standard attribute
        const template = await this.getTemplate('apiController', name);
        if (apiResource) {
            return template.replace(/\{\{\s*apiResource\s*\}\}/g, apiResource);
        }
        return template;
    }
    
    public async getTsModelInterfaceTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('tsModel', name, attributes);
    }
    
    public async getTsResourceInterfaceTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        return this.getTemplate('tsResource', name, attributes);
    }
    
    public async getTsServiceHookTemplate(name: string, apiResource?: string): Promise<string> {
        // We need to process apiResource separately since it's not a standard attribute
        const template = await this.getTemplate('tsServiceHook', name);
        if (apiResource) {
            return template.replace(/\{\{\s*apiResource\s*\}\}/g, apiResource);
        }
        return template;
    }
    
    public async getTsServiceTemplate(name: string): Promise<string> {
        return this.getTemplate('tsService', name);
    }
    
    // Some special cases for non-stub templates
    public async getFeatureTestTemplate(name: string): Promise<string> {
        // Create feature test template on the fly using the helper methods
        const modelName = TemplateHelper.toPascalCase(name);
        const modelVariable = TemplateHelper.toCamelCase(name);
        const routeName = TemplateHelper.toSnakeCase(TemplateHelper.pluralize(name));
        
        return `<?php

namespace Tests\\Feature;

use App\\Models\\${modelName};
use App\\Models\\User;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Tests\\TestCase;

class ${modelName}Test extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the index page can be accessed.
     */
    public function test_index_page_can_be_rendered(): void
    {
        $user = User::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->get(route('${routeName}.index'));
        
        $response->assertStatus(200);
    }

    /**
     * Test that the create page can be accessed.
     */
    public function test_create_page_can_be_rendered(): void
    {
        $user = User::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->get(route('${routeName}.create'));
        
        $response->assertStatus(200);
    }

    /**
     * Test that a ${modelName} can be created.
     */
    public function test_${modelVariable}_can_be_created(): void
    {
        $user = User::factory()->create();
        
        // Replace with actual test data
        $data = [
            // Add required fields here
        ];
        
        $response = $this
            ->actingAs($user)
            ->post(route('${routeName}.store'), $data);

        $response->assertRedirect(route('${routeName}.index'));
        $response->assertSessionHas('message', '${modelName} created successfully.');
        
        $this->assertDatabaseHas('${TemplateHelper.pluralize(TemplateHelper.toSnakeCase(name))}', [
            // Add key fields to verify here
        ]);
    }
}
`;
    }

    public async getUnitTestTemplate(name: string): Promise<string> {
        const modelName = TemplateHelper.toPascalCase(name);
        const modelVariable = TemplateHelper.toCamelCase(name);
        
        return `<?php

namespace Tests\\Unit;

use App\\Models\\${modelName};
use App\\Services\\${modelName}Service;
use App\\Support\\Interfaces\\Repositories\\${modelName}RepositoryInterface;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Mockery;
use Tests\\TestCase;

class ${modelName}Test extends TestCase
{
    use RefreshDatabase;

    protected ${modelName}Service $${modelVariable}Service;
    protected ${modelName}RepositoryInterface $${modelVariable}Repository;
    
    public function setUp(): void
    {
        parent::setUp();
        
        // Mock the repository
        $this->${modelVariable}Repository = Mockery::mock(${modelName}RepositoryInterface::class);
        
        // Inject mocked repository to service
        $this->${modelVariable}Service = new ${modelName}Service();
        $this->${modelVariable}Service->setRepository($this->${modelVariable}Repository);
    }
    
    public function test_it_can_get_all_${TemplateHelper.pluralize(TemplateHelper.toSnakeCase(name))}_paginated(): void
    {
        // Arrange
        $expectedData = ${modelName}::factory(3)->make();
        $this->${modelVariable}Repository->shouldReceive('getAllPaginated')
            ->once()
            ->andReturn($expectedData);
        
        // Act
        $result = $this->${modelVariable}Service->getAllPaginated();
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
}
`;
    }

    public async getTsIndexPageTemplate(name: string): Promise<string> {
        const modelName = TemplateHelper.toPascalCase(name);
        const camelModelName = TemplateHelper.toCamelCase(name);
        const pluralCamelName = TemplateHelper.toCamelCase(TemplateHelper.pluralize(name));
        const pluralName = TemplateHelper.pluralize(name);
        
        return `import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/Components/UI/table';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { use${modelName}Service } from '@/Services/${camelModelName}ServiceHook';

export default function Index() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    
    const { useGet${pluralCamelName} } = use${modelName}Service();
    const { data, isLoading } = useGet${pluralCamelName}({ 
        search,
        page
    });
    
    return (
        <AuthenticatedLayout>
            <Head title="${pluralName}" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between">
                        <h1 className="text-2xl font-semibold">${pluralName}</h1>
                        <Button asChild>
                            <Link href={\`/${TemplateHelper.toSnakeCase(pluralName)}/create\`}>Create New</Link>
                        </Button>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            {/* Table header and content */}
                            <TableHead>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Table content rendering */}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
`;
    }

    public async getTsFormComponentTemplate(name: string, attributes: AttributeDefinition[]): Promise<string> {
        const modelName = TemplateHelper.toPascalCase(name);
        const camelModelName = TemplateHelper.toCamelCase(name);
        
        // Here we generate a condensed version of the form instead of the full detail
        return `import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import { Label } from '@/Components/UI/label';
import { ${modelName} } from '@/Support/Interfaces/Models/${modelName}';

interface ${modelName}FormProps {
    ${camelModelName}?: ${modelName};
    isEditing?: boolean;
}

export default function ${modelName}Form({ ${camelModelName}, isEditing = false }: ${modelName}FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<Partial<${modelName}>>({
        // Default form values
        ...(${camelModelName} || {})
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && ${camelModelName}?.id) {
            put(route('${TemplateHelper.toSnakeCase(TemplateHelper.pluralize(name))}.update', ${camelModelName}.id));
        } else {
            post(route('${TemplateHelper.toSnakeCase(TemplateHelper.pluralize(name))}.store'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Form fields would go here */}
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
`;
    }
}
