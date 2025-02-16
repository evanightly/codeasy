import { colors } from './colors.js';
import { getCurrentTimestamp } from './getCurrentTimestamp.js';

const { gray, reset, bold } = colors;

export const generatePrefixText = ({ labelColor, label = 'vite', text }) => {
    const color = colors[labelColor] || colors.cyan;
    return `${gray}${getCurrentTimestamp()}${reset} ${color}${bold}[${label}]${reset} ${text}`;
};