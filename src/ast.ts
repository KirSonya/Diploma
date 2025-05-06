// ast.ts

// Базовый тип для всех узлов AST
export type ASTNode = 
  | FunctionCallNode
  | ComparisonNode
  | LogicalNode
  | LiteralNode
  | IdentifierNode
  | PresentFunctionNode
  | ExtractFunctionNode
  | DateFunctionNode
  | StartOfPeriodNode
  | EndOfPeriodNode
  | InFunctionNode
  | AddFunctionNode;

// Базовый интерфейс для всех узлов
interface BaseASTNode {
  type: string;
}

// Функция СЕЙЧАС()
export interface PresentFunctionNode extends BaseASTNode {
  type: 'PresentFunction';
}

// Функция ИЗВЛЕЧЬ()
export interface ExtractFunctionNode extends BaseASTNode {
  type: 'ExtractFunction';
  source: ASTNode;
  unit: string;
}

// Функция ДАТА()
export interface DateFunctionNode extends BaseASTNode {
  type: 'DateFunction';
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

// Функция НАЧАЛОПЕРИОДА()
export interface StartOfPeriodNode extends BaseASTNode {
  type: 'StartOfPeriod';
  date: ASTNode;
  unit: string;
}

// Функция КОНЕЦПЕРИОДА()
export interface EndOfPeriodNode extends BaseASTNode {
  type: 'EndOfPeriod';
  date: ASTNode;
  unit: string;
}

// Функция В()
export interface InFunctionNode extends BaseASTNode {
  type: 'InFunction';
  extract: ExtractFunctionNode;
  values: ASTNode[];
}

// Функция ДОБАВИТЬ()
export interface AddFunctionNode extends BaseASTNode {
  type: 'AddFunction';
  date: ASTNode;
  unit: string;
  amount: number;
}

// Общий узел для вызова функции
export interface FunctionCallNode extends BaseASTNode {
  type: 'FunctionCall';
  funcName: string;
  args: ASTNode[];
}

// Узел сравнения
export interface ComparisonNode extends BaseASTNode {
  type: 'Comparison';
  left: ASTNode;
  operator: string;
  right: ASTNode;
}

// Узел логической операции
export interface LogicalNode extends BaseASTNode {
  type: 'Logical';
  left: ASTNode;
  operator: string;
  right: ASTNode;
}

// Узел литерала (число, строка)
export interface LiteralNode extends BaseASTNode {
  type: 'Literal';
  value: string | number;
}

// Узел идентификатора
export interface IdentifierNode extends BaseASTNode {
  type: 'Identifier';
  name: string;
}

// Вспомогательные типы
export type ComparisonOperator = '=' | '<' | '>' | '<=' | '>=';
export type LogicalOperator = 'И' | 'ИЛИ';

// Единицы измерения времени
export type TimeUnit = 
  | 'ГОД' | 'КВАРТАЛ' | 'МЕСЯЦ' | 'НЕДЕЛЯ' | 'ДЕНЬ'
  | 'ЧАС' | 'МИНУТА' | 'СЕКУНДА' | 'ДЕНЬНЕДЕЛИ' | 'ДЕНЬГОДА';

// Фабрики для создания узлов AST
export const ASTFactory = {
  createPresentFunction(): PresentFunctionNode {
    return { type: 'PresentFunction' };
  },

  createExtractFunction(source: ASTNode, unit: string): ExtractFunctionNode {
    return { type: 'ExtractFunction', source, unit };
  },

  createDateFunction(
    year: number, 
    month: number, 
    day: number,
    hour?: number,
    minute?: number,
    second?: number
  ): DateFunctionNode {
    return { 
      type: 'DateFunction', 
      year, month, day, 
      hour, minute, second 
    };
  },

  createStartOfPeriod(date: ASTNode, unit: string): StartOfPeriodNode {
    return { type: 'StartOfPeriod', date, unit };
  },

  createEndOfPeriod(date: ASTNode, unit: string): EndOfPeriodNode {
    return { type: 'EndOfPeriod', date, unit };
  },

  createInFunction(extract: ExtractFunctionNode, values: ASTNode[]): InFunctionNode {
    return { type: 'InFunction', extract, values };
  },

  createAddFunction(date: ASTNode, unit: string, amount: number): AddFunctionNode {
    return { type: 'AddFunction', date, unit, amount };
  },

  createFunctionCall(funcName: string, args: ASTNode[]): FunctionCallNode {
    return { type: 'FunctionCall', funcName, args };
  },

  createComparison(left: ASTNode, operator: ComparisonOperator, right: ASTNode): ComparisonNode {
    return { type: 'Comparison', left, operator, right };
  },

  createLogical(left: ASTNode, operator: LogicalOperator, right: ASTNode): LogicalNode {
    return { type: 'Logical', left, operator, right };
  },

  createLiteral(value: string | number): LiteralNode {
    return { type: 'Literal', value };
  },

  createIdentifier(name: string): IdentifierNode {
    return { type: 'Identifier', name };
  }
};

// Вспомогательные функции для работы с AST
export const ASTUtils = {
  isFunctionCall(node: ASTNode, funcName?: string): node is FunctionCallNode {
    return node.type === 'FunctionCall' && 
      (funcName ? (node as FunctionCallNode).funcName === funcName : true);
  },

  isComparison(node: ASTNode): node is ComparisonNode {
    return node.type === 'Comparison';
  },

  isLogical(node: ASTNode): node is LogicalNode {
    return node.type === 'Logical';
  },

  isLiteral(node: ASTNode): node is LiteralNode {
    return node.type === 'Literal';
  },

  isIdentifier(node: ASTNode, name?: string): node is IdentifierNode {
    return node.type === 'Identifier' && 
      (name ? (node as IdentifierNode).name === name : true);
  }
};