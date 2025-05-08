"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
class Translator {
    constructor(language = 'ru') {
        this.currentUnitTranslations = {
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
    translateNow() {
        return this.language === 'ru' ? 'Текущий момент' : 'Current moment';
    }
    //Извлечь()
    translateExtract(node) {
        const [source, unitNode] = node.args;
        const unit = this.getUnitName(unitNode);
        // Если источник - СЕЙЧАС(), возвращаем "Текущий [единица]"
        if (source.type === 'FunctionCall' && source.funcName === 'СЕЙЧАС') {
            return this.translateCurrentUnit(unit);
        }
        // Для простого ИЗВЛЕЧЬ(Период, единица)
        return this.getSimpleUnitName(unit);
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
            throw new Error('Ожидался литерал для единицы измерения');
        }
        const validUnits = [
            'ГОД', 'КВАРТАЛ', 'МЕСЯЦ', 'НЕДЕЛЯ', 'ДЕНЬ',
            'ЧАС', 'МИНУТА', 'СЕКУНДА', 'ДЕНЬНЕДЕЛИ', 'ДЕНЬГОДА'
        ];
        if (!validUnits.includes(node.value)) {
            throw new Error(`Неизвестная единица измерения: ${node.value}`);
        }
        return node.value;
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
            // Аналогичные переводы для английского
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
        if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
            const dateStr = this.translateDate(dateNode);
            return `${this.getTranslation('periodStart')}: ${dateStr}`;
        }
        return `${this.getUnitTranslation(unit)} ${this.getTranslation('periodStart')}`;
    }
    translateEndOfPeriod(node) {
        const [dateNode, unitNode] = node.args;
        const unit = this.getUnitName(unitNode);
        if (dateNode.type === 'FunctionCall' && dateNode.funcName === 'ДАТА') {
            const dateStr = this.translateDate(dateNode);
            return `${this.getTranslation('periodEnd')}: ${dateStr}`;
        }
        return `${this.getUnitTranslation(unit)} ${this.getTranslation('periodEnd')}`;
    }
    translateIn(node) {
        const [extractNode, ...valueNodes] = node.args;
        if (extractNode.type !== 'FunctionCall' || extractNode.funcName !== 'ИЗВЛЕЧЬ') {
            throw new Error('Ожидалась функция ИЗВЛЕЧЬ внутри В');
        }
        const unit = this.getUnitName(extractNode.args[1]);
        const values = valueNodes.map(node => this.translate(node));
        return this.formatRange(unit, values);
    }
    translateAdd(node) {
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
exports.Translator = Translator;
