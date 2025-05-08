import { Translator } from './translator';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';

// Упрощённая функция для тестирования перевода
function testTranslation(formula: string, expected: string, lang: 'ru' | 'en' = 'ru') {
  const tokenizer = new Tokenizer(formula);
  const tokens = tokenizer.tokenize();
  
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  const translator = new Translator(lang);
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
    /*{
      formula: 'НАЧАЛОПЕРИОДА(СЕЙЧАС(), МЕСЯЦ)',
      ru: 'Январь начала периода',
      en: 'Start of current month'
    }*/
  ];

  describe('Russian translations', () => {
    testCases.forEach(({formula, ru}) => {
      test(`"${formula}" → "${ru}"`, () => {
        testTranslation(formula, ru, 'ru');
      });
    });
  });

  describe('English translations', () => {
    testCases.forEach(({formula, en}) => {
      test(`"${formula}" → "${en}"`, () => {
        testTranslation(formula, en, 'en');
      });
    });
  });
});