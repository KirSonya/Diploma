"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// parser.test.ts
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const parser_1 = require("./parser");
const ast_1 = require("./ast");
(0, node_test_1.default)('Парсер должен правильно обрабатывать СЕЙЧАС()', () => {
    const parser = new parser_1.Parser("СЕЙЧАС()");
    const result = parser.parse();
    node_assert_1.default.ok(result instanceof ast_1.PresentFunctionNode);
});
(0, node_test_1.default)('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)', () => {
    const parser = new parser_1.Parser("ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)");
    const result = parser.parse();
    node_assert_1.default.ok(result instanceof ast_1.NowFunctionNode);
    node_assert_1.default.strictEqual(result.unit, 'Текущий год');
});
(0, node_test_1.default)('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(Период, ГОД)', () => {
    const parser = new parser_1.Parser("ИЗВЛЕЧЬ(Период, ГОД)");
    const result = parser.parse();
    node_assert_1.default.ok(result instanceof ast_1.ExtractRegexFunctionNode);
    node_assert_1.default.strictEqual(result.unit, 'ГОД');
});
(0, node_test_1.default)('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(Период, ГОД) = 1', () => {
    const parser = new parser_1.Parser("ИЗВЛЕЧЬ(Период, ГОД) = 1");
    const result = parser.parse();
    node_assert_1.default.ok(result instanceof ast_1.ExtractWithValueFunctionNode);
    node_assert_1.default.strictEqual(result.period, 'Период');
    node_assert_1.default.strictEqual(result.unit, 'ГОД');
    node_assert_1.default.strictEqual(result.value, '1');
    node_assert_1.default.strictEqual(result.comparisonOperator, '=');
});
(0, node_test_1.default)('Парсер должен выбрасывать ошибку для неверного формата', () => {
    const parser = new parser_1.Parser("Неверный формат");
    node_assert_1.default.throws(() => parser.parse(), { message: 'Неверный формат входного выражения' });
});
