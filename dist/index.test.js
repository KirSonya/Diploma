"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const translator_1 = require("./translator");
describe('Интеграционное тестирование', () => {
    test('Полный процесс преобразования для формулы ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)', () => {
        const formula = 'ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)';
        const result = (0, index_1.processFormula)(formula);
        // Проверяем корректность токенизации
        const tokenizer = new tokenizer_1.Tokenizer(formula);
        const tokens = tokenizer.tokenize();
        expect(tokens).toEqual([
            { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
            { type: 'LPAREN', value: '(' },
            { type: 'IDENTIFIER', value: 'Период' },
            { type: 'COMMA', value: ',' },
            { type: 'UNIT', value: 'НЕДЕЛЯ' },
            { type: 'RPAREN', value: ')' }
        ]);
        // Проверяем корректность парсинга
        const parser = new parser_1.Parser(tokens);
        const ast = parser.parse();
        expect(ast).toEqual({
            type: 'FunctionCall',
            funcName: 'ИЗВЛЕЧЬ',
            args: [
                { type: 'Identifier', name: 'Период' },
                { type: 'Literal', value: 'НЕДЕЛЯ' }
            ]
        });
        // Проверяем корректность перевода
        const translator = new translator_1.Translator('ru');
        const translation = translator.translate(ast);
        expect(translation).toBe('Неделя');
        // Проверяем конечный результат
        expect(result).toBe('Неделя');
    });
});
