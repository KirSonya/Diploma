"use strict";
// ast.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTUtils = exports.ASTFactory = void 0;
// Фабрики для создания узлов AST
exports.ASTFactory = {
    createPresentFunction() {
        return { type: 'PresentFunction' };
    },
    createExtractFunction(source, unit) {
        return { type: 'ExtractFunction', source, unit };
    },
    createDateFunction(year, month, day, hour, minute, second) {
        return {
            type: 'DateFunction',
            year, month, day,
            hour, minute, second
        };
    },
    createStartOfPeriod(date, unit) {
        return { type: 'StartOfPeriod', date, unit };
    },
    createEndOfPeriod(date, unit) {
        return { type: 'EndOfPeriod', date, unit };
    },
    createInFunction(extract, values) {
        return { type: 'InFunction', extract, values };
    },
    createAddFunction(date, unit, amount) {
        return { type: 'AddFunction', date, unit, amount };
    },
    createFunctionCall(funcName, args) {
        return { type: 'FunctionCall', funcName, args };
    },
    createComparison(left, operator, right) {
        return { type: 'Comparison', left, operator, right };
    },
    createLogical(left, operator, right) {
        return { type: 'Logical', left, operator, right };
    },
    createLiteral(value) {
        return { type: 'Literal', value };
    },
    createIdentifier(name) {
        return { type: 'Identifier', name };
    },
    /*createDateFromNodes(yearNode: ASTNode, monthNode: ASTNode, dayNode: ASTNode): DateFunctionNode {
      if (!ASTUtils.isLiteral(yearNode) || !ASTUtils.isLiteral(monthNode) || !ASTUtils.isLiteral(dayNode)) {
          throw new Error('Аргументы ДАТА должны быть литералами');
      }
      
      return {
          type: 'DateFunction',
          year: Number(yearNode.value),
          month: Number(monthNode.value),
          day: Number(dayNode.value)
      };
  },*/
    createStringLiteral(value) {
        return { type: 'Literal', value };
    },
    createNumericLiteral(value) {
        return { type: 'NumericLiteral', value };
    }
};
// Вспомогательные функции для работы с AST
exports.ASTUtils = {
    isFunctionCall(node, funcName) {
        return node.type === 'FunctionCall' &&
            (funcName ? node.funcName === funcName : true);
    },
    isComparison(node) {
        return node.type === 'Comparison';
    },
    isLogical(node) {
        return node.type === 'Logical';
    },
    isNumericLiteral(node) {
        return node.type === 'NumericLiteral';
    },
    isStringLiteral(node) {
        return node.type === 'Literal';
    },
    isIdentifier(node, name) {
        return node.type === 'Identifier' &&
            (name ? node.name === name : true);
    },
    isPresentFunction(node) {
        return node.type === 'PresentFunction';
    },
    isExtractFunction(node) {
        return node.type === 'ExtractFunction';
    }
};
