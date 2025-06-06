// translator.ts
import { ASTNode, FunctionCallNode, ComparisonNode, LogicalNode, LiteralNode, IdentifierNode } from './parser';

export type TimeUnit = 
  // Русские единицы
  | 'ГОД' | 'КВАРТАЛ' | 'МЕСЯЦ' | 'НЕДЕЛЯ' | 'ДЕНЬ'
  | 'ЧАС' | 'МИНУТА' | 'СЕКУНДА' | 'ДЕНЬНЕДЕЛИ' | 'ДЕНЬГОДА'
  // Английские единицы
  | 'YEAR' | 'QUARTER' | 'MONTH' | 'WEEK' | 'DAY'
  | 'HOUR' | 'MINUTE' | 'SECOND' | 'WEEKDAY' | 'YEARDAY';

type Language = 'ru' | 'en';
type ComparisonOperator = '=' | '<' | '>' | '<=' | '>=';
type TranslationKey = 'current' | 'periodStart' | 'periodEnd';

type UnitTranslations = {
    [key in TimeUnit]: string;
};

interface LanguageTranslations {
    ru: UnitTranslations;
    en: UnitTranslations;
}

interface OperatorTranslations {
  ru: Record<ComparisonOperator, string>;
  en: Record<ComparisonOperator, string>;
}

interface TranslationDictionary {
  ru: Record<TranslationKey, string>;
  en: Record<TranslationKey, string>;
}

export class Translator {
  private readonly language: Language;

  constructor(language: Language = 'ru') {
    this.language = language;
  }

  public translate(node: ASTNode): string {
    switch (node.type) {
      case 'FunctionCall':
        return this.translateFunctionCall(node);
      case 'Comparison':
        return this.translateComparison(node);
      case 'Logical':
        return this.translateLogical(node);
      case 'Literal':
        return this.translateLiteral(node);
    case 'Identifier':
        return this.translateIdentifier(node);
      default:
        throw new Error(`Неизвестный тип узла: ${(node as any).type}`);
    }
  }

  private readonly operatorPrefixes: OperatorTranslations = {
    ru: {
      '=': '',
      '<': 'до ',
      '>': 'после ',
      '<=': 'по ',
      '>=': 'с '
    },
    en: {
      '=': '',
      '<': 'before ',
      '>': 'after ',
      '<=': 'by ',
      '>=': 'since '
    }
  };

  private translateFunctionCall(node: FunctionCallNode): string {
    switch (node.funcName) {
      case 'СЕЙЧАС':
        return this.translateNow();
      case 'ИЗВЛЕЧЬ':
        return this.translateExtract(node);
      case 'ДАТА':
        return this.translateDate(node);
      case 'НАЧАЛОПЕРИОДА':
        return this.translateStartOfPeriod(node);
      case 'КОНЕЦПЕРИОДА':
        return this.translateEndOfPeriod(node);
      case 'В':
        return this.translateIn(node);
      case 'ДОБАВИТЬ':
        return this.translateAdd(node);
      default:
        throw new Error(`Неизвестная функция: ${node.funcName}`);
    }
  }

  private getSimpleUnitName(unit: TimeUnit): string {
    type UnitTranslations = {
        [key in TimeUnit]: string;
    };

    type LanguageTranslations = {
        ru: UnitTranslations;
        en: UnitTranslations;
    };

    const translations: LanguageTranslations = {
        ru: {
            ГОД: "Год",
            КВАРТАЛ: "Квартал",
            МЕСЯЦ: "Месяц",
            НЕДЕЛЯ: "Неделя",
            ДЕНЬ: "День",
            ЧАС: "Час",
            МИНУТА: "Минута",
            СЕКУНДА: "Секунда",
            ДЕНЬНЕДЕЛИ: "День недели",
            ДЕНЬГОДА: "День года",
            // Английские варианты для TypeScript (но не будут использоваться при language: 'ru')
            YEAR: "Год",
            QUARTER: "Квартал",
            MONTH: "Месяц",
            WEEK: "Неделя",
            DAY: "День",
            HOUR: "Час",
            MINUTE: "Минута",
            SECOND: "Секунда",
            WEEKDAY: "День недели",
            YEARDAY: "День года"
        },
        en: {
            ГОД: "Year",
            КВАРТАЛ: "Quarter",
            МЕСЯЦ: "Month",
            НЕДЕЛЯ: "Week",
            ДЕНЬ: "Day",
            ЧАС: "Hour",
            МИНУТА: "Minute",
            СЕКУНДА: "Second",
            ДЕНЬНЕДЕЛИ: "Day of week",
            ДЕНЬГОДА: "Day of year",
            // Английские варианты
            YEAR: "Year",
            QUARTER: "Quarter",
            MONTH: "Month",
            WEEK: "Week",
            DAY: "Day",
            HOUR: "Hour",
            MINUTE: "Minute",
            SECOND: "Second",
            WEEKDAY: "Day of week",
            YEARDAY: "Day of year"
        }
    };

    return translations[this.language][unit];
}

  // Сейчас()
  private translateNow(): string {
    return this.language === 'ru' ? 'Текущий момент' : 'Current moment';
  }

