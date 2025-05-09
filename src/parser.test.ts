import { Parser } from './parser';
import { Tokenizer } from './tokenizer';
import { ASTFactory } from './ast';

describe('Парсер', () => {
  function testParsing(formula: string, expected: any) {
    const tokenizer = new Tokenizer(formula);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const result = parser.parse();
    expect(result).toEqual(expected);
  }

  test('парсинг функции EXTRACT', () => {
    testParsing(
      'ИЗВЛЕЧЬ(Период, ГОД)',
      ASTFactory.createFunctionCall('ИЗВЛЕЧЬ', [
        ASTFactory.createIdentifier('Период'),
        ASTFactory.createLiteral('ГОД')
      ])
    );
  });

  test('парсинг вложенных функций', () => {
    testParsing(
      'ИЗВЛЕЧЬ(НАЧАЛОПЕРИОДА(СЕЙЧАС(), МЕСЯЦ), ДЕНЬ)',
      ASTFactory.createFunctionCall('ИЗВЛЕЧЬ', [
        ASTFactory.createFunctionCall('НАЧАЛОПЕРИОДА', [
          ASTFactory.createFunctionCall('СЕЙЧАС', []),
          ASTFactory.createLiteral('МЕСЯЦ')
        ]),
        ASTFactory.createLiteral('ДЕНЬ')
      ])
    );
  });

  test('ошибка при некорректных формулах', () => {
    expect(() => {
      const tokenizer = new Tokenizer('ИЗВЛЕЧЬ(Период, ГОД < 2023');
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      parser.parse();
    }).toThrow();
  });
});