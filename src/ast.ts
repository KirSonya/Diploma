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