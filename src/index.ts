// index.ts
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Translator } from './translator';
import chalk from 'chalk'; // библиотека для цветного вывода

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
]

// Выбор языка: 'ru' или 'en'
const language: 'ru' | 'en' = 'en';

// Функция для обработки одной формулы
export function processFormula(formula: string, lang: 'ru' | 'en' = 'en'): string {
  try {
    // 1. Токенизация
    const tokenizer = new Tokenizer(formula);
    const tokens = tokenizer.tokenize();
    
    // 2. Парсинг
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    // 3. Трансляция
    const translator = new Translator(lang);
    return translator.translate(ast);
    
  } catch (error) {
    throw new Error(`Ошибка обработки формулы: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Функция для вывода разделителя
const printSeparator = () => {
  console.log(chalk.gray('═'.repeat(60)));
};

// Функция для вывода заголовка теста
const printTestHeader = (index: number, formula: string) => {
  printSeparator();
  console.log(chalk.gray(` 🧪 ТЕСТ ${index + 1}`));
  console.log(chalk(`Формула: ${formula}`));
};

// Функция для вывода результата
const printSuccessResult = (result: string) => {
  console.log(chalk.gray('✔ Результат:'));
  console.log(chalk.bold(`  ${result}`));
};

const printError = (error: unknown) => {
  console.log(chalk.red('❌ Ошибка:'));
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string'
      ? error
      : 'Неизвестная ошибка';
  console.log(chalk.redBright(`  ${errorMessage}`));
};

console.log(chalk.bold.green('\n════════════════════ ТЕСТИРОВАНИЕ БИБЛИОТЕКИ ════════════════════'));

// блок обработки ошибок в forEach
testFormulas.forEach((formula, index) => {
  printTestHeader(index, formula);
  
  try {
    const result = processFormula(formula, language);
    printSuccessResult(result);
  } catch (error: unknown) {
    printError(error);
  }
});

printSeparator();
console.log(chalk.bold.green('════════════════════ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ════════════════════\n'));