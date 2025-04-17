"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const parser_1 = require("./parser");
const translator_1 = require("./translator");
// Примеры входных выражений
const inputs = [
    "ИЗВЛЕЧЬ (Период, ГОД)",
    "СЕЙЧАС()",
    "ИЗВЛЕЧЬ (СЕЙЧАС(), ГОД)",
    "ИЗВЛЕЧЬ (СЕЙЧАС(), ЧАС)",
    "ИЗВЛЕЧЬ (Период, ЧАС) = 1"
];
inputs.forEach(input => {
    const parser = new parser_1.Parser(input);
    try {
        const ast = parser.parse();
        const translator = new translator_1.Translator(ast);
        const result = translator.translate();
        console.log(`${input} -> ${result}`);
    }
    catch (error) {
        // Приведение типа error к Error
        if (error instanceof Error) {
            console.error(`Ошибка обработки "${input}": ${error.message}`);
        }
        else {
            console.error(`Ошибка обработки "${input}": ${String(error)}`);
        }
    }
});
