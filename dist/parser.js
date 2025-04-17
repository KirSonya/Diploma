"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
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
        //console.log(1234);
        if (presentMatch) {
            return new ast_1.PresentFunctionNode();
        }
        /*
           const complexExtractMatch = this.input.match(complexExtractRegex);
           if (complexExtractMatch) {
               const period = complexExtractMatch[1].trim();
               const unit = complexExtractMatch[2];
               const comparisonOperator = complexExtractMatch[3];
               const value = complexExtractMatch[4];
               return new ExtractFunctionNode(period, unit, value, comparisonOperator);
           }*/
        throw new Error('Неверный формат входного выражения'); // Если не найдено совпадение
    }
}
exports.Parser = Parser;
