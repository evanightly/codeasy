import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { generatePrefixText } from './lib/generatePrefixText';

const phpEnumFilePath = path.resolve(__dirname, '../app/Support/Enums/PermissionEnum.php');
const tsEnumFilePath = path.resolve(__dirname, '../resources/js/Support/Enums/permissionEnum.ts');

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

    return `const permissions = {\n${lines.join('\n')}\n};\n\nexport const PermissionEnum = permissions;\n\nexport type PermissionEnum = (typeof permissions)[keyof typeof permissions];\n`;
}

function updateTsFile() {
    const phpContent = fs.readFileSync(phpEnumFilePath, 'utf8');
    const parsedEnum = parsePhpEnum(phpContent);
    const tsContent = generateTsEnum(parsedEnum);

    fs.writeFileSync(tsEnumFilePath, tsContent, 'utf8');
    const msg = generatePrefixText({
        label: 'Transform Permission Enum',
        text: `Updated TypeScript file: ${tsEnumFilePath}`,
    });
    console.log(msg);
}

export default function permissionEnumPlugin() {
    return {
        name: 'vite-plugin-permission-enum',
        buildStart() {
            chokidar.watch(phpEnumFilePath).on('change', () => {
                const msg = generatePrefixText({
                    label: 'Transform Permission Enum',
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
