// tokenizer.ts
export type TokenType =
  | "FUNCTION"    // СЕЙЧАС, ИЗВЛЕЧЬ и т.д.
  | "UNIT"        // ГОД, МЕСЯЦ и т.д.
  | "NUMBER"      // 2024, 1 и т.д.
  | "OPERATOR"    // =, <, >, <=, >=
  | "LOGICAL"     // И, ИЛИ
  | "LPAREN"      // (
  | "RPAREN"      // )
  | "COMMA"       // ,
  | "IDENTIFIER"  // Период, ДатаОбращения
  | "EOF";        // Маркер конца токенов

export interface Token {
  type: TokenType;
  value: string;
}

export class Tokenizer {
  private static readonly FUNCTION_NAMES = [
    "СЕЙЧАС", "ИЗВЛЕЧЬ", "ДАТА", "НАЧАЛОПЕРИОДА", 
    "КОНЕЦПЕРИОДА", "В", "ДОБАВИТЬ"
  ];

  private static readonly UNITS = [
    "ГОД", "КВАРТАЛ", "МЕСЯЦ", "НЕДЕЛЯ", "ДЕНЬ",
    "ЧАС", "МИНУТА", "СЕКУНДА", "ДЕНЬНЕДЕЛИ", "ДЕНЬГОДА"
  ];

  private static readonly LOGICAL_OPS = ["И", "ИЛИ"];
  private static readonly OPERATORS = ["=", "<", ">", "<=", ">="];

  private input: string;
  private position: number;
  private currentChar: string | null;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[0] || null;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

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
  private isIdentifier(word: string): boolean {
    const russianIdentifiers = ['Период', 'ДатаОбращения'];
    const englishIdentifiers = ['Period', 'RequestDate'];
    return [...russianIdentifiers, ...englishIdentifiers].includes(word);
  }

  private advance(): void {
    this.position++;
    this.currentChar = this.position < this.input.length ? 
      this.input[this.position] : null;
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isLetter(char: string): boolean {
    return /[а-яА-ЯЁёa-zA-Z]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return ['=', '<', '>'].includes(char);
  }

  private readOperator(): string {
    let operator = this.currentChar!;
    this.advance();

    if ((operator === '<' || operator === '>') && 
        this.currentChar === '=') {
      operator += this.currentChar;
      this.advance();
    }

    return operator;
  }

  private readNumber(): string {
    let result = '';
    while (this.currentChar !== null && this.isDigit(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }

  private readWord(): string {
    let result = '';
    while (this.currentChar !== null && 
          (this.isLetter(this.currentChar) || this.isDigit(this.currentChar))) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }

    // метод для создания EOF-токена
    public static createEOFToken(): Token {
        return { type: "EOF", value: "" };
    }
}