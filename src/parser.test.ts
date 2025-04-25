// parser.test.ts
import test from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser';
import { PresentFunctionNode, NowFunctionNode, ExtractRegexFunctionNode, ExtractWithValueFunctionNode } from './ast';

test('Парсер должен правильно обрабатывать СЕЙЧАС()', () => {
    const parser = new Parser("СЕЙЧАС()");
    const result = parser.parse();
    assert.ok(result instanceof PresentFunctionNode);
});

test('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)', () => {
    const parser = new Parser("ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)");
    const result = parser.parse();
    assert.ok(result instanceof NowFunctionNode);
    assert.strictEqual(result.unit, 'Текущий год');
});

test('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(Период, ГОД)', () => {
    const parser = new Parser("ИЗВЛЕЧЬ(Период, ГОД)");
    const result = parser.parse();
    assert.ok(result instanceof ExtractRegexFunctionNode);
    assert.strictEqual(result.unit, 'ГОД');
});

test('Парсер должен правильно обрабатывать ИЗВЛЕЧЬ(Период, ГОД) = 1', () => {
    const parser = new Parser("ИЗВЛЕЧЬ(Период, ГОД) = 1");
    const result = parser.parse();
    assert.ok(result instanceof ExtractWithValueFunctionNode);
    assert.strictEqual(result.period, 'Период');
    assert.strictEqual(result.unit, 'ГОД');
    assert.strictEqual(result.value, '1');
    assert.strictEqual(result.comparisonOperator, '=');
});

test('Парсер должен выбрасывать ошибку для неверного формата', () => {
    const parser = new Parser("Неверный формат");
    assert.throws(() => parser.parse(), { message: 'Неверный формат входного выражения' });
});
