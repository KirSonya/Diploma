import { Translator } from './translator';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';

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
    // Базовые функции
    {
      formula: 'СЕЙЧАС()',
      ru: 'Текущий момент',
      en: 'Current moment'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ГОД)',
      ru: 'Год',
      en: 'Year'
    },
    {
      formula: 'ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)',
      ru: 'Текущий год',
      en: 'Current year'
    },

    // Операторы сравнения
    {
      formula: 'ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)',
      ru: 'до текущего года',
      en: 'before current year'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ГОД) >= 2023',
      ru: 'с 2023 года',
      en: 'since 2023 year'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5',
      ru: 'Май',
      en: 'May'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ДЕНЬ) <= 15',
      ru: 'по 15 день',
      en: 'by 15 day'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ЧАС) > 12',
      ru: 'после 12 часа',
      en: 'after 12 hour'
    },

    // Функции даты
    {
      formula: 'ДАТА(2023, 5, 15)',
      ru: '15.05.2023',
      en: '15.05.2023'
    },

    // Периоды
    {
      formula: 'НАЧАЛОПЕРИОДА(Период, МЕСЯЦ)',
      ru: 'Начало месяца',
      en: 'Start of month'
    },
    {
      formula: 'КОНЕЦПЕРИОДА(ДАТА(2023, 1, 1), КВАРТАЛ)',
      ru: 'Конец периода: 1 кв.',
      en: 'End of period: Q1'
    },

    // Логические операторы
    {
      formula: 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5 И ИЗВЛЕЧЬ(Период, ДЕНЬ) < 15',
      ru: 'Май и до 15 дня',
      en: 'May and before 15 day'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ГОД) = 2023 ИЛИ ИЗВЛЕЧЬ(Период, ГОД) = 2024',
      ru: '2023 год или 2024 год',
      en: '2023 year or 2024 year'
    },

    // Функция В (IN)
    {
      formula: 'В(ИЗВЛЕЧЬ(Период, МЕСЯЦ), 1, 2, 3)',
      ru: 'Январь-Март',
      en: 'January-March'
    },
    {
      formula: 'В(ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ), 1, 7)',
      ru: 'понедельник, воскресенье',
      en: 'Monday, Sunday'
    },

    // Функция ДОБАВИТЬ
    {
      formula: 'ДОБАВИТЬ(СЕЙЧАС(), ГОД, 1)',
      ru: 'текущий + 1 год',
      en: 'current + 1 year'
    },
    {
      formula: 'ДОБАВИТЬ(ДАТА(2023, 1, 1), МЕСЯЦ, 3)',
      ru: '01.04.2023 00:00:00',
      en: '01.04.2023 00:00:00'
    },

    // Комплексные примеры
    {
      formula: 'НАЧАЛОПЕРИОДА(ДАТА(2023, 5, 15), МЕСЯЦ) = Период',
      ru: 'Период',
      en: 'Period'
    },
    {
      formula: 'В(ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ), 6, 7) И ИЗВЛЕЧЬ(Период, ЧАС) >= 9 И ИЗВЛЕЧЬ(Период, ЧАС) <= 18',
      ru: 'суббота-воскресенье и с 9 часа и по 18 час',
      en: 'Saturday-Sunday and since 9 hour and by 18 hour'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, КВАРТАЛ) = 1 И В(ИЗВЛЕЧЬ(Период, МЕСЯЦ), 1, 2, 3)',
      ru: '1 кв. и Январь-Март',
      en: 'Q1 and January-March'
    },

    // Граничные случаи
    {
      formula: 'ИЗВЛЕЧЬ(Период, СЕКУНДА) = 0',
      ru: '0 секунда',
      en: '0 second'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ДЕНЬГОДА) = 100',
      ru: '10.04',
      en: '04/10'
    },
    {
      formula: 'ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1',
      ru: 'понедельник',
      en: 'Monday'
    }
  ];

  describe('Русский язык', () => {
    testCases.forEach(({formula, ru}, index) => {
      test(`Тест #${index + 1}: "${formula}" → "${ru}"`, () => {
        testTranslation(formula, ru, 'ru');
      });
    });
  });

  describe('Английский язык', () => {
    testCases.forEach(({formula, en}, index) => {
      test(`Test #${index + 1}: "${formula}" → "${en}"`, () => {
        testTranslation(formula, en, 'en');
      });
    });
  });
});