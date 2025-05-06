"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const translator_1 = require("./translator");
// Примеры входных выражений для тестирования
const testFormulas = [
    "ИЗВЛЕЧЬ (Период, ГОД)",
    "ИЗВЛЕЧЬ (Период, КВАРТАЛ)",
    "ИЗВЛЕЧЬ (Период, МЕСЯЦ) < 6",
    "ИЗВЛЕЧЬ (Период, НЕДЕЛЯ) < 1",
    "ИЗВЛЕЧЬ (Период, ДЕНЬ) > 13",
    "ИЗВЛЕЧЬ (Период, ЧАС) < 1",
    "ИЗВЛЕЧЬ (Период, МИНУТА) < 1",
    "ИЗВЛЕЧЬ (Период, СЕКУНДА) > 1",
    "ИЗВЛЕЧЬ (Период, ДЕНЬНЕДЕЛИ)",
    "ИЗВЛЕЧЬ (Период, ДЕНЬГОДА) < 56"
    /*
  // Простые случаи
  "СЕЙЧАС()",
  "ИЗВЛЕЧЬ(Период, ГОД)",
  "ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)",
  "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)",
  "ДАТА(2024, 5, 15)",
  
  // Сравнения
  "ИЗВЛЕЧЬ(Период, ГОД) = 2024",
  "ИЗВЛЕЧЬ(Период, МЕСЯЦ) < 6",
  "Период <= ДАТА(2024, 12, 31)",
  
  // Логические операции
  "ИЗВЛЕЧЬ(Период, ГОД) = 2023 ИЛИ ИЗВЛЕЧЬ(Период, ГОД) = 2024",
  "ИЗВЛЕЧЬ(Период, ГОД) >= 2023 И ИЗВЛЕЧЬ(Период, МЕСЯЦ) <= 6",
  
  // Вложенные функции
  "ДОБАВИТЬ(ДАТА(2024, 1, 1), МЕСЯЦ, 3)",
  "НАЧАЛОПЕРИОДА(ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 7), НЕДЕЛЯ)",
  "НАЧАЛОПЕРИОДА(ДОБАВИТЬ(СЕЙЧАС(), ДЕНЬ, 7), ГОД)",
  "В(ИЗВЛЕЧЬ(Период, МЕСЯЦ), 1, 2, 3)",
  
  // Сложные случаи
  "ИЗВЛЕЧЬ(Период, ГОД, МЕСЯЦ) = 202405",
  "ДОБАВИТЬ(ДАТА(1992, 11, 26, 4, 30, 0), ЧАС, 2)" */
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
// Вывод заголовка
console.log('ТЕСТИРОВАНИЕ');
console.log(`Выбран язык: ${language === 'ru' ? 'Русский' : 'Английский'}\n`);
// Обработка и вывод результатов для каждой формулы
testFormulas.forEach((formula, index) => {
    console.log(`\n${'-'.repeat(60)}`);
    console.log(`ФОРМУЛА ${index + 1}: ${formula}`);
    try {
        const result = processFormula(formula, language);
        console.log(`\n${result}\n`);
    }
    catch (error) {
        console.error('❌ ОШИБКА:', error instanceof Error ? error.message : error);
    }
});
