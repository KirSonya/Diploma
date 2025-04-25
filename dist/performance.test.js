"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// performance.test.ts
const parser_1 = require("./parser");
const translator_1 = require("./translator");
describe('Тестирование производительности', () => {
    const largeInput = "Период = НАЧАЛОПЕРИОДА(Период, ГОД)"; // Пример большого выражения
    test('Проверка производительности парсинга', () => {
        console.time('Парсинг большого выражения');
        const parser = new parser_1.Parser(largeInput);
        const ast = parser.parse();
        console.timeEnd('Парсинг большого выражения');
        expect(ast).toBeDefined();
    });
    test('Проверка производительности перевода', () => {
        const parser = new parser_1.Parser(largeInput);
        const ast = parser.parse();
        console.time('Перевод большого выражения');
        const translator = new translator_1.Translator(ast, 'ru');
        const result = translator.translate();
        console.timeEnd('Перевод большого выражения');
        expect(result).toBeDefined();
    });
});
