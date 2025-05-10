// parser.ts
import { ASTFactory } from './ast';
import { Token, Tokenizer, TokenType } from './tokenizer';

export type ASTNode =
  | FunctionCallNode
  | ComparisonNode
  | LogicalNode
  | LiteralNode
  | IdentifierNode;

export interface FunctionCallNode {
  type: 'FunctionCall';
  funcName: string;
  args: ASTNode[];
}

export interface ComparisonNode {
  type: 'Comparison';
  left: ASTNode;
  operator: string;
  right: ASTNode;
}

export interface LogicalNode {
  type: 'Logical';
  left: ASTNode;
  operator: string;
  right: ASTNode;
}

export interface LiteralNode {
  type: 'Literal';
  value: string;
}

export interface IdentifierNode {
    type: 'Identifier';
    name: string;
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.tokens = [...tokens, Tokenizer.createEOFToken()];
  }

  public parse(): ASTNode {
    return this.parseLogicalExpression();
  }

  private parseLogicalExpression(): ASTNode {
    let left = this.parseComparisonExpression();

    while (this.matchToken('LOGICAL')) {
      const operator = this.previous().value;
      const right = this.parseComparisonExpression();
      left = {
        type: 'Logical',
        left,
        operator,
        right
      } as LogicalNode;
    }

    return left;
  }

  private parseComparisonExpression(): ASTNode {
    let left = this.parsePrimaryExpression();

    // Проверяем текущий токен на наличие оператора сравнения
    while (this.matchToken('OPERATOR')) {
        const operator = this.previous().value;
        const right = this.parsePrimaryExpression();
        left = {
            type: 'Comparison',
            left,
            operator,
            right
        } as ComparisonNode;
    }

    return left;
}

  private parsePrimaryExpression(): ASTNode {
    if (this.matchToken('IDENTIFIER')) {
      const identifierName = this.previous().value;
        // Нормализуем русские и английские варианты
        const normalizedName = identifierName === 'Period' ? 'Период' : 
                            identifierName === 'RequestDate' ? 'ДатаОбращения' :
                            identifierName;
        return ASTFactory.createIdentifier(normalizedName);
        //return ASTFactory.createIdentifier(this.previous().value);
    }

    if (this.matchToken('FUNCTION')) {
      return this.parseFunctionCall();
    }

    if (this.matchToken('NUMBER') || this.matchToken('UNIT')) {
      return {
        type: 'Literal',
        value: this.previous().value
      } as LiteralNode;
    }

    if (this.matchToken('LPAREN')) {
      const expr = this.parseLogicalExpression();
      this.consume('RPAREN', "Ожидалась закрывающая скобка ')'");
      return expr;
    }

    throw this.error(`Неожиданный токен: ${this.peek().type}`);
  }

  private parseFunctionCall(): FunctionCallNode {
    const funcName = this.previous().value;
    this.consume('LPAREN', "Ожидалась открывающая скобка '(' после имени функции");

    const args: ASTNode[] = [];
    while (!this.check('RPAREN') && !this.isAtEnd()) {
      args.push(this.parseLogicalExpression());
      if (!this.matchToken('COMMA')) {
        break;
      }
    }

    this.consume('RPAREN', "Ожидалась закрывающая скобка ')' после аргументов функции");
    return {
      type: 'FunctionCall',
      funcName,
      args
    };
  }

  private matchToken(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(message);
  }

  private error(message: string): Error {
    const token = this.peek();
    return new Error(`${message}. Найден токен: ${token.type} '${token.value}'`);
  }
}

// Вспомогательная функция для создания EOF токена
export function addEOFToken(tokens: Token[]): Token[] {
  return [...tokens, { type: 'EOF', value: '' }];
}