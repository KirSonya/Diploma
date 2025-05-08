// translator.ts
import { ASTNode, FunctionCallNode, ComparisonNode, LogicalNode, LiteralNode } from './parser';

type TimeUnit = 
  | 'ГОД' | 'КВАРТАЛ' | 'МЕСЯЦ' | 'НЕДЕЛЯ' | 'ДЕНЬ'
  | 'ЧАС' | 'МИНУТА' | 'СЕКУНДА' | 'ДЕНЬНЕДЕЛИ' | 'ДЕНЬГОДА';

type Language = 'ru' | 'en';
type ComparisonOperator = '=' | '<' | '>' | '<=' | '>=';
type TranslationKey = 'current' | 'periodStart' | 'periodEnd';
type UnitTranslationFn = (val: number) => string;
type UnitFormatter = (val: number, op: ComparisonOperator) => string;

type UnitTranslations = {
    [key in TimeUnit]: string;
};

interface LanguageTranslations {
    ru: UnitTranslations;
    en: UnitTranslations;
}

interface UnitTranslation {
    ru: Record<TimeUnit, string>;
    en: Record<TimeUnit, string>;
}

interface UnitTranslationWithOperator {
    ru: Record<TimeUnit, UnitFormatter>;
    en: Record<TimeUnit, UnitFormatter>;
}

interface OperatorTranslations {
  ru: Record<ComparisonOperator, string>;
  en: Record<ComparisonOperator, string>;
}

interface TranslationDictionary {
  ru: Record<TranslationKey, string>;
  en: Record<TranslationKey, string>;
}

interface TranslationMap {
    ru: Record<TimeUnit, UnitTranslationFn>;
    en: Record<TimeUnit, UnitTranslationFn>;
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
      default:
        throw new Error(`Неизвестный тип узла: ${(node as any).type}`);
    }
  }

  private readonly currentUnitTranslations: UnitTranslation = {
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
      ДЕНЬГОДА: 'Текущий день года'
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
      ДЕНЬГОДА: 'Current day of year'
    }
  };

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
    const translations = {
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
            ДЕНЬГОДА: "День года"
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
            ДЕНЬГОДА: "Day of year"
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
    const [source, unitNode] = node.args;
    const unit = this.getUnitName(unitNode);

    // Если источник - СЕЙЧАС(), возвращаем "Текущий [единица]"
    if (source.type === 'FunctionCall' && source.funcName === 'СЕЙЧАС') {
        return this.translateCurrentUnit(unit);
    }

    // Для простого ИЗВЛЕЧЬ(Период, единица)
    return this.getSimpleUnitName(unit);
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
    
    // Добавляем явную проверку типа для node.left
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
        
        // Добавляем префикс оператора если нужно
        if (operator !== '=') {
            const prefix = this.getOperatorPrefix(operator);
            formattedValue = `${prefix}${formattedValue}`;
        }
        
        return formattedValue;
    }
    // Стандартная обработка других сравнений
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
            ДЕНЬГОДА: "дня года"
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
    switch (unit) {
        case 'ГОД':
            return `${value}`;
        case 'КВАРТАЛ':
            return `${value} кв.`;
        case 'МЕСЯЦ':
            return this.getMonthName(value);
        case 'НЕДЕЛЯ':
            return `${value} неделя`;
        case 'ДЕНЬ':
            // Для дней возвращаем формат "дд.мм"
            return this.formatDayOfMonth(value);
        case 'ЧАС':
            return `${value} час${this.getHourSuffix(value)}`;
        case 'МИНУТА':
            return `${value} минут${this.getMinuteSuffix(value)}`;
        case 'СЕКУНДА':
            return `${value} секунд${this.getSecondSuffix(value)}`;
        case 'ДЕНЬНЕДЕЛИ':
            return this.formatDayOfWeek(value, operator);
        case 'ДЕНЬГОДА':
            return this.formatDayOfYear(value);
        default:
            throw new Error(`Неизвестная единица измерения: ${unit}`);
    }
}
private formatDayOfWeek(dayNumber: number, operator: ComparisonOperator): string {
    const dayName = this.getDayOfWeekName(dayNumber);
    const dayNameForComp = this.getDayOfWeekNameForComp(dayNumber);
    
    switch (operator) {
        case '=':
            return dayName;
        case '<=':
            return `${dayName}`;
        case '>=':
            return `${dayNameForComp}`;
        case '>':
            return `${dayNameForComp}`;
        case '<':
            return `${dayNameForComp}`;
        default:
            return dayName;
    }
}

    private formatDayOfMonth(day: number): string {
        // Форматируем день как "дд.01" (месяц всегда 01 для примера)
        return `${day.toString().padStart(2, '0')}.01`;
    }

    // Вспомогательные методы для склонений
private getHourSuffix(val: number): string {
    if (this.language === 'ru') {
        if (val % 10 === 1 && val % 100 !== 11) return '';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'а';
        return 'ов';
    }
    return '';
}

