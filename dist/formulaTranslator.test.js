"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('Корректность обработки формул', () => {
    test('ИЗВЛЕЧЬ (Период, НЕДЕЛЯ) -> Неделя', () => {
        const language = 'ru';
        console.log(index_1.processFormula);
        const formula = "ИЗВЛЕЧЬ (Период, НЕДЕЛЯ)";
        const result = (0, index_1.processFormula)(formula, language);
        //const result = processFormula('ИЗВЛЕЧЬ (Период, НЕДЕЛЯ)', language);
        expect(result).toBe('Неделя');
    });
    test('Период = НАЧАЛОПЕРИОДА(Период, ЧАС)  -> Начало часа', () => {
        const result = (0, index_1.processFormula)('Период = НАЧАЛОПЕРИОДА(Период, ЧАС)');
        expect(result).toBe('Начало часа');
    });
    test('ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2) -> текущий + 2 дня', () => {
        const result = (0, index_1.processFormula)('ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2)');
        expect(result).toBe('текущий + 2 дня');
    });
    test('ИЗВЛЕЧЬ (Период, ДЕНЬНЕДЕЛИ) = 1 -> понедельник', () => {
        const result = (0, index_1.processFormula)('ИЗВЛЕЧЬ (Период, ДЕНЬНЕДЕЛИ) = 1');
        expect(result).toBe('понедельник');
    });
    test('ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ) -> до текущего месяца', () => {
        const result = (0, index_1.processFormula)('ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)');
        expect(result).toBe('до текущего месяца');
    });
});
/*import { processFormula } from '../src/index';

describe('Formula Translation Tests', () => {
  // Тест 1: ИЗВЛЕЧЬ(Период, НЕДЕЛЯ) -> Неделя
  test('ИЗВЛЕЧЬ(Период, НЕДЕЛЯ) should translate to "Неделя"', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)';
    const result = processFormula(formula, 'ru');
    expect(result).toBe('Неделя');
  });

  // Тест 2: Период = НАЧАЛОПЕРИОДА(Период, ЧАС) -> Начало часа
  test('Период = НАЧАЛОПЕРИОДА(Период, ЧАС) should translate to "Начало часа"', () => {
    const formula = 'Период = НАЧАЛОПЕРИОДА(Период, ЧАС)';
    const result = processFormula(formula);
    expect(result).toBe('Начало часа');
  });

  // Тест 3: ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2) -> текущий + 2 дня
  test('ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2) should translate to "текущий + 2 дня"', () => {
    const formula = 'ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2)';
    const result = processFormula(formula);
    expect(result).toBe('текущий + 2 дня');
  });

  // Тест 4: ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1 -> понедельник
  test('ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1 should translate to "понедельник"', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1';
    const result = processFormula(formula);
    expect(result).toBe('понедельник');
  });

  // Тест 5: ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ) -> до текущего месяца
  test('ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ) should translate to "до текущего месяца"', () => {
    const formula = 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)';
    const result = processFormula(formula);
    expect(result).toBe('до текущего месяца');
  });
});*/ 
