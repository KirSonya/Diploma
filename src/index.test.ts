// index.test.ts
import { Parser } from './parser';
import { Translator } from './translator';

describe('Интеграционное тестирование', () => {
    const inputs = [
        "НАЧАЛОПЕРИОДА(Период, ГОД)",
        "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)"
    ];

    test.each(inputs)('Проверка интеграции для %s', (input) => {
        const parser = new Parser(input);
        const ast = parser.parse();
        const translator = new Translator(ast, 'ru');
        const result = translator.translate();
        expect(result).toBeDefined();
    });
});
