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
    "ИЗВЛЕЧЬ (СЕЙЧАС(), КВАРТАЛ)",
    "ИЗВЛЕЧЬ (Период, ДЕНЬНЕДЕЛИ) = 1",
    "ИЗВЛЕЧЬ(Период, ДЕНЬ) < ИЗВЛЕЧЬ(СЕЙЧАС(), ДЕНЬ)",
    "ДАТА(2017, 01, 01)",
    "Период > ДАТА(2017, 01, 01)",
    "НАЧАЛОПЕРИОДА(Период, НЕДЕЛЯ)",
    "Период = НАЧАЛОПЕРИОДА(Период, КВАРТАЛ)",
    "НАЧАЛОПЕРИОДА(ДАТА(2017, 01, 01, 4, 12, 34), КВАРТАЛ)",
    "КОНЕЦПЕРИОДА (ДАТА(2017, 01, 01, 4, 12, 34), СЕКУНДА)",
    "В(ИЗВЛЕЧЬ(Период, МИНУТА), 1, 2, 3, 5, 10, 11, 12)",
    "В(ИЗВЛЕЧЬ(Период, ГОД, МЕСЯЦ, ДЕНЬ, ЧАС, МИНУТА, СЕКУНДА), 20170101010101, 20170101010102)",
    "ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 1 ИЛИ ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 3",
    "ИЗВЛЕЧЬ(Период, ГОД) = 2017 И ИЗВЛЕЧЬ(Период, МЕСЯЦ) = 3",
    "ДОБАВИТЬ(СЕЙЧАС(), ЧАС, 3)",
    "ДОБАВИТЬ(ДАТА(2017,11,26,4,30,0), ЧАС, 1)",
    "ИЗВЛЕЧЬ (Период, ГОД, МЕСЯЦ, ДЕНЬ) = 20250101"
];
// Выбор языка: 'ru' или 'en'
const language = 'ru';
// Функция для обработки одной формулы
function processFormula(formula, lang = 'ru') {
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
// Главный заголовок
console.log(chalk_1.default.bold.green('\n════════════════════ ТЕСТИРОВАНИЕ БИБЛИОТЕКИ ════════════════════'));
//console.log(`Выбран язык: ${language === 'ru' ? 'Русский' : 'Английский'}\n`);
// Обновленный блок обработки ошибок в forEach
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
// Финальный разделитель
printSeparator();
console.log(chalk_1.default.bold.green('════════════════════ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ════════════════════\n'));
// Вывод заголовка
/*console.log('ТЕСТИРОВАНИЕ');
console.log(`Выбран язык: ${language === 'ru' ? 'Русский' : 'Английский'}\n`);

// Обработка и вывод результатов для каждой формулы
testFormulas.forEach((formula, index) => {
  console.log(`\n${'-'.repeat(60)}`);
  console.log(`ФОРМУЛА ${index + 1}: ${formula}`);
  
  try {
    const result = processFormula(formula, language);
    console.log(`\n${result}\n`);
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error instanceof Error ? error.message : error);
  }
});*/ 
