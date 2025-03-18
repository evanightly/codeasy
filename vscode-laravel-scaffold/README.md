# Laravel Scaffold - VS Code Extension

This VS Code extension provides automated scaffolding for Laravel projects, helping you generate models, migrations, controllers, services, repositories, and more with a few clicks.

## Features

- **Model Generation**: Create Laravel models with the corresponding migration
- **CRUD Generation**: Generate complete CRUD functionality including:
  - Models, Migrations, Factories, and Seeders
  - Repository pattern (Repository + Interface)
  - Service pattern (Service + Interface)
  - Controllers (Web + API)
  - Form Requests (Store + Update)
  - Resources and Collections
  - TypeScript interfaces for frontend

## Requirements

- VS Code 1.50.0 or higher
- Laravel 8.0+ project

## Usage

1. Open a Laravel project in VS Code
2. Press `Ctrl+Shift+P` to open the Command Palette
3. Type "Laravel Scaffold" and select either:
   - `Laravel Scaffold: Generate Model` - to create a model and related files
   - `Laravel Scaffold: Generate CRUD` - to create a complete CRUD setup

## Customization

### Using Custom Stubs

This extension uses a stub-based template system, which means you can customize the generated code by providing your own stub files. There are two ways to customize templates:

#### 1. Project-level Stubs

Create stub files in your project structure:
