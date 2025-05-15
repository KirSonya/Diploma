import { 
    ASTFactory, 
    ASTUtils,
    ASTNode,
    FunctionCallNode,
    ComparisonNode,
    LogicalNode,
    LiteralNode,
    IdentifierNode,
    PresentFunctionNode,
    ExtractFunctionNode,
    DateFunctionNode,
    StartOfPeriodNode,
    EndOfPeriodNode,
    InFunctionNode,
    AddFunctionNode,
    NumericLiteralNode
  } from './ast';
  
  describe('ASTFactory', () => {
    test('должен создать узел PresentFunction', () => {
      const node = ASTFactory.createPresentFunction();
      expect(node.type).toBe('PresentFunction');
      expect(ASTUtils.isPresentFunction(node)).toBe(true);
    });
  
    test('должен создать узел ExtractFunction', () => {
      const source = ASTFactory.createPresentFunction();
      const node = ASTFactory.createExtractFunction(source, 'ГОД');
      expect(node.type).toBe('ExtractFunction');
      expect(node.source).toBe(source);
      expect(node.unit).toBe('ГОД');
      expect(ASTUtils.isExtractFunction(node)).toBe(true);
    });
  
    test('должен создать узел DateFunction', () => {
      const node = ASTFactory.createDateFunction(2023, 5, 15);
      expect(node.type).toBe('DateFunction');
      expect(node.year).toBe(2023);
      expect(node.month).toBe(5);
      expect(node.day).toBe(15);
    });
  
    test('должен создать узел StartOfPeriod', () => {
      const date = ASTFactory.createPresentFunction();
      const node = ASTFactory.createStartOfPeriod(date, 'МЕСЯЦ');
      expect(node.type).toBe('StartOfPeriod');
      expect(node.date).toBe(date);
      expect(node.unit).toBe('МЕСЯЦ');
    });
  
    test('должен создать узел EndOfPeriod', () => {
      const date = ASTFactory.createPresentFunction();
      const node = ASTFactory.createEndOfPeriod(date, 'КВАРТАЛ');
      expect(node.type).toBe('EndOfPeriod');
      expect(node.date).toBe(date);
      expect(node.unit).toBe('КВАРТАЛ');
    });
  
    test('должен создать узел InFunction', () => {
      const extract = ASTFactory.createExtractFunction(ASTFactory.createPresentFunction(), 'ДЕНЬ');
      const values = [ASTFactory.createNumericLiteral(1), ASTFactory.createNumericLiteral(2)];
      const node = ASTFactory.createInFunction(extract, values);
      expect(node.type).toBe('InFunction');
      expect(node.extract).toBe(extract);
      expect(node.values).toEqual(values);
    });
  
    test('должен создать узел AddFunction', () => {
      const date = ASTFactory.createPresentFunction();
      const node = ASTFactory.createAddFunction(date, 'НЕДЕЛЯ', 2);
      expect(node.type).toBe('AddFunction');
      expect(node.date).toBe(date);
      expect(node.unit).toBe('НЕДЕЛЯ');
      expect(node.amount).toBe(2);
    });
  
    test('должен создать узел FunctionCall', () => {
      const args = [ASTFactory.createLiteral('test')];
      const node = ASTFactory.createFunctionCall('testFunc', args);
      expect(node.type).toBe('FunctionCall');
      expect(node.funcName).toBe('testFunc');
      expect(node.args).toEqual(args);
    });
  
    test('должен создать узел Comparison', () => {
      const left = ASTFactory.createLiteral('left');
      const right = ASTFactory.createLiteral('right');
      const node = ASTFactory.createComparison(left, '=', right);
      expect(node.type).toBe('Comparison');
      expect(node.left).toBe(left);
      expect(node.operator).toBe('=');
      expect(node.right).toBe(right);
    });
  
    test('должен создать узел Logical', () => {
      const left = ASTFactory.createComparison(
        ASTFactory.createLiteral('left'), 
        '=', 
        ASTFactory.createLiteral('right')
      );
      const right = ASTFactory.createLiteral('right');
      const node = ASTFactory.createLogical(left, 'И', right);
      expect(node.type).toBe('Logical');
      expect(node.left).toBe(left);
      expect(node.operator).toBe('И');
      expect(node.right).toBe(right);
    });
  
    test('должен создать узел Literal', () => {
      const node = ASTFactory.createLiteral('test');
      expect(node.type).toBe('Literal');
      expect(node.value).toBe('test');
    });
  
    test('должен создать узел Identifier', () => {
      const node = ASTFactory.createIdentifier('Период');
      expect(node.type).toBe('Identifier');
      expect(node.name).toBe('Период');
    });
  
    test('должен создать узел NumericLiteral', () => {
      const node = ASTFactory.createNumericLiteral(42);
      expect(node.type).toBe('NumericLiteral');
      expect(node.value).toBe(42);
    });
  });
  
  describe('ASTUtils', () => {
    test('должен идентифицировать узлы FunctionCall', () => {
      const node = ASTFactory.createFunctionCall('test', []);
      expect(ASTUtils.isFunctionCall(node)).toBe(true);
      expect(ASTUtils.isFunctionCall(node, 'test')).toBe(true);
      expect(ASTUtils.isFunctionCall(node, 'other')).toBe(false);
    });
  
    test('должен идентифицировать узлы Comparison', () => {
      const node = ASTFactory.createComparison(
        ASTFactory.createLiteral('left'), 
        '=', 
        ASTFactory.createLiteral('right')
      );
      expect(ASTUtils.isComparison(node)).toBe(true);
    });
  
    test('должен идентифицировать узлы Logical', () => {
      const node = ASTFactory.createLogical(
        ASTFactory.createLiteral('left'), 
        'И', 
        ASTFactory.createLiteral('right')
      );
      expect(ASTUtils.isLogical(node)).toBe(true);
    });
  
    test('должен идентифицировать узлы NumericLiteral', () => {
      const node = ASTFactory.createNumericLiteral(42);
      expect(ASTUtils.isNumericLiteral(node)).toBe(true);
    });
  
    test('должен идентифицировать узлы StringLiteral', () => {
      const node = ASTFactory.createLiteral('test');
      expect(ASTUtils.isStringLiteral(node)).toBe(true);
    });
  
    test('должен идентифицировать узлы Identifier', () => {
      const node = ASTFactory.createIdentifier('Период');
      expect(ASTUtils.isIdentifier(node)).toBe(true);
      expect(ASTUtils.isIdentifier(node, 'Период')).toBe(true);
      expect(ASTUtils.isIdentifier(node, 'other')).toBe(false);
    });
  
    test('должен идентифицировать узлы PresentFunction', () => {
      const node = ASTFactory.createPresentFunction();
      expect(ASTUtils.isPresentFunction(node)).toBe(true);
    });
  
    test('должен идентифицировать узлы ExtractFunction', () => {
      const node = ASTFactory.createExtractFunction(
        ASTFactory.createPresentFunction(), 
        'ГОД'
      );
      expect(ASTUtils.isExtractFunction(node)).toBe(true);
    });
  });