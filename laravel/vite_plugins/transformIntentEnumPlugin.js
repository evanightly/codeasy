import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { generatePrefixText } from '../lib/generatePrefixText.js';

const phpEnumFilePath = path.resolve(__dirname, '../../app/Support/Enums/IntentEnum.php');
const tsEnumFilePath = path.resolve(__dirname, '../../resources/js/Support/Enums/intentEnum.ts');

function parsePhpEnum(fileContent) {
    const enumMatches = fileContent.match(/case\s+(\w+)\s*=\s*['"](.*?)['"];/g);
    if (!enumMatches) return {};

    return enumMatches.reduce((acc, match) => {
        const [, key, value] = match.match(/case\s+(\w+)\s*=\s*['"](.*?)['"];/);
        acc[key] = value;
        return acc;
    }, {});
}

function generateTsEnum(enumObject) {
    const lines = Object.entries(enumObject).map(([key, value]) => `    ${key}: '${value}',`);

    return `const intents = {\n${lines.join('\n')}\n};\n\nexport const IntentEnum = intents;\n\nexport type IntentEnum = (typeof intents)[keyof typeof intents];\n`;
}

function updateTsFile() {
    const phpContent = fs.readFileSync(phpEnumFilePath, 'utf8');
    const parsedEnum = parsePhpEnum(phpContent);
    const tsContent = generateTsEnum(parsedEnum);

    fs.writeFileSync(tsEnumFilePath, tsContent, 'utf8');
    const msg = generatePrefixText({
        label: 'Transform Intent Enum',
        text: `Updated TypeScript file: ${tsEnumFilePath}`,
    });
    console.log(msg);
}

export default function intentEnumPlugin() {
    return {
        name: 'vite-plugin-intent-enum',
        buildStart() {
            chokidar.watch(phpEnumFilePath).on('change', () => {
                const msg = generatePrefixText({
                    label: 'Transform Intent Enum',
                    text: `Detected changes in ${phpEnumFilePath}`,
                });
                console.log(msg);
                updateTsFile();
            });

            // Initial sync
            updateTsFile();
        },
    };
}