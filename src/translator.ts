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
    const left = this.translate(node.left);
    const right = this.translate(node.right);
    const operator = node.operator;
    
    // Специальная обработка для ИЗВЛЕЧЬ(Период, единица)
    if (node.left.type === 'FunctionCall' && node.left.funcName === 'ИЗВЛЕЧЬ') {
        return this.formatExtractComparisonWithOperator(node.left, operator, right);
    }
    
    return `${this.getOperatorPrefix(operator)}${right}`;
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

//метод для форматирования сравнений с ИЗВЛЕЧЬ
private formatExtractComparison(extractNode: FunctionCallNode, value: string): string {
    const [_, unitNode] = extractNode.args;
    const unit = this.getUnitName(unitNode);
    const numValue = parseInt(value);
    
    const translations: TranslationMap = {
        ru: {
            ГОД: (val: number) => `${val} год`,  // Всегда "год"
            КВАРТАЛ: (val: number) => `${val} квартал${this.getQuarterSuffix(val)}`,
            МЕСЯЦ: (val: number) => this.getMonthName(val),
            НЕДЕЛЯ: (val: number) => `${val} неделя${this.getWeekSuffix(val)}`,
            ДЕНЬ: (val: number) => `${val} день`,  // Всегда "день"
            ЧАС: (val: number) => `${val} час${this.getHourSuffix(val)}`,
            МИНУТА: (val: number) => `${val} минут${this.getMinuteSuffix(val)}`,
            СЕКУНДА: (val: number) => `${val} секунд${this.getSecondSuffix(val)}`,
            ДЕНЬНЕДЕЛИ: (val: number) => this.getDayOfWeekName(val),
            ДЕНЬГОДА: (val: number) => this.formatDayOfYear(val)
        },

        en: {
            ГОД: (val: number) => `${val} year${val !== 1 ? 's' : ''}`,
            КВАРТАЛ: (val: number) => `${val} quarter${val !== 1 ? 's' : ''}`,
            МЕСЯЦ: (val: number) => this.getMonthName(val),
            НЕДЕЛЯ: (val: number) => `${val} week${val !== 1 ? 's' : ''}`,
            ДЕНЬ: (val: number) => `${val} day${val !== 1 ? 's' : ''}`,
            ЧАС: (val: number) => `${val} hour${val !== 1 ? 's' : ''}`,
            МИНУТА: (val: number) => `${val} minute${val !== 1 ? 's' : ''}`,
            СЕКУНДА: (val: number) => `${val} second${val !== 1 ? 's' : ''}`,
            ДЕНЬНЕДЕЛИ: (val: number) => this.getDayOfWeekName(val),
            ДЕНЬГОДА: (val: number) => this.formatDayOfYear(val)
        }
    };
    
    return translations[this.language][unit](numValue);
}

private getHourSuffix(val: number): string {
    if (this.language === 'ru') {
        // Русские правила склонения для "час"
        if (val % 10 === 1 && val % 100 !== 11) return '';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'а';
        return 'ов';
    }
    // Английский вариант
    return val === 1 ? '' : 's';
}

private getMinuteSuffix(val: number): string {
    if (this.language === 'ru') {
        // Русские правила склонения для "минута"
        if (val % 10 === 1 && val % 100 !== 11) return 'а';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'ы';
        return '';
    }
    // Английский вариант
    return val === 1 ? '' : 's';
}

private getSecondSuffix(val: number): string {
    if (this.language === 'ru') {
        // Русские правила склонения для "секунда"
        if (val % 10 === 1 && val % 100 !== 11) return 'а';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'ы';
        return '';
    }
    // Английский вариант
    return val === 1 ? '' : 's';
}

private getYearSuffix(val: number): string {
    if (this.language === 'ru') {
        // Для "год" используем форму "год" для всех чисел
        return '';
    }
    return val === 1 ? '' : 's';
}

