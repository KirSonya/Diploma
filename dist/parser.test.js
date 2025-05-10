"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const tokenizer_1 = require("./tokenizer");
const ast_1 = require("./ast");
describe('Парсер', () => {
    function testParsing(formula, expected) {
        const tokenizer = new tokenizer_1.Tokenizer(formula);
        const tokens = tokenizer.tokenize();
        const parser = new parser_1.Parser(tokens);
        const result = parser.parse();
        expect(result).toEqual(expected);
    }
    test('парсинг функции EXTRACT', () => {
        testParsing('ИЗВЛЕЧЬ(Период, ГОД)', ast_1.ASTFactory.createFunctionCall('ИЗВЛЕЧЬ', [
            ast_1.ASTFactory.createIdentifier('Период'),
            ast_1.ASTFactory.createLiteral('ГОД')
        ]));
    });
    test('парсинг вложенных функций', () => {
        testParsing('ИЗВЛЕЧЬ(НАЧАЛОПЕРИОДА(СЕЙЧАС(), МЕСЯЦ), ДЕНЬ)', ast_1.ASTFactory.createFunctionCall('ИЗВЛЕЧЬ', [
            ast_1.ASTFactory.createFunctionCall('НАЧАЛОПЕРИОДА', [
                ast_1.ASTFactory.createFunctionCall('СЕЙЧАС', []),
                ast_1.ASTFactory.createLiteral('МЕСЯЦ')
            ]),
            ast_1.ASTFactory.createLiteral('ДЕНЬ')
        ]));
    });
    test('ошибка при некорректных формулах', () => {
        expect(() => {
            const tokenizer = new tokenizer_1.Tokenizer('ИЗВЛЕЧЬ(Период, ГОД < 2023');
            const tokens = tokenizer.tokenize();
            const parser = new parser_1.Parser(tokens);
            parser.parse();
        }).toThrow();
    });
});