  //Извлечь()
  private translateExtract(node: FunctionCallNode): string {
    const [sourceNode, ...unitNodes] = node.args;
    const units = unitNodes.map(unitNode => this.getUnitName(unitNode));

    // Специальная обработка для ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
    if (sourceNode.type === 'FunctionCall' && 
        (sourceNode.funcName === 'СЕЙЧАС' || sourceNode.funcName === 'NOW')) {
        return this.formatCurrentUnits(units);
    }

    // Если сравнение с числовым значением (например, = 202501)
    if (sourceNode.type === 'Comparison') {
        const value = parseInt(this.translate(sourceNode.right));
        return this.formatCompositeValue(value, units);
    }
        
    // Если источник - СЕЙЧАС(), возвращаем текущие значения
    if (sourceNode.type === 'FunctionCall' && 
        (sourceNode.funcName === 'СЕЙЧАС' || sourceNode.funcName === 'NOW')) {
        return this.formatCurrentComposite(units);
    }

    // Для простого ИЗВЛЕЧЬ(Период, единицы)
    return this.getCompositeUnitName(units);
}

private translateIdentifier(node: IdentifierNode): string {
    // Специальная обработка для "Период" и других идентификаторов
    if (node.name === 'Период' || node.name === 'Period') {
        return this.language === 'ru' ? 'Период' : 'Period';
    }
    return node.name;
}

private formatCurrentUnits(units: TimeUnit[]): string {
    // Для случая с одной единицей времени
    if (units.length === 1) {
      return this.getCurrentUnitTranslation(units[0]);
    }

    // Для нескольких единиц (например, ГОД и МЕСЯЦ)
    const translatedUnits = units.map(unit => this.getCurrentUnitTranslation(unit));
    return translatedUnits.join(' и ');
}

private getCurrentUnitTranslation(unit: TimeUnit): string {
    const translations: Record<Language, Record<TimeUnit, string>> = {
      ru: {
        ГОД: 'Текущий год',
        КВАРТАЛ: 'Текущий квартал',
        МЕСЯЦ: 'Текущий месяц',
        НЕДЕЛЯ: 'Текущая неделя',
        ДЕНЬ: 'Сегодня',
        ЧАС: 'Текущий час',
        МИНУТА: 'Текущая минута',
        СЕКУНДА: 'Текущая секунда',
        ДЕНЬНЕДЕЛИ: 'Текущий день недели',
        ДЕНЬГОДА: 'Текущий день года',
        // Английские аналоги
        YEAR: 'Текущий год',
        QUARTER: 'Текущий квартал',
        MONTH: 'Текущий месяц',
        WEEK: 'Текущая неделя',
        DAY: 'Сегодня',
        HOUR: 'Текущий час',
        MINUTE: 'Текущая минута',
        SECOND: 'Текущая секунда',
        WEEKDAY: 'Текущий день недели',
        YEARDAY: 'Текущий день года'
      },
      en: {
        ГОД: 'Current year',
        КВАРТАЛ: 'Current quarter',
        МЕСЯЦ: 'Current month',
        НЕДЕЛЯ: 'Current week',
        ДЕНЬ: 'Today',
        ЧАС: 'Current hour',
        МИНУТА: 'Current minute',
        СЕКУНДА: 'Current second',
        ДЕНЬНЕДЕЛИ: 'Current day of week',
        ДЕНЬГОДА: 'Current day of year',
        // English originals
        YEAR: 'Current year',
        QUARTER: 'Current quarter',
        MONTH: 'Current month',
        WEEK: 'Current week',
        DAY: 'Today',
        HOUR: 'Current hour',
        MINUTE: 'Current minute',
        SECOND: 'Current second',
        WEEKDAY: 'Current day of week',
        YEARDAY: 'Current day of year'
      }
    };
    return translations[this.language][unit];
}

private translateExtractComparison(
    leftExtract: FunctionCallNode,
    operator: ComparisonOperator,
    rightExtract: FunctionCallNode
): string {
    // Проверяем, что справа СЕЙЧАС()
    if (!(rightExtract.args[0].type === 'FunctionCall' && 
         rightExtract.args[0].funcName === 'СЕЙЧАС')) {
        throw new Error('Ожидалась функция СЕЙЧАС() в правой части сравнения');
    }

    const unit = this.getUnitName(leftExtract.args[1]);
    const operatorText = this.getCurrentTimeOperatorText(operator, unit);
    const unitPhrase = operator === '<='
        ? this.getCurrentTimeUnitAccusative(unit)  // Винительный падеж для "<="
        : this.getCurrentTimeUnitGenitive(unit);   // Родительный падеж для других операторов
    
    return `${operatorText}${unitPhrase}`;
}

private translateComparison(node: ComparisonNode): string {
    // Проверяем случай ИЗВЛЕЧЬ(Период) <оператор> ИЗВЛЕЧЬ(СЕЙЧАС())
    if (node.left.type === 'FunctionCall' && 
        node.left.funcName === 'ИЗВЛЕЧЬ' &&
        node.right.type === 'FunctionCall' && 
        node.right.funcName === 'ИЗВЛЕЧЬ') {
        
        return this.translateExtractComparison(
            node.left, 
            node.operator as ComparisonOperator, 
            node.right
        );
    }
    const operator = node.operator as ComparisonOperator;
    
    if (node.left.type === 'Identifier' && node.left.name === 'Период') {
        if (node.right.type === 'FunctionCall' && node.right.funcName === 'НАЧАЛОПЕРИОДА') {
            return this.formatPeriodStartComparison(
                node.operator as ComparisonOperator, 
                node.right
            );
        }
    }

    // Обработка ИЗВЛЕЧЬ(Период, единица) оператор значение
    if (node.left.type === 'FunctionCall' && node.left.funcName === 'ИЗВЛЕЧЬ') {
        const unit = this.getUnitName(node.left.args[1]);
        const value = this.translate(node.right);
        const numValue = parseInt(value);
        
        // Форматируем значение в зависимости от единицы измерения
        let formattedValue = this.formatExtractedValue(unit, numValue, operator);
        
        // Добавляем префикс оператора 
        /*if (operator !== '=') {
            const prefix = this.getOperatorPrefix(operator);
            formattedValue = `${prefix}${formattedValue}`;
        }*/
        
        return formattedValue;
    }

    // Обработка других сравнений
    const left = this.translate(node.left);
    const right = this.translate(node.right);
    return `${this.getOperatorPrefix(operator)}${right}`;
}

private formatPeriodStartComparison(operator: ComparisonOperator, periodNode: FunctionCallNode): string {
    if (periodNode.args.length !== 2) {
        throw new Error('НАЧАЛОПЕРИОДА требует 2 аргумента');
    }

    const unit = this.getUnitName(periodNode.args[1]);
    return this.getPeriodDescription(unit, operator);
}

private getPeriodDescription(unit: TimeUnit, operator: ComparisonOperator): string {
    const baseForms: Record<Language, Record<TimeUnit, string>> = {
        ru: {
            ГОД: "года",
            КВАРТАЛ: "квартала",
            МЕСЯЦ: "месяца",
            НЕДЕЛЯ: "недели",
            ДЕНЬ: "дня",
            ЧАС: "часа",
            МИНУТА: "минуты",
            СЕКУНДА: "секунды",
            ДЕНЬНЕДЕЛИ: "дня недели",
            ДЕНЬГОДА: "дня года",
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        },
        en: {
            ГОД: "year",
            КВАРТАЛ: "quarter",
            МЕСЯЦ: "month",
            НЕДЕЛЯ: "week",
            ДЕНЬ: "day",
            ЧАС: "hour",
            МИНУТА: "minute",
            СЕКУНДА: "second",
            ДЕНЬНЕДЕЛИ: "week day",
            ДЕНЬГОДА: "year day",
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        }
    };
    const periodStartForms: Record<Language, Record<ComparisonOperator, string>> = {
        ru: {
            '=': "Начало ",
            '<=': "по начало ",
            '>=': "с начала ",
            '<': "до начала ",
            '>': "после начала "
        },
        en: {
            '=': "Start of ",
            '<=': "by start of ",
            '>=': "since start of ",
            '<': "before start of ",
            '>': "after start of "
        }
    };
    const baseForm = baseForms[this.language][unit];
    const periodStartForm = periodStartForms[this.language][operator];

    return `${periodStartForm}${baseForm}`;
}

private formatExtractedValue(unit: TimeUnit, value: number, operator: ComparisonOperator): string {
    const op = operator as ComparisonOperator;
    const prefix = this.getOperatorPrefix(op);
    
    // Выбираем форматировщик в зависимости от языка
    const formatter = this.language === 'ru' 
        ? this.formatForRussian.bind(this) 
        : this.formatForEnglish.bind(this);
    
    return formatter(unit, value, operator, prefix);
}

private formatForRussian(unit: TimeUnit, value: number, operator: ComparisonOperator, prefix: string): string {
    switch (unit) {
        case 'ГОД':
            return this.formatYearComparison(value, operator, prefix);
        case 'КВАРТАЛ':
            return this.formatQuarterComparison(value, operator, prefix);
        case 'МЕСЯЦ':
            return this.formatMonthComparison(value, operator, prefix);
        case 'НЕДЕЛЯ':
            return this.formatWeekComparison(value, operator, prefix);
        case 'ДЕНЬ':
            return this.formatDayComparison(value, operator, prefix);
        case 'ЧАС':
            return this.formatHourComparison(value, operator, prefix);
        case 'МИНУТА':
            return this.formatMinuteComparison(value, operator, prefix);
        case 'СЕКУНДА':
            return this.formatSecondComparison(value, operator, prefix);
        case 'ДЕНЬНЕДЕЛИ':
            return this.formatDayOfWeekComparison(value, operator, prefix);
        case 'ДЕНЬГОДА':
            return this.formatDayOfYearComparison(value, operator, prefix);
        default:
            throw new Error(`Неизвестная единица измерения: ${unit}`);
    }
}

/*private formatForEnglish(unit: TimeUnit, value: number, operator: ComparisonOperator, prefix: string): string {
    // Маппинг русских единиц на английские
    const unitMapping: Record<string, string> = {
        'ГОД': 'year',
        'КВАРТАЛ': 'quarter',
        'МЕСЯЦ': 'month',
        'НЕДЕЛЯ': 'week',
        'ДЕНЬ': 'day',
        'ЧАС': 'hour',
        'МИНУТА': 'minute',
        'СЕКУНДА': 'second',
        'ДЕНЬНЕДЕЛИ': 'weekday',
        'ДЕНЬГОДА': 'yearday'
    };

    const englishUnit = unitMapping[unit] || unit;
    
    switch (englishUnit) {
        case 'year':
            return `${prefix}${value} year${value !== 1 ? 's' : ''}`;
        case 'quarter':
            return `${prefix}Q${value}`;
        case 'month':
            return `${prefix}${this.monthNames.en[value - 1]}`;
        case 'week':
            return `${prefix}${value} week${value !== 1 ? 's' : ''}`;
        case 'day':
            return `${prefix}${value} day${value !== 1 ? 's' : ''}`;
        case 'hour':
            return `${prefix}${value} hour${value !== 1 ? 's' : ''}`;
        case 'minute':
            return `${prefix}${value} minute${value !== 1 ? 's' : ''}`;
        case 'second':
            return `${prefix}${value} second${value !== 1 ? 's' : ''}`;
        case 'weekday':
            return `${prefix}${this.dayNames.en[value - 1]}`;
        case 'yearday':
            const date = new Date(new Date().getFullYear(), 0, value);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${prefix}${month}/${day}`;
        default:
            throw new Error(`Unknown time unit: ${englishUnit}`);
    }
}*/

private formatForEnglish(unit: TimeUnit, value: number, operator: ComparisonOperator, prefix: string): string {
    // Маппинг русских единиц на английские
    const unitMapping: Record<string, string> = {
        'ГОД': 'year',
        'КВАРТАЛ': 'quarter',
        'МЕСЯЦ': 'month',
        'НЕДЕЛЯ': 'week',
        'ДЕНЬ': 'day',
        'ЧАС': 'hour',
        'МИНУТА': 'minute',
        'СЕКУНДА': 'second',
        'ДЕНЬНЕДЕЛИ': 'weekday',
        'ДЕНЬГОДА': 'yearday'
    };

    const englishUnit = unitMapping[unit] || unit;
    
    switch (englishUnit) {
        case 'year':
            return `${prefix}${value} year`;
        case 'quarter':
            return `${prefix}Q${value}`;
        case 'month':
            return `${prefix}${this.monthNames.en[value - 1]}`;
        case 'week':
            return `${prefix}${value} week`;
        case 'day':
            return `${prefix}${value} day`;
        case 'hour':
            return `${prefix}${value} hour`;
        case 'minute':
            return `${prefix}${value} minute`;
        case 'second':
            return `${prefix}${value} second`;
        case 'weekday':
            return `${prefix}${this.dayNames.en[value - 1]}`;
        case 'yearday':
            const date = new Date(new Date().getFullYear(), 0, value);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${prefix}${month}/${day}`;
        default:
            throw new Error(`Unknown time unit: ${englishUnit}`);
    }
}

private formatYearComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} год`;
        case '>=':
            return `${prefix}${value} года`;
        case '<=':
            return `${prefix}${value} год`;
        case '>':
            return `${prefix}${value} года`;
        case '<':
            return `${prefix}${value} года`;
    }
}

private formatQuarterComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} кв.`;
        case '>=':
            return `${prefix}${value} кв.`;
        case '<=':
            return `${prefix}${value} кв.`;
        case '>':
            return `${prefix}${value} кв.`;
        case '<':
            return `${prefix}${value} кв.`;
    }
}

private formatMonthComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    const monthName = this.getMonthName(value);
    const monthNameForComp = this.getMonthNameForComparing(value)
    switch (operator) {
        case '=':
            return monthName;
        case '>=':
            return `${prefix}${monthNameForComp}`;
        case '<=':
            return `${prefix}${monthName}`;
        case '>':
            return `${prefix}${monthNameForComp}`;
        case '<':
            return `${prefix}${monthNameForComp}`;
    }
}

private formatWeekComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} неделя`;
        case '>=':
            return `${prefix}${value} недели`;
        case '<=':
            return `${prefix}${value} неделе`;
        case '>':
            return `${prefix}${value} недели`;
        case '<':
            return `${prefix}${value} недели`;
    }
}

private formatDayComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} день`;
        case '>=':
            return `${prefix}${value} дня`;
        case '<=':
            return `${prefix}${value} день`;
        case '>':
            return `${prefix}${value} дня`;
        case '<':
            return `${prefix}${value} дня`;
        }
}

private formatHourComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} час`;
        case '>=':
            return `${prefix}${value} часа`;
        case '<=':
            return `${prefix}${value} час`;
        case '>':
            return `${prefix}${value} часа`;
        case '<':
            return `${prefix}${value} часа`;
        }
}

private formatMinuteComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} минута`;
        case '>=':
            return `${prefix}${value} минуты`;
        case '<=':
            return `${prefix}${value} минуту`;
        case '>':
            return `${prefix}${value} минуты`;
        case '<':
            return `${prefix}${value} минуты`;
        }
}

private formatSecondComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    switch (operator) {
        case '=':
            return `${value} секунда`;
        case '>=':
            return `${prefix}${value} секунды`;
        case '<=':
            return `${prefix}${value} секунду`;
        case '>':
            return `${prefix}${value} секунды`;
        case '<':
            return `${prefix}${value} секунды`;
        }
}

private formatDayOfWeekComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    const dayName = this.getDayOfWeekName(value); // Получаем название дня недели
    switch (operator) {
        case '=':
            return dayName;
        case '>=':
            return `${prefix}${dayName}`;
        case '<=':
            return `${prefix}${dayName}`;
        case '>':
            return `${prefix}${dayName}`;
        case '<':
            return `${prefix}${dayName}`;
        }
}

private formatDayOfYearComparison(value: number, operator: ComparisonOperator, prefix: string): string {
    const dateFormatted = this.formatDayOfYear(value);
    switch (operator) {
        case '=':
            return dateFormatted; // Возвращаем дату в формате "дд.мм"
        case '>=':
            return `${prefix}${dateFormatted}`; // "с дд.мм"
        case '<=':
            return `${prefix}${dateFormatted}`; // "по дд.мм"
        case '>':
            return `${prefix}${dateFormatted}`; // "после дд.мм"
        case '<':
            return `${prefix}${dateFormatted}`; // "до дд.мм"
    }
}

private translateLogical(node: LogicalNode): string {
    const left = this.translate(node.left);
    const right = this.translate(node.right);
    
    // Определяем оператор в зависимости от языка
    let operator: string;
    if (this.language === 'ru') {
        operator = node.operator === 'И' ? 'и' : 'или';
    } else {
        operator = node.operator === 'И' ? 'and' : 'or';
    }

    // Специальная обработка для нескольких ИЗВЛЕЧЬ с одинаковыми единицами
    if (this.isExtractComparison(node.left) && this.isExtractComparison(node.right)) {
        const leftUnit = this.getExtractUnit(node.left);
        const rightUnit = this.getExtractUnit(node.right);
        
        if (leftUnit === rightUnit) {
            if (this.language === 'ru') {
                // Для русского - перечисление через запятую для "И", " или " для "ИЛИ"
                return node.operator === 'И' 
                    ? `${left}, ${right}`
                    : `${left} или ${right}`;
            } else {
                // Для английского - "and"/"or" с разделением запятой
                return node.operator === 'И'
                    ? `${left} and ${right}`
                    : `${left} or ${right}`;
            }
        }
    }
    
    // Общий случай
    return `${left} ${operator} ${right}`;
}

private isExtractComparison(node: ASTNode): boolean {
    return node.type === 'Comparison' && 
           node.left.type === 'FunctionCall' && 
           node.left.funcName === 'ИЗВЛЕЧЬ';
}

private getExtractUnit(node: ASTNode): TimeUnit | null {
    if (node.type === 'Comparison' && 
        node.left.type === 'FunctionCall' && 
        node.left.funcName === 'ИЗВЛЕЧЬ') {
        return this.getUnitName(node.left.args[1]);
    }
    return null;
}

  private translateLiteral(node: LiteralNode): string {
    return node.value;
  }

  private getUnitName(node: ASTNode): TimeUnit {
    if (node.type !== 'Literal') {
      throw new Error('Expected literal for time unit');
    }
  
    // Все допустимые единицы для обоих языков
    const allValidUnits: TimeUnit[] = [
      'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
      'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА',
      'YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY',
      'HOUR', 'MINUTE', 'SECOND', 'WEEKDAY', 'YEARDAY'
    ];
  
    if (!allValidUnits.includes(node.value as TimeUnit)) {
      throw new Error(`Unknown unit: ${node.value}`);
    }
  
    return node.value as TimeUnit;
}

private getUnitTranslation(unit: string, count: number = 1): string {
const translations = {
    ru: {
    ГОД: this.pluralize(count, ['год', 'года', 'лет']),
    КВАРТАЛ: this.pluralize(count, ['квартал', 'квартала', 'кварталов']),
    МЕСЯЦ: this.getMonthName(count),
    НЕДЕЛЯ: this.pluralize(count, ['неделя', 'недели', 'недель']),
    ДЕНЬ: this.pluralize(count, ['день', 'дня', 'дней']),
    ЧАС: this.pluralize(count, ['час', 'часа', 'часов']),
    МИНУТА: this.pluralize(count, ['минута', 'минуты', 'минут']),
    СЕКУНДА: this.pluralize(count, ['секунда', 'секунды', 'секунд']),
    ДЕНЬНЕДЕЛИ: this.getDayOfWeekName(count),
    ДЕНЬГОДА: this.formatDayOfYear(count)
    },
    en: {
    ГОД: "year",
    КВАРТАЛ: "quarter",
    МЕСЯЦ: "month",
    НЕДЕЛЯ: "week",
    ДЕНЬ: "day",
    ЧАС: "hour",
    МИНУТА: "minute",
    СЕКУНДА: "second",
    ДЕНЬНЕДЕЛИ: "week day",
    ДЕНЬГОДА: "year day"
    }
};

// Добавляем проверку типа
if (this.language === 'ru' || this.language === 'en') {
    const langTranslations = translations[this.language];
    if (unit in langTranslations) {
        return langTranslations[unit as keyof typeof langTranslations];
    }
}

return unit;
}

private getOperatorPrefix(operator: string): string {
    const prefixes = {
        ru: {
            '=': '',
            '<': 'до ',
            '>': 'после ',
            '<=': 'по ',
            '>=': 'с '
        },
        en: {
            '=': '',
            '<': 'before ',
            '>': 'after ',
            '<=': 'by ',
            '>=': 'since '
        }
    };
    return prefixes[this.language][operator as keyof typeof prefixes.ru] || '';
}

private formatDate(day: number, month: number, year: number): string {
const pad = (n: number) => n.toString().padStart(2, '0');
return `${pad(day)}.${pad(month)}.${year}`;
}

private getMonthName(month: number): string {
    const months = {
        ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
    };
    return months[this.language][month - 1] || month.toString();
}

private getMonthNameForComparing(month: number): string {
    const months = {
        ru: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 
            'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
    };
    return months[this.language][month - 1] || month.toString();
}

private getDayOfWeekName(day: number): string {
    const days = {
        ru: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
        en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    };

    // Проверяем валидность номера дня
    if (day < 1 || day > 7) {
        throw new Error(`Номер дня недели должен быть от 1 до 7, получено: ${day}`);
    }

    return days[this.language][day - 1] || day.toString();
}

private formatDayOfYear(day: number): string {
    const date = new Date(new Date().getFullYear(), 0);
    date.setDate(day);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}.${m}`;
}

