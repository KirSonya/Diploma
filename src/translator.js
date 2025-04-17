"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
class Translator {
    constructor(ast) {
        this.ast = ast;
    }
    translate() {
        return this.ast.map(node => this.translateNode(node)).join('\n');
    }
    translateNode(node) {
        switch (node.type) {
            case 'now':
                return 'Текущий момент';
            case 'extract':
                return this.translateExtract(node);
            case 'filter':
                return this.translateFilter(node);
            case 'add':
                return this.translateAdd(node);
            case 'unknown':
                return node.value;
            default:
                return '';
        }
    }
    translateExtract(node) {
        const periods = {
            ГОД: 'Год',
            КВАРТАЛ: 'Квартал',
            МЕСЯЦ: 'Месяц',
            НЕДЕЛЯ: 'Неделя',
            ДЕНЬ: 'День',
            ЧАС: 'Час',
            МИНУТА: 'Минута',
            СЕКУНДА: 'Секунда',
            ДЕНЬНЕДЕЛИ: 'День Недели',
            ДЕНЬГОДА: 'День Года'
        };
        if (periods[node.typeName]) {
            return `Извлечь ${node.period} как ${periods[node.typeName]}`;
        }
        return `Неизвестный узел: ${node.typeName}`;
    }
    translateFilter(node) {
        const left = this.translateNode(node.left);
        const right = this.translateNode(node.right);
        let operatorString = '';
        switch (node.operator) {
            case '=':
                operatorString = '=';
                break;
            case '<':
                operatorString = 'до';
                break;
            case '>':
                operatorString = 'после';
                break;
            case '<=':
                operatorString = 'по';
                break;
            case '>=':
                operatorString = 'после';
                break;
            default:
                operatorString = node.operator;
        }
        return `${left} ${operatorString} ${right}`;
    }
    translateAdd(node) {
        const left = this.translateNode(node.left);
        const unit = this.translateUnit(node.unit, node.amount);
        return `${left} + ${node.amount} ${unit}`;
    }
    translateUnit(unit, amount) {
        const units = {
            ГОД: 'год',
            КВАРТАЛ: 'квартал',
            МЕСЯЦ: 'месяц',
            НЕДЕЛЯ: 'неделя',
            ДЕНЬ: 'день',
            ЧАС: 'час',
            МИНУТА: 'минута',
            СЕКУНДА: 'секунда'
        };
        return units[unit] ? units[unit] : `неизвестная единица ${unit}`;
    }
}
exports.Translator = Translator;
