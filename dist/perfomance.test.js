"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('Тестирование производительности', () => {
    test('Обработка формулы должны занимать меньше 50 мс', () => {
        const formula = 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)';
        const start = process.hrtime();
        (0, index_1.processFormula)(formula);
        const [seconds, nanoseconds] = process.hrtime(start);
        const milliseconds = seconds * 1000 + nanoseconds / 1000000;
        expect(milliseconds).toBeLessThan(50);
    });
});
