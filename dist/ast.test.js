"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
describe('ASTFactory', () => {
    test('должен создать узел PresentFunction', () => {
        const node = ast_1.ASTFactory.createPresentFunction();
        expect(node.type).toBe('PresentFunction');
        expect(ast_1.ASTUtils.isPresentFunction(node)).toBe(true);
    });
    test('должен создать узел ExtractFunction', () => {
        const source = ast_1.ASTFactory.createPresentFunction();
        const node = ast_1.ASTFactory.createExtractFunction(source, 'ГОД');
        expect(node.type).toBe('ExtractFunction');
        expect(node.source).toBe(source);
        expect(node.unit).toBe('ГОД');
        expect(ast_1.ASTUtils.isExtractFunction(node)).toBe(true);
    });
    test('должен создать узел DateFunction', () => {
        const node = ast_1.ASTFactory.createDateFunction(2023, 5, 15);
        expect(node.type).toBe('DateFunction');
        expect(node.year).toBe(2023);
        expect(node.month).toBe(5);
        expect(node.day).toBe(15);
    });
    test('должен создать узел StartOfPeriod', () => {
        const date = ast_1.ASTFactory.createPresentFunction();
        const node = ast_1.ASTFactory.createStartOfPeriod(date, 'МЕСЯЦ');
        expect(node.type).toBe('StartOfPeriod');
        expect(node.date).toBe(date);
        expect(node.unit).toBe('МЕСЯЦ');
    });
    test('должен создать узел EndOfPeriod', () => {
        const date = ast_1.ASTFactory.createPresentFunction();
        const node = ast_1.ASTFactory.createEndOfPeriod(date, 'КВАРТАЛ');
        expect(node.type).toBe('EndOfPeriod');
        expect(node.date).toBe(date);
        expect(node.unit).toBe('КВАРТАЛ');
    });
    test('должен создать узел InFunction', () => {
        const extract = ast_1.ASTFactory.createExtractFunction(ast_1.ASTFactory.createPresentFunction(), 'ДЕНЬ');
        const values = [ast_1.ASTFactory.createNumericLiteral(1), ast_1.ASTFactory.createNumericLiteral(2)];
        const node = ast_1.ASTFactory.createInFunction(extract, values);
        expect(node.type).toBe('InFunction');
        expect(node.extract).toBe(extract);
        expect(node.values).toEqual(values);
    });
    test('должен создать узел AddFunction', () => {
        const date = ast_1.ASTFactory.createPresentFunction();
        const node = ast_1.ASTFactory.createAddFunction(date, 'НЕДЕЛЯ', 2);
        expect(node.type).toBe('AddFunction');
        expect(node.date).toBe(date);
        expect(node.unit).toBe('НЕДЕЛЯ');
        expect(node.amount).toBe(2);
    });
    test('должен создать узел FunctionCall', () => {
        const args = [ast_1.ASTFactory.createLiteral('test')];
        const node = ast_1.ASTFactory.createFunctionCall('testFunc', args);
        expect(node.type).toBe('FunctionCall');
        expect(node.funcName).toBe('testFunc');
        expect(node.args).toEqual(args);
    });
    test('должен создать узел Comparison', () => {
        const left = ast_1.ASTFactory.createLiteral('left');
        const right = ast_1.ASTFactory.createLiteral('right');
        const node = ast_1.ASTFactory.createComparison(left, '=', right);
        expect(node.type).toBe('Comparison');
        expect(node.left).toBe(left);
        expect(node.operator).toBe('=');
        expect(node.right).toBe(right);
    });
    test('должен создать узел Logical', () => {
        const left = ast_1.ASTFactory.createComparison(ast_1.ASTFactory.createLiteral('left'), '=', ast_1.ASTFactory.createLiteral('right'));
        const right = ast_1.ASTFactory.createLiteral('right');
        const node = ast_1.ASTFactory.createLogical(left, 'И', right);
        expect(node.type).toBe('Logical');
        expect(node.left).toBe(left);
        expect(node.operator).toBe('И');
        expect(node.right).toBe(right);
    });
    test('должен создать узел Literal', () => {
        const node = ast_1.ASTFactory.createLiteral('test');
        expect(node.type).toBe('Literal');
        expect(node.value).toBe('test');
    });
    test('должен создать узел Identifier', () => {
        const node = ast_1.ASTFactory.createIdentifier('Период');
        expect(node.type).toBe('Identifier');
        expect(node.name).toBe('Период');
    });
    test('должен создать узел NumericLiteral', () => {
        const node = ast_1.ASTFactory.createNumericLiteral(42);
        expect(node.type).toBe('NumericLiteral');
        expect(node.value).toBe(42);
    });
});
describe('ASTUtils', () => {
    test('должен идентифицировать узлы FunctionCall', () => {
        const node = ast_1.ASTFactory.createFunctionCall('test', []);
        expect(ast_1.ASTUtils.isFunctionCall(node)).toBe(true);
        expect(ast_1.ASTUtils.isFunctionCall(node, 'test')).toBe(true);
        expect(ast_1.ASTUtils.isFunctionCall(node, 'other')).toBe(false);
    });
    test('должен идентифицировать узлы Comparison', () => {
        const node = ast_1.ASTFactory.createComparison(ast_1.ASTFactory.createLiteral('left'), '=', ast_1.ASTFactory.createLiteral('right'));
        expect(ast_1.ASTUtils.isComparison(node)).toBe(true);
    });
    test('должен идентифицировать узлы Logical', () => {
        const node = ast_1.ASTFactory.createLogical(ast_1.ASTFactory.createLiteral('left'), 'И', ast_1.ASTFactory.createLiteral('right'));
        expect(ast_1.ASTUtils.isLogical(node)).toBe(true);
    });
    test('должен идентифицировать узлы NumericLiteral', () => {
        const node = ast_1.ASTFactory.createNumericLiteral(42);
        expect(ast_1.ASTUtils.isNumericLiteral(node)).toBe(true);
    });
    test('должен идентифицировать узлы StringLiteral', () => {
        const node = ast_1.ASTFactory.createLiteral('test');
        expect(ast_1.ASTUtils.isStringLiteral(node)).toBe(true);
    });
    test('должен идентифицировать узлы Identifier', () => {
        const node = ast_1.ASTFactory.createIdentifier('Период');
        expect(ast_1.ASTUtils.isIdentifier(node)).toBe(true);
        expect(ast_1.ASTUtils.isIdentifier(node, 'Период')).toBe(true);
        expect(ast_1.ASTUtils.isIdentifier(node, 'other')).toBe(false);
    });
    test('должен идентифицировать узлы PresentFunction', () => {
        const node = ast_1.ASTFactory.createPresentFunction();
        expect(ast_1.ASTUtils.isPresentFunction(node)).toBe(true);
    });
    test('должен идентифицировать узлы ExtractFunction', () => {
        const node = ast_1.ASTFactory.createExtractFunction(ast_1.ASTFactory.createPresentFunction(), 'ГОД');
        expect(ast_1.ASTUtils.isExtractFunction(node)).toBe(true);
    });
});
