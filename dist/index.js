"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFormula = processFormula;
// index.ts
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const translator_1 = require("./translator");
const chalk_1 = __importDefault(require("chalk")); // библиотека для цветного вывода
// Примеры входных выражений для тестирования
const testFormulas = [
    "СЕЙЧАС ()",
    "ИЗВЛЕЧЬ (Период, ГОД)",
    "ИЗВЛЕЧЬ (СЕЙЧАС(), НЕДЕЛЯ)",
    "ИЗВЛЕЧЬ (Период, ДЕНЬНЕДЕЛИ) = 1",
    "ИЗВЛЕЧЬ (Период, СЕКУНДА) >= 1",
    "ИЗВЛЕЧЬ(Период, ДЕНЬГОДА) < ИЗВЛЕЧЬ(СЕЙЧАС(), ДЕНЬГОДА)",
    "ДАТА(2017, 01, 01)",
    "Период <= ДАТА(2017, 01, 01)",
    "НАЧАЛОПЕРИОДА(Период, СЕКУНДА)",
    "Период = НАЧАЛОПЕРИОДА(Период, МИНУТА)",
    "НАЧАЛОПЕРИОДА(ДАТА(2017, 01, 01, 4, 12, 34), ДЕНЬНЕДЕЛИ)",
    "КОНЕЦПЕРИОДА(ДАТА(2017, 01, 01, 4, 12, 34), КВАРТАЛ)",
    "В(ИЗВЛЕЧЬ(Период, МИНУТА), 1, 2, 3, 5, 10, 11, 12)",
    "В(ИЗВЛЕЧЬ(Период, ГОД, МЕСЯЦ, ДЕНЬ), 20170101, 20170102)",
    "ИЗВЛЕЧЬ(Период, ДЕНЬ) = 12 ИЛИ ИЗВЛЕЧЬ(Период, ДЕНЬ) = 23",
    "ИЗВЛЕЧЬ(Период, ДЕНЬ) = 12 И  ИЗВЛЕЧЬ(Период, ДЕНЬ) = 23",
    "ДОБАВИТЬ(СЕЙЧАС(), ГОД, 1)",
    "ДОБАВИТЬ(ДАТА(2017,11,26,4,30,0), ГОД, 1)"
];
// Выбор языка: 'ru' или 'en'
const language = 'en';
// Функция для обработки одной формулы
function processFormula(formula, lang = 'en') {
    try {
        // 1. Токенизация
        const tokenizer = new tokenizer_1.Tokenizer(formula);
        const tokens = tokenizer.tokenize();
        // 2. Парсинг
        const parser = new parser_1.Parser(tokens);
        const ast = parser.parse();
        // 3. Трансляция
        const translator = new translator_1.Translator(lang);
        return translator.translate(ast);
    }
    catch (error) {
        throw new Error(`Ошибка обработки формулы: ${error instanceof Error ? error.message : String(error)}`);
    }
}
// Функция для вывода разделителя
const printSeparator = () => {
    console.log(chalk_1.default.gray('═'.repeat(60)));
};
// Функция для вывода заголовка теста
const printTestHeader = (index, formula) => {
    printSeparator();
    console.log(chalk_1.default.gray(` 🧪 ТЕСТ ${index + 1}`));
    console.log((0, chalk_1.default)(`Формула: ${formula}`));
};
// Функция для вывода результата
const printSuccessResult = (result) => {
    console.log(chalk_1.default.gray('✔ Результат:'));
    console.log(chalk_1.default.bold(`  ${result}`));
};
const printError = (error) => {
    console.log(chalk_1.default.red('❌ Ошибка:'));
    const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
            ? error
            : 'Неизвестная ошибка';
    console.log(chalk_1.default.redBright(`  ${errorMessage}`));
};
console.log(chalk_1.default.bold.green('\n════════════════════ ТЕСТИРОВАНИЕ БИБЛИОТЕКИ ════════════════════'));
// блок обработки ошибок в forEach
testFormulas.forEach((formula, index) => {
    printTestHeader(index, formula);
    try {
        const result = processFormula(formula, language);
        printSuccessResult(result);
    }
    catch (error) {
        printError(error);
    }
});
printSeparator();
console.log(chalk_1.default.bold.green('════════════════════ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ════════════════════\n'));
