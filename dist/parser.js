"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
exports.addEOFToken = addEOFToken;
// parser.ts
const tokenizer_1 = require("./tokenizer");
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
        this.tokens = [...tokens, tokenizer_1.Tokenizer.createEOFToken()];
    }
    parse() {
        return this.parseLogicalExpression();
    }
    parseLogicalExpression() {
        let left = this.parseComparisonExpression();
        while (this.matchToken('LOGICAL')) {
            const operator = this.previous().value;
            const right = this.parseComparisonExpression();
            left = {
                type: 'Logical',
                left,
                operator,
                right
            };
        }
        return left;
    }
    parseComparisonExpression() {
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
            };
        }
        return left;
    }
    parsePrimaryExpression() {
        if (this.matchToken('FUNCTION')) {
            return this.parseFunctionCall();
        }
        if (this.matchToken('NUMBER') || this.matchToken('UNIT') || this.matchToken('IDENTIFIER')) {
            return {
                type: 'Literal',
                value: this.previous().value
            };
        }
        if (this.matchToken('LPAREN')) {
            const expr = this.parseLogicalExpression();
            this.consume('RPAREN', "Ожидалась закрывающая скобка ')'");
            return expr;
        }
        throw this.error(`Неожиданный токен: ${this.peek().type}`);
    }
    parseFunctionCall() {
        const funcName = this.previous().value;
        this.consume('LPAREN', "Ожидалась открывающая скобка '(' после имени функции");
        const args = [];
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
    matchToken(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === 'EOF';
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw this.error(message);
    }
    error(message) {
        const token = this.peek();
        return new Error(`${message}. Найден токен: ${token.type} '${token.value}'`);
    }
}
exports.Parser = Parser;
// Вспомогательная функция для создания EOF токена
function addEOFToken(tokens) {
    return [...tokens, { type: 'EOF', value: '' }];
}
