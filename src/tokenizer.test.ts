// tokenizer.test.ts
import { Tokenizer } from './tokenizer';

describe('Tokenizer', () => {
  test('should tokenize simple comparison', () => {
    const tokenizer = new Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) < 2023');
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

  test('should tokenize complex logical expression', () => {
    const tokenizer = new Tokenizer('ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5 И ИЗВЛЕЧЬ(Период, ДЕНЬ) < 15');
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

  test('should tokenize function with multiple arguments', () => {
    const tokenizer = new Tokenizer('ДАТА(2023, 5, 15)');
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

  test('should tokenize compound operators', () => {
    const tokenizer = new Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) <= 2023');
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

  test('should throw error for unknown character', () => {
    const tokenizer = new Tokenizer('ИЗВЛЕЧЬ(Период, ГОД) @ 2023');
    expect(() => tokenizer.tokenize()).toThrow('Неизвестный символ: @');
  });
});