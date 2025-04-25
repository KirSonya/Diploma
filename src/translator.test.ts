// translator.test.ts
import { Translator } from './translator';
import { NowFunctionNode, ExtractWithValueFunctionNode, PresentFunctionNode } from './ast';

describe('Translator', () => {
    test('Перевод СЕЙЧАС()', () => {
        const translator = new Translator(new PresentFunctionNode(), 'ru');
        expect(translator.translate()).toBe('Текущий момент');

        const translatorEn = new Translator(new PresentFunctionNode(), 'en');
        expect(translatorEn.translate()).toBe('Current moment');
    });

    test('Перевод ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)', () => {
        const ast = new NowFunctionNode('ГОД');
        const translator = new Translator(ast, 'ru');
        expect(translator.translate()).toBe('Текущий год');
        
        const translatorEn = new Translator(ast, 'en');
        expect(translatorEn.translate()).toBe('Current year');
    });

    test('Перевод с некорректным оператором', () => {
        const ast = new ExtractWithValueFunctionNode('Период', 'ГОД', '2023', '>');
        const translator = new Translator(ast, 'ru');
        expect(translator.translate()).toContain('после');
    });
});
