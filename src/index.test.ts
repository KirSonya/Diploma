import { processFormula } from './index';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Translator } from './translator';

describe('Интеграционное тестирование', () => {
  test('Полный процесс преобразования для формулы ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)';
    const result = processFormula(formula);
    
    // Проверяем корректность токенизации
    const tokenizer = new Tokenizer(formula);
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
    const parser = new Parser(tokens);
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
    const translator = new Translator('ru');
    const translation = translator.translate(ast);
    expect(translation).toBe('Неделя');
    
    // Проверяем конечный результат
    expect(result).toBe('Неделя');
  });
});