private getQuarterSuffix(val: number): string {
    return this.language === 'ru' ? (val % 10 === 1 && val % 100 !== 11 ? '' : 'а') : '';
}

private getWeekSuffix(val: number): string {
    if (this.language === 'ru') {
        if (val % 10 === 1 && val % 100 !== 11) return '';
        if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20)) return 'и';
        return '';
    }
    return val === 1 ? '' : 's';
}

private getDaySuffix(val: number): string {
    if (this.language === 'ru') {
        // Для "день" используем форму "день" для всех чисел
        return '';
    }
    return val === 1 ? '' : 's';
}


  private translateLogical(node: LogicalNode): string {
    const left = this.translate(node.left);
    const right = this.translate(node.right);
    
    return `${left} ${node.operator === 'И' ? 'и' : 'или'} ${right}`;
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
        const unit = this.getUnitName(unitNode);
        const amount = this.translate(amountNode);
        
        const dateStr = dateNode.type === 'FunctionCall' && dateNode.funcName === 'СЕЙЧАС'
          ? this.getTranslation('current')
          : this.translate(dateNode);
        
        return `${dateStr} + ${amount} ${this.getUnitTranslation(unit, parseInt(amount))}`;
      }
}

/*private formatExtractComparisonWithOperator(
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
    
    const translations: UnitTranslationWithOperator = {
        ru: {
            ГОД: (val, _) => `${prefix}${val} год`,
            КВАРТАЛ: (val, op) => {
                const suffix = op === '>=' || op === '<=' ? 'а' : '';
                return `${prefix}${val} квартал${suffix}`;
            },
            МЕСЯЦ: (val, op) => {
                const suffix = op === '>=' || op === '<=' ? 'а' : '';
                return `${prefix}${this.getMonthName(val)}${suffix}`;
            },
            НЕДЕЛЯ: (val, op) => `${prefix}${val} недел${op === '>=' || op === '<=' ? 'и' : 'я'}`,
            ДЕНЬ: (val, op) => `${prefix}${val} дн${op === '>=' || op === '<=' ? 'я' : 'ь'}`,
            ЧАС: (val, op) => `${prefix}${val} час${op === '>=' || op === '<=' ? 'а' : ''}`,
            МИНУТА: (val, op) => `${prefix}${val} минут${op === '>=' || op === '<=' ? 'ы' : 'у'}`,
            СЕКУНДА: (val, op) => `${prefix}${val} секунд${op === '>=' || op === '<=' ? 'ы' : 'у'}`,
            ДЕНЬНЕДЕЛИ: (val, _) => `${prefix}${this.getDayOfWeekName(val)}`,
            ДЕНЬГОДА: (val, _) => `${prefix}${this.formatDayOfYear(val)}`
        },
        en: {
            ГОД: (val, _) => `${prefix}${val} year${val !== 1 ? 's' : ''}`,
            КВАРТАЛ: (val, _) => `${prefix}${val} quarter${val !== 1 ? 's' : ''}`,
            МЕСЯЦ: (val, _) => `${prefix}${this.getMonthName(val)}`,
            НЕДЕЛЯ: (val, _) => `${prefix}${val} week${val !== 1 ? 's' : ''}`,
            ДЕНЬ: (val, _) => `${prefix}${val} day${val !== 1 ? 's' : ''}`,
            ЧАС: (val, _) => `${prefix}${val} hour${val !== 1 ? 's' : ''}`,
            МИНУТА: (val, _) => `${prefix}${val} minute${val !== 1 ? 's' : ''}`,
            СЕКУНДА: (val, _) => `${prefix}${val} second${val !== 1 ? 's' : ''}`,
            ДЕНЬНЕДЕЛИ: (val, _) => `${prefix}${this.getDayOfWeekName(val)}`,
            ДЕНЬГОДА: (val, _) => `${prefix}${this.formatDayOfYear(val)}`
        }
    };
    
    return translations[this.language][unit](numValue, op);
}*/