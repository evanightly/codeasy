import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TemplateProcessor {
    // Convert camelCase or PascalCase to snake_case
    private toSnakeCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase();
    }

    // Convert string to PascalCase
    private toPascalCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }

    // Convert string to camelCase
    private toCamelCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c, i) => i === 0 && c ? c.toLowerCase() : c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
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

    // Convert string to human-readable format
    private toHumanReadable(str: string): string {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, match => match.toUpperCase())
            .replace(/_/g, ' ')
            .trim();
    }

    // Get PHP-compatible type
    private getPhpType(dbType: string): string {
        const typeMap: {[key: string]: string} = {
            'string': 'string',
            'integer': 'int',
            'bigInteger': 'int',
            'boolean': 'bool',
            'date': 'string',
            'dateTime': 'string',
            'decimal': 'float',
            'float': 'float',
            'text': 'string',
            'json': 'array',
        };
        return typeMap[dbType] || 'string';
    }

    // Get TypeScript-compatible type
    private getTsType(dbType: string): string {
        const typeMap: {[key: string]: string} = {
            'string': 'string',
            'integer': 'number',
            'bigInteger': 'number',
            'boolean': 'boolean',
            'date': 'string',
            'dateTime': 'string',
            'decimal': 'number',
            'float': 'number',
            'text': 'string',
            'json': 'Record<string, any>',
        };
        return typeMap[dbType] || 'string';
    }

    // Add this method to check and read custom templates
    private async readCustomTemplate(templateType: string, ...args: any[]): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('laravelScaffold');
        const templatePaths = config.get('templatePaths') as Record<string, string>;

        if (templatePaths && templatePaths[templateType]) {
            const templatePath = templatePaths[templateType];
            
            try {
                if (fs.existsSync(templatePath)) {
                    let content = fs.readFileSync(templatePath, 'utf8');
                    // Process basic template variables
                    const name = args[0]; // Assuming first arg is name
                    content = content.replace(/\{\{\s*name\s*\}\}/g, name);
                    content = content.replace(/\{\{\s*modelName\s*\}\}/g, this.toPascalCase(name));
                    content = content.replace(/\{\{\s*modelVariable\s*\}\}/g, this.toCamelCase(name));
                    content = content.replace(/\{\{\s*tableName\s*\}\}/g, this.toSnakeCase(this.pluralize(name)));

                    // Process attributes if provided
                    if (args[1] && Array.isArray(args[1])) {
                        // More sophisticated template processing could be added here
                    }

                    return content;
                }
            } catch (error) {
                console.error(`Error reading custom template from ${templatePath}:`, error);
            }
        }

        return null; // No custom template found or error occurred
    }

    // New method to read from Laravel stub files with better error handling and logging
    private async readStubFile(stubType: string): Promise<string | null> {
        try {
            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                console.log(`No workspace folder found when trying to load ${stubType} stub`);
                return null;
            }

            // Map stub types to their relative paths in the Laravel project
            const stubPaths: Record<string, string> = {
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
                
                // Frontend stubs
                'tsModel': 'stubs/scaffold/frontend/model.stub',
                'tsResource': 'stubs/scaffold/frontend/resource.stub',
                'tsServiceHook': 'stubs/scaffold/frontend/service.hook.stub',
            };

            const stubPath = stubPaths[stubType];
            if (!stubPath) {
                console.log(`No stub path defined for ${stubType}`);
                return null;
            }

            // Try to read from '/laravel' directory first (common Laravel project root)
            const laravelPath = path.join(workspaceFolder, 'laravel', stubPath);
            if (fs.existsSync(laravelPath)) {
                console.log(`Found ${stubType} stub at ${laravelPath}`);
                return fs.readFileSync(laravelPath, 'utf8');
            }

            // Then try project root (for projects where Laravel is at the root)
            const projectRootPath = path.join(workspaceFolder, stubPath);
            if (fs.existsSync(projectRootPath)) {
                console.log(`Found ${stubType} stub at ${projectRootPath}`);
                return fs.readFileSync(projectRootPath, 'utf8');
            }

            console.log(`Stub file for ${stubType} not found at either ${laravelPath} or ${projectRootPath}`);
            return null;
        } catch (error) {
            console.error(`Error reading stub file for ${stubType}:`, error);
            return null;
        }
    }

    // Process template with variables
    private async processTemplateWithVariables(template: string, name: string, attributes?: any[], tableName?: string): Promise<string> {
        if (!template) {
            return '';
        }

        const modelName = this.toPascalCase(name);
        const modelVariable = this.toCamelCase(name);
        const pluralName = this.pluralize(name);
        const pluralCamelName = this.toCamelCase(pluralName);
        const tablename = tableName || this.toSnakeCase(pluralName);
        const routeName = this.toSnakeCase(pluralName);
        
        // Basic replacements
        let processedTemplate = template
            .replace(/\{\{\s*name\s*\}\}/g, name)
            .replace(/\{\{\s*modelName\s*\}\}/g, modelName)
            .replace(/\{\{\s*modelNamePlural\s*\}\}/g, this.toPascalCase(pluralName))
            .replace(/\{\{\s*modelVariable\s*\}\}/g, modelVariable)
            .replace(/\{\{\s*modelVariablePlural\s*\}\}/g, pluralCamelName)
            .replace(/\{\{\s*tableName\s*\}\}/g, tablename)
            .replace(/\{\{\s*routeName\s*\}\}/g, routeName);
        
        // Process attributes if provided
        if (attributes && attributes.length > 0) {
            // Process fillable attributes
            const fillable = attributes
                .filter(attr => attr.fillable !== false)
                .map(attr => `'${attr.name}'`)
                .join(',\n        ');
            processedTemplate = processedTemplate.replace(/\{\{\s*fillable\s*\}\}/g, fillable);
            
            // Process casts
            const casts = attributes
                .filter(attr => ['boolean', 'integer', 'float', 'decimal', 'date', 'dateTime', 'json'].includes(attr.type))
                .map(attr => `'${attr.name}' => '${this.getPhpType(attr.type)}'`)
                .join(',\n        ');
            processedTemplate = processedTemplate.replace(/\{\{\s*casts\s*\}\}/g, casts);
            
            // Process migration fields
            const migrationFields = attributes.map(attr => {
                let line = `$table->${attr.type}('${attr.name}')`;
                if (attr.nullable) {
                    line += '->nullable()';
                }
                if (attr.default !== '') {
                    if (['string', 'text'].includes(attr.type)) {
                        line += `->default('${attr.default}')`;
                    } else if (['boolean'].includes(attr.type)) {
                        line += `->default(${attr.default === 'true' ? 'true' : 'false'})`;
                    } else {
                        line += `->default(${attr.default})`;
                    }
                }
                return line + ';';
            }).join('\n            ');
            processedTemplate = processedTemplate.replace(/\{\{\s*migrationFields\s*\}\}/g, migrationFields);
            
            // Process factory definitions
            const factoryDefinitions = attributes.map(attr => {
                let definition = '';
                switch (attr.type) {
                    case 'string':
                        definition = `'${attr.name}' => fake()->word()`;
                        break;
                    case 'integer':
                    case 'bigInteger':
                        definition = `'${attr.name}' => fake()->randomNumber()`;
                        break;
                    case 'boolean':
                        definition = `'${attr.name}' => fake()->boolean()`;
                        break;
                    case 'date':
                        definition = `'${attr.name}' => fake()->date()`;
                        break;
                    case 'dateTime':
                        definition = `'${attr.name}' => fake()->dateTime()`;
                        break;
                    case 'decimal':
                    case 'float':
                        definition = `'${attr.name}' => fake()->randomFloat(2)`;
                        break;
                    case 'text':
                        definition = `'${attr.name}' => fake()->paragraph()`;
                        break;
                    case 'json':
                        definition = `'${attr.name}' => ['key' => fake()->word()]`;
                        break;
                    default:
                        definition = `'${attr.name}' => fake()->word()`;
                }
                return definition;
            }).join(',\n            ');
            processedTemplate = processedTemplate.replace(/\{\{\s*factoryDefinitions\s*\}\}/g, factoryDefinitions);
            
            // Process resource attributes
            const resourceAttributes = attributes.map(attr => 
                `'${attr.name}' => $this->${attr.name},`
            ).join('\n            ');
            processedTemplate = processedTemplate.replace(/\{\{\s*resourceAttributes\s*\}\}/g, resourceAttributes);
            
            // Process validation rules for store request
            const storeRules = attributes
                .filter(attr => attr.fillable !== false)
                .map(attr => {
                    let rule = '';
                    switch (attr.type) {
                        case 'string':
                        case 'text':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'string']`;
                            break;
                        case 'integer':
                        case 'bigInteger':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'integer']`;
                            break;
                        case 'boolean':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'boolean']`;
                            break;
                        case 'date':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'date']`;
                            break;
                        case 'dateTime':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'date_format:Y-m-d H:i:s']`;
                            break;
                        case 'decimal':
                        case 'float':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'numeric']`;
                            break;
                        case 'json':
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'array']`;
                            break;
                        default:
                            rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}]`;
                    }
                    return rule;
                }).join(',\n            ');
            processedTemplate = processedTemplate.replace(/\{\{\s*storeRules\s*\}\}/g, storeRules);
            
            // Process validation rules for update request
            const updateRules = attributes
                .filter(attr => attr.fillable !== false)
                .map(attr => {
                    let rule = '';
                    switch (attr.type) {
                        case 'string':
                        case 'text':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'string']`;
                            break;
                        case 'integer':
                        case 'bigInteger':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'integer']`;
                            break;
                        case 'boolean':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'boolean']`;
                            break;
                        case 'date':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'date']`;
                            break;
                        case 'dateTime':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'date_format:Y-m-d H:i:s']`;
                            break;
                        case 'decimal':
                        case 'float':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'numeric']`;
                            break;
                        case 'json':
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'array']`;
                            break;
                        default:
                            rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}]`;
                    }
                    return rule;
                }).join(',\n            ');
            processedTemplate = processedTemplate.replace(/\{\{\s*updateRules\s*\}\}/g, updateRules);
            
            // Process TypeScript attributes
            const tsAttributes = attributes
                .map(attr => `    ${attr.name}${attr.nullable ? '?' : ''}: ${this.getTsType(attr.type)};`)
                .join('\n');
            processedTemplate = processedTemplate.replace(/\{\{\s*tsAttributes\s*\}\}/g, tsAttributes);
        }
        
        return processedTemplate;
    }

    // Generate Model File
    public async getModelTemplate(name: string, attributes: any[], tableName?: string): Promise<string> {
        // First try to use custom template from settings
        const customTemplate = await this.readCustomTemplate('model', name, attributes, tableName);
        if (customTemplate) {
            return customTemplate;
        }

        // Then try to use stub file as standard approach
        const stubTemplate = await this.readStubFile('model');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes, tableName);
        }

        // Otherwise use the built-in template logic as fallback
        console.log('Using built-in model template as fallback');
        const modelName = this.toPascalCase(name);
        const casts = attributes
            .filter(attr => ['boolean', 'integer', 'float', 'decimal', 'date', 'dateTime', 'json'].includes(attr.type))
            .map(attr => `'${attr.name}' => '${this.getPhpType(attr.type)}'`);
        const fillable = attributes
            .filter(attr => attr.fillable !== false)
            .map(attr => `'${attr.name}'`);

        return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ${modelName} extends Model
{
    use HasFactory;
    ${tableName ? `protected $table = '${tableName}';\n\n    ` : ''}protected $fillable = [
        ${fillable.join(',\n        ')}
    ];
    ${casts.length ? `protected $casts = [
        ${casts.join(',\n        ')}
    ];` : ''}
}
`;
    }

    // Generate Migration File
    public async getMigrationTemplate(name: string, tableName: string, attributes: any[]): Promise<string> {
        // First try to use custom template from settings
        const customTemplate = await this.readCustomTemplate('migration', name, tableName, attributes);
        if (customTemplate) {
            return customTemplate;
        }

        // Try to use stub file as standard approach
        const stubTemplate = await this.readStubFile('migration');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes, tableName);
        }

        // Otherwise use the built-in template logic as fallback
        console.log('Using built-in migration template as fallback');
        
        const table = tableName || this.pluralize(this.toSnakeCase(name));
        const schema = attributes.map(attr => {
            let line = `$table->${attr.type}('${attr.name}')`;
            if (attr.nullable) {
                line += '->nullable()';
            }
            if (attr.default !== '') {
                if (['string', 'text'].includes(attr.type)) {
                    line += `->default('${attr.default}')`;
                } else if (['boolean'].includes(attr.type)) {
                    line += `->default(${attr.default === 'true' ? 'true' : 'false'})`;
                } else {
                    line += `->default(${attr.default})`;
                }
            }
            return line + ';';
        }).join('\n            ');

        return `<?php

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
        Schema::create('${table}', function (Blueprint $table) {
            $table->id();
            ${schema}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('${table}');
    }
};
`;
    }

    // Generate Factory File
    public async getFactoryTemplate(name: string, attributes: any[]): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('factory', name, attributes);
        if (customTemplate) {
            return customTemplate;
        }

        // Try to use stub file
        const stubTemplate = await this.readStubFile('factory');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }

        // Otherwise use the built-in template logic
        const modelName = this.toPascalCase(name);
        const definitions = attributes.map(attr => {
            let definition = '';
            switch (attr.type) {
                case 'string':
                    definition = `'${attr.name}' => fake()->word()`;
                    break;
                case 'integer':
                case 'bigInteger':
                    definition = `'${attr.name}' => fake()->randomNumber()`;
                    break;
                case 'boolean':
                    definition = `'${attr.name}' => fake()->boolean()`;
                    break;
                case 'date':
                    definition = `'${attr.name}' => fake()->date()`;
                    break;
                case 'dateTime':
                    definition = `'${attr.name}' => fake()->dateTime()`;
                    break;
                case 'decimal':
                case 'float':
                    definition = `'${attr.name}' => fake()->randomFloat(2)`;
                    break;
                case 'text':
                    definition = `'${attr.name}' => fake()->paragraph()`;
                    break;
                case 'json':
                    definition = `'${attr.name}' => ['key' => fake()->word()]`;
                    break;
                default:
                    definition = `'${attr.name}' => fake()->word()`;
            }
            return definition;
        }).join(',\n            ');

        return `<?php