private pluralize(count: number, forms: string[]): string {
    if (this.language === 'ru') {
        const cases = [2, 0, 1, 1, 1, 2];
        return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
    }
    return count === 1 ? forms[0] : forms[1];
}

private readonly translations: TranslationDictionary = {
    ru: {
        current: 'Текущий',
        periodStart: 'начала периода',
        periodEnd: 'конца периода'
    },
    en: {
        current: 'Current',
        periodStart: 'period start',
        periodEnd: 'period end'
    }
};

private readonly unitTranslations: Record<Language, Record<TimeUnit, string>> = {
    ru: {
        ГОД: "год",
        КВАРТАЛ: "кв.",
        МЕСЯЦ: "", // месяц будет обрабатываться отдельно
        НЕДЕЛЯ: "неделя",
        ДЕНЬ: "день",
        ЧАС: "час",
        МИНУТА: "минута",
        СЕКУНДА: "секунда",
        ДЕНЬНЕДЕЛИ: "", // день недели обрабатывается отдельно
        ДЕНЬГОДА: "" // день года обрабатывается отдельно
        ,
        YEAR: '',
        QUARTER: '',
        MONTH: '',
        WEEK: '',
        DAY: '',
        HOUR: '',
        MINUTE: '',
        SECOND: '',
        WEEKDAY: '',
        YEARDAY: ''
    },
    en: {
        ГОД: "year",
        КВАРТАЛ: "Q",
        МЕСЯЦ: "", 
        НЕДЕЛЯ: "week",
        ДЕНЬ: "day",
        ЧАС: "hour",
        МИНУТА: "minute",
        СЕКУНДА: "second",
        ДЕНЬНЕДЕЛИ: "", 
        ДЕНЬГОДА: "" 
        ,
        YEAR: '',
        QUARTER: '',
        MONTH: '',
        WEEK: '',
        DAY: '',
        HOUR: '',
        MINUTE: '',
        SECOND: '',
        WEEKDAY: '',
        YEARDAY: ''
    }
};
  
