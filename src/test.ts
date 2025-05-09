import { Tokenizer } from './tokenizer';
import { ASTNode, Parser } from './parser';
import { Translator } from './translator';
import { processFormula } from './index';

describe('Tokenizer', () => {
  test('should tokenize simple expression correctly', () => {
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
      { type: 'PAREN', value: ')' },
    ]);
  });

  test('should handle whitespace correctly', () => {
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

  test('should throw error on unknown character', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД) $ СЕЙЧАС()';
    const tokenizer = new Tokenizer(input);
    expect(() => tokenizer.tokenize()).toThrow('Неизвестный символ: $');
  });
});

describe('Parser', () => {
  test('should parse simple comparison expression', () => {
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

  test('should throw error on missing closing parenthesis', () => {
    const input = 'ИЗВЛЕЧЬ(Период, ГОД';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow("Ожидалась закрывающая скобка ')'");
  });
});

describe('Translator', () => {
  test('should translate comparison to Russian', () => {
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

  test('should translate comparison to English', () => {
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
  test('should process formula correctly in Russian', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const result = processFormula(formula, 'ru');
    expect(result).toBe('до текущего года');
  });

  test('should process formula correctly in English', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)';
    const result = processFormula(formula, 'en');
    expect(result).toBe('before current year');
  });

  test('should throw error on invalid formula', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ГОД $ СЕЙЧАС()';
    expect(() => processFormula(formula, 'ru')).toThrow('Ошибка обработки формулы: Неизвестный символ: $');
  });

  test('should process all test formulas without errors in Russian', () => {
    const testFormulas = [
      "ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)",
      "ИЗВЛЕЧЬ(Период, КВАРТАЛ) <= ИЗВЛЕЧЬ(СЕЙЧАС(), КВАРТАЛ)",
      "ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)",
    ];
    testFormulas.forEach(formula => {
      expect(() => processFormula(formula, 'ru')).not.toThrow();
    });
  });
});

/*import { processFormula } from './index'; // Импортируем функцию обработки формул
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Translator } from './translator';

// Тесты
describe('Тестирование библиотеки преобразования формул', () => {

  test('Поддержка вложенности формул', () => {
    const formula = "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)";
    const result = processFormula(formula, 'ru');
    expect(result).toBe("Текущий год");
  });

  test('Поддержка операций сравнения', () => {
    const formulas = [
      { formula: "ИЗВЛЕЧЬ(Период, ГОД) = 2022", expected: "2022 год" },
      { formula: "ИЗВЛЕЧЬ(Период, ГОД) > 2022", expected: "после 2022 года" },
      { formula: "ИЗВЛЕЧЬ(Период, ГОД) < 2022", expected: "до 2022 года" },
      { formula: "ИЗВЛЕЧЬ(Период, ГОД) <= 2022", expected: "по 2022 году" },
      { formula: "ИЗВЛЕЧЬ(Период, ГОД) >= 2022", expected: "с 2022 года" },
    ];
    
    formulas.forEach(({ formula, expected }) => {
      const result = processFormula(formula, 'ru');
      expect(result).toBe(expected);
    });
  });

  test('Токенизация формулы', () => {
    const tokenizer = new Tokenizer("ИЗВЛЕЧЬ(Период, ГОД)");
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: "FUNCTION", value: "ИЗВЛЕЧЬ" },
      { type: "LPAREN", value: '(' },
      { type: "IDENTIFIER", value: "Период" },
      { type: "COMMA", value: ',' },
      { type: "UNIT", value: "ГОД" },
      { type: "RPAREN", value: ')' },
    ]);
  });

  test('Парсер формулы', () => {
    const tokenizer = new Tokenizer("ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast).toMatchObject({
      type: 'Logical',
      left: {
        type: 'Comparison',
        left: {
          type: 'FunctionCall',
          funcName: 'ИЗВЛЕЧЬ',
          args: expect.any(Array),
        },
        operator: '<',
        right: {
          type: 'FunctionCall',
          funcName: 'ИЗВЛЕЧЬ',
          args: expect.any(Array),
        },
      },
    });
  });

  test('Логика преобразования АСТ в текст', () => {
    const ast = {
      type: 'Comparison',
      left: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'Identifier', name: 'Период' },
          { type: 'Literal', value: 'ГОД' }
        ],
      },
      operator: '<',
      right: {
        type: 'FunctionCall',
        funcName: 'ИЗВЛЕЧЬ',
        args: [
          { type: 'FunctionCall', funcName: 'СЕЙЧАС', args: [] },
          { type: 'Literal', value: 'ГОД' }
        ],
      },
    };
    
    const translator = new Translator('ru');
    //const result = translator.translate(ast);
    //expect(result).toBe("до текущего года");
  });

  test('Время обработки входных формул не более 50 миллисекунд', () => {
    const start = performance.now();
    processFormula("ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)", 'ru');
    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });
});*/