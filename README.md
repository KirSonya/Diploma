# Выпускная Квалификационная Работа
## На тему: Библиотека для сворачивания формул аналитической отчетности в естественное описание на русском и английском языках

Библиотека для сворачивания формул аналитической отчетности в естественное описание на русском и английских языках создана для упрощения работы пользователей приложения «1С: Аналитика». В частности, библиотека преобразовывает заданные формулы формата «1С: Аналитика» в более доступные и понятные выражения на человеческом языке, что упрощает работу сотрудников, и используется в таблицах и отчетах. Практическая значимость проекта заключается в автоматизации и упрощении создания заголовков столбцов таблиц, также отчетов, что в свою очередь уменьшает вероятность возникновения ошибок при интерпретации данных и экономит время сотрудников. В процессе создания библиотеки были применены технологии токенизации заданной формулы, рекурсивного парсинга для преобразования формул в абстрактное синтаксическое дерево (AST), а также разработаны методы обхода этого дерева (транслятор) с целью получения финальных текстовых описаний. В будущем данная библиотека будет встроена в сервис «1С: Аналитика». 

## Открытие и запуск библиотеки:
1. Скачать код данного репозитория
2. Открыть проект в редакторе кода (Рекомендуемо - Visual Studio Code)
3. Для сборки проекта ввести команду в терминал:
`npm run build`
### Запуск библиотеки 
1. Для запуска работы билилотеки ввести в терминал `npm start`
2. Для смены языка в файле "index.ts" изменить язык в соедующих строчках:   
`// Выбор языка: 'ru' или 'en'
const language: 'ru' | 'en' = 'ru';`  
`export function processFormula(formula: string, lang: 'ru' | 'en' = 'ru'): string`  

### Тестирование библиотеки
Тесты для проверки корректности работы библиотеки хранятся в файлах с расширением `test.ts`
Для тестирования ввести в терминал:
1. `npx jest src/index.test.ts` - проверка корректности обработки формул в целом через функцию из файла index.ts  
2. `npx jest src/tokenizer.test.ts` - тестирование токенизатора  
3. `npx jest src/ast.test.ts` - тестирование АСТ  
4. `npx jest src/parser.test.ts` - тестирование парсера   
5. `npx jest src/translator.test.ts` - тестирование транслятора  
6. `npx jest src/formula.test.ts` - проверка корректности обработки ошибок и обработки формул в целом  
7. `npx jest src/perfomance.test.ts` - тестирование производителбности   