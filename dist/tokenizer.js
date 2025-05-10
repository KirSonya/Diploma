"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
class Tokenizer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.currentChar = this.input[0] || null;
    }
    tokenize() {
        const tokens = [];
        while (this.currentChar !== null) {
            if (this.isWhitespace(this.currentChar)) {
                this.advance();
                continue;
            }
            if (this.currentChar === '(') {
                tokens.push({ type: "LPAREN", value: '(' });
                this.advance();
                continue;
            }
            if (this.currentChar === ')') {
                tokens.push({ type: "RPAREN", value: ')' });
                this.advance();
                continue;
            }
            if (this.currentChar === ',') {
                tokens.push({ type: "COMMA", value: ',' });
                this.advance();
                continue;
            }
            if (this.isOperatorStart(this.currentChar)) {
                const operator = this.readOperator();
                tokens.push({ type: "OPERATOR", value: operator });
                continue;
            }
            if (this.isDigit(this.currentChar)) {
                const number = this.readNumber();
                tokens.push({ type: "NUMBER", value: number });
                continue;
            }
            if (this.isLetter(this.currentChar)) {
                const word = this.readWord();
                if (Tokenizer.FUNCTION_NAMES.includes(word)) {
                    tokens.push({ type: "FUNCTION", value: word });
                    continue;
                }
                if (Tokenizer.UNITS.includes(word)) {
                    tokens.push({ type: "UNIT", value: word });
                    continue;
                }
                if (Tokenizer.LOGICAL_OPS.includes(word)) {
                    tokens.push({ type: "LOGICAL", value: word });
                    continue;
                }
                tokens.push({ type: "IDENTIFIER", value: word });
                continue;
            }
            throw new Error(`Неизвестный символ: ${this.currentChar}`);
        }
        return tokens;
    }
    // Добавим английские идентификаторы в список
    isIdentifier(word) {
        const russianIdentifiers = ['Период', 'ДатаОбращения'];
        const englishIdentifiers = ['Period', 'RequestDate'];
        return [...russianIdentifiers, ...englishIdentifiers].includes(word);
    }
    advance() {
        this.position++;
        this.currentChar = this.position < this.input.length ?
            this.input[this.position] : null;
    }
    isWhitespace(char) {
        return /\s/.test(char);
    }
    isDigit(char) {
        return /[0-9]/.test(char);
    }
    isLetter(char) {
        return /[а-яА-ЯЁёa-zA-Z]/.test(char);
    }
    isOperatorStart(char) {
        return ['=', '<', '>'].includes(char);
    }
    readOperator() {
        let operator = this.currentChar;
        this.advance();
        if ((operator === '<' || operator === '>') &&
            this.currentChar === '=') {
            operator += this.currentChar;
            this.advance();
        }
        return operator;
    }
    readNumber() {
        let result = '';
        while (this.currentChar !== null && this.isDigit(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }
    readWord() {
        let result = '';
        while (this.currentChar !== null &&
            (this.isLetter(this.currentChar) || this.isDigit(this.currentChar))) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }
    // метод для создания EOF-токена
    static createEOFToken() {
        return { type: "EOF", value: "" };
    }
}
exports.Tokenizer = Tokenizer;
Tokenizer.FUNCTION_NAMES = [
    "СЕЙЧАС", "ИЗВЛЕЧЬ", "ДАТА", "НАЧАЛОПЕРИОДА",
    "КОНЕЦПЕРИОДА", "В", "ДОБАВИТЬ"
];
Tokenizer.UNITS = [
    "ГОД", "КВАРТАЛ", "МЕСЯЦ", "НЕДЕЛЯ", "ДЕНЬ",
    "ЧАС", "МИНУТА", "СЕКУНДА", "ДЕНЬНЕДЕЛИ", "ДЕНЬГОДА"
];
Tokenizer.LOGICAL_OPS = ["И", "ИЛИ"];
Tokenizer.OPERATORS = ["=", "<", ">", "<=", ">="];
