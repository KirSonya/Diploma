// index.ts
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Translator } from './translator';

// Примеры входных выражений для тестирования
const testFormulas = [
    "ИЗВЛЕЧЬ(Период, ГОД) < ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД)",
    "ИЗВЛЕЧЬ(Период, КВАРТАЛ) <= ИЗВЛЕЧЬ(СЕЙЧАС(), КВАРТАЛ)",
    "ИЗВЛЕЧЬ(Период, МЕСЯЦ) < ИЗВЛЕЧЬ(СЕЙЧАС(), МЕСЯЦ)",
    "ИЗВЛЕЧЬ(Период, НЕДЕЛЯ) <= ИЗВЛЕЧЬ(СЕЙЧАС(), НЕДЕЛЯ)",
    "ИЗВЛЕЧЬ(Период, ДЕНЬ) < ИЗВЛЕЧЬ(СЕЙЧАС(), ДЕНЬ)",
    "ИЗВЛЕЧЬ(Период, ЧАС) <= ИЗВЛЕЧЬ(СЕЙЧАС(), ЧАС)",
    "ИЗВЛЕЧЬ(Период, МИНУТА) < ИЗВЛЕЧЬ(СЕЙЧАС(), МИНУТА)",
    "ИЗВЛЕЧЬ(Период, СЕКУНДА) <= ИЗВЛЕЧЬ(СЕЙЧАС(), СЕКУНДА)",
    "ИЗВЛЕЧЬ(Период, ДЕНЬНЕДЕЛИ) < ИЗВЛЕЧЬ(СЕЙЧАС(), ДЕНЬНЕДЕЛИ)",
    "ИЗВЛЕЧЬ(Период, ДЕНЬГОДА) <= ИЗВЛЕЧЬ(СЕЙЧАС(), ДЕНЬГОДА)"
]

// Выбор языка: 'ru' или 'en'
const language: 'ru' | 'en' = 'ru';

// Функция для обработки одной формулы
export function processFormula(formula: string, lang: 'ru' | 'en' = 'ru'): string {
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
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error instanceof Error ? error.message : error);
  }
});