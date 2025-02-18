import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { generatePrefixText } from './lib/generatePrefixText';

const phpEnumFilePath = path.resolve(__dirname, '../app/Support/Enums/RoleEnum.php');
const tsEnumFilePath = path.resolve(__dirname, '../resources/js/Support/Enums/roleEnum.ts');

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

    return `const roles = {\n${lines.join('\n')}\n};\n\nexport const RoleEnum = roles;\n\nexport type RoleEnum = (typeof roles)[keyof typeof roles];\n`;
}

function updateTsFile() {
    const phpContent = fs.readFileSync(phpEnumFilePath, 'utf8');
    const parsedEnum = parsePhpEnum(phpContent);
    const tsContent = generateTsEnum(parsedEnum);

    fs.writeFileSync(tsEnumFilePath, tsContent, 'utf8');
    const msg = generatePrefixText({
        label: 'Transform Role Enum',
        text: `Updated TypeScript file: ${tsEnumFilePath}`,
    });
    console.log(msg);
}

export default function roleEnumPlugin() {
    return {
        name: 'vite-plugin-role-enum',
        buildStart() {
            chokidar.watch(phpEnumFilePath).on('change', () => {
                const msg = generatePrefixText({
                    label: 'Transform Role Enum',
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
