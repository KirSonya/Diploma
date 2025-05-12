import { Tokenizer } from './tokenizer';
import { ASTNode, Parser } from './parser';
import { Translator } from './translator';
import { processFormula } from './index';

describe('Tokenizer', () => {
  test('должен токенизировать корректно простые выражения', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
      { type: 'LPAREN', value: '(' },
      { type: 'IDENTIFIER', value: 'Период' },
      { type: 'COMMA', value: ',' },
      { type: 'UNIT', value: 'ГОД' },
      { type: 'RPAREN', value: ')' },
      { type: 'OPERATOR', value: '<' },
      { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
      { type: 'LPAREN', value: '(' },
      { type: 'FUNCTION', value: 'СЕЙЧАС' },
      { type: 'LPAREN', value: '(' },
      { type: 'RPAREN', value: ')' },
      { type: 'COMMA', value: ',' },
      { type: 'UNIT',value: 'ГОД' },
      { type: 'RPAREN', value: ')' },
    ]);
  });

  test('должен корректно обрабатывать пробелы', () => {
    const input = 'ИЗВЛЕЧЬ ( Период , ГОД ) < СЕЙЧАС ( )';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'FUNCTION', value: 'ИЗВЛЕЧЬ' },
      { type: 'LPAREN', value: '(' },
      { type: 'IDENTIFIER', value: 'Период' },
      { type: 'COMMA', value: ',' },
      { type: 'UNIT', value: 'ГОД' },
      { type: 'RPAREN', value: ')' },
      { type: 'OPERATOR', value: '<' },
      { type: 'FUNCTION', value: 'СЕЙЧАС' },
      { type: 'LPAREN', value: '(' },
      { type: 'RPAREN', value: ')' },
    ]);
  });

  test('должен выбрасывать ошибку при неизвестном символе', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД) $ СЕЙЧАС()';
    const tokenizer = new Tokenizer(input);
    expect(() => tokenizer.tokenize()).toThrow('Неизвестный символ: $');
  });
});

describe('Parser', () => {
  test('должен парсить простые выражения со сраавенением', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Comparison',
      left: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'Identifier', name: 'Период' },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
      operator: '<',
      right: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'FunctionCall', funcName: 'СЕЙЧАС', args: [] },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
    });
  });

  test('должен выбрасывать ошибку при отстутсвии закрывающей скобки', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow("Ожидалась закрывающая скобка ')'");
  });
});

describe('Translator', () => {
  test('должен преобразовывать формулу в русский язык', () => {
    const ast = {
      type: 'Comparison',
      left: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'Identifier', name: 'Период' },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
      operator: '<',
      right: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'FunctionCall', funcName: 'СЕЙЧАС', args: [] },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
    };
    const translator = new Translator('ru');
    const result = translator.translate(ast as ASTNode);
    expect(result).toBe('до текущего года');
  });

  test('должен преобразовывать формулу в английский язык', () => {
    const ast = {
      type: 'Comparison',
      left: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'Identifier', name: 'Период' },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
      operator: '<',
      right: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'FunctionCall', funcName: 'СЕЙЧАС', args: [] },
          { type: 'Literal', value: 'ГОД' },
        ],
      },
    };
    const translator = new Translator('en');
    const result = translator.translate(ast as ASTNode);
    expect(result).toBe('before current year');
  });
});

describe('processFormula', () => {
  test('должен корректно обрабатывать формулу при выбранном русском языке', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const result = processFormula(formula, 'ru');
    expect(result).toBe('до текущего года');
  });

  test('должен корректно обрабатывать формулу при выбранном английском языке', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const result = processFormula(formula, 'en');
    expect(result).toBe('before current year');
  });

  test('должен выбрасывать ошибку при некорректно заданной формуле', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД $ СЕЙЧАС()';
    expect(() => processFormula(formula, 'ru')).toThrow('Ошибка обработки формулы: Неизвестный символ: $');
  });
});