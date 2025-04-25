"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
// translator.ts
const ast_1 = require("./ast");
const abbreviations = {
    ГОД: "Год",
    КВАРТАЛ: "Квартал",
    МЕСЯЦ: "Месяц",
    НЕДЕЛЯ: "Неделя",
    ДЕНЬ: "День",
    ЧАС: "Час",
    МИНУТА: "Минутa",
    СЕКУНДА: "Секунда",
    ДЕНЬНЕДЕЛИ: "День Недели",
    ДЕНЬГОДА: "День Года"
};
const englishAbbreviations = {
    ГОД: "Year",
    КВАРТАЛ: "Quarter",
    МЕСЯЦ: "Month",
    НЕДЕЛЯ: "Week",
    ДЕНЬ: "Day",
    ЧАС: "Hour",
    МИНУТА: "Minute",
    СЕКУНДА: "Second",
    ДЕНЬНЕДЕЛИ: "Day of the Week",
    ДЕНЬГОДА: "Day of the Year"
};
const daysOfWeek = {
    1: "Понедельник",
    2: "Вторник",
    3: "Среда",
    4: "Четверг",
    5: "Пятница",
    6: "Суббота",
    7: "Воскресенье"
};
const englishDaysOfWeek = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday"
};
class Translator {
    constructor(ast, language) {
        this.ast = ast;
        this.language = language; // Устанавливаем язык
    }
    translate() {
        if (this.ast instanceof ast_1.PresentFunctionNode) { // СЕЙЧАС()
            return this.language === 'ru' ? 'Текущий момент' : 'Current moment';
        }
        else if (this.ast instanceof ast_1.NowFunctionNode) { // ИЗВЛЕЧЬ(СЕЙЧАС()...)
            const { unit } = this.ast; // Извлекаем тип единицы из узла
            if (!unit) {
                throw new Error(this.language === 'ru' ? 'Не указана единица измерения для СЕЙЧАС()' : 'Unit of measurement for NOW() is not specified');
            }
            return this.translateNow(unit); // Передаем в метод translateNow
        }
        else if (this.ast instanceof ast_1.ExtractRegexFunctionNode) { // ИЗВЛЕЧЬ(Период, ...)
            const { unit } = this.ast;
            if (!unit) {
                throw new Error(this.language === 'ru' ? 'Не указана единица измерения для ИЗВЛЕЧЬ' : 'Unit of measurement for EXTRACT is not specified');
            }
            const abbreviation = this.language === 'ru' ? abbreviations[unit] : englishAbbreviations[unit]; // Получаем аббревиатуру из словаря
            if (!abbreviation) {
                throw new Error(this.language === 'ru' ? `Неизвестная единица измерения: ${unit}` : `Unknown unit of measurement: ${unit}`);
            }
            return abbreviation;
        }
        else if (this.ast instanceof ast_1.ExtractWithValueFunctionNode) { // ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
            const { period, unit, comparisonOperator, value } = this.ast;
            const comparisonPrefix = this.getComparisonPrefix(comparisonOperator !== null && comparisonOperator !== void 0 ? comparisonOperator : '');
            if (!value) {
                throw new Error(this.language === 'ru' ? 'Значение не указано' : 'Value is not specified');
            }
            return `${comparisonPrefix}${this.handleValue(unit, value)}`;
        }
        else if (this.ast instanceof ast_1.DateComparisonNode) { // Период = ДАТА(1992, 11, 26) 
            const { operator, year, month, day } = this.ast;
            const date = this.ast.formatDate();
            const comparisonPrefix = this.getComparisonPrefix(operator);
            return `${comparisonPrefix}${date}`;
        }
        else if (this.ast instanceof ast_1.DateFunctionNode) { // ДатаОбращения = ДАТА(1992, 11, 26) 
            const dateStr = this.ast.formatDate();
            const prefix = this.getComparisonPrefix(this.ast.operator); // Получаем префикс для оператора
            return this.language === 'ru' ? `Дата обращения: ` + prefix + `${dateStr}`.trim() : `Date of request: ` + prefix + `${dateStr}`.trim(); // Используем префикс в результате
        }
        else if (this.ast instanceof ast_1.StartOfPeriodNode) { // НАЧАЛОПЕРИОДА(Период, День) 
            const { unit } = this.ast;
            if (!unit) {
                throw new Error(this.language === 'ru' ? 'Не указана единица измерения для ИЗВЛЕЧЬ' : 'Unit of measurement for EXTRACT is not specified');
            }
            const abbreviation = this.language === 'ru' ? abbreviations[unit] : englishAbbreviations[unit]; // Получаем аббревиатуру из словаря
            if (!abbreviation) {
                throw new Error(this.language === 'ru' ? `Неизвестная единица измерения: ${unit}` : `Unknown unit of measurement: ${unit}`);
            }
            return this.language === 'ru' ? abbreviation + ` начала периода` : abbreviation + ` of the period's beginning`;
        }
        return '';
    }
    getComparisonPrefix(operator) {
        switch (operator) {
            case '<':
                return this.language === 'ru' ? "до " : "before ";
            case '>':
                return this.language === 'ru' ? "после " : "after ";
            case '>=':
                return this.language === 'ru' ? "с " : "after ";
            case '<=':
                return this.language === 'ru' ? "по " : "by ";
            case '=':
                return "";
            default:
                return "";
        }
    }
    translateNow(unit) {
        switch (unit) {
            case 'ГОД':
                return this.language === 'ru' ? "Текущий год" : "Current year";
            case 'КВАРТАЛ':
                return this.language === 'ru' ? "Текущий квартал" : "Current quarter";
            case 'МЕСЯЦ':
                return this.language === 'ru' ? "Текущий месяц" : "Current month";
            case 'НЕДЕЛЯ':
                return this.language === 'ru' ? "Текущая неделя" : "Current week";
            case 'ДЕНЬ':
                return this.language === 'ru' ? "Сегодня" : "Today";
            case 'ЧАС':
                return this.language === 'ru' ? "Текущий час" : "Current hour";
            case 'МИНУТА':
                return this.language === 'ru' ? "Текущая минута" : "Current minute";
            case 'СЕКУНДА':
                return this.language === 'ru' ? "Текущая секунда" : "Current second";
            case 'ДЕНЬНЕДЕЛИ':
                return this.language === 'ru' ? "Текущий день недели" : "Current day of the week";
            case 'ДЕНЬГОДА':
                return this.language === 'ru' ? "Текущий день года" : "Current day of the year";
            default:
                throw new Error(this.language === 'ru' ? `Неизвестная единица измерения: ${unit}` : `Unknown unit of measurement: ${unit}`);
        }
    }
    handleValue(unit, value) {
        switch (unit) {
            case 'ГОД':
                return this.language === 'ru' ? `${value} г.` : `${value} yr.`;
            case 'КВАРТАЛ':
                return this.language === 'ru' ? `${value} кв.` : `${value} qtr.`;
            case 'МЕСЯЦ':
                const months = this.language === 'ru'
                    ? ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
                    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return months[parseInt(value) - 1];
            case 'НЕДЕЛЯ':
                return this.language === 'ru' ? `${value} неделя` : `${value} week`;
            case 'ДЕНЬ':
                return this.language === 'ru' ? `${value} день` : `${value} day`;
            case 'ЧАС':
                return this.language === 'ru' ? `${value} час${this.getHourSuffix(parseInt(value))}` : `${value} hour${this.getHourSuffix(parseInt(value), 'en')}`;
            case 'МИНУТА':
                return this.language === 'ru' ? `${value} минут${this.getMinuteSuffix(parseInt(value))}` : `${value} minute${this.getMinuteSuffix(parseInt(value), 'en')}`;
            case 'СЕКУНДА':
                return this.language === 'ru' ? `${value} секунд${this.getSecondSuffix(parseInt(value))}` : `${value} second${this.getSecondSuffix(parseInt(value), 'en')}`;
            case 'ДЕНЬНЕДЕЛИ':
                return this.language === 'ru' ? daysOfWeek[parseInt(value)] || 'Неизвестный день недели' : englishDaysOfWeek[parseInt(value)] || 'Unknown day of the week';
            case 'ДЕНЬГОДА':
                const date = this.getDateFromDayOfYear(parseInt(value));
                return date;
            default:
                throw new Error(this.language === 'ru' ? `Неизвестная единица измерения: ${unit}` : `Unknown unit of measurement: ${unit}`);
        }
    }
    getYearSuffix(value) {
        if (value % 10 === 1 && value % 100 !== 11)
            return this.language === 'ru' ? "" : " year";
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20))
            return this.language === 'ru' ? "а" : " years";
        return this.language === 'ru' ? "ов" : " years";
    }
    getHourSuffix(value, lang = 'ru') {
        if (lang === 'ru') {
            if (value % 10 === 1 && value % 100 !== 11)
                return "";
            if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20))
                return "а";
            return "ов";
        }
        else {
            return value === 1 ? "" : "s"; // Для английского языка
        }
    }
    getMinuteSuffix(value, lang = 'ru') {
        if (lang === 'ru') {
            if (value % 10 === 1 && value % 100 !== 11)
                return "а";
            if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20))
                return "ы";
            return " минут";
        }
        else {
            return value === 1 ? " minute" : " minutes"; // Для английского языка
        }
    }
    getSecondSuffix(value, lang = 'ru') {
        if (lang === 'ru') {
            if (value % 10 === 1 && value % 100 !== 11)
                return "а";
            if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20))
                return "ы";
            return " секунд";
        }
        else {
            return value === 1 ? " second" : " seconds"; // Для английского языка
        }
    }
    getDateFromDayOfYear(dayOfYear) {
        const date = new Date(new Date().getFullYear(), 0);
        date.setDate(dayOfYear);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`; // Формат ДД.ММ
    }
    formatDate(year, month, day) {
        // Форматируем дату в формате ДД.ММ.ГГГГ
        return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
    }
}
exports.Translator = Translator;
