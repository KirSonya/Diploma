// translator.ts
import { ASTNode, ExtractWithValueFunctionNode, NowFunctionNode, PresentFunctionNode, ExtractRegexFunctionNode } from './ast';

const abbreviations: { [key: string]: string } = {
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

const daysOfWeek: { [key: number]: string } = {
    1: "Понедельник",
    2: "Вторник",
    3: "Среда",
    4: "Четверг",
    5: "Пятница",
    6: "Суббота",
    7: "Воскресенье"
};

export class Translator {
    private ast: ASTNode;

    constructor(ast: ASTNode) {
        this.ast = ast;
    }

    translate(): string {
        if (this.ast instanceof PresentFunctionNode) { // СЕЙЧАС()
            return 'Текущий момент';
        } else if (this.ast instanceof NowFunctionNode) { // ИЗВЛЕЧЬ(СЕЙЧАС()...)
            const { unit } = this.ast; // Извлекаем тип единицы из узла
            //console.log(unit); 
            if (!unit) {
                throw new Error('Не указана единица измерения для СЕЙЧАС()');
            }
            return this.translateNow(unit); // Передаем в метод translateNow
        } else if (this.ast instanceof ExtractRegexFunctionNode) { // ИЗВЛЕЧЬ(Период, ...)
            const { unit } = this.ast;
            if (!unit) {
                throw new Error('Не указана единица измерения для ИЗВЛЕЧЬ');
            }
            const abbreviation = abbreviations[unit]; // Получаем аббревиатуру из словаря
            if (!abbreviation) {
                throw new Error(`Неизвестная единица измерения: ${unit}`);
            }
            
            return abbreviation; 
        } else if (this.ast instanceof ExtractWithValueFunctionNode) { // ИЗВЛЕЧЬ(СЕЙЧАС(), ...)
            const { period, unit, comparisonOperator, value } = this.ast;
            const comparisonPrefix = this.getComparisonPrefix(comparisonOperator ?? '');
            /*console.log(period); 
            console.log(unit); 
            console.log(comparisonOperator); 
            console.log(value); */
            if (!value) {
                throw new Error('Значение не указано');
            }
            return `${comparisonPrefix}${this.handleValue(unit, value)}`;
        } 

        return '';
    }

    private getComparisonPrefix(operator: string): string {
        switch (operator) {
            case '<':
                return "до ";
            case '>':
                return "после ";
            case '>=':
                return "после ";
            case '<=':
                return "по ";
            case '=':
                return "";
            default:
                return "";
        }
    }

    private translateNow(unit: any) {
        switch (unit) {
            case 'ГОД':
                return "Текущий год";
            case 'КВАРТАЛ':
                return "Текущий квартал";
            case 'МЕСЯЦ':
                return "Текущий месяц";
            case 'НЕДЕЛЯ':
                return "Текущая неделя";
            case 'ДЕНЬ':
                return "Сегодня";
            case 'ЧАС':
                return "Текущий час";
            case 'МИНУТА':
                return "Текущая минута";
            case 'СЕКУНДА':
                return "Текущая секунда";
            case 'ДЕНЬНЕДЕЛИ':
                return "Текущий день недели";
            case 'ДЕНЬГОДА':
                return "Текущий день года";
            default:
                throw new Error(`Неизвестная единица измерения: ${unit}`);
        }
    }

    private handleValue(unit: string, value: string): string {
        switch (unit) {
            case 'ГОД':
                return `${value} г.`;
            case 'КВАРТАЛ':
                return `${value} кв.`;
            case 'МЕСЯЦ':
                const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
                return months[parseInt(value) - 1];
            case 'НЕДЕЛЯ':
                return `${value} неделя`;
            case 'ДЕНЬ':
                return `${value} день`;
            case 'ЧАС':
                return `${value} час${this.getHourSuffix(parseInt(value))}`;
            case 'МИНУТА':
                return `${value} минут${this.getMinuteSuffix(parseInt(value))}`;
            case 'СЕКУНДА':
                return `${value} секунд${this.getSecondSuffix(parseInt(value))}`;
            case 'ДЕНЬНЕДЕЛИ':
                return daysOfWeek[parseInt(value)] || 'Неизвестный день недели';
            case 'ДЕНЬГОДА':
                const date = this.getDateFromDayOfYear(parseInt(value));
                return date;
            default:
                throw new Error(`Неизвестная единица измерения: ${unit}`);
        }
    }

    private getYearSuffix(value: number): string {
        if (value % 10 === 1 && value % 100 !== 11) return "";
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) return "а";
        return "ов";
    }

    private getHourSuffix(value: number): string {
        if (value % 10 === 1 && value % 100 !== 11) return "";
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) return "а";
        return "ов";
    }

    private getMinuteSuffix(value: number): string {
        if (value % 10 === 1 && value % 100 !== 11) return "а";
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) return "ы";
        return " минут";
    }

    private getSecondSuffix(value: number): string {
        if (value % 10 === 1 && value % 100 !== 11) return "а";
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) return "ы";
        return " секунд";
    }

    private getDateFromDayOfYear(dayOfYear: number): string {
        const date = new Date(new Date().getFullYear(), 0);
        date.setDate(dayOfYear);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`; // Формат ДД.ММ
    }
}