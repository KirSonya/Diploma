"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// translator.test.ts
const translator_1 = require("./translator");
const ast_1 = require("./ast");
describe('Translator', () => {
    test('Перевод СЕЙЧАС()', () => {
        const translator = new translator_1.Translator(new ast_1.PresentFunctionNode(), 'ru');
        expect(translator.translate()).toBe('Текущий момент');
        const translatorEn = new translator_1.Translator(new ast_1.PresentFunctionNode(), 'en');
        expect(translatorEn.translate()).toBe('Current moment');
    });
    test('Перевод ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)', () => {
        const ast = new ast_1.NowFunctionNode('ГОД');
        const translator = new translator_1.Translator(ast, 'ru');
        expect(translator.translate()).toBe('Текущий год');
        const translatorEn = new translator_1.Translator(ast, 'en');
        expect(translatorEn.translate()).toBe('Current year');
    });
    test('Перевод с некорректным оператором', () => {
        const ast = new ast_1.ExtractWithValueFunctionNode('Период', 'ГОД', '2023', '>');
        const translator = new translator_1.Translator(ast, 'ru');
        expect(translator.translate()).toContain('после');
    });
});