namespace Database\\Factories;

use App\\Models\\${modelName};
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class ${modelName}Factory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ${modelName}::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            ${definitions}
        ];
    }
}
`;
    }

    // Generate Seeder File
    public async getSeederTemplate(name: string): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('seeder', name);
        if (customTemplate) {
            return customTemplate;
        }

        const modelName = this.toPascalCase(name);
        const tableName = this.pluralize(this.toSnakeCase(name));

        return `<?php

namespace Database\\Seeders;

use App\\Models\\${modelName};
use Illuminate\\Database\\Seeder;

class ${modelName}Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test data
        ${modelName}::factory(10)->create();
    }
}
`;
    }

    // Generate Repository Interface
    public async getRepositoryInterfaceTemplate(name: string): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('repositoryInterface', name);
        if (customTemplate) {
            return customTemplate;
        }

        const modelName = this.toPascalCase(name);
        
        return `<?php

namespace App\\Support\\Interfaces\\Repositories;

interface ${modelName}RepositoryInterface extends BaseRepositoryInterface {}
`;
    }

    // Generate Repository Implementation
    public async getRepositoryTemplate(name: string, attributes: any[] = []): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('repository', name);
        if (customTemplate) {
            return customTemplate;
        }

        const modelName = this.toPascalCase(name);
        
        // Extract attribute names for column filters
        const columnNames = attributes
            .map(attr => `'${attr.name}'`)
            .join(', ');

        return `<?php

