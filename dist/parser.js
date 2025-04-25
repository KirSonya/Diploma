"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
// parser.ts
const ast_1 = require("./ast");
class Parser {
    constructor(input) {
        this.input = input.trim(); // Удаляем лишние пробелы
    }
    parse() {
        const present = /СЕЙЧАС\s*\(\s*\)/;
        const nowRegex = /ИЗВЛЕЧЬ\s*\(\s*СЕЙЧАС\s*\(\s*\)\s*,\s*(ГОД|КВАРТАЛ|МЕСЯЦ|НЕДЕЛЯ|ДЕНЬ|ЧАС|МИНУТА|СЕКУНДА|ДЕНЬНЕДЕЛИ|ДЕНЬГОДА)\s*\)/;
        const extractRegex = /ИЗВЛЕЧЬ\s*\(\s*Период\s*,\s*(ГОД|КВАРТАЛ|МЕСЯЦ|НЕДЕЛЯ|ДЕНЬ|ЧАС|МИНУТА|СЕКУНДА|ДЕНЬНЕДЕЛИ|ДЕНЬГОДА)\s*\)/;
        const extractWithValueRegex = /ИЗВЛЕЧЬ\s*\(\s*([^\s,]+)\s*,\s*(ГОД|КВАРТАЛ|МЕСЯЦ|НЕДЕЛЯ|ДЕНЬ|ЧАС|МИНУТА|СЕКУНДА|ДЕНЬНЕДЕЛИ|ДЕНЬГОДА)\s*\)\s*(=|<|>|<=|>=)\s*([0-9]+)/;
        const date = /Период\s*(=|<|>|<=|>=)\s*ДАТА\s*\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)/;
        const dateRegex = /ДатаОбращения\s*([=<>]=?|<)\s*ДАТА\s*\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)/;
        const startOfPeriodRegex = /НАЧАЛОПЕРИОДА\(([\wА-Яа-яЁё]+),\s*([\wА-Яа-яЁё]+)\)/i;
        const nowMatch = this.input.match(nowRegex); // ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
        if (nowMatch) {
            const unit = nowMatch[1]; // Тип единицы
            //console.log(unit);
            return new ast_1.NowFunctionNode(unit); // Создаем узел для NOW
        }
        const extractWithValueMatch = this.input.match(extractWithValueRegex); // ИЗВЛЕЧЬ(Период, ...) <= ...
        if (extractWithValueMatch) {
            const period = extractWithValueMatch[1].trim(); // Период
            //console.log(period);
            const unit = extractWithValueMatch[2]; // Тип единицы
            //console.log(unit);
            const comparisonOperator = extractWithValueMatch[3]; // Оператор сравнения
            //console.log(comparisonOperator);
            const value = extractWithValueMatch[4]; // Значение
            //console.log(value);
            return new ast_1.ExtractWithValueFunctionNode(period, unit, value, comparisonOperator);
        }
        const extractRegexMatch = this.input.match(extractRegex); // ИЗВЛЕЧЬ(Период, ...)
        if (extractRegexMatch !== null) { // Проверяем, что extractRegexMatch не null
            const unit = extractRegexMatch[1]; // Извлекаем единицу
            return new ast_1.ExtractRegexFunctionNode(unit);
        }
        const presentMatch = this.input.match(present); // СЕЙЧАС()
        if (presentMatch) {
            return new ast_1.PresentFunctionNode();
        }
        // Период = ДАТА(1992, 11, 26) 
        const dateP = this.input.match(date);
        if (dateP) {
            const operator = dateP[1]; // Сохраняем оператор
            const year = parseInt(dateP[2], 10);
            const month = parseInt(dateP[3], 10);
            const day = parseInt(dateP[4], 10);
            return new ast_1.DateComparisonNode(operator, year, month, day); // Создаем узел сравнения
        }
        // ДатаОбращения = ДАТА(1992, 11, 26) 
        const dateMatch = this.input.match(dateRegex); // ДатаОбращения = ДАТА(1992, 11, 26) 
        if (dateMatch) {
            const operator = dateMatch[1]; // Получаем оператор
            const year = parseInt(dateMatch[2], 10);
            const month = parseInt(dateMatch[3], 10);
            const day = parseInt(dateMatch[4], 10);
            return new ast_1.DateFunctionNode(year, month, day, operator);
        }
        // НАЧАЛОПЕРИОДА(Период, День) 
        const startOfPeriodMatch = this.input.match(startOfPeriodRegex);
        if (startOfPeriodMatch) {
            const period = startOfPeriodMatch[1]; // Получаем период
            const unit = startOfPeriodMatch[2]; // Получаем единицу времени
            return new ast_1.StartOfPeriodNode(period, unit); // Создаем узел для начала периода
        }
        throw new Error('Неверный формат входного выражения'); // Если не найдено совпадение
    }
}
exports.Parser = Parser;
