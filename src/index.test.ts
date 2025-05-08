import { processFormula } from './index';

describe('processFormula', () => {
  test('should process simple comparison in Russian', () => {
    const result = processFormula('ИЗВЛЕЧЬ(Период, ГОД) < 2023', 'ru');
    expect(result).toBe('до 2023');
  });

  test('should process month comparison in Russian', () => {
    const result = processFormula('ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5', 'ru');
    expect(result).toBe('Май');
  });

  test('should process logical AND in Russian', () => {
    const result = processFormula(
      'ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 5 И ИЗВЛЕЧЬ(Период, ДЕНЬ) < 15', 
      'ru'
    );
    expect(result).toBe('Май, до 15.01');
  });

  test('should process simple comparison in English', () => {
    const result = processFormula('ИЗВЛЕЧЬ(Период, ГОД) < 2023', 'en');
    expect(result).toBe('before 2023');
  });

  test('should throw error for invalid formula', () => {
    expect(() => processFormula('ИЗВЛЕЧЬ(Период, ГОД < 2023', 'ru'))
      .toThrow('Ошибка обработки формулы');
  });
});