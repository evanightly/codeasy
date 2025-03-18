import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Helper class for template processing
 */
export class TemplateHelper {
    /**
     * Convert string to PascalCase
     */
    static toPascalCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }

    /**
     * Convert string to camelCase
     */
    static toCamelCase(str: string): string {
        return str
            .replace(/(?:^|[-_])(\w)/g, (_, c, i) => i === 0 && c ? c.toLowerCase() : c ? c.toUpperCase() : '')
            .replace(/\s+/g, '');
    }

    /**
     * Convert string to snake_case
     */
    static toSnakeCase(str: string): string {
        return str
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_+/, '')
            .replace(/\s+/g, '_');
    }

    /**
     * Convert string to UPPER_SNAKE_CASE
     */
    static toUpperSnakeCase(str: string): string {
        return this.toSnakeCase(str).toUpperCase();
    }

    /**
     * Simple pluralization for English nouns
     */
    static pluralize(word: string): string {
        // Special cases
        const irregulars: Record<string, string> = {
            'person': 'people',
            'child': 'children',
            'man': 'men',
            'woman': 'women',
            'foot': 'feet',
            'tooth': 'teeth',
            'goose': 'geese',
            'mouse': 'mice'
        };
        
        if (irregulars[word.toLowerCase()]) {
            return irregulars[word.toLowerCase()];
        }
        
        if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => word.endsWith(ending))) {
            return word.slice(0, -1) + 'ies';
        } else if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
                  word.endsWith('ch') || word.endsWith('sh')) {
            return word + 'es';
        } else {
            return word + 's';
        }
    }

    /**
     * Map attribute type to PHP type for casts
     */
    static getPhpType(type: string): string {
        switch (type) {
            case 'integer':
            case 'bigInteger': 
                return 'integer';
            case 'decimal':
            case 'float': 
                return 'float';
            case 'boolean': 
                return 'boolean';
            case 'date': 
                return 'date';
            case 'dateTime': 
                return 'datetime';
            case 'json': 
                return 'array';
            case 'timestamp':
                return 'timestamp';
            default: 
                return 'string';
        }
    }

    /**
     * Map attribute type to TypeScript type
     */
    static getTsType(type: string): string {
        switch (type) {
            case 'integer':
            case 'bigInteger':
            case 'decimal':
            case 'float': 
                return 'number';
            case 'boolean': 
                return 'boolean';
            case 'date':
            case 'dateTime':
            case 'timestamp':
                return 'string';
            case 'json': 
                return 'Record<string, any>';
            default: 
                return 'string';
        }
    }
    
    /**
     * Process simple conditional blocks in templates (e.g. {{#if variable}}content{{/if}})
     */
    static processConditionalBlocks(template: string, variables: Record<string, any>): string {
        // Process #if blocks
        const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        return template.replace(ifRegex, (_, condition, content) => {
            if (variables[condition]) {
                return content;
            }
            return '';
        });
    }

    /**
     * Generate migration fields
     */
    static generateMigrationFields(attributes: any[]): string {
        return attributes.map(attr => {
            let field = `            $table->${attr.type}('${attr.name}')`;
            
            // Add modifiers
            if (attr.nullable) {
                field += '->nullable()';
            }
            
            if (attr.unique) {
                field += '->unique()';
            }
            
            if (attr.index) {
                field += '->index()';
            }
            
            if (attr.unsigned && ['integer', 'bigInteger'].includes(attr.type)) {
                field += '->unsigned()';
            }
            
            // Add default value if specified
            if (attr.default !== undefined && attr.default !== '') {
                if (attr.type === 'boolean') {
                    field += `->default(${attr.default})`;
                } else if (['integer', 'bigInteger', 'decimal', 'float'].includes(attr.type)) {
                    field += `->default(${attr.default})`;
                } else {
                    field += `->default('${attr.default}')`;
                }
            }
            
            field += ';';
            return field;
        }).join('\n');
    }

    /**
     * Generate factory definitions
     */
    static generateFactoryDefinitions(attributes: any[]): string {
        return attributes.map(attr => {
            let factoryLine;
            
            switch (attr.type) {
                case 'string':
                    factoryLine = `'${attr.name}' => fake()->word()`;
                    break;
                case 'integer':
                case 'bigInteger':
                    factoryLine = `'${attr.name}' => fake()->numberBetween(1, 1000)`;
                    break;
                case 'decimal':
                case 'float':
                    factoryLine = `'${attr.name}' => fake()->randomFloat(2, 1, 1000)`;
                    break;
                case 'boolean':
                    factoryLine = `'${attr.name}' => fake()->boolean()`;
                    break;
                case 'date':
                    factoryLine = `'${attr.name}' => fake()->date()`;
                    break;
                case 'dateTime':
                case 'timestamp':
                    factoryLine = `'${attr.name}' => fake()->dateTime()`;
                    break;
                case 'text':
                    factoryLine = `'${attr.name}' => fake()->paragraph()`;
                    break;
                case 'json':
                    factoryLine = `'${attr.name}' => ['data' => fake()->word()]`;
                    break;
                case 'email':
                    factoryLine = `'${attr.name}' => fake()->safeEmail()`;
                    break;
                case 'uuid':
                    factoryLine = `'${attr.name}' => fake()->uuid()`;
                    break;
                default:
                    factoryLine = `'${attr.name}' => fake()->word()`;
            }
            
            return factoryLine;
        }).join(",\n            ");
    }

    /**
     * Generate validation rules
     */
    static generateValidationRules(attributes: any[], ruleType: 'store' | 'update'): string {
        return attributes.map(attr => {
            let rules = [];
            
            // Add required/nullable rule
            if (attr.nullable) {
                rules.push('nullable');
            } else if (ruleType === 'store') {
                rules.push('required');
            } else {
                rules.push('sometimes', 'required');
            }
            
            // Add type validation
            switch (attr.type) {
                case 'string':
                    rules.push('string', 'max:255');
                    break;
                case 'integer':
                case 'bigInteger':
                    rules.push('integer');
                    break;
                case 'decimal':
                case 'float':
                    rules.push('numeric');
                    break;
                case 'boolean':
                    rules.push('boolean');
                    break;
                case 'date':
                    rules.push('date');
                    break;
                case 'dateTime':
                case 'timestamp':
                    rules.push('date');
                    break;
                case 'text':
                    rules.push('string');
                    break;
                case 'json':
                    rules.push('array');
                    break;
                case 'email':
                    rules.push('email');
                    break;
                case 'uuid':
                    rules.push('uuid');
                    break;
            }
            
            // Add unique rule for update requests if specified
            if (attr.unique && ruleType === 'update') {
                rules.push(`'unique:${attr.tableName || 'table_name'},${attr.name},\'.$this->route()->parameter(\'${attr.routeParam || 'id'}\').\'`);
            }
            
            return `'${attr.name}' => ['${rules.join("', '")}']`;
        }).join(",\n            ");
    }

    /**
     * Load a stub file from the extension's stub directory
     */
    static loadStubFile(stubFileName: string, context: vscode.ExtensionContext): string {
        const stubPath = path.join(context.extensionPath, 'stubs', stubFileName);
        if (!fs.existsSync(stubPath)) {
            throw new Error(`Stub file not found: ${stubFileName}`);
        }
        
        return fs.readFileSync(stubPath, 'utf8');
    }
}
