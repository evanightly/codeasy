import * as vscode from 'vscode';
import { ModelGenerator } from './generators/ModelGenerator';
import { CrudGenerator } from './generators/CrudGenerator';
import { LaravelProjectAnalyzer } from './utils/LaravelProjectAnalyzer';

export function activate(context: vscode.ExtensionContext) {
    const modelGenerator = new ModelGenerator(context);
    const crudGenerator = new CrudGenerator(context);
    const projectAnalyzer = new LaravelProjectAnalyzer();

    // Check if we're in a Laravel project
    projectAnalyzer.isLaravelProject().then(isLaravel => {
        if (!isLaravel) {
            vscode.window.showWarningMessage('This doesn\'t appear to be a Laravel project. Some features may not work correctly.');
        }
    });

    // Register the model generator command
    let modelDisposable = vscode.commands.registerCommand('laravelScaffold.generateModel', async () => {
        await modelGenerator.showModelDefinitionUI();
    });

    // Register the CRUD generator command
    let crudDisposable = vscode.commands.registerCommand('laravelScaffold.generateCRUD', async () => {
        await crudGenerator.showCrudDefinitionUI();
    });

    context.subscriptions.push(modelDisposable, crudDisposable);
}

export function deactivate() {}
