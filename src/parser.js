"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    constructor(expression) {
        this.expression = expression;
    }
    parse() {
        // Простой парсер, который разбивает выражение на узлы.
        // Здесь можно использовать более сложные методы разбора, если необходимо.
        const nodes = [];
        const regex = /СЕЙЧАС\(\)|ИЗВЛЕЧЬ\(([^,]+),\s*([^,\)]+)(?:,\s*(\d+))?\)|([<>]=?|=)\s*(\d+)|([абв])|(\w+)/g;
        let match;
        while ((match = regex.exec(this.expression)) !== null) {
            if (match[0] === 'СЕЙЧАС()') {
                nodes.push({ type: 'now' });
            }
            else if (match[0].startsWith('ИЗВЛЕЧЬ')) {
                const period = match[1].trim();
                const typeName = match[2].trim();
                const value = match[3] ? parseInt(match[3], 10) : undefined;
                nodes.push({ type: 'extract', period, typeName, value });
            }
            else if (match[4]) {
                nodes.push({ type: 'filter', left: nodes.pop(), operator: match[4], right: { type: 'unknown', value: match[5] } });
            }
            else if (match[6]) {
                nodes.push({ type: 'unknown', value: match[6] });
            }
            else {
                nodes.push({ type: 'unknown', value: match[0] });
            }
        }
        return nodes;
    }
}
exports.Parser = Parser;
