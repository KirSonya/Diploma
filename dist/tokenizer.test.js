"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tokenizer.test.ts
const tokenizer_1 = require("./tokenizer");
describe('Токенизатор', () => {
    test('токенизация простых выражений', () => {
        const tokenizer = new tokenizer_1.Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) < 2023');
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
            { type: 'LPAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'Период' },
            { type: 'COMMA', value: ',' },
            { type: 'UNIT', value: 'ГОД' },
            { type: 'RPAREN', value: ')' },
            { type: 'OPERATOR', value: '<' },
            { type: 'NUMBER', value: '2023' }
        ]);
    });
    test('токенизация логических выражений', () => {
        const tokenizer = new tokenizer_1.Tokenizer('ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5 И ИЗВЛЕЧЬ(Период, ДЕНЬ) < 15');
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
            { type: 'LPAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'Период' },
            { type: 'COMMA', value: ',' },
            { type: 'UNIT', value: 'МЕСЯЦ' },
            { type: 'RPAREN', value: ')' },
            { type: 'OPERATOR', value: '=' },
            { type: 'NUMBER', value: '5' },
            { type: 'LOGICAL', value: 'И' },
            { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
            { type: 'LPAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'Период' },
            { type: 'COMMA', value: ',' },
            { type: 'UNIT', value: 'ДЕНЬ' },
            { type: 'RPAREN', value: ')' },
            { type: 'OPERATOR', value: '<' },
            { type: 'NUMBER', value: '15' }
        ]);
    });
    test('токенизация функций с несколькими аргументами', () => {
        const tokenizer = new tokenizer_1.Tokenizer('ДАТА(2023, 5, 15)');
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: 'FUNCTION', value: 'ДАТА' },
            { type: 'LPAREN', value: '(' },
            { type: 'NUMBER', value: '2023' },
            { type: 'COMMA', value: ',' },
            { type: 'NUMBER', value: '5' },
            { type: 'COMMA', value: ',' },
            { type: 'NUMBER', value: '15' },
            { type: 'RPAREN', value: ')' }
        ]);
    });
    test('токенизация формул со знаками сравнения', () => {
        const tokenizer = new tokenizer_1.Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) <= 2023');
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
            { type: 'LPAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'Период' },
            { type: 'COMMA', value: ',' },
            { type: 'UNIT', value: 'ГОД' },
            { type: 'RPAREN', value: ')' },
            { type: 'OPERATOR', value: '<=' },
            { type: 'NUMBER', value: '2023' }
        ]);
    });
    test('обработка ошибок при некорректных формулах', () => {
        const tokenizer = new tokenizer_1.Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) @ 2023');
        expect(() => tokenizer.tokenize()).toThrow('Неизвестный символ: @');
    });
});
