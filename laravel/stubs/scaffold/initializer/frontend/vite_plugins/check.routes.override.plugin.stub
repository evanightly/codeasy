import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { generatePrefixText } from '../lib/generatePrefixText.js';

const tanstackKeysFilePath = path.resolve(
    __dirname,
    '../../resources/js/Support/Constants/tanstackQueryKeys.ts',
);
const routesFilePath = path.resolve(__dirname, '../../resources/js/Support/Constants/routes.ts');

function parseKeys(fileContent) {
    const matches = fileContent.match(/(\w+):\s*['"`]\w+['"`]/g);
    if (!matches) return {};

    return matches.reduce((acc, match) => {
        const [key] = match.split(':');
        acc[key.trim()] = true;
        return acc;
    }, {});
}

function validateKeys() {
    const routesContent = fs.readFileSync(routesFilePath, 'utf8');
    const tanstackKeysContent = fs.readFileSync(tanstackKeysFilePath, 'utf8');

    const routesKeys = parseKeys(routesContent);
    const tanstackKeys = parseKeys(tanstackKeysContent);

    // Check for duplicate keys
    const duplicateKeys = Object.keys(routesKeys).filter((key) => tanstackKeys[key]);

    if (duplicateKeys.length > 0) {
        // Format the duplicate keys for better readability
        const formattedDuplicateKeys = duplicateKeys.map((key) => `- ${key}`).join('\n');

        const errorMsg = generatePrefixText({
            labelColor: 'red',
            label: 'Tanstack Query Keys Validator',
            text: `Duplicate keys detected in tanstackQueryKeys.ts. The following keys conflict with ROUTES:\n${formattedDuplicateKeys}\n\nPlease ensure keys in TANSTACK_QUERY_KEYS do not override keys from ROUTES.`,
        });

        throw new Error(errorMsg);
    }

    const msg = generatePrefixText({
        label: 'Tanstack Query Keys Validator',
        text: 'No duplicate keys found.',
    });
    console.log(msg);
}

export default function tanstackQueryKeysPlugin() {
    return {
        name: 'vite-plugin-tanstack-query-keys',
        buildStart() {
            // Initial validation
            validateKeys();

            // Watch for changes
            chokidar.watch([tanstackKeysFilePath, routesFilePath]).on('change', (filePath) => {
                const msg = generatePrefixText({
                    label: 'Tanstack Query Keys Validator',
                    text: `Detected changes in ${filePath}`,
                });

                console.log(msg);
                try {
                    validateKeys();
                } catch (err) {
                    console.error(err.message);
                }
            });
        },
    };
}