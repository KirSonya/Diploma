"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('Корректность обработки формул', () => {
    // Тест 1: ИЗВЛЕЧЬ(Период, НЕДЕЛЯ) -> Неделя
    test('ИЗВЛЕЧЬ(Период, НЕДЕЛЯ) should translate to "Неделя"', () => {
        const formula = 'ИЗВЛЕЧЬ(Период, НЕДЕЛЯ)';
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe('Неделя');
    });
    // Тест 2: Период = НАЧАЛОПЕРИОДА(Период, ЧАС) -> Начало часа
    test('Период = НАЧАЛОПЕРИОДА(Период, ЧАС) should translate to "Начало часа"', () => {
        const formula = 'Период = НАЧАЛОПЕРИОДА(Период, ЧАС)';
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe('Начало часа');
    });
    // Тест 3: ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2) -> текущий + 2 дня
    test('ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2) should translate to "текущий + 2 дня"', () => {
        const formula = 'ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 2)';
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe('текущий + 2 дня');
    });
    // Тест 4: ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1 -> понедельник
    test('ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1 should translate to "понедельник"', () => {
        const formula = 'ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) = 1';
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe('понедельник');
    });
    // Тест 5: ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ) -> до текущего месяца
    test('ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ) should translate to "до текущего месяца"', () => {
        const formula = 'ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)';
        const result = (0, index_1.processFormula)(formula, 'ru');
        expect(result).toBe('до текущего месяца');
    });
});
describe('Корректность обработки ошибок', () => {
    test('Ошибка: Пустая формула', () => {
        expect(() => (0, index_1.processFormula)('')).toThrow('Ошибка обработки формулы');
    });
    test('Ошибка: Неправильная формула', () => {
        expect(() => (0, index_1.processFormula)('НЕИЗВЕСТНАЯ_ФУНКЦИЯ()')).toThrow('Ошибка обработки формулы: Неизвестный символ: _');
    });
    test('Ошибка: Неполная формула', () => {
        expect(() => (0, index_1.processFormula)('СЕЙЧАС(')).toThrow('Ожидалась закрывающая скобка');
    });
    test('Ошибка: Неправильный символ в формуле', () => {
        expect(() => (0, index_1.processFormula)('ИЗВЛЕЧЬ(Период, НЕИЗВЕСТНАЯ_ЕДИНИЦА)')).toThrow('Ошибка обработки формулы: Неизвестный символ: _');
    });
});