namespace App\\Repositories;

use App\\Models\\${modelName};
use App\\Support\\Interfaces\\Repositories\\${modelName}RepositoryInterface;
use App\\Traits\\Repositories\\HandlesFiltering;
use App\\Traits\\Repositories\\HandlesRelations;
use App\\Traits\\Repositories\\HandlesSorting;
use App\\Traits\\Repositories\\RelationQueryable;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Model;

class ${modelName}Repository extends BaseRepository implements ${modelName}RepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function getModelClass(): string {
        return ${modelName}::class;
    }

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['name']);

        $query = $this->applyResolvedRelations($query, $searchParams);
        
        $query = $this->applyColumnFilters($query, $searchParams, ['id', ${columnNames}, 'created_at', 'updated_at']);
        
        $query = $this->applySorting($query, $searchParams);

        return $query;
    }
}
`;
    }

    // Generate Service Interface
    public async getServiceInterfaceTemplate(name: string): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('serviceInterface', name);
        if (customTemplate) {
            return customTemplate;
        }

        const modelName = this.toPascalCase(name);
        
        return `<?php

namespace App\\Support\\Interfaces\\Services;

use Adobrovolsky97\\LaravelRepositoryServicePattern\\Services\\CrudServiceInterface;

interface ${modelName}ServiceInterface extends CrudServiceInterface {}
`;
    }

    // Generate Service Implementation
    public async getServiceTemplate(name: string): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('service', name);
        if (customTemplate) {
            return customTemplate;
        }

        const modelName = this.toPascalCase(name);
        
        return `<?php

namespace App\\Services;

use Adobrovolsky97\\LaravelRepositoryServicePattern\\Services\\BaseCrudService;
use App\\Support\\Interfaces\\Repositories\\${modelName}RepositoryInterface;
use App\\Support\\Interfaces\\Services\\${modelName}ServiceInterface;
use App\\Traits\\Services\\HandlesPageSizeAll;
use Illuminate\\Contracts\\Pagination\\LengthAwarePaginator;

class ${modelName}Service extends BaseCrudService implements ${modelName}ServiceInterface {
    use HandlesPageSizeAll;

