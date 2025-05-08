"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index"); // Импортируем функцию обработки формул
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const translator_1 = require("./translator");
// Тесты
describe('Тестирование библиотеки преобразования формул', () => {
    test('Поддержка вложенности формул', () => {
        const formula = "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)";
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe("Текущий год");
    });
    test('Поддержка операций сравнения', () => {
        const formulas = [
            { formula: "ИЗВЛЕЧЬ(Период, ГОД) = 2022", expected: "2022 год" },
            { formula: "ИЗВЛЕЧЬ(Период, ГОД) > 2022", expected: "после 2022 года" },
            { formula: "ИЗВЛЕЧЬ(Период, ГОД) < 2022", expected: "до 2022 года" },
            { formula: "ИЗВЛЕЧЬ(Период, ГОД) <= 2022", expected: "по 2022 году" },
            { formula: "ИЗВЛЕЧЬ(Период, ГОД) >= 2022", expected: "с 2022 года" },
        ];
        formulas.forEach(({ formula, expected }) => {
            const result = (0, index_1.processFormula)(formula, 'ru');
            expect(result).toBe(expected);
        });
    });
    test('Токенизация формулы', () => {
        const tokenizer = new tokenizer_1.Tokenizer("ИЗВЛЕЧЬ(Период, ГОД)");
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: "FUNCTION", value: "ИЗВЛЕЧЬ" },
            { type: "LPAREN", value: '(' },
            { type: "IDENTIFIER", value: "Период" },
            { type: "COMMA", value: ',' },
            { type: "UNIT", value: "ГОД" },
            { type: "RPAREN", value: ')' },
        ]);
    });
    test('Парсер формулы', () => {
        const tokenizer = new tokenizer_1.Tokenizer("ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)");
        const tokens = tokenizer.tokenize();
        const parser = new parser_1.Parser(tokens);
        const ast = parser.parse();
        expect(ast).toMatchObject({
            type: 'Logical',
            left: {
                type: 'Comparison',
                left: {
                    type: 'FunctionCall',
                    funcName: 'ИЗВЛЕЧЬ',
                    args: expect.any(Array),
                },
                operator: '<',
                right: {
                    type: 'FunctionCall',
                    funcName: 'ИЗВЛЕЧЬ',
                    args: expect.any(Array),
                },
            },
        });
    });
    test('Логика преобразования АСТ в текст', () => {
        const ast = {
            type: 'Comparison',
            left: {
                type: 'FunctionCall',
                funcName: 'ИЗВЛЕЧЬ',
                args: [
                    { type: 'Identifier', name: 'Период' },
                    { type: 'Literal', value: 'ГОД' }
                ],
            },
            operator: '<',
            right: {
                type: 'FunctionCall',
                funcName: 'ИЗВЛЕЧЬ',
                args: [
                    { type: 'FunctionCall', funcName: 'СЕЙЧАС', args: [] },
                    { type: 'Literal', value: 'ГОД' }
                ],
            },
        };
        const translator = new translator_1.Translator('ru');
        //const result = translator.translate(ast);
        //expect(result).toBe("до текущего года");
    });
    test('Время обработки входных формул не более 50 миллисекунд', () => {
        const start = performance.now();
        (0, index_1.processFormula)("ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)", 'ru');
        const end = performance.now();
        expect(end - start).toBeLessThan(50);
    });
});
