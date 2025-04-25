"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const parser_1 = require("./parser");
const translator_1 = require("./translator");
// Примеры входных выражений
const inputs = [
    "ИЗВЛЕЧЬ (СЕЙЧАС(), ДЕНЬ)",
    "ИЗВЛЕЧЬ(Период, ГОД) < 2024",
    "НАЧАЛОПЕРИОДА(Период, ГОД)",
    "ДатаОбращения > ДАТА(1992, 11, 26)",
    "Период <= ДАТА(1992, 11, 26)"
];
// Выбор языка: 'ru' для русского, 'en' для английского
const language = 'en';
inputs.forEach(input => {
    const parser = new parser_1.Parser(input);
    try {
        const ast = parser.parse();
        const translator = new translator_1.Translator(ast, language); // Передаем язык
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