private readonly monthNames: Record<Language, string[]> = {
    ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", 
         "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    en: ["January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"]
};
  
private readonly dayNames: Record<Language, string[]> = {
    ru: ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"],
    en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
};

private translateDate(node: FunctionCallNode): string {
    const args = node.args.map(arg => this.translate(arg));
    
    if (args.length === 3) {
        // ДАТА(год, месяц, день)
        const [year, month, day] = args;
        return this.formatDate(parseInt(day), parseInt(month), parseInt(year));
    } else if (args.length === 6) {
        // ДАТА(год, месяц, день, час, минута, секунда)
        const [year, month, day, hour, minute, second] = args;
        return `${this.formatDate(parseInt(day), parseInt(month), parseInt(year))} ${hour}:${minute}:${second}`;
    }
    
    throw new Error(`Неправильное количество аргументов для ДАТА: ${args.length}`);
}

private translateStartOfPeriod(node: FunctionCallNode): string {
    const [dateNode, unitNode] = node.args;
    const unit = this.getUnitName(unitNode);
    
    if (dateNode.type === 'FunctionCall' && 
        (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
        const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
        
        // Создаем объект Date из аргументов
        const date = new Date(
            dateValues[0],                     // год
            dateValues[1] - 1,                // месяц (0-11)
            dateValues[2] || 1,               // день
            dateValues[3] || 0,               // часы
            dateValues[4] || 0,               // минуты
            dateValues[5] || 0                // секунды
        );
        
        // Форматируем вывод в зависимости от единицы измерения
        const formattedValue = this.formatPeriodStartValue(date, unit);
        
        return this.language === 'ru' 
            ? `Начало периода: ${formattedValue}`
            : `Start of period: ${formattedValue}`;
    }
    
    return this.language === 'ru'
        ? `Начало ${this.getGenitiveUnit(unit)}`
        : `Start of ${this.getUnitTranslation(unit).toLowerCase()}`;
    }
        
private formatPeriodStartValue(date: Date, unit: TimeUnit): string {
    switch (unit) {
        case 'ГОД':
        case 'YEAR':
            return date.getFullYear().toString();
            
        case 'КВАРТАЛ':
        case 'QUARTER':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return this.language === 'ru' 
                ? `${quarter} кв.` 
                : `Q${quarter}`;
            
        case 'МЕСЯЦ':
        case 'MONTH':
            return this.getMonthName(date.getMonth() + 1);
            
        case 'НЕДЕЛЯ':
        case 'WEEK':
            return this.language === 'ru'
                ? `${this.getWeekNumber(date)} неделя`
                : `Week ${this.getWeekNumber(date)}`;
                    
        case 'ДЕНЬ':
        case 'DAY':
            return this.language === 'ru'
                ? `${date.getDate()} день`
                : `Day ${date.getDate()}`;
            
        case 'ЧАС':
        case 'HOUR':
            return this.language === 'ru'
                ? `${date.getHours()} час`
                : `Hour ${date.getHours()}`;
            
        case 'МИНУТА':
        case 'MINUTE':
            return this.language === 'ru'
                ? `${date.getMinutes()} минута`
                : `Minute ${date.getMinutes()}`;
            
        case 'СЕКУНДА':
        case 'SECOND':
            return this.language === 'ru'
                ? `${date.getSeconds()} секунда`
                : `Second ${date.getSeconds()}`;
            
        case 'ДЕНЬНЕДЕЛИ':
        case 'WEEKDAY':
            return this.getDayOfWeekName(date.getDay() + 1);
            
        case 'ДЕНЬГОДА':
        case 'YEARDAY':
            const day = date.getDate();
            const month = date.getMonth() + 1;
            return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}`;
            
        default:
            return date.toString();
    }
}

private getGenitiveUnit(unit: TimeUnit): string {
    const units: Record<TimeUnit, string> = {
        ГОД: "года",
        КВАРТАЛ: "квартала",
        МЕСЯЦ: "месяца",
        НЕДЕЛЯ: "недели",  // Исправлено на родительный падеж
        ДЕНЬ: "дня",
        ЧАС: "часа",
        МИНУТА: "минуты",
        СЕКУНДА: "секунды",
        ДЕНЬНЕДЕЛИ: "дня недели",
        ДЕНЬГОДА: "дня года",
        // Английские варианты (не будут использоваться при русском языке)
        YEAR: "года",
        QUARTER: "квартала",
        MONTH: "месяца",
        WEEK: "недели",
        DAY: "дня",
        HOUR: "часа",
        MINUTE: "минуты",
        SECOND: "секунды",
        WEEKDAY: "дня недели",
        YEARDAY: "дня года"
    };

    return units[unit];
}
    
private translateEndOfPeriod(node: FunctionCallNode): string {
    const [dateNode, unitNode] = node.args;
    const unit = this.getUnitName(unitNode);

    if (dateNode.type === 'FunctionCall' && 
        (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
        const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
        
        // Создаем объект Date из аргументов
        const date = new Date(
            dateValues[0],                     // год
            dateValues[1] - 1,                // месяц (0-11)
            dateValues[2] || 1,               // день
            dateValues[3] || 0,               // часы
            dateValues[4] || 0,               // минуты
            dateValues[5] || 0                // секунды
        );
        
        // Форматируем вывод в зависимости от единицы измерения
        const formattedValue = this.formatPeriodEndValue(date, unit);
        
        return this.language === 'ru' 
            ? `Конец периода: ${formattedValue}`
            : `End of period: ${formattedValue}`;
    }

    return this.language === 'ru'
        ? `Конец ${this.getGenitiveUnit(unit)}`
        : `End of ${this.getUnitTranslation(unit).toLowerCase()}`;
}
    
private formatPeriodEndValue(date: Date, unit: TimeUnit): string {
    switch (unit) {
        case 'ГОД':
        case 'YEAR':
            return date.getFullYear().toString();
            
        case 'КВАРТАЛ':
        case 'QUARTER':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return this.language === 'ru' 
                ? `${quarter} кв.` 
                : `Q${quarter}`;
            
        case 'МЕСЯЦ':
        case 'MONTH':
            return this.getMonthName(date.getMonth() + 1);
            
        case 'НЕДЕЛЯ':
        case 'WEEK':
            return this.language === 'ru'
                ? `${this.getWeekNumber(date)} неделя`
                : `Week ${this.getWeekNumber(date)}`;
            
        case 'ДЕНЬ':
        case 'DAY':
            return this.language === 'ru'
                ? `${date.getDate()} день`
                : `Day ${date.getDate()}`;
                
        case 'ЧАС':
        case 'HOUR':
            return this.language === 'ru'
                ? `${date.getHours()} час`
                : `Hour ${date.getHours()}`;
            
        case 'МИНУТА':
        case 'MINUTE':
            return this.language === 'ru'
                ? `${date.getMinutes()} минута`
                : `Minute ${date.getMinutes()}`;
            
        case 'СЕКУНДА':
        case 'SECOND':
            return this.language === 'ru'
                ? `${date.getSeconds()} секунда`
                : `Second ${date.getSeconds()}`;
            
        case 'ДЕНЬНЕДЕЛИ':
        case 'WEEKDAY':
            return this.getDayOfWeekName(date.getDay() + 1);
            
        case 'ДЕНЬГОДА':
        case 'YEARDAY':
            const day = date.getDate();
            const month = date.getMonth() + 1;
            return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}`;
                
        default:
            return date.toString();
    }
}
    