    protected function getRepositoryClass(): string {
        return ${modelName}RepositoryInterface::class;
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        // Handle "all" pageSize for frontend
        $this->handlePageSizeAll($pageSize);
        
        return parent::getAllPaginated($search, $pageSize);
    }
}
`;
    }

    // Generate Resource
    public async getResourceTemplate(name: string, attributes: any[]): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('resource', name, attributes);
        if (customTemplate) {
            return customTemplate;
        }
        
        // Try to use stub file
        const stubTemplate = await this.readStubFile('resource');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }
        
        // Otherwise use the built-in template logic
        const modelName = this.toPascalCase(name);
        
        const resourceAttrs = attributes.map(attr => 
            `'${attr.name}' => $this->${attr.name},`
        ).join('\n            ');
        
        return `<?php

namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${modelName}Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            ${resourceAttrs}
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
`;
    }

    // Generate Feature Test
    public async getFeatureTestTemplate(name: string): Promise<string> {
        const modelName = this.toPascalCase(name);
        const modelVariable = this.toCamelCase(name);
        const routeName = this.toSnakeCase(this.pluralize(name));
        
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
        
        $this->assertDatabaseHas('${this.pluralize(this.toSnakeCase(name))}', [
            // Add key fields to verify here
        ]);
    }

    /**
     * Test that a ${modelName} can be viewed.
     */
    public function test_${modelVariable}_can_be_viewed(): void
    {
        $user = User::factory()->create();
        $${modelVariable} = ${modelName}::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->get(route('${routeName}.show', $${modelVariable}));
        
        $response->assertStatus(200);
    }

    /**
     * Test that a ${modelName} can be edited.
     */
    public function test_${modelVariable}_can_be_edited(): void
    {
        $user = User::factory()->create();
        $${modelVariable} = ${modelName}::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->get(route('${routeName}.edit', $${modelVariable}));
        
        $response->assertStatus(200);
    }

    /**
     * Test that a ${modelName} can be updated.
     */
    public function test_${modelVariable}_can_be_updated(): void
    {
        $user = User::factory()->create();
        $${modelVariable} = ${modelName}::factory()->create();
        
        // Replace with actual test data
        $data = [
            // Add required fields here
        ];
        
        $response = $this
            ->actingAs($user)
            ->put(route('${routeName}.update', $${modelVariable}), $data);

        $response->assertRedirect(route('${routeName}.index'));
        $response->assertSessionHas('message', '${modelName} updated successfully.');
    }

    /**
     * Test that a ${modelName} can be deleted.
     */
    public function test_${modelVariable}_can_be_deleted(): void
    {
        $user = User::factory()->create();
        $${modelVariable} = ${modelName}::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->delete(route('${routeName}.destroy', $${modelVariable}));

        $response->assertRedirect(route('${routeName}.index'));
        $response->assertSessionHas('message', '${modelName} deleted successfully.');
        
        $this->assertModelMissing($${modelVariable});
    }
}
`;
    }

    // Generate Unit Test
    public async getUnitTestTemplate(name: string): Promise<string> {
        const modelName = this.toPascalCase(name);
        const modelVariable = this.toCamelCase(name);
        
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
    
    public function test_it_can_get_all_${this.pluralize(this.toSnakeCase(name))}_paginated(): void
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
    
    public function test_it_can_create_${this.toSnakeCase(name)}(): void
    {
        // Arrange
        $data = [
            // Add necessary attributes for the model
        ];
        
        $expected${modelName} = new ${modelName}($data);
        $expected${modelName}->id = 1;
        
        $this->${modelVariable}Repository->shouldReceive('store')
            ->once()
            ->with($data)
            ->andReturn($expected${modelName});
        
        // Act
        $result = $this->${modelVariable}Service->store($data);
        
        // Assert
        $this->assertEquals($expected${modelName}, $result);
    }
    
    public function test_it_can_update_${this.toSnakeCase(name)}(): void
    {
        // Arrange
        $id = 1;
        $data = [
            // Add necessary attributes for the model
        ];
        
        $expected${modelName} = new ${modelName}($data);
        $expected${modelName}->id = $id;
        
        $this->${modelVariable}Repository->shouldReceive('update')
            ->once()
            ->with($id, $data)
            ->andReturn($expected${modelName});
        
        // Act
        $result = $this->${modelVariable}Service->update($id, $data);
        
        // Assert
        $this->assertEquals($expected${modelName}, $result);
    }
    
    public function test_it_can_delete_${this.toSnakeCase(name)}(): void
    {
        // Arrange
        $id = 1;
        
        $this->${modelVariable}Repository->shouldReceive('delete')
            ->once()
            ->with($id)
            ->andReturn(true);
        
        // Act
        $result = $this->${modelVariable}Service->delete($id);
        
        // Assert
        $this->assertTrue($result);
    }
}
`;
    }

    // Generate TypeScript Model Interface
    public async getTsModelInterfaceTemplate(name: string, attributes: any[]): Promise<string> {
        // Try to use stub file
        const stubTemplate = await this.readStubFile('tsModel');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }
        
        // Otherwise use the built-in template
        const modelName = this.toPascalCase(name);
        const attributesTs = attributes
            .map(attr => `    ${attr.name}${attr.nullable ? '?' : ''}: ${this.getTsType(attr.type)};`)
            .join('\n');
        
        return `export interface ${modelName} {
    id: number;
${attributesTs}
    created_at?: string;
    updated_at?: string;
}
`;
    }

    // Generate TypeScript Resource Interface
    public async getTsResourceInterfaceTemplate(name: string, attributes: any[]): Promise<string> {
        const modelName = this.toPascalCase(name);
        const attributesTs = attributes
            .map(attr => `    ${attr.name}${attr.nullable ? '?' : ''}: ${this.getTsType(attr.type)};`)
            .join('\n');
        
        return `import { ${modelName} } from '../Models/${modelName}';

