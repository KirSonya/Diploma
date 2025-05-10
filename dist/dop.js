"use strict";
/*

type UnitTranslationFn = (val: number) => string;


interface UnitTranslation {
    ru: Record<TimeUnit, string>;
    en: Record<TimeUnit, string>;
}

interface UnitTranslationWithOperator {
    ru: Record<TimeUnit, UnitFormatter>;
    en: Record<TimeUnit, UnitFormatter>;
}

type UnitFormatter = (val: number, op: ComparisonOperator) => string;


interface TranslationMap {
    ru: Record<TimeUnit, UnitTranslationFn>;
    en: Record<TimeUnit, UnitTranslationFn>;
}

private static readonly FUNCTION_NAMES = [
    "СЕЙЧАС", "NOW",
    "ИЗВЛЕЧЬ", "EXTRACT",
    "ДАТА", "DATE",
    "НАЧАЛОПЕРИОДА", "STARTOFPERIOD",
    "КОНЕЦПЕРИОДА", "ENDOFPERIOD",
    "В", "IN",
    "ДОБАВИТЬ", "ADD"
  ];

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
        ДЕНЬГОДА: 'Текущий день года',
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


  */
/*private translateStartOfPeriod(node: FunctionCallNode): string {
  const [dateNode, unitNode] = node.args;
  const unit = this.getUnitName(unitNode);
  
  if (this.language === 'ru') {
      if (dateNode.type === 'Identifier' && dateNode.name === 'Период') {
          return `Начало ${this.getGenitiveUnit(unit)}`;  // Используем родительный падеж
      }
      if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
          const dateStr = this.translateDate(dateNode);
          return `Начало периода: ${dateStr}`;
      }
    
    return `Начало ${this.getUnitTranslation(unit).toLowerCase()}`;
  } else {
  // Английская версия
      if (dateNode.type === 'Identifier' && dateNode.name === 'Период') {
          return `Start of ${this.getUnitTranslation(unit).toLowerCase()}`;
      }
      if (dateNode.type === 'FunctionCall' && (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
          const dateStr = this.translateDate(dateNode);
          return `Start of period: ${dateStr}`;
      }
    
    return `Start of ${this.getUnitTranslation(unit).toLowerCase()}`;
  }
}*/
/*private parseCompositeValue(value: string, units: TimeUnit[]): Record<TimeUnit, number> {
const result: Record<string, number> = {};
let pos = 0;

for (const unit of units) {
    let length = 0;
    switch (unit) {
        case 'ГОД':
        case 'YEAR':
            length = 4;
            break;
        case 'КВАРТАЛ':
        case 'QUARTER':
        case 'МЕСЯЦ':
        case 'MONTH':
        case 'ДЕНЬ':
        case 'DAY':
        case 'ЧАС':
        case 'HOUR':
        case 'МИНУТА':
        case 'MINUTE':
        case 'СЕКУНДА':
        case 'SECOND':
            length = 2;
            break;
        default:
            length = 2;
    }
    
    const part = value.substr(pos, length);
    result[unit] = parseInt(part);
    pos += length;
}

return result as Record<TimeUnit, number>;
}

private formatDateComponents(components: Record<TimeUnit, number>, units: TimeUnit[]): string {
const parts: string[] = [];

// Форматируем дату
if (units.includes('ГОД') || units.includes('YEAR')) {
    const year = components['ГОД'] || components['YEAR'];
    
    if (units.includes('МЕСЯЦ') || units.includes('MONTH')) {
        const month = components['МЕСЯЦ'] || components['MONTH'];
        
        if (units.includes('ДЕНЬ') || units.includes('DAY')) {
            const day = components['ДЕНЬ'] || components['DAY'];
            parts.push(`${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`);
            
            // Форматируем время, если есть
            if (units.includes('ЧАС') || units.includes('HOUR')) {
                const hour = components['ЧАС'] || components['HOUR'];
                
                if (units.includes('МИНУТА') || units.includes('MINUTE')) {
                    const minute = components['МИНУТА'] || components['MINUTE'];
                    
                    if (units.includes('СЕКУНДА') || units.includes('SECOND')) {
                        const second = components['СЕКУНДА'] || components['SECOND'];
                        parts.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
                    } else {
                        parts.push(`${hour} час ${minute} минута`);
                    }
                } else {
                    parts.push(`${hour} час`);
                }
            }
        } else {
            // Только год и месяц
            parts.push(`${this.getMonthName(month)} ${year}`);
        }
    } else {
        // Только год
        parts.push(year.toString());
    }
}

return parts.join(' ');
}*/
// Вспомогательная функция для получения номера недели
/*private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}*/
/*private translateExtract(node: FunctionCallNode): string {
const [sourceNode, ...unitNodes] = node.args;
const units = unitNodes.map(unitNode => this.getUnitName(unitNode));

// Если источник - СЕЙЧАС(), возвращаем текущие значения
if (sourceNode.type === 'FunctionCall' &&
(sourceNode.funcName === 'СЕЙЧАС' || sourceNode.funcName === 'NOW')) {
return this.formatCurrentComposite(units);
}

// Если сравнение с числовым значением (например, = 202501)
if (sourceNode.type === 'Comparison') {
const value = parseInt(this.translate(sourceNode.right));
return this.formatCompositeValue(value, units);
}

// Для простого ИЗВЛЕЧЬ(Период, единицы)
return this.getCompositeUnitName(units);
}*/
// Методы addTimeUnits и formatDateTime остаются без изменений
/* private translateAdd(node: FunctionCallNode): string {
    const [dateNode, unitNode, amountNode] = node.args;
    
    // Получаем исходную дату
    let date: Date;
    if (dateNode.type === 'FunctionCall' &&
        (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
        const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
        date = new Date(
            dateValues[0],                     // год
            dateValues[1] - 1,                // месяц (0-11)
            dateValues[2] || 1,               // день
            dateValues[3] || 0,               // часы
            dateValues[4] || 0,               // минуты
            dateValues[5] || 0                // секунды
        );
    } else {
        throw new Error('Первым аргументом ДОБАВИТЬ должна быть функция ДАТА()');
    }
    
    // Получаем единицу измерения и количество
    const unit = this.getUnitName(unitNode);
    const amount = parseInt(this.translate(amountNode));
    
    // Добавляем указанное количество единиц
    const resultDate = this.addTimeUnits(date, unit, amount);
    
    // Форматируем результат
    return this.formatDateTime(resultDate);
}*/
/*private translateAdd(node: FunctionCallNode): string {
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
}*/
/*private translateIn(node: FunctionCallNode): string {
const [extractNode, ...valueNodes] = node.args;

if (extractNode.type !== 'FunctionCall' || extractNode.funcName !== 'ИЗВЛЕЧЬ') {
throw new Error('Ожидалась функция ИЗВЛЕЧЬ внутри В');
}

const unit = this.getUnitName(extractNode.args[1]);
const values = valueNodes.map(node => parseInt(this.translate(node)));

// Сортируем значения для правильной группировки
values.sort((a, b) => a - b);

// Форматируем значения в зависимости от типа единицы
const formattedValues = this.formatInValues(values, unit);

return formattedValues;
}*/
/*private translateEndOfPeriod(node: FunctionCallNode): string {
const [dateNode, unitNode] = node.args;
const unit = this.getUnitName(unitNode);

if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
const dateStr = this.translateDate(dateNode);
return `${this.getTranslation('periodEnd')}: ${dateStr}`;
}

return `${this.getUnitTranslation(unit)} ${this.getTranslation('periodEnd')}`;
}*/
/*private formatDateComponents(components: Record<TimeUnit, number>, units: TimeUnit[]): string {
const parts: string[] = [];

// Год
const year = components['ГОД'] || components['YEAR'];

// Месяц
if (units.includes('МЕСЯЦ') || units.includes('MONTH')) {
const month = components['МЕСЯЦ'] || components['MONTH'];
parts.push(`${this.getMonthName(month)} ${year}`);

// День
if (units.includes('ДЕНЬ') || units.includes('DAY')) {
    const day = components['ДЕНЬ'] || components['DAY'];
    parts.push(`${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`);
    
    // Время
    const timeParts: string[] = [];
    if (units.includes('ЧАС') || units.includes('HOUR')) {
        const hour = components['ЧАС'] || components['HOUR'];
        timeParts.push(this.language === 'ru' ? `${hour} час` : `${hour} hour`);
        
        if (units.includes('МИНУТА') || units.includes('MINUTE')) {
            const minute = components['МИНУТА'] || components['MINUTE'];
            timeParts.push(this.language === 'ru' ? `${minute} минута` : `${minute} minute`);
            
            if (units.includes('СЕКУНДА') || units.includes('SECOND')) {
                const second = components['СЕКУНДА'] || components['SECOND'];
                timeParts.push(this.language === 'ru' ? `${second} секунда` : `${second} second`);
                
                // Полный формат времени
                parts.push(
                    `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ` +
                    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
                );
                return parts[parts.length - 1];
            }
        }
    }
    
    if (timeParts.length > 0) {
        parts.push(
            `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ` +
            timeParts.join(' ')
        );
    }
}
} else {
parts.push(year.toString());
}

return parts[parts.length - 1];
}*/
/*private formatDateComponents(components: Record<TimeUnit, number>, units: TimeUnit[]): string {
    const parts: string[] = [];
    
    // Форматируем дату
    if (units.includes('ГОД') || units.includes('YEAR')) {
        const year = components['ГОД'] || components['YEAR'];
        
        if (units.includes('МЕСЯЦ') || units.includes('MONTH')) {
            const month = components['МЕСЯЦ'] || components['MONTH'];
            
            if (units.includes('ДЕНЬ') || units.includes('DAY')) {
                const day = components['ДЕНЬ'] || components['DAY'];
                parts.push(`${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`);
                
                // Форматируем время, если есть
                if (units.includes('ЧАС') || units.includes('HOUR')) {
                    const hour = components['ЧАС'] || components['HOUR'];
                    
                    if (units.includes('МИНУТА') || units.includes('MINUTE')) {
                        const minute = components['МИНУТА'] || components['MINUTE'];
                        
                        if (units.includes('СЕКУНДА') || units.includes('SECOND')) {
                            const second = components['СЕКУНДА'] || components['SECOND'];
                            parts.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
                        } else {
                            parts.push(`${hour} час ${minute} минута`);
                        }
                    } else {
                        parts.push(`${hour} час`);
                    }
                }
            } else {
                // Только год и месяц
                parts.push(`${this.getMonthName(month)} ${year}`);
            }
        } else {
            // Только год
            parts.push(year.toString());
        }
    }
    
    return parts.join(' ');
}*/
/*private parseCompositeValue(value: string, units: TimeUnit[]): Record<TimeUnit, number> {
    const result: Record<string, number> = {};
    let pos = 0;
    
    for (const unit of units) {
        let length = 0;
        switch (unit) {
            case 'ГОД':
            case 'YEAR':
                length = 4;
                break;
            case 'КВАРТАЛ':
            case 'QUARTER':
            case 'МЕСЯЦ':
            case 'MONTH':
            case 'ДЕНЬ':
            case 'DAY':
            case 'ЧАС':
            case 'HOUR':
            case 'МИНУТА':
            case 'MINUTE':
            case 'СЕКУНДА':
            case 'SECOND':
                length = 2;
                break;
            default:
                length = 2;
        }
        
        const part = value.substr(pos, length);
        result[unit] = parseInt(part);
        pos += length;
    }
    
    return result as Record<TimeUnit, number>;
}*/
/*private formatCompositeExtractComparison(units: TimeUnit[], value: string, operator: ComparisonOperator): string {
    // Парсим числовое значение в компоненты даты
    const dateComponents = this.parseCompositeValue(value, units);
    
    // Форматируем дату
    const formattedDate = this.formatDateComponents(dateComponents, units);
    
    // Получаем название извлекаемых компонентов
    const extractedComponents = this.getExtractedComponentsDescription(units);
    
    // Форматируем оператор сравнения
    //const operatorText = this.getComparisonOperatorText(operator);
    
    return `${extractedComponents} ${operatorText}${formattedDate}`;
}*/
/*getExtractedComponentsDescription(units: TimeUnit[]) {
    throw new Error('Method not implemented.');
}*/ 