// Вспомогательная функция для получения номера недели
private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

private translateIn(node: FunctionCallNode): string {
    const [extractNode, ...valueNodes] = node.args;
    
    if (extractNode.type !== 'FunctionCall' || extractNode.funcName !== 'ИЗВЛЕЧЬ') {
        throw new Error('Ожидалась функция ИЗВЛЕЧЬ внутри В');
    }
    
    // Получаем список единиц измерения из функции ИЗВЛЕЧЬ
    const units = extractNode.args.slice(1).map(arg => this.getUnitName(arg));
    const values = valueNodes.map(node => this.translate(node));
    
    // Для составных дат (когда несколько единиц измерения)
    if (units.length > 1) {
        return this.formatCompositeDateValues(values, units);
    }
    
    // Для простых случаев с одной единицей измерения
    const numericValues = values.map(v => parseInt(v, 10)).sort((a, b) => a - b);
    return this.formatInValues(numericValues, units[0]);
}

private formatCompositeDateValues(values: string[], units: TimeUnit[]): string {
    // Разбираем каждое значение на компоненты даты
    const dateComponents = values.map(value => {
        return this.parseCompositeValue(value, units);
    });
    
    // Форматируем каждую дату и сохраняем оригинальные компоненты
    const formattedWithComponents = dateComponents.map(components => ({
        formatted: this.formatDateComponents(components, units),
        components
    }));
    
    // Группируем последовательные даты
    const groupedDates = this.groupSequentialDates(formattedWithComponents, units);
    
    // Формируем итоговую строку
    return groupedDates.map(group => {
        if (group.length === 1) return group[0].formatted;
        return `${group[0].formatted} – ${group[group.length - 1].formatted}`;
    }).join(', ');
}

private formatDateComponents(components: Record<TimeUnit, number>, units: TimeUnit[]): string {
    const parts: string[] = [];
    
    // Форматирование даты
    if (units.includes('ГОД')) {
        const year = components['ГОД'];
        
        if (units.includes('МЕСЯЦ')) {
            const month = components['МЕСЯЦ'];
            const monthName = this.getMonthName(month);
            
            if (units.includes('ДЕНЬ')) {
                // Полная дата: DD.MM.YYYY
                const day = components['ДЕНЬ'];
                parts.push(`${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`);
            } else {
                // Только год и месяц
                parts.push(`${monthName} ${year}`);
            }
        } else {
            // Только год
            parts.push(year.toString());
        }
    }
        
    // Форматирование времени
    if (units.includes('ЧАС')) {
        const hour = components['ЧАС'];
        
        if (units.includes('МИНУТА')) {
            const minute = components['МИНУТА'];
            
            if (units.includes('СЕКУНДА')) {
                // Полное время: HH:MM:SS
                const second = components['СЕКУНДА'];
                parts.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
            } else {
                // Часы и минуты
                parts.push(this.language === 'ru' 
                    ? `${hour} час ${minute} минута`
                    : `${hour} hour ${minute} minute`);
            }
        } else {
            // Только часы
            parts.push(this.language === 'ru' 
                ? `${hour} час`
                : `${hour} hour`);
        }
    } else if (units.includes('МИНУТА') || units.includes('СЕКУНДА')) {
        // Если есть минуты/секунды, но нет часов - это ошибка
        throw new Error('Нельзя указать минуты/секунды без часов');
    }
    
    return parts.join(' ');
}