export interface ${modelName}Resource {
    id: number;
${attributesTs}
    created_at: string;
    updated_at: string;
}
`;
    }

    // Generate TypeScript Service Hook
    public async getTsServiceHookTemplate(name: string, apiResource: string): Promise<string> {
        const modelName = this.toPascalCase(name);
        const camelModelName = this.toCamelCase(name);
        const pluralCamelName = this.toCamelCase(this.pluralize(name));
        const snakePluralName = this.toSnakeCase(this.pluralize(name));
        const endpoint = apiResource || `/api/${snakePluralName}`;
        
        return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ${modelName} } from '../Support/Interfaces/Models/${modelName}';
import { ${modelName}Resource } from '../Support/Interfaces/Resources/${modelName}Resource';
import { PaginatedResponse } from '../Support/Interfaces/PaginatedResponse';
import { toast } from 'sonner';

export const use${modelName}Service = () => {
    const queryClient = useQueryClient();
    
    // Query key for ${camelModelName}s
    const ${pluralCamelName}QueryKey = ['${pluralCamelName}'];
    
    // Fetch all ${camelModelName}s with pagination and search
    const useGet${pluralCamelName} = (params: Record<string, any> = {}) => {
        return useQuery<PaginatedResponse<${modelName}Resource>>({
            queryKey: [...${pluralCamelName}QueryKey, params],
            queryFn: async () => {
                const response = await axios.get<PaginatedResponse<${modelName}Resource>>('${endpoint}', { params });
                return response.data;
            },
            keepPreviousData: true
        });
    };
    
    // Fetch a single ${camelModelName} by id
    const useGet${modelName} = (id: number | string | null) => {
        return useQuery<${modelName}Resource>({
            queryKey: [...${pluralCamelName}QueryKey, id],
            queryFn: async () => {
                if (!id) throw new Error("ID is required");
                const response = await axios.get<${modelName}Resource>(\`${endpoint}/\${id}\`);
                return response.data;
            },
            enabled: !!id // Only run query if ID is provided
        });
    };
    
    // Create a new ${camelModelName}
    const useCreate${modelName} = () => {
        return useMutation<${modelName}Resource, Error, Partial<${modelName}>>({
            mutationFn: async (data) => {
                const response = await axios.post<${modelName}Resource>('${endpoint}', data);
                return response.data;
            },
            onSuccess: () => {
                // Invalidate the ${camelModelName}s query to refetch the list
                queryClient.invalidateQueries(${pluralCamelName}QueryKey);
                toast.success('${modelName} created successfully');
            },
            onError: (error) => {
                console.error('Failed to create ${camelModelName}:', error);
                toast.error('Failed to create ${camelModelName}');
            }
        });
    };
    
    // Update an existing ${camelModelName}
    const useUpdate${modelName} = () => {
        return useMutation<${modelName}Resource, Error, { id: number; data: Partial<${modelName}> }>({
            mutationFn: async ({ id, data }) => {
                const response = await axios.put<${modelName}Resource>(\`${endpoint}/\${id}\`, data);
                return response.data;
            },
            onSuccess: (_, variables) => {
                // Invalidate specific ${camelModelName} query and list query
                queryClient.invalidateQueries([...${pluralCamelName}QueryKey, variables.id]);
                queryClient.invalidateQueries(${pluralCamelName}QueryKey);
                toast.success('${modelName} updated successfully');
            },
            onError: (error) => {
                console.error('Failed to update ${camelModelName}:', error);
                toast.error('Failed to update ${camelModelName}');
            }
        });
    };
    
    // Delete a ${camelModelName}
    const useDelete${modelName} = () => {
        return useMutation<any, Error, number>({
            mutationFn: async (id) => {
                const response = await axios.delete(\`${endpoint}/\${id}\`);
                return response.data;
            },
            onSuccess: () => {
                // Invalidate the ${camelModelName}s query to refetch the list
                queryClient.invalidateQueries(${pluralCamelName}QueryKey);
                toast.success('${modelName} deleted successfully');
            },
            onError: (error) => {
                console.error('Failed to delete ${camelModelName}:', error);
                toast.error('Failed to delete ${camelModelName}');
            }
        });
    };
    
    return {
        useGet${pluralCamelName},
        useGet${modelName},
        useCreate${modelName},
        useUpdate${modelName},
        useDelete${modelName}
    };
};
`;
    }

    // Generate TypeScript Service
    public async getTsServiceTemplate(name: string): Promise<string> {
        const modelName = this.toPascalCase(name);
        const pluralModelName = this.pluralize(modelName);
        const camelModelName = this.toCamelCase(name);
        const snakePluralName = this.toSnakeCase(this.pluralize(name));
        
        return `import axios from 'axios';
import { ${modelName} } from '../Support/Interfaces/Models/${modelName}';
import { ${modelName}Resource } from '../Support/Interfaces/Resources/${modelName}Resource';
import { PaginatedResponse } from '../Support/Interfaces/PaginatedResponse';

export class ${modelName}Service {
    /**
     * Get all ${pluralModelName} with pagination
     * 
     * @param params Query parameters for filtering and pagination
     * @returns Promise with paginated response of ${modelName}Resource objects
     */
    public static async getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<${modelName}Resource>> {
        const response = await axios.get<PaginatedResponse<${modelName}Resource>>(\`/api/${snakePluralName}\`, { params });
        return response.data;
    }

    /**
     * Get a single ${modelName} by ID
     * 
     * @param id The ID of the ${camelModelName}
     * @returns Promise with the ${modelName}Resource
     */
    public static async getById(id: number): Promise<${modelName}Resource> {
        const response = await axios.get<${modelName}Resource>(\`/api/${snakePluralName}/\${id}\`);
        return response.data;
    }

    /**
     * Create a new ${modelName}
     * 
     * @param data The ${modelName} data to create
     * @returns Promise with the created ${modelName}Resource
     */
    public static async create(data: Partial<${modelName}>): Promise<${modelName}Resource> {
        const response = await axios.post<${modelName}Resource>(\`/api/${snakePluralName}\`, data);
        return response.data;
    }

    /**
     * Update an existing ${modelName}
     * 
     * @param id The ID of the ${camelModelName} to update
     * @param data The ${modelName} data to update
     * @returns Promise with the updated ${modelName}Resource
     */
    public static async update(id: number, data: Partial<${modelName}>): Promise<${modelName}Resource> {
        const response = await axios.put<${modelName}Resource>(\`/api/${snakePluralName}/\${id}\`, data);
        return response.data;
    }

    /**
     * Delete a ${modelName}
     * 
     * @param id The ID of the ${camelModelName} to delete
     * @returns Promise with the API response
     */
    public static async delete(id: number): Promise<any> {
        const response = await axios.delete(\`/api/${snakePluralName}/\${id}\`);
        return response.data;
    }
}
`;
    }

    // Generate Collection (simplified)
    public async getCollectionTemplate(name: string): Promise<string> {
        // Return a simple comment since we want to disable Collection generation
        return `<?php

namespace App\\Http\\Resources;

// Collection generation is disabled per request
// This is a minimal placeholder file

use Illuminate\\Http\\Resources\\Json\\ResourceCollection;

class ${this.toPascalCase(name)}Collection extends ResourceCollection
{
    // Collection functionality disabled
}
`;
    }

    // Generate Store Request with model-specific directory
    public async getStoreRequestTemplate(name: string, attributes: any[]): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('storeRequest', name, attributes);
        if (customTemplate) {
            return customTemplate;
        }
        
        // Try to use stub file
        const stubTemplate = await this.readStubFile('storeRequest');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }
        
        // Otherwise use the built-in template
        const modelName = this.toPascalCase(name);
        const rules = attributes
            .filter(attr => attr.fillable !== false)
            .map(attr => {
                let rule = '';
                switch (attr.type) {
                    case 'string':
                    case 'text':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'string']`;
                        break;
                    case 'integer':
                    case 'bigInteger':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'integer']`;
                        break;
                    case 'boolean':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'boolean']`;
                        break;
                    case 'date':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'date']`;
                        break;
                    case 'dateTime':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'date_format:Y-m-d H:i:s']`;
                        break;
                    case 'decimal':
                    case 'float':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'numeric']`;
                        break;
                    case 'json':
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}, 'array']`;
                        break;
                    default:
                        rule = `'${attr.name}' => ['required'${attr.nullable ? ", 'nullable'" : ''}]`;
                }
                return rule;
            }).join(',\n            ');
        
        return `<?php

