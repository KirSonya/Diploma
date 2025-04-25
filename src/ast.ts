// ast.ts
export interface ASTNode {
    type: string; // Тип узла (ExtractFunction, NowFunction и т.д.)
    period?: string; // Период (например, "СЕЙЧАС", "ДЕНЬ" и т.д.)
    unit?: string; // Единица измерения (например, "ГОД", "МЕСЯЦ")
    value?: string; // Значение, используемое в выражении (например, "2017")
    comparisonOperator?: string; // Оператор сравнения (например, "=", "<", ">")
}

// СЕЙЧАС()
export class PresentFunctionNode implements ASTNode {
    type: string;
    constructor() {
        this.type = 'PresentFunction';
    }
}

//  ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
export class NowFunctionNode implements ASTNode {
    type: string;
    unit: string;

    constructor(unit: string) {
        this.type = 'NowFunction';
        this.unit = unit;
    }
}

//  ИЗВЛЕЧЬ(Период, ...)
export class ExtractRegexFunctionNode implements ASTNode {
    type: string;
    unit: string;

    constructor(unit: string) {
        this.type = 'ExtractRegexFunction';
        this.unit = unit;
    }
}

// Фильтр: ИЗВЛЕЧЬ(Период, ...) = ...
export class ExtractWithValueFunctionNode implements ASTNode {
    type: string;
    period: string;
    unit: string;
    value?: string;
    comparisonOperator?: string;

    constructor(period: string, unit: string, value?: string, comparisonOperator?: string) {
        this.type = 'ExtractWithValueFunction';
        this.period = period;
        this.unit = unit;
        this.value = value;
        this.comparisonOperator = comparisonOperator;
    }
}
    // Период = ДАТА(1992, 11, 26) 
    export class DateComparisonNode implements ASTNode {
        type: string;
        operator: string;
        year: number;
        month: number;
        day: number;

        constructor(operator: string, year: number, month: number, day: number) {
            this.type = 'DateComparison';
            this.operator = operator;
            this.year = year;
            this.month = month;
            this.day = day;
        }

        formatDate(): string {
            return `${String(this.day).padStart(2, '0')}.${String(this.month).padStart(2, '0')}.${this.year}`;
        }
    }

    // ДатаОбращения = ДАТА(1992, 11, 26) 
    export class DateFunctionNode implements ASTNode {
    type: string;
    year: number;
    month: number;
    day: number;
    operator: string; // Добавим поле для оператора

    constructor(year: number, month: number, day: number, operator: string) {
        this.type = 'DateFunction';
        this.year = year;
        this.month = month;
        this.day = day;
        this.operator = operator; // Инициализируем оператор
    }

    formatDate(): string {
        return `${String(this.day).padStart(2, '0')}.${String(this.month).padStart(2, '0')}.${this.year}`;
    }
}

// НАЧАЛОПЕРИОДА(Период, День) 
export class StartOfPeriodNode implements ASTNode {
    type: string;
    period: string;
    unit: string;

    constructor(period: string, unit: string) {
        this.type = 'StartOfPeriod';
        this.period = period;
        this.unit = unit;
    }
}

    
