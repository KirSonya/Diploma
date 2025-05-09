import { processFormula } from '../src/index';

describe('Тестирование производительности', () => {
    test('Обработка формулы должны занимать меньше 50 мс', () => {
      const formula = 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)';
      const start = process.hrtime();
      processFormula(formula);
      const [seconds, nanoseconds] = process.hrtime(start);
      const milliseconds = seconds * 1000 + nanoseconds / 1000000;
      expect(milliseconds).toBeLessThan(50);
    });
  });