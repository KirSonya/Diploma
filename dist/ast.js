"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartOfPeriodNode = exports.DateFunctionNode = exports.DateComparisonNode = exports.ExtractWithValueFunctionNode = exports.ExtractRegexFunctionNode = exports.NowFunctionNode = exports.PresentFunctionNode = void 0;
// СЕЙЧАС()
class PresentFunctionNode {
    constructor() {
        this.type = 'PresentFunction';
    }
}
exports.PresentFunctionNode = PresentFunctionNode;
//  ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
class NowFunctionNode {
    constructor(unit) {
        this.type = 'NowFunction';
        this.unit = unit;
    }
}
exports.NowFunctionNode = NowFunctionNode;
//  ИЗВЛЕЧЬ(Период, ...)
class ExtractRegexFunctionNode {
    constructor(unit) {
        this.type = 'ExtractRegexFunction';
        this.unit = unit;
    }
}
exports.ExtractRegexFunctionNode = ExtractRegexFunctionNode;
// Фильтр: ИЗВЛЕЧЬ(Период, ...) = ...
class ExtractWithValueFunctionNode {
    constructor(period, unit, value, comparisonOperator) {
        this.type = 'ExtractWithValueFunction';
        this.period = period;
        this.unit = unit;
        this.value = value;
        this.comparisonOperator = comparisonOperator;
    }
}
exports.ExtractWithValueFunctionNode = ExtractWithValueFunctionNode;
// Период = ДАТА(1992, 11, 26) 
class DateComparisonNode {
    constructor(operator, year, month, day) {
        this.type = 'DateComparison';
        this.operator = operator;
        this.year = year;
        this.month = month;
        this.day = day;
    }
    formatDate() {
        return `${String(this.day).padStart(2, '0')}.${String(this.month).padStart(2, '0')}.${this.year}`;
    }
}
exports.DateComparisonNode = DateComparisonNode;
// ДатаОбращения = ДАТА(1992, 11, 26) 
class DateFunctionNode {
    constructor(year, month, day, operator) {
        this.type = 'DateFunction';
        this.year = year;
        this.month = month;
        this.day = day;
        this.operator = operator; // Инициализируем оператор
    }
    formatDate() {
        return `${String(this.day).padStart(2, '0')}.${String(this.month).padStart(2, '0')}.${this.year}`;
    }
}
exports.DateFunctionNode = DateFunctionNode;
// НАЧАЛОПЕРИОДА(Период, День) 
class StartOfPeriodNode {
    constructor(period, unit) {
        this.type = 'StartOfPeriod';
        this.period = period;
        this.unit = unit;
    }
}
exports.StartOfPeriodNode = StartOfPeriodNode;
