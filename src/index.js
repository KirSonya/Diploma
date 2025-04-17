"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const translator_1 = require("./translator");
const input = "ИЗВЛЕЧЬ(СЕЙЧАС(), ГОД) = 2021"; // Пример входного выражения
const parser = new parser_1.Parser(input);
const ast = parser.parse();
const translator = new translator_1.Translator(ast);
const output = translator.translate();
console.log(output);