private getMinuteSuffix(val: number): string {
    if (this.language === 'ru') {
        if (val % 10 === 1 && val % 100 !== 11) return 'а';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'ы';
        return '';
    }
    return '';
}

private getSecondSuffix(val: number): string {
    if (this.language === 'ru') {
        if (val % 10 === 1 && val % 100 !== 11) return 'а';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'ы';
        return '';
    }
    return '';
}

private formatDateComparison(fieldName: string, dateNode: FunctionCallNode, operator: ComparisonOperator): string {
    const dateStr = this.translateDate(dateNode);
    const prefix = this.getOperatorPrefix(operator);

    if (operator === '=') {
      return `${fieldName}: ${dateStr}`;
    }

    // Для остальных операторов добавляем соответствующий префикс
    // с, по, после, до
    return `${fieldName}: ${prefix}${dateStr}`;
  }

private formatExtractComparisonWithOperator(
    extractNode: FunctionCallNode,
    operator: string,
    value: string
): string {
    const [_, unitNode] = extractNode.args;
    const unit = this.getUnitName(unitNode);
    const numValue = parseInt(value);
    
    // Приводим operator к типу ComparisonOperator
    const op = operator as ComparisonOperator;
    const prefix = this.getOperatorPrefix(op);
    
    switch (unit) {
        case 'ГОД':
            return this.formatYearComparison(numValue, op, prefix);
        case 'КВАРТАЛ':
            return this.formatQuarterComparison(numValue, op, prefix);
        case 'МЕСЯЦ':
            return this.formatMonthComparison(numValue, op, prefix);
        case 'НЕДЕЛЯ':
            return this.formatWeekComparison(numValue, op, prefix);
        case 'ДЕНЬ':
            return this.formatDayComparison(numValue, op, prefix);
        case 'ЧАС':
            return this.formatHourComparison(numValue, op, prefix);
        case 'МИНУТА':
            return this.formatMinuteComparison(numValue, op, prefix);
        case 'СЕКУНДА':
            return this.formatSecondComparison(numValue, op, prefix);
        case 'ДЕНЬНЕДЕЛИ':
            return this.formatDayOfWeekComparison(numValue, op, prefix);
        case 'ДЕНЬГОДА':
            return this.formatDayOfYearComparison(numValue, op, prefix);
        default:
            throw new Error(`Неизвестная единица измерения: ${unit}`);
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
    
    // Обработка комбинированных условий с ИЗВЛЕЧЬ
    if (node.operator === 'И') {
        if (this.isExtractComparison(node.left) && this.isExtractComparison(node.right)) {
            return `${left}, ${right}`;
        }
    }
    
    return `${left} ${node.operator === 'И' ? 'и' : 'или'} ${right}`;
}

private isExtractComparison(node: ASTNode): boolean {
    return node.type === 'Comparison' && 
           node.left.type === 'FunctionCall' && 
           node.left.funcName === 'ИЗВЛЕЧЬ';
}

  private translateLiteral(node: LiteralNode): string {
    return node.value;
  }

  private getUnitName(node: ASTNode): TimeUnit {
    if (node.type !== 'Literal') {
      throw new Error('Ожидался литерал для единицы измерения');
    }
  
    const validUnits: TimeUnit[] = [
      'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
      'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА'
    ];
  
    if (!validUnits.includes(node.value as TimeUnit)) {
      throw new Error(`Неизвестная единица измерения: ${node.value}`);
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
        // Аналогичные переводы для английского
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

  private translateCurrentUnit(unit: TimeUnit): string {
    const translations = {
        ru: {
            ГОД: "Текущий год",
            КВАРТАЛ: "Текущий квартал",
            МЕСЯЦ: "Текущий месяц",
            НЕДЕЛЯ: "Текущая неделя",
            ДЕНЬ: "Сегодня",
            ЧАС: "Текущий час",
            МИНУТА: "Текущая минута",
            СЕКУНДА: "Текущая секунда",
            ДЕНЬНЕДЕЛИ: "Текущий день недели",
            ДЕНЬГОДА: "Текущий день года"
        },
        en: {
            ГОД: "Current year",
            КВАРТАЛ: "Current quarter",
            МЕСЯЦ: "Current month",
            НЕДЕЛЯ: "Current week",
            ДЕНЬ: "Today",
            ЧАС: "Current hour",
            МИНУТА: "Current minute",
            СЕКУНДА: "Current second",
            ДЕНЬНЕДЕЛИ: "Current day of week",
            ДЕНЬГОДА: "Current day of year"
        }
    };

    return translations[this.language][unit];
}

    // Вспомогательная функция для проверки TimeUnit
    private isTimeUnit(unit: string): unit is TimeUnit {
        const validUnits: TimeUnit[] = [
          'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
          'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА'
        ];
        return validUnits.includes(unit as TimeUnit);
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

    // Вспомогательная функция для проверки операторов
    private isComparisonOperator(op: string): op is ComparisonOperator {
        return op === '=' || op === '<' || op === '>' || op === '<=' || op === '>=';
    }

  private formatDate(day: number, month: number, year: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(day)}.${pad(month)}.${year}`;
  }

  private formatRange(unit: string, values: string[]): string {
    if (unit === 'МЕСЯЦ') {
      return values.map(v => this.getMonthName(parseInt(v))).join(', ');
    }
    if (unit === 'ДЕНЬНЕДЕЛИ') {
      return values.map(v => this.getDayOfWeekName(parseInt(v))).join(', ');
    }
    return values.join(' - ');
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

private getDayOfWeekNameForComp(day: number): string {
    const days = {
        ru: ['понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы', 'воскресенья'],
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

  private getTranslation(key: string): string {
    // Проверяем, что key является допустимым TranslationKey
    if (this.isTranslationKey(key)) {
        return this.translations[this.language][key];
    }
    return key;
}

    // Вспомогательная функция для проверки ключей
    private isTranslationKey(key: string): key is TranslationKey {
        return key in this.translations.ru || key in this.translations.en;
    }

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
        
        if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
          const dateStr = this.translateDate(dateNode);
          return `${this.getTranslation('periodStart')}: ${dateStr}`;
        }
        
        return `${this.getUnitTranslation(unit)} ${this.getTranslation('periodStart')}`;
      }
    
      private translateEndOfPeriod(node: FunctionCallNode): string {
        const [dateNode, unitNode] = node.args;
        const unit = this.getUnitName(unitNode);
        
        if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
          const dateStr = this.translateDate(dateNode);
          return `${this.getTranslation('periodEnd')}: ${dateStr}`;
        }
        
        return `${this.getUnitTranslation(unit)} ${this.getTranslation('periodEnd')}`;
      }
    
      private translateIn(node: FunctionCallNode): string {
        const [extractNode, ...valueNodes] = node.args;
        
        if (extractNode.type !== 'FunctionCall' || extractNode.funcName !== 'ИЗВЛЕЧЬ') {
          throw new Error('Ожидалась функция ИЗВЛЕЧЬ внутри В');
        }
        
        const unit = this.getUnitName(extractNode.args[1]);
        const values = valueNodes.map(node => this.translate(node));
        
        return this.formatRange(unit, values);
      }
    
      private translateAdd(node: FunctionCallNode): string {
        const [dateNode, unitNode, amountNode] = node.args;
        
        // Проверяем, что первый аргумент - СЕЙЧАС()
        if (!(dateNode.type === 'FunctionCall' && dateNode.funcName === 'СЕЙЧАС')) {
            throw new Error('Первым аргументом ДОБАВИТЬ должен быть СЕЙЧАС()');
        }
    
        const unit = this.getUnitName(unitNode);
        const amount = parseInt(this.translate(amountNode));
        
        // Получаем базовое название единицы времени
        const unitName = this.getSimpleUnitName(unit);
        
        // Формируем строку с правильным склонением
        const formattedUnit = this.formatUnitWithCount(unit, amount);
        
        return `текущий + ${amount} ${formattedUnit}`;
    }

    private formatUnitWithCount(unit: TimeUnit, count: number): string {
        const translations: LanguageTranslations = {
            ru: {
                ГОД: this.pluralize(count, ['год', 'года', 'лет']),
                КВАРТАЛ: this.pluralize(count, ['кв.', 'кв.', 'кв.']),
                МЕСЯЦ: this.pluralize(count, ['месяц', 'месяца', 'месяцев']),
                НЕДЕЛЯ: this.pluralize(count, ['неделя', 'недели', 'недель']),
                ДЕНЬ: this.pluralize(count, ['день', 'дня', 'дней']),
                ЧАС: this.pluralize(count, ['час', 'часа', 'часов']),
                МИНУТА: this.pluralize(count, ['минута', 'минуты', 'минут']),
                СЕКУНДА: this.pluralize(count, ['секунда', 'секунды', 'секунд']),
                ДЕНЬНЕДЕЛИ: this.pluralize(count, ['день недели', 'дня недели', 'дней недели']),
                ДЕНЬГОДА: this.pluralize(count, ['день года', 'дня года', 'дней года'])
            },
            en: {
                ГОД: count === 1 ? 'year' : 'years',
                КВАРТАЛ: count === 1 ? 'quarter' : 'quarters',
                МЕСЯЦ: count === 1 ? 'month' : 'months',
                НЕДЕЛЯ: count === 1 ? 'week' : 'weeks',
                ДЕНЬ: count === 1 ? 'day' : 'days',
                ЧАС: count === 1 ? 'hour' : 'hours',
                МИНУТА: count === 1 ? 'minute' : 'minutes',
                СЕКУНДА: count === 1 ? 'second' : 'seconds',
                ДЕНЬНЕДЕЛИ: count === 1 ? 'day of week' : 'days of week',
                ДЕНЬГОДА: count === 1 ? 'day of year' : 'days of year'
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
                ДЕНЬГОДА: 'текущий день года'
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
                ДЕНЬГОДА: 'current day of year'
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
                ДЕНЬГОДА: 'текущего дня года'
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
                ДЕНЬГОДА: 'current day of year'
            }
        };
        return phrases[this.language][unit];
    }
    
}