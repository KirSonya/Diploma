// index.ts
import { Parser } from './parser';
import { Translator } from './translator';

// Примеры входных выражений
const inputs = [
    "ИЗВЛЕЧЬ (Период, ГОД)",
    "СЕЙЧАС()",
    "ИЗВЛЕЧЬ (СЕЙЧАС(), ГОД)",
    "ИЗВЛЕЧЬ (СЕЙЧАС(), ЧАС)",
    "ИЗВЛЕЧЬ (Период, ЧАС) = 1"
];

inputs.forEach(input => {
    const parser = new Parser(input);
    try {
        const ast = parser.parse();
        const translator = new Translator(ast);
        const result = translator.translate();
        console.log(`${input} -> ${result}`);
    } catch (error) {
        // Приведение типа error к Error
        if (error instanceof Error) {
            console.error(`Ошибка обработки "${input}": ${error.message}`);
        } else {
            console.error(`Ошибка обработки "${input}": ${String(error)}`);
        }
    }
});
