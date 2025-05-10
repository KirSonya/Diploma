"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
class Translator {
    constructor(language = 'ru') {
        this.operatorPrefixes = {
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
        this.translations = {
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
        this.language = language;
    }
    translate(node) {
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
                throw new Error(`Неизвестный тип узла: ${node.type}`);
        }
    }
    translateFunctionCall(node) {
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
    getSimpleUnitName(unit) {
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
    translateNow() {
        return this.language === 'ru' ? 'Текущий момент' : 'Current moment';
    }
    //Извлечь()
    translateExtract(node) {
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
    translateIdentifier(node) {
        // Специальная обработка для "Период" и других идентификаторов
        if (node.name === 'Период' || node.name === 'Period') {
            return this.language === 'ru' ? 'Период' : 'Period';
        }
        return node.name;
    }
    getNumericValue(node) {
        if (typeof node.value === 'number') {
            return Math.floor(node.value).toString();
        }
        return node.value.toString().trim();
    }
    parseCompactDate(value, units) {
        // Дополняем строку нулями до 14 символов (YYYYMMDDhhmmss)
        const paddedValue = value.padEnd(14, '0');
        const result = {};
        // Год (обязательно)
        result['ГОД'] = parseInt(paddedValue.substring(0, 4), 10);
        // Остальные компоненты только если запрошены
        if (units.includes('МЕСЯЦ')) {
            result['МЕСЯЦ'] = parseInt(paddedValue.substring(4, 6), 10) || 1;
        }
        if (units.includes('ДЕНЬ')) {
            result['ДЕНЬ'] = parseInt(paddedValue.substring(6, 8), 10) || 1;
        }
        if (units.includes('ЧАС')) {
            result['ЧАС'] = parseInt(paddedValue.substring(8, 10), 10) || 0;
        }
        if (units.includes('МИНУТА')) {
            result['МИНУТА'] = parseInt(paddedValue.substring(10, 12), 10) || 0;
        }
        if (units.includes('СЕКУНДА')) {
            result['СЕКУНДА'] = parseInt(paddedValue.substring(12, 14), 10) || 0;
        }
        return result;
    }
    formatCompactDate(parts, units) {
        const result = [];
        // Форматирование даты
        if (units.includes('ГОД')) {
            if (units.includes('МЕСЯЦ')) {
                if (units.includes('ДЕНЬ')) {
                    // Полная дата: DD.MM.YYYY
                    result.push(`${parts['ДЕНЬ'].toString().padStart(2, '0')}.` +
                        `${parts['МЕСЯЦ'].toString().padStart(2, '0')}.` +
                        parts['ГОД']);
                }
                else {
                    // Только год и месяц: Месяц YYYY
                    result.push(`${this.getMonthName(parts['МЕСЯЦ'])} ${parts['ГОД']}`);
                }
            }
            else {
                // Только год
                result.push(parts['ГОД'].toString());
            }
        }
        // Форматирование времени
        if (units.includes('ЧАС')) {
            if (units.includes('МИНУТА') && units.includes('СЕКУНДА')) {
                // Полное время: HH:MM:SS
                result.push(`${parts['ЧАС'].toString().padStart(2, '0')}:` +
                    `${parts['МИНУТА'].toString().padStart(2, '0')}:` +
                    `${parts['СЕКУНДА'].toString().padStart(2, '0')}`);
            }
            else if (units.includes('МИНУТА')) {
                // Часы и минуты: X час Y минута
                result.push(this.language === 'ru'
                    ? `${parts['ЧАС']} час ${parts['МИНУТА']} минута`
                    : `${parts['ЧАС']} hour ${parts['МИНУТА']} minute`);
            }
            else {
                // Только часы: X час
                result.push(this.language === 'ru'
                    ? `${parts['ЧАС']} час`
                    : `${parts['ЧАС']} hour`);
            }
        }
        return result.join(' ');
    }
    formatComponentsDescription(units) {
        const unitNames = units.map(unit => this.getSimpleUnitName(unit));
        if (this.language === 'ru') {
            return unitNames.length === 1
                ? `${unitNames[0]} из Период`
                : `${unitNames.join(' и ')} из Период`;
        }
        else {
            return unitNames.length === 1
                ? `${unitNames[0]} from Period`
                : `${unitNames.join(' and ')} from Period`;
        }
    }
    formatComparisonResult(componentsDesc, operator, value) {
        if (operator === '=') {
            return this.language === 'ru'
                ? `${componentsDesc} равен ${value}`
                : `${componentsDesc} equals ${value}`;
        }
        const prefix = this.operatorPrefixes[this.language][operator];
        return `${componentsDesc} ${prefix}${value}`;
    }
    formatCurrentUnits(units) {
        // Для случая с одной единицей времени
        if (units.length === 1) {
            return this.getCurrentUnitTranslation(units[0]);
        }
        // Для нескольких единиц (например, ГОД и МЕСЯЦ)
        const translatedUnits = units.map(unit => this.getCurrentUnitTranslation(unit));
        return translatedUnits.join(' и ');
    }
    getCurrentUnitTranslation(unit) {
        const translations = {
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
    translateExtractComparison(leftExtract, operator, rightExtract) {
        // Проверяем, что справа СЕЙЧАС()
        if (!(rightExtract.args[0].type === 'FunctionCall' &&
            rightExtract.args[0].funcName === 'СЕЙЧАС')) {
            throw new Error('Ожидалась функция СЕЙЧАС() в правой части сравнения');
        }
        const unit = this.getUnitName(leftExtract.args[1]);
        const operatorText = this.getCurrentTimeOperatorText(operator, unit);
        const unitPhrase = operator === '<='
            ? this.getCurrentTimeUnitAccusative(unit) // Винительный падеж для "<="
            : this.getCurrentTimeUnitGenitive(unit); // Родительный падеж для других операторов
        return `${operatorText}${unitPhrase}`;
    }
    translateComparison(node) {
        // Проверяем случай ИЗВЛЕЧЬ(Период) <оператор> ИЗВЛЕЧЬ(СЕЙЧАС())
        if (node.left.type === 'FunctionCall' &&
            node.left.funcName === 'ИЗВЛЕЧЬ' &&
            node.right.type === 'FunctionCall' &&
            node.right.funcName === 'ИЗВЛЕЧЬ') {
            return this.translateExtractComparison(node.left, node.operator, node.right);
        }
        const operator = node.operator;
        // Добавляем явную проверку типа для node.left
        if (node.left.type === 'Identifier' && node.left.name === 'Период') {
            if (node.right.type === 'FunctionCall' && node.right.funcName === 'НАЧАЛОПЕРИОДА') {
                return this.formatPeriodStartComparison(node.operator, node.right);
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
    formatPeriodStartComparison(operator, periodNode) {
        if (periodNode.args.length !== 2) {
            throw new Error('НАЧАЛОПЕРИОДА требует 2 аргумента');
        }
        const unit = this.getUnitName(periodNode.args[1]);
        return this.getPeriodDescription(unit, operator);
    }
    getPeriodDescription(unit, operator) {
        const baseForms = {
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
        const periodStartForms = {
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
    formatExtractedValue(unit, value, operator) {
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
    formatDayOfWeek(dayNumber, operator) {
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
    formatDayOfMonth(day) {
        // Форматируем день как "дд.01" (месяц всегда 01 для примера)
        return `${day.toString().padStart(2, '0')}.01`;
    }
    // Вспомогательные методы для склонений
    getHourSuffix(val) {
        if (this.language === 'ru') {
            if (val % 10 === 1 && val % 100 !== 11)
                return '';
            if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20))
                return 'а';
            return 'ов';
        }
        return '';
    }
    getMinuteSuffix(val) {
        if (this.language === 'ru') {
            if (val % 10 === 1 && val % 100 !== 11)
                return 'а';
            if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20))
                return 'ы';
            return '';
        }
        return '';
    }
    getSecondSuffix(val) {
        if (this.language === 'ru') {
            if (val % 10 === 1 && val % 100 !== 11)
                return 'а';
            if (val % 10 >= 2 && val % 10 <= 4 && (val % 100 < 10 || val % 100 >= 20))
                return 'ы';
            return '';
        }
        return '';
    }
    formatDateComparison(fieldName, dateNode, operator) {
        const dateStr = this.translateDate(dateNode);
        const prefix = this.getOperatorPrefix(operator);
        if (operator === '=') {
            return `${fieldName}: ${dateStr}`;
        }
        // Для остальных операторов добавляем соответствующий префикс
        // с, по, после, до
        return `${fieldName}: ${prefix}${dateStr}`;
    }
    formatExtractComparisonWithOperator(extractNode, operator, value) {
        const [_, unitNode] = extractNode.args;
        const unit = this.getUnitName(unitNode);
        const numValue = parseInt(value);
        // Приводим operator к типу ComparisonOperator
        const op = operator;
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
    formatYearComparison(value, operator, prefix) {
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
    formatQuarterComparison(value, operator, prefix) {
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
    formatMonthComparison(value, operator, prefix) {
        const monthName = this.getMonthName(value);
        const monthNameForComp = this.getMonthNameForComparing(value);
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
    formatWeekComparison(value, operator, prefix) {
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
    formatDayComparison(value, operator, prefix) {
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
    formatHourComparison(value, operator, prefix) {
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
    formatMinuteComparison(value, operator, prefix) {
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
    formatSecondComparison(value, operator, prefix) {
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
    formatDayOfWeekComparison(value, operator, prefix) {
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
    formatDayOfYearComparison(value, operator, prefix) {
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
    translateLogical(node) {
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
    isExtractComparison(node) {
        return node.type === 'Comparison' &&
            node.left.type === 'FunctionCall' &&
            node.left.funcName === 'ИЗВЛЕЧЬ';
    }
    translateLiteral(node) {
        return node.value;
    }
    getUnitName(node) {
        if (node.type !== 'Literal') {
            throw new Error('Expected literal for time unit');
        }
        // Все допустимые единицы для обоих языков
        const allValidUnits = [
            'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
            'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА',
            'YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY',
            'HOUR', 'MINUTE', 'SECOND', 'WEEKDAY', 'YEARDAY'
        ];
        if (!allValidUnits.includes(node.value)) {
            throw new Error(`Unknown unit: ${node.value}`);
        }
        return node.value;
    }
    normalizeUnit(unit) {
        const unitMap = {
            // Русские
            'ГОД': 'YEAR',
            'КВАРТАЛ': 'QUARTER',
            'МЕСЯЦ': 'MONTH',
            'НЕДЕЛЯ': 'WEEK',
            'ДЕНЬ': 'DAY',
            'ЧАС': 'HOUR',
            'МИНУТА': 'MINUTE',
            'СЕКУНДА': 'SECOND',
            'ДЕНЬНЕДЕЛИ': 'WEEKDAY',
            'ДЕНЬГОДА': 'YEARDAY',
            // Английские
            'YEAR': 'YEAR',
            'QUARTER': 'QUARTER',
            'MONTH': 'MONTH',
            'WEEK': 'WEEK',
            'DAY': 'DAY',
            'HOUR': 'HOUR',
            'MINUTE': 'MINUTE',
            'SECOND': 'SECOND',
            'WEEKDAY': 'WEEKDAY',
            'YEARDAY': 'YEARDAY'
        };
        return unitMap[unit] || unit;
    }
    getUnitTranslation(unit, count = 1) {
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
                return langTranslations[unit];
            }
        }
        return unit;
    }
    translateCurrentUnit(unit) {
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
    isTimeUnit(unit) {
        const validUnits = [
            'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
            'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА'
        ];
        return validUnits.includes(unit);
    }
    getOperatorPrefix(operator) {
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
        return prefixes[this.language][operator] || '';
    }
    // Вспомогательная функция для проверки операторов
    isComparisonOperator(op) {
        return op === '=' || op === '<' || op === '>' || op === '<=' || op === '>=';
    }
    formatDate(day, month, year) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(day)}.${pad(month)}.${year}`;
    }
    formatRange(unit, values) {
        if (unit === 'МЕСЯЦ') {
            return values.map(v => this.getMonthName(parseInt(v))).join(', ');
        }
        if (unit === 'ДЕНЬНЕДЕЛИ') {
            return values.map(v => this.getDayOfWeekName(parseInt(v))).join(', ');
        }
        return values.join(' - ');
    }
    getMonthName(month) {
        const months = {
            ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            en: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
        };
        return months[this.language][month - 1] || month.toString();
    }
    getMonthNameForComparing(month) {
        const months = {
            ru: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
                'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
            en: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
        };
        return months[this.language][month - 1] || month.toString();
    }
    getDayOfWeekName(day) {
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
    getDayOfWeekNameForComp(day) {
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
    formatDayOfYear(day) {
        const date = new Date(new Date().getFullYear(), 0);
        date.setDate(day);
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}.${m}`;
    }
    pluralize(count, forms) {
        if (this.language === 'ru') {
            const cases = [2, 0, 1, 1, 1, 2];
            return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
        }
        return count === 1 ? forms[0] : forms[1];
    }
    getTranslation(key) {
        // Проверяем, что key является допустимым TranslationKey
        if (this.isTranslationKey(key)) {
            return this.translations[this.language][key];
        }
        return key;
    }
    // Вспомогательная функция для проверки ключей
    isTranslationKey(key) {
        return key in this.translations.ru || key in this.translations.en;
    }
    translateDate(node) {
        const args = node.args.map(arg => this.translate(arg));
        if (args.length === 3) {
            // ДАТА(год, месяц, день)
            const [year, month, day] = args;
            return this.formatDate(parseInt(day), parseInt(month), parseInt(year));
        }
        else if (args.length === 6) {
            // ДАТА(год, месяц, день, час, минута, секунда)
            const [year, month, day, hour, minute, second] = args;
            return `${this.formatDate(parseInt(day), parseInt(month), parseInt(year))} ${hour}:${minute}:${second}`;
        }
        throw new Error(`Неправильное количество аргументов для ДАТА: ${args.length}`);
    }
    translateStartOfPeriod(node) {
        const [dateNode, unitNode] = node.args;
        const unit = this.getUnitName(unitNode);
        if (dateNode.type === 'FunctionCall' &&
            (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
            const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
            // Создаем объект Date из аргументов
            const date = new Date(dateValues[0], // год
            dateValues[1] - 1, // месяц (0-11)
            dateValues[2] || 1, // день
            dateValues[3] || 0, // часы
            dateValues[4] || 0, // минуты
            dateValues[5] || 0 // секунды
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
    formatPeriodStartValue(date, unit) {
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
    getGenitiveUnit(unit) {
        const units = {
            ГОД: "года",
            КВАРТАЛ: "квартала",
            МЕСЯЦ: "месяца",
            НЕДЕЛЯ: "недели", // Исправлено на родительный падеж
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
    translateEndOfPeriod(node) {
        const [dateNode, unitNode] = node.args;
        const unit = this.getUnitName(unitNode);
        if (dateNode.type === 'FunctionCall' &&
            (dateNode.funcName === 'ДАТА' || dateNode.funcName === 'DATE')) {
            const dateValues = dateNode.args.map(arg => parseInt(this.translate(arg)));
            // Создаем объект Date из аргументов
            const date = new Date(dateValues[0], // год
            dateValues[1] - 1, // месяц (0-11)
            dateValues[2] || 1, // день
            dateValues[3] || 0, // часы
            dateValues[4] || 0, // минуты
            dateValues[5] || 0 // секунды
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
    formatPeriodEndValue(date, unit) {
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
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    translateIn(node) {
        const [extractNode, ...valueNodes] = node.args;
        if (extractNode.type !== 'FunctionCall' || extractNode.funcName !== 'ИЗВЛЕЧЬ') {
            throw new Error('Ожидалась функция ИЗВЛЕЧЬ внутри В');
        }
        // Получаем единицу измерения из функции ИЗВЛЕЧЬ
        const unitNode = extractNode.args[1];
        const unit = this.getUnitName(unitNode);
        // Преобразуем значения в числа
        const values = valueNodes.map(node => {
            const translated = this.translate(node);
            return parseInt(translated, 10);
        }).sort((a, b) => a - b);
        // Форматируем значения в зависимости от единицы измерения
        return this.formatInValues(values, unit);
    }
    /*private formatInValues(values: number[], unit: TimeUnit): string {
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
    }*/
    formatCompositeValues(values, units) {
        // Разбираем числовые значения на компоненты даты/времени
        const dateComponents = values.map(value => this.parseCompositeValue(value, units));
        // Форматируем каждое значение
        const formattedValues = dateComponents.map(components => {
            return this.formatDateComponents(components, units);
        });
        // Группируем последовательные даты
        const groupedValues = this.groupSequentialDates(dateComponents, units);
        // Форматируем группы
        const formattedGroups = groupedValues.map(group => {
            if (group.length === 1) {
                return this.formatDateComponents(group[0], units);
            }
            else {
                const first = this.formatDateComponents(group[0], units);
                const last = this.formatDateComponents(group[group.length - 1], units);
                return `${first} – ${last}`;
            }
        });
        return formattedGroups.join(', ');
    }
    /*parseCompositeValue(value: string, units: TimeUnit[]): any {
        throw new Error('Method not implemented.');
    }*/
    parseCompositeValue(value, units) {
        const result = {};
        let pos = 0;
        // Схема разбора для каждой единицы измерения
        const unitParsingSchema = {
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
        return result;
    }
    formatDateComponents(components, units) {
        const year = components['ГОД'] || components['YEAR'];
        // Форматирование даты
        if (units.includes('МЕСЯЦ') || units.includes('MONTH')) {
            const month = components['МЕСЯЦ'] || components['MONTH'];
            const monthName = this.getMonthName(month);
            if (units.includes('ДЕНЬ') || units.includes('DAY')) {
                const day = components['ДЕНЬ'] || components['DAY'];
                const paddedDay = day.toString().padStart(2, '0');
                const paddedMonth = month.toString().padStart(2, '0');
                // Форматирование времени
                if (units.includes('ЧАС') || units.includes('HOUR')) {
                    const hour = components['ЧАС'] || components['HOUR'];
                    if (units.includes('МИНУТА') || units.includes('MINUTE')) {
                        const minute = components['МИНУТА'] || components['MINUTE'];
                        if (units.includes('СЕКУНДА') || units.includes('SECOND')) {
                            const second = components['СЕКУНДА'] || components['SECOND'];
                            // Полный формат даты и времени
                            return `${paddedDay}.${paddedMonth}.${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
                        }
                        // Дата + часы и минуты
                        return this.language === 'ru'
                            ? `${paddedDay}.${paddedMonth}.${year} ${hour} час ${minute} минута`
                            : `${paddedDay}.${paddedMonth}.${year} ${hour} hour ${minute} minute`;
                    }
                    // Дата + часы
                    return this.language === 'ru'
                        ? `${paddedDay}.${paddedMonth}.${year} ${hour} час`
                        : `${paddedDay}.${paddedMonth}.${year} ${hour} hour`;
                }
                // Только дата
                return `${paddedDay}.${paddedMonth}.${year}`;
            }
            // Год и месяц
            return `${monthName} ${year}`;
        }
        // Только год
        return year.toString();
    }
    groupSequentialDates(dates, units) {
        if (dates.length === 0)
            return [];
        const groups = [];
        let currentGroup = [dates[0]];
        for (let i = 1; i < dates.length; i++) {
            let isSequential = true;
            // Проверяем, является ли текущая дата последовательной для всех единиц
            for (const unit of units) {
                const prevValue = currentGroup[currentGroup.length - 1][unit];
                const currValue = dates[i][unit];
                // Для дней проверяем последовательность
                if (unit === 'ДЕНЬ' || unit === 'DAY') {
                    if (currValue !== prevValue + 1) {
                        isSequential = false;
                        break;
                    }
                }
                // Для других единиц проверяем равенство
                else if (currValue !== prevValue) {
                    isSequential = false;
                    break;
                }
            }
            if (isSequential) {
                currentGroup.push(dates[i]);
            }
            else {
                groups.push(currentGroup);
                currentGroup = [dates[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    }
    formatInValues(values, unit) {
        if (values.length === 0)
            return '';
        // Группируем последовательные числа
        const groups = [];
        let currentGroup = [values[0]];
        for (let i = 1; i < values.length; i++) {
            if (values[i] === currentGroup[currentGroup.length - 1] + 1) {
                currentGroup.push(values[i]);
            }
            else {
                groups.push(currentGroup);
                currentGroup = [values[i]];
            }
        }
        groups.push(currentGroup);
        // Форматируем каждую группу
        const formattedGroups = groups.map(group => {
            if (group.length === 1) {
                return this.formatSingleValue(group[0], unit);
            }
            else {
                return `${this.formatSingleValue(group[0], unit)}-${this.formatSingleValue(group[group.length - 1], unit)}`;
            }
        });
        return formattedGroups.join(', ');
    }
    formatSingleValue(value, unit) {
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
    translateAdd(node) {
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
            const date = new Date(dateValues[0], // год
            dateValues[1] - 1, // месяц (0-11)
            dateValues[2] || 1, // день
            dateValues[3] || 0, // часы
            dateValues[4] || 0, // минуты
            dateValues[5] || 0 // секунды
            );
            const resultDate = this.addTimeUnits(date, unit, amount);
            return this.formatDateTime(resultDate);
        }
        throw new Error('Первым аргументом ДОБАВИТЬ должна быть функция ДАТА() или СЕЙЧАС()');
    }
    formatRelativeAddition(unit, amount) {
        const unitForm = this.getUnitForm(unit, amount);
        return this.language === 'ru'
            ? `текущий + ${amount} ${unitForm}`
            : `current + ${amount} ${unitForm}`;
    }
    getUnitForm(unit, count) {
        const forms = {
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
    getFormIndex(count) {
        if (this.language === 'ru') {
            const cases = [2, 0, 1, 1, 1, 2];
            return count % 100 > 4 && count % 100 < 20
                ? 2
                : cases[Math.min(count % 10, 5)];
        }
        else {
            // Для английского языка
            return count === 1 ? 0 : 1;
        }
    }
    addTimeUnits(date, unit, amount) {
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
    formatDateTime(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }
    formatUnitWithCount(unit, count) {
        const translations = {
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
                ДЕНЬГОДА: this.pluralize(count, ['день года', 'дня года', 'дней года']),
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
                ГОД: count === 1 ? 'year' : 'years',
                КВАРТАЛ: count === 1 ? 'quarter' : 'quarters',
                МЕСЯЦ: count === 1 ? 'month' : 'months',
                НЕДЕЛЯ: count === 1 ? 'week' : 'weeks',
                ДЕНЬ: count === 1 ? 'day' : 'days',
                ЧАС: count === 1 ? 'hour' : 'hours',
                МИНУТА: count === 1 ? 'minute' : 'minutes',
                СЕКУНДА: count === 1 ? 'second' : 'seconds',
                ДЕНЬНЕДЕЛИ: count === 1 ? 'day of week' : 'days of week',
                ДЕНЬГОДА: count === 1 ? 'day of year' : 'days of year',
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
        return translations[this.language][unit];
    }
    formatCompositeValue(value, units) {
        const dateParts = this.parseCompositeValue(value.toString(), units);
        return this.formatDateComponents(dateParts, units);
    }
    getExtractedComponentsDescription(units) {
        const unitNames = units.map(unit => this.getSimpleUnitName(unit));
        if (this.language === 'ru') {
            return unitNames.length === 1
                ? `${unitNames[0]} из Период`
                : `${unitNames.slice(0, -1).join(', ')} и ${unitNames[unitNames.length - 1]} из Период`;
        }
        else {
            return unitNames.length === 1
                ? `${unitNames[0]} from Period`
                : `${unitNames.slice(0, -1).join(', ')} and ${unitNames[unitNames.length - 1]} from Period`;
        }
    }
    getCompositeUnitName(units) {
        const unitNames = units.map(unit => this.getSimpleUnitName(unit));
        return unitNames.join(' + ');
    }
    formatCurrentComposite(units) {
        const now = new Date();
        const components = {
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
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    getCurrentTimeOperatorText(operator, unit) {
        const operators = {
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
    getCurrentTimeUnitAccusative(unit) {
        // Винительный падеж (кого? что?) для оператора <=
        const phrases = {
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
    getCurrentTimeUnitGenitive(unit) {
        // Родительный падеж (кого? чего?)
        const phrases = {
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
exports.Translator = Translator;
