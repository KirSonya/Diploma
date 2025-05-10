"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translator_1 = require("./translator");
const parser_1 = require("./parser");
const tokenizer_1 = require("./tokenizer");
function testTranslation(formula, expected, lang = 'ru') {
    const tokenizer = new tokenizer_1.Tokenizer(formula);
    const tokens = tokenizer.tokenize();
    const parser = new parser_1.Parser(tokens);
    const ast = parser.parse();
    const translator = new translator_1.Translator(lang);
    const result = translator.translate(ast);
    expect(result).toBe(expected);
}
describe('Formula Translation', () => {
    const testCases = [
        {
            formula: 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)',
            ru: 'до текущего года',
            en: 'before current year'
        },
        {
            formula: 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5',
            ru: 'Май',
            en: 'May'
        },
        {
            formula: 'ИЗВЛЕЧЬ(Период, ДЕНЬ) <= 15',
            ru: 'по 15.01',
            en: 'by 15.01'
        },
        {
            formula: 'ДАТА(2023, 5, 15)',
            ru: '15.05.2023',
            en: '15.05.2023'
        },
        {
            formula: 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5 И ИЗВЛЕЧЬ(Период, ДЕНЬ) < 15',
            ru: 'Май, до 15.01',
            en: 'May, before 15.01'
        }
    ];
    describe('Русский язык', () => {
        testCases.forEach(({ formula, ru }) => {
            test(`"${formula}" → "${ru}"`, () => {
                testTranslation(formula, ru, 'ru');
            });
        });
    });
    describe('Английский язык', () => {
        testCases.forEach(({ formula, en }) => {
            test(`"${formula}" → "${en}"`, () => {
                testTranslation(formula, en, 'en');
            });
        });
    });
});
