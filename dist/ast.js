"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractWithValueFunctionNode = exports.ExtractRegexFunctionNode = exports.NowFunctionNode = exports.PresentFunctionNode = void 0;
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