private groupSequentialDates(
    dates: Array<{formatted: string, components: Record<TimeUnit, number>}>, 
    units: TimeUnit[]
): Array<Array<{formatted: string, components: Record<TimeUnit, number>}>> {
    if (dates.length === 0) return [];
    
    const groups: Array<Array<{formatted: string, components: Record<TimeUnit, number>}>> = [];
    let currentGroup = [dates[0]];
    
    for (let i = 1; i < dates.length; i++) {
        if (this.isSequentialDate(
            currentGroup[currentGroup.length - 1].components, 
            dates[i].components, 
            units
        )) {
            currentGroup.push(dates[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [dates[i]];
        }
    }
    
    groups.push(currentGroup);
    return groups;
}
    
private isSequentialDate(
    prev: Record<TimeUnit, number>,
    current: Record<TimeUnit, number>,
    units: TimeUnit[]
): boolean {
    // Определяем самую младшую единицу измерения
    const unitOrder: TimeUnit[] = [
        'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ', 
        'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА'
    ];
    
    // Находим самую младшую единицу из запрошенных
    let minUnit: TimeUnit = units[0];
    for (const unit of units) {
        if (unitOrder.indexOf(unit) > unitOrder.indexOf(minUnit)) {
            minUnit = unit;
        }
    }
    
    // Проверяем, что все старшие единицы совпадают
    for (const unit of units) {
        if (unit === minUnit) break;
        if (prev[unit] !== current[unit]) {
            return false;
        }
    }
    
    // Проверяем последовательность для младшей единицы
    return current[minUnit] === prev[minUnit] + 1;
}


private parseCompositeValue(value: string, units: TimeUnit[]): Record<TimeUnit, number> {
    const result: Partial<Record<TimeUnit, number>> = {};
    let pos = 0;
    
    // Схема разбора для каждой единицы измерения
    const unitParsingSchema: Record<TimeUnit, number> = {
        ГОД: 4, КВАРТАЛ: 1, МЕСЯЦ: 2, НЕДЕЛЯ: 2, ДЕНЬ: 2,
        ЧАС: 2, МИНУТА: 2, СЕКУНДА: 2, ДЕНЬНЕДЕЛИ: 1, ДЕНЬГОДА: 3,
        // Английские варианты
        YEAR: 4, QUARTER: 1, MONTH: 2, WEEK: 2, DAY: 2,
        HOUR: 2, MINUTE: 2, SECOND: 2, WEEKDAY: 1, YEARDAY: 3
    };

    for (const unit of units) {
        const length = unitParsingSchema[unit] || 2;
        const part = value.substring(pos, pos + length);
        
        if (!part || part.length < length) {
            throw new Error(`Недостаточно цифр для ${unit}`);
        }
        
        result[unit] = parseInt(part, 10);
        pos += length;
    }
    
    return result as Record<TimeUnit, number>;
}
    
private formatInValues(values: number[], unit: TimeUnit): string {
    if (values.length === 0) return '';
    
    // Группируем последовательные числа
    const groups: number[][] = [];
    let currentGroup: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
        if (values[i] === currentGroup[currentGroup.length - 1] + 1) {
            currentGroup.push(values[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [values[i]];
        }
    }
    groups.push(currentGroup);
    
    // Форматируем каждую группу
    const formattedGroups = groups.map(group => {
        if (group.length === 1) {
            return this.formatSingleValue(group[0], unit);
        } else {
            return `${this.formatSingleValue(group[0], unit)}-${this.formatSingleValue(group[group.length - 1], unit)}`;
        }
    });
    
    return formattedGroups.join(', ');
}
    
private formatSingleValue(value: number, unit: TimeUnit): string {
    switch (unit) {
        case 'ГОД':
        case 'YEAR':
            return this.language === 'ru' ? `${value}г` : `${value}`;
            
        case 'КВАРТАЛ':
        case 'QUARTER':
            return this.language === 'ru' ? `${value} кв` : `Q${value}`;
            
        case 'МЕСЯЦ':
        case 'MONTH':
            return this.getMonthName(value);
            
        case 'НЕДЕЛЯ':
        case 'WEEK':
            return this.language === 'ru' 
                ? `${value} неделя` 
                : `week ${value}`;
                    
        case 'ДЕНЬ':
        case 'DAY':
            return this.language === 'ru' 
                ? `${value} день` 
                : `day ${value}`;
                
        case 'ЧАС':
        case 'HOUR':
            return this.language === 'ru' 
                ? `${value} час` 
                : `hour ${value}`;
                
        case 'МИНУТА':
        case 'MINUTE':
            return this.language === 'ru' 
                ? `${value} минута` 
                : `minute ${value}`;
                
        case 'СЕКУНДА':
        case 'SECOND':
            return this.language === 'ru' 
                ? `${value} секунда` 
                : `second ${value}`;
                
        case 'ДЕНЬНЕДЕЛИ':
        case 'WEEKDAY':
            return this.getDayOfWeekName(value);
                
        case 'ДЕНЬГОДА':
        case 'YEARDAY':
            const date = new Date(new Date().getFullYear(), 0, value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}.${month}`;
            
        default:
            return value.toString();
    }
}

private translateAdd(node: FunctionCallNode): string {
    const [dateNode, unitNode, amountNode] = node.args;
    
    // Получаем единицу измерения и количество
    const unit = this.getUnitName(unitNode);
    const amount = parseInt(this.translate(amountNode));
    
    // Обработка случая с СЕЙЧАС()
    if (dateNode.type === 'FunctionCall' && 
        (dateNode.funcName === 'СЕЙЧАС' || dateNode.funcName === 'NOW')) {
        return this.formatRelativeAddition(unit, amount);
    }
    
    // Обработка случая с ДАТА()
    if (dateNode.type === 'FunctionCall' && 
        (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
        const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
        const date = new Date(
            dateValues[0],                     // год
            dateValues[1] - 1,                // месяц (0-11)
            dateValues[2] || 1,               // день
            dateValues[3] || 0,               // часы
            dateValues[4] || 0,               // минуты
            dateValues[5] || 0                // секунды
        );
            
        const resultDate = this.addTimeUnits(date, unit, amount);
        return this.formatDateTime(resultDate);
    }
    
    throw new Error('Первым аргументом ДОБАВИТЬ должна быть функция ДАТА() или СЕЙЧАС()');
}
    
private formatRelativeAddition(unit: TimeUnit, amount: number): string {
    const unitForm = this.getUnitForm(unit, amount);
    return this.language === 'ru' 
        ? `текущий + ${amount} ${unitForm}`
        : `current + ${amount} ${unitForm}`;
}
    
private getUnitForm(unit: TimeUnit, count: number): string {
    const forms: Record<Language, Record<TimeUnit, [string, string, string]>> = {
        ru: {
            ГОД: ['год', 'года', 'лет'],
            КВАРТАЛ: ['кв.', 'кв.', 'кв.'],
            МЕСЯЦ: ['месяц', 'месяца', 'месяцев'],
            НЕДЕЛЯ: ['неделя', 'недели', 'недель'],
            ДЕНЬ: ['день', 'дня', 'дней'],
            ЧАС: ['час', 'часа', 'часов'],
            МИНУТА: ['минута', 'минуты', 'минут'],
            СЕКУНДА: ['секунда', 'секунды', 'секунд'],
            ДЕНЬНЕДЕЛИ: ['день недели', 'дня недели', 'дней недели'],
            ДЕНЬГОДА: ['день года', 'дня года', 'дней года'],
            // Английские варианты с русскими переводами
            YEAR: ['год', 'года', 'лет'],
            QUARTER: ['кв.', 'кв.', 'кв.'],
            MONTH: ['месяц', 'месяца', 'месяцев'],
            WEEK: ['неделя', 'недели', 'недель'],
            DAY: ['день', 'дня', 'дней'],
            HOUR: ['час', 'часа', 'часов'],
            MINUTE: ['минута', 'минуты', 'минут'],
            SECOND: ['секунда', 'секунды', 'секунд'],
            WEEKDAY: ['день недели', 'дня недели', 'дней недели'],
            YEARDAY: ['день года', 'дня года', 'дней года']
        },
        en: {
            // Аналогичные формы для английского языка
            YEAR: ['year', 'years', 'years'],
            QUARTER: ['quarter', 'quarters', 'quarters'],
            MONTH: ['month', 'months', 'months'],
            WEEK: ['week', 'weeks', 'weeks'],
            DAY: ['day', 'days', 'days'],
            HOUR: ['hour', 'hours', 'hours'],
            MINUTE: ['minute', 'minutes', 'minutes'],
            SECOND: ['second', 'seconds', 'seconds'],
            WEEKDAY: ['week day', 'week days', 'week days'],
            YEARDAY: ['year day', 'year days', 'year days'],
            // Русские варианты с английскими переводами
            ГОД: ['year', 'years', 'years'],
            КВАРТАЛ: ['quarter', 'quarters', 'quarters'],
            МЕСЯЦ: ['month', 'months', 'months'],
            НЕДЕЛЯ: ['week', 'weeks', 'weeks'],
            ДЕНЬ: ['day', 'days', 'days'],
            ЧАС: ['hour', 'hours', 'hours'],
            МИНУТА: ['minute', 'minutes', 'minutes'],
            СЕКУНДА: ['second', 'seconds', 'seconds'],
            ДЕНЬНЕДЕЛИ: ['week day', 'week days', 'week days'],
            ДЕНЬГОДА: ['year day', 'year days', 'year days']
        }
    };

    const formIndex = this.getFormIndex(count);
    return forms[this.language][unit][formIndex];
}
    
private getFormIndex(count: number): number {
    if (this.language === 'ru') {
        const cases = [2, 0, 1, 1, 1, 2];
        return count % 100 > 4 && count % 100 < 20 
            ? 2 
            : cases[Math.min(count % 10, 5)];
    } else {
        // Для английского языка
        return count === 1 ? 0 : 1;
    }
}
    
    
private addTimeUnits(date: Date, unit: TimeUnit, amount: number): Date {
    const result = new Date(date);
    
    switch (unit) {
        case 'ГОД':
        case 'YEAR':
            result.setFullYear(result.getFullYear() + amount);
            break;
            
        case 'КВАРТАЛ':
        case 'QUARTER':
            result.setMonth(result.getMonth() + amount * 3);
            break;
            
        case 'МЕСЯЦ':
        case 'MONTH':
            result.setMonth(result.getMonth() + amount);
            break;
            
        case 'НЕДЕЛЯ':
        case 'WEEK':
            result.setDate(result.getDate() + amount * 7);
            break;
            
        case 'ДЕНЬ':
        case 'DAY':
            result.setDate(result.getDate() + amount);
            break;
                
        case 'ЧАС':
        case 'HOUR':
            result.setHours(result.getHours() + amount);
            break;
            
        case 'МИНУТА':
        case 'MINUTE':
            result.setMinutes(result.getMinutes() + amount);
            break;
            
        case 'СЕКУНДА':
        case 'SECOND':
            result.setSeconds(result.getSeconds() + amount);
            break;
            
        default:
            throw new Error(`Неизвестная единица времени: ${unit}`);
    }
    
    return result;
}
    
private formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

private formatCompositeValue(value: number, units: TimeUnit[]): string {
    const dateParts = this.parseCompositeValue(value.toString(), units);
    return this.formatDateComponents(dateParts, units);
}

private getCompositeUnitName(units: TimeUnit[]): string {
    const unitNames = units.map(unit => this.getSimpleUnitName(unit));
    return unitNames.join(' + ');
}

private formatCurrentComposite(units: TimeUnit[]): string {
    const now = new Date();
    const components: Record<TimeUnit, number> = {
        // Русские единицы
        ГОД: now.getFullYear(),
        КВАРТАЛ: Math.floor(now.getMonth() / 3) + 1,
        МЕСЯЦ: now.getMonth() + 1,
        НЕДЕЛЯ: this.getWeekNumber(now),
        ДЕНЬ: now.getDate(),
        ЧАС: now.getHours(),
        МИНУТА: now.getMinutes(),
        СЕКУНДА: now.getSeconds(),
        ДЕНЬНЕДЕЛИ: now.getDay() + 1,
        ДЕНЬГОДА: this.getDayOfYear(now),
        
        // Английские единицы
        YEAR: now.getFullYear(),
        QUARTER: Math.floor(now.getMonth() / 3) + 1,
        MONTH: now.getMonth() + 1,
        WEEK: this.getWeekNumber(now),
        DAY: now.getDate(),
        HOUR: now.getHours(),
        MINUTE: now.getMinutes(),
        SECOND: now.getSeconds(),
        WEEKDAY: now.getDay() + 1,
        YEARDAY: this.getDayOfYear(now)
    };
    
    return this.formatDateComponents(components, units);
}

// Вспомогательная функция для получения дня года
private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

private getCurrentTimeOperatorText(operator: ComparisonOperator, unit: TimeUnit): string {
    const operators: Record<Language, Record<ComparisonOperator, string>> = {
        ru: {
            '<': 'до ',
            '<=': 'по ',
            '>': 'после ',
            '>=': 'с ',
            '=': ''
        },
        en: {
            '<': 'before ',
            '<=': 'by ',
            '>': 'after ',
            '>=': 'since ',
            '=': ''
        }
    };
    return operators[this.language][operator];
}

private getCurrentTimeUnitAccusative(unit: TimeUnit): string {
    // Винительный падеж (кого? что?) для оператора <=
    const phrases: Record<Language, Record<TimeUnit, string>> = {
        ru: {
            ГОД: 'текущий год',
            КВАРТАЛ: 'текущий квартал',
            МЕСЯЦ: 'текущий месяц',
            НЕДЕЛЯ: 'текущую неделю',
            ДЕНЬ: 'текущий день',
            ЧАС: 'текущий час',
            МИНУТА: 'текущую минуту',
            СЕКУНДА: 'текущую секунду',
            ДЕНЬНЕДЕЛИ: 'текущий день недели',
            ДЕНЬГОДА: 'текущий день года',
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        },
        en: {
            ГОД: 'current year',
            КВАРТАЛ: 'current quarter',
            МЕСЯЦ: 'current month',
            НЕДЕЛЯ: 'current week',
            ДЕНЬ: 'current day',
            ЧАС: 'current hour',
            МИНУТА: 'current minute',
            СЕКУНДА: 'current second',
            ДЕНЬНЕДЕЛИ: 'current day of week',
            ДЕНЬГОДА: 'current day of year',
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        }
    };
    return phrases[this.language][unit];
}

private getCurrentTimeUnitGenitive(unit: TimeUnit): string {
    // Родительный падеж (кого? чего?)
    const phrases: Record<Language, Record<TimeUnit, string>> = {
        ru: {
            ГОД: 'текущего года',
            КВАРТАЛ: 'текущего квартала',
            МЕСЯЦ: 'текущего месяца',
            НЕДЕЛЯ: 'текущей недели',
            ДЕНЬ: 'текущего дня',
            ЧАС: 'текущего часа',
            МИНУТА: 'текущей минуты',
            СЕКУНДА: 'текущей секунды',
            ДЕНЬНЕДЕЛИ: 'текущего дня недели',
            ДЕНЬГОДА: 'текущего дня года',
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        },
        en: {
            ГОД: 'current year',
            КВАРТАЛ: 'current quarter',
            МЕСЯЦ: 'current month',
            НЕДЕЛЯ: 'current week',
            ДЕНЬ: 'current day',
            ЧАС: 'current hour',
            МИНУТА: 'current minute',
            СЕКУНДА: 'current second',
            ДЕНЬНЕДЕЛИ: 'current day of week',
            ДЕНЬГОДА: 'current day of year',
            YEAR: '',
            QUARTER: '',
            MONTH: '',
            WEEK: '',
            DAY: '',
            HOUR: '',
            MINUTE: '',
            SECOND: '',
            WEEKDAY: '',
            YEARDAY: ''
        }
    };
    return phrases[this.language][unit];
}
    
}