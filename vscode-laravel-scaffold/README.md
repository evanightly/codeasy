# Laravel Full-Stack Scaffolding Extension

A VS Code extension that helps you rapidly scaffold Laravel full-stack components including:

- Models
- Migrations
- Factories and Seeders
- Repositories and Services
- Form Requests
- Controllers (Web and API)
- Resources and Collections
- TypeScript interfaces and services
- React/Inertia components

## Features

- Interactive UI for defining models and attributes
- Configurable options for generating related files
- Support for both individual component generation and full CRUD setup
- Generation of both backend and frontend files

## Usage

### Generate Model & Related Files

1. Right-click on a folder in the Explorer view
2. Select "Laravel Scaffold: Generate Model & Related Files"
3. Define your model name, attributes, and select which related files to generate
4. Click "Generate"

### Generate Complete CRUD

1. Right-click on a folder in the Explorer view
2. Select "Laravel Scaffold: Generate Complete CRUD"
3. Define your model name, attributes, and configure CRUD options
4. Click "Generate"

## Requirements

- VS Code 1.60.0 or higher
- A Laravel project with standard directory structure

## Extension Settings

This extension contributes the following commands:

- `laravelScaffold.generateModel`: Generate a Laravel model with related files
- `laravelScaffold.generateCRUD`: Generate a complete Laravel CRUD setup

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open the project in VS Code
4. Press F5 to launch the extension in debug mode

## Building the Extension

Run `npm run vscode:prepublish` to compile the extension.

## License

MIT
