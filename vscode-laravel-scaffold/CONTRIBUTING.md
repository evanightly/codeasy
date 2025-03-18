# Contributing to Laravel Scaffold

Thank you for considering contributing to Laravel Scaffold! This document outlines the process for contributing to this project.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vscode-laravel-scaffold.git
   cd vscode-laravel-scaffold
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

4. Open the project in VS Code:
   ```bash
   code .
   ```

5. Debug the extension by pressing F5 or clicking the "Run and Debug" button in VS Code.

## Project Structure

- `src/`: TypeScript source code
  - `extension.ts`: Main extension entry point
  - `generators/`: Code generators for different Laravel components
  - `templates/`: Template loading and management
  - `utils/`: Helper utilities for file operations, etc.
- `stubs/`: Stub template files
  - `backend/`: Backend (PHP) templates
  - `frontend/`: Frontend (TypeScript) templates
- `out/`: Compiled JavaScript output (generated)

## Adding New Templates

To add a new template type:

1. Create a new stub file in the appropriate directory (`stubs/backend/` or `stubs/frontend/`)
2. Add the stub file name to the `DefaultTemplates` class in `src/templates/DefaultTemplates.ts`
3. Create any necessary helper methods in `src/utils/helpers/TemplateHelper.ts`
4. Add the template generation logic in the appropriate generator class

## Running Tests

```bash
npm test
```

## Packaging the Extension

To package the extension for distribution:

```bash
npm run vscode:prepublish
vsce package
```

This will create a `.vsix` file that can be installed in VS Code.

## Submitting Changes

1. Create a new branch for your changes
2. Make your changes
3. Write tests if applicable
4. Update documentation if needed
5. Submit a pull request

## Code Style

- Follow the existing code style
- Use proper TypeScript typing
- Comment your code when necessary
- Write clear commit messages

Thank you for contributing!