namespace App\\Http\\Requests\\${modelName};

use Illuminate\\Foundation\\Http\\FormRequest;

class Store${modelName}Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ${rules}
        ];
    }
}
`;
    }

    // Generate Update Request with model-specific directory
    public async getUpdateRequestTemplate(name: string, attributes: any[]): Promise<string> {
        // Check for custom template
        const customTemplate = await this.readCustomTemplate('updateRequest', name, attributes);
        if (customTemplate) {
            return customTemplate;
        }
        
        // Try to use stub file
        const stubTemplate = await this.readStubFile('updateRequest');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }
        
        // Otherwise use the built-in template
        const modelName = this.toPascalCase(name);
        const rules = attributes
            .filter(attr => attr.fillable !== false)
            .map(attr => {
                let rule = '';
                switch (attr.type) {
                    case 'string':
                    case 'text':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'string']`;
                        break;
                    case 'integer':
                    case 'bigInteger':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'integer']`;
                        break;
                    case 'boolean':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'boolean']`;
                        break;
                    case 'date':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'date']`;
                        break;
                    case 'dateTime':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'date_format:Y-m-d H:i:s']`;
                        break;
                    case 'decimal':
                    case 'float':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'numeric']`;
                        break;
                    case 'json':
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}, 'array']`;
                        break;
                    default:
                        rule = `'${attr.name}' => ['sometimes'${attr.nullable ? ", 'nullable'" : ''}]`;
                }
                return rule;
            }).join(',\n            ');
        
        return `<?php

namespace App\\Http\\Requests\\${modelName};

use Illuminate\\Foundation\\Http\\FormRequest;

class Update${modelName}Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ${rules}
        ];
    }
}
`;
    }

    // Generate Controller using model-specific namespaced requests
    public async getControllerTemplate(name: string, attributes: any[]): Promise<string> {
        // Check for custom template from settings
        const customTemplate = await this.readCustomTemplate('controller', name, attributes);
        if (customTemplate) {
            return customTemplate;
        }
        
        // Try to use stub file as standard approach
        const stubTemplate = await this.readStubFile('controller');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, attributes);
        }
        
        // Otherwise use the built-in template logic as fallback
        console.log('Using built-in controller template as fallback');
        
        const modelName = this.toPascalCase(name);
        const modelVariable = this.toCamelCase(name);
        const routeName = this.toSnakeCase(this.pluralize(name));
        
        return `<?php

namespace App\\Http\\Controllers;

use App\\Http\\Requests\\${modelName}\\Store${modelName}Request;
use App\\Http\\Requests\\${modelName}\\Update${modelName}Request;
use App\\Models\\${modelName};
use App\\Support\\Interfaces\\Services\\${modelName}ServiceInterface;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Inertia\\Inertia;
use Inertia\\Response;

class ${modelName}Controller extends Controller
{
    public function __construct(protected ${modelName}ServiceInterface $${modelVariable}Service)
    {
        // Middleware can be added here
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->only(['search', 'order', 'dir', 'page', 'pageSize']);
        
        return Inertia::render('${modelName}/Index', [
            '${this.pluralize(modelVariable)}' => $this->${modelVariable}Service->getAllPaginated($search),
            'filters' => $search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('${modelName}/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Store${modelName}Request $request): RedirectResponse
    {
        $${modelVariable} = $this->${modelVariable}Service->store($request->validated());

        return redirect()->route('${routeName}.index')
            ->with('message', '${modelName} created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(${modelName} $${modelVariable}): Response
    {
        return Inertia::render('${modelName}/Show', [
            '${modelVariable}' => $${modelVariable},
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(${modelName} $${modelVariable}): Response
    {
        return Inertia::render('${modelName}/Edit', [
            '${modelVariable}' => $${modelVariable},
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Update${modelName}Request $request, ${modelName} $${modelVariable}): RedirectResponse
    {
        $this->${modelVariable}Service->update($${modelVariable}->id, $request->validated());

        return redirect()->route('${routeName}.index')
            ->with('message', '${modelName} updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(${modelName} $${modelVariable}): RedirectResponse
    {
        $this->${modelVariable}Service->delete($${modelVariable}->id);

        return redirect()->route('${routeName}.index')
            ->with('message', '${modelName} deleted successfully.');
    }
}
`;
    }

    // Generate API Controller using model-specific namespaced requests
    public async getApiControllerTemplate(name: string, apiResource: string): Promise<string> {
        // Check for custom template from settings
        const customTemplate = await this.readCustomTemplate('apiController', name);
        if (customTemplate) {
            return customTemplate;
        }
        
        // Try to use stub file as standard approach
        const stubTemplate = await this.readStubFile('apiController');
        if (stubTemplate) {
            return this.processTemplateWithVariables(stubTemplate, name, [], undefined);
        }
        
        // Otherwise use the built-in template logic as fallback
        console.log('Using built-in API controller template as fallback');
        
        const modelName = this.toPascalCase(name);
        const modelVariable = this.toCamelCase(name);
        const apiRoute = apiResource || `/api/${this.toSnakeCase(this.pluralize(name))}`;
        
        return `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\${modelName}\\Store${modelName}Request;
use App\\Http\\Requests\\${modelName}\\Update${modelName}Request;
use App\\Http\\Resources\\${modelName}Resource;
use App\\Models\\${modelName};
use App\\Support\\Interfaces\\Services\\${modelName}ServiceInterface;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

/**
 * @group ${modelName} Management
 * 
 * API endpoints for managing ${this.pluralize(modelName)}
 * 
 * @authenticated
 */
class ${modelName}Controller extends Controller
{
    public function __construct(protected ${modelName}ServiceInterface $${modelVariable}Service)
    {
        // You may apply middleware here
    }
    
    /**
     * List all ${this.pluralize(modelName)}
     * 
     * Get a paginated list of all ${this.pluralize(modelName)}.
     * 
     * @queryParam search string Search query. Example: keyword
     * @queryParam page integer Page number. Example: 1
     * @queryParam pageSize integer Items per page. Example: 15
     * @queryParam order string Sort column. Example: created_at
     * @queryParam dir string Sort direction (asc or desc). Example: desc
     * 
     * @apiResource App\\Http\\Resources\\${modelName}Resource
     * @apiResourceModel App\\Models\\${modelName}
     * 
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = $request->only(['search', 'order', 'dir', 'page', 'pageSize']);
        
        $${this.pluralize(modelVariable)} = $this->${modelVariable}Service->getAllPaginated($search);
        
        return ${modelName}Resource::collection($${this.pluralize(modelVariable)});
    }

    /**
     * Create ${modelName}
     * 
     * Store a new ${modelName} in the database.
     * 
     * @apiResource App\\Http\\Resources\\${modelName}Resource
     * @apiResourceModel App\\Models\\${modelName}
     * 
     * @param Store${modelName}Request $request
     * @return ${modelName}Resource
     */
    public function store(Store${modelName}Request $request): ${modelName}Resource
    {
        $${modelVariable} = $this->${modelVariable}Service->store($request->validated());
        
        return new ${modelName}Resource($${modelVariable});
    }

    /**
     * Get ${modelName} details
     * 
     * Get detailed information about a specific ${modelName}.
     * 
     * @apiResource App\\Http\\Resources\\${modelName}Resource
     * @apiResourceModel App\\Models\\${modelName}
     * 
     * @param ${modelName} $${modelVariable}
     * @return ${modelName}Resource
     */
    public function show(${modelName} $${modelVariable}): ${modelName}Resource
    {
        return new ${modelName}Resource($${modelVariable});
    }

    /**
     * Update ${modelName}
     * 
     * Update an existing ${modelName} in the database.
     * 
     * @apiResource App\\Http\\Resources\\${modelName}Resource
     * @apiResourceModel App\\Models\\${modelName}
     * 
     * @param Update${modelName}Request $request
     * @param ${modelName} $${modelVariable}
     * @return ${modelName}Resource
     */
    public function update(Update${modelName}Request $request, ${modelName} $${modelVariable}): ${modelName}Resource
    {
        $updated${modelName} = $this->${modelVariable}Service->update($${modelVariable}->id, $request->validated());
        
        return new ${modelName}Resource($updated${modelName});
    }

    /**
     * Delete ${modelName}
     * 
     * Remove a ${modelName} from the database.
     * 
     * @param ${modelName} $${modelVariable}
     * @return JsonResponse
     */
    public function destroy(${modelName} $${modelVariable}): JsonResponse
    {
        $this->${modelVariable}Service->delete($${modelVariable}->id);
        
        return response()->json(['message' => '${modelName} deleted successfully']);
    }
}
`;
    }

    // Generate TypeScript Index Page
    public async getTsIndexPageTemplate(name: string): Promise<string> {
        const modelName = this.toPascalCase(name);
        const camelModelName = this.toCamelCase(name);
        const pluralCamelName = this.toCamelCase(this.pluralize(name));
        const pluralName = this.pluralize(name);
        
        return `import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/Components/UI/table';
import { 
    Pagination, 
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/Components/UI/pagination';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { ${modelName}Resource } from '@/Support/Interfaces/Resources/${modelName}Resource';
import { use${modelName}Service } from '@/Services/${camelModelName}ServiceHook';
import { confirmDialog } from '@/Contexts/ConfirmationDialogContext';

export default function Index() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Service hooks
    const { useGet${pluralCamelName}, useDelete${modelName} } = use${modelName}Service();
    const { data: ${pluralCamelName}Data, isLoading } = useGet${pluralCamelName}({ 
        search: debouncedSearch,
        page,
        pageSize
    });
    const deleteMutation = useDelete${modelName}();
    
    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page when search changes
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);
    
    // Handle delete with confirmation
    const handleDelete = (id: number) => {
        confirmDialog({
            title: 'Delete ${modelName}',
            message: 'Are you sure you want to delete this ${camelModelName}? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                deleteMutation.mutate(id);
            }
        });
    };
    
    return (
        <AuthenticatedLayout>
            <Head title="${pluralName}" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between">
                        <h1 className="text-2xl font-semibold">${pluralName}</h1>
                        <Button asChild>
                            <Link href={\`/${this.toSnakeCase(pluralName)}/create\`}>Create New ${modelName}</Link>
                        </Button>
                    </div>
                    
                    <div className="mb-6">
                        <Input
                            type="search"
                            placeholder="Search ${pluralName}..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border bg-card">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    {/* Add table headers based on model attributes */}
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : ${pluralCamelName}Data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No ${pluralName} found</TableCell>
                                    </TableRow>
                                ) : (
                                    ${pluralCamelName}Data?.data?.map((item: ${modelName}Resource) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            {/* Add table cells based on model attributes */}
                                            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={\`/${this.toSnakeCase(pluralName)}/\${item.id}\`}>View</Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={\`/${this.toSnakeCase(pluralName)}/\${item.id}/edit\`}>Edit</Link>
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deleteMutation.isLoading}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination */}
                    {${pluralCamelName}Data?.meta?.last_page > 1 && (
                        <Pagination className="mt-4 justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) setPage(page - 1);
                                        }}
                                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                
                                {/* Implement page number links based on pagination meta */}
                                {Array.from({ length: ${pluralCamelName}Data?.meta?.last_page }).slice(0, 5).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(i + 1);
                                            }}
                                            isActive={page === i + 1}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                
                                {${pluralCamelName}Data?.meta?.last_page > 5 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page < ${pluralCamelName}Data?.meta?.last_page) setPage(page + 1);
                                        }}
                                        className={page >= ${pluralCamelName}Data?.meta?.last_page ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
`;
    }

    // Generate TypeScript Form Component
    public async getTsFormComponentTemplate(name: string, attributes: any[]): Promise<string> {
        const modelName = this.toPascalCase(name);
        const camelModelName = this.toCamelCase(name);
        
        // Generate form fields based on attributes
        const formFields = attributes.map(attr => {
            const fieldName = attr.name;
            const fieldType = attr.type;
            let formField = '';
            
            switch (fieldType) {
                case 'boolean':
                    formField = `
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="${fieldName}"
                                    checked={data.${fieldName} === true}
                                    onCheckedChange={(checked) => setData('${fieldName}', checked)}
                                />
                                <Label htmlFor="${fieldName}" className="text-sm font-medium">
                                    ${this.toHumanReadable(fieldName)}
                                </Label>
                            </div>
                            {errors.${fieldName} && (
                                <p className="text-xs text-destructive">{errors.${fieldName}}</p>
                            )}
                        </div>`;
                    break;
                case 'text':
                    formField = `
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="${fieldName}">${this.toHumanReadable(fieldName)}</Label>
                                <Textarea
                                    id="${fieldName}"
                                    value={data.${fieldName} || ''}
                                    onChange={(e) => setData('${fieldName}', e.target.value)}
                                    rows={4}
                                    className="w-full"
                                    placeholder="Enter ${this.toHumanReadable(fieldName).toLowerCase()}"
                                />
                            </div>
                            {errors.${fieldName} && (
                                <p className="text-xs text-destructive">{errors.${fieldName}}</p>
                            )}
                        </div>`;
                    break;
                case 'date':
                    formField = `
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="${fieldName}">${this.toHumanReadable(fieldName)}</Label>
                                <Input
                                    id="${fieldName}"
                                    type="date"
                                    value={data.${fieldName} || ''}
                                    onChange={(e) => setData('${fieldName}', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            {errors.${fieldName} && (
                                <p className="text-xs text-destructive">{errors.${fieldName}}</p>
                            )}
                        </div>`;
                    break;
                case 'dateTime':
                    formField = `
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="${fieldName}">${this.toHumanReadable(fieldName)}</Label>
                                <Input
                                    id="${fieldName}"
                                    type="datetime-local"
                                    value={data.${fieldName} || ''}
                                    onChange={(e) => setData('${fieldName}', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            {errors.${fieldName} && (
                                <p className="text-xs text-destructive">{errors.${fieldName}}</p>
                            )}
                        </div>`;
                    break;
                default:
                    formField = `
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="${fieldName}">${this.toHumanReadable(fieldName)}</Label>
                                <Input
                                    id="${fieldName}"
                                    type="${fieldType === 'integer' || fieldType === 'bigInteger' || fieldType === 'decimal' || fieldType === 'float' ? 'number' : 'text'}"
                                    value={data.${fieldName} || ''}
                                    onChange={(e) => setData('${fieldName}', e.target.value)}
                                    className="w-full"
                                    placeholder="Enter ${this.toHumanReadable(fieldName).toLowerCase()}"
                                />
                            </div>
                            {errors.${fieldName} && (
                                <p className="text-xs text-destructive">{errors.${fieldName}}</p>
                            )}
                        </div>`;
            }
            
            return formField;
        }).join('\n');
        
        // Generate default values for form
        const defaultValues = attributes
            .filter(attr => attr.fillable !== false)
            .map(attr => {
                const name = attr.name;
                const type = attr.type;
                const defaultValue = attr.default || '';
                const isNullable = attr.nullable;
                
                if (isNullable) {
                    return `${name}: ${camelModelName}?.${name} ?? null`;
                }
                
                if (type === 'boolean') {
                    return `${name}: ${camelModelName}?.${name} ?? ${defaultValue || false}`;
                }
                
                if (type === 'integer' || type === 'bigInteger' || type === 'decimal' || type === 'float') {
                    return `${name}: ${camelModelName}?.${name} ?? ${defaultValue || 0}`;
                }
                
                return `${name}: ${camelModelName}?.${name} ?? '${defaultValue}'`;
            })
            .join(',\n        ');
        
        return `import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import { Label } from '@/Components/UI/label';
import { Textarea } from '@/Components/UI/textarea';
import { Switch } from '@/Components/UI/switch';
import { ${modelName} } from '@/Support/Interfaces/Models/${modelName}';

export interface ${modelName}FormProps {
    ${camelModelName}?: ${modelName};
    isEditing?: boolean;
}

export default function ${modelName}Form({ ${camelModelName}, isEditing = false }: ${modelName}FormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm<Partial<${modelName}>>({
        // Default values for all fields
        ${defaultValues}
    });

    useEffect(() => {
        // Reset form when ${camelModelName} changes
        if (${camelModelName}) {
            reset({
                ...${camelModelName}
            });
        }
    }, [${camelModelName}]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && ${camelModelName}?.id) {
            put(route('${this.toSnakeCase(this.pluralize(name))}.update', ${camelModelName}.id));
        } else {
            post(route('${this.toSnakeCase(this.pluralize(name))}.store'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                ${formFields}
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
`;
    }
}
