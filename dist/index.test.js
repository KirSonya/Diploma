"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// index.test.ts
const parser_1 = require("./parser");
const translator_1 = require("./translator");
describe('Интеграционное тестирование', () => {
    const inputs = [
        "НАЧАЛОПЕРИОДА(Период, ГОД)",
        "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)"
    ];
    test.each(inputs)('Проверка интеграции для %s', (input) => {
        const parser = new parser_1.Parser(input);
        const ast = parser.parse();
        const translator = new translator_1.Translator(ast, 'ru');
        const result = translator.translate();
        expect(result).toBeDefined();
    });
});
