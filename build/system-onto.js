"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
class Place {
    constructor() {
        this.value = [];
    }
}
class Transition {
    constructor() {
        this.inFlows = [];
        this.outFlows = [];
        this.equations = [];
    }
}
class InFlow {
    constructor() {
        this.vars = [];
    }
}
class OutFlow {
    constructor() {
        this.vars = [];
    }
}
class Function {
    constructor() {
        this.rowList = [];
    }
}
class Tuple {
    constructor() {
        this.values = [];
    }
}
class Symbol {
    constructor() {
        this.value = new Map();
    }
}
const functionF = new Function();
functionF.name = "f";
var tuple = new Tuple();
tuple.values.push("shirt", "50Eur");
functionF.rowList.push(tuple);
const data = fs_1.default.readFileSync('src/data/system-initial.onto', 'utf8');
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of lines) {
    const words = line.split(' ');
    if (words == undefined || words.length < 3) {
        continue;
    }
    if (words[1].trim() === 'is-a') {
        symbolTable.set(words[0], {
            name: words[0],
            _type: words[2],
            value: new Map()
        });
    }
}
for (const line of lines) {
    const words = line.split(' ');
    if (words.length < 3 || words[1] === "is-a") {
        continue;
    }
    const ownerName = words[0].trim();
    const verb = words[1];
    const value = words[2];
    const ownerObject = symbolTable.get(ownerName);
    const valueObject = symbolTable.get(value);
    if (valueObject === undefined) {
        continue;
    }
    ownerObject.value.set(verb, valueObject);
}
const inFlows = new Map();
for (const line of lines) {
    const words = line.split(' ');
    if (words.length < 3 || words[1] === "is-a" || words[1] === "has") {
        continue;
    }
    const ownerName = words[0].trim();
    const verb = words[1];
    const value = words[2];
    const ownerObject = symbolTable.get(ownerName);
    const valueObject = symbolTable.get(value);
    if (ownerObject === undefined) {
        continue;
    }
    ownerObject.value.set(verb, valueObject);
}
myStringify(symbolTable);
function myStringify(symbol) {
    let string = '';
    for (const [key, value] of symbol.entries()) {
        string += JSON.stringify(key) + ': ' +
            JSON.stringify(value)
            + '\n';
        if (value.value == undefined || value.value.length == 0) {
            continue;
        }
        for (const [key2, value2] of value.value.entries()) {
            if (value2 == undefined) {
                continue;
            }
            string += JSON.stringify(key2) + ': ' +
                JSON.stringify(value)
                + '\n';
            if (value2.value == undefined || value2.value.length == 0) {
                continue;
            }
            for (const [key3, value3] of value2.value.entries()) {
                if (value3 == undefined) {
                    continue;
                }
                string += JSON.stringify(key3) + ': ' +
                    JSON.stringify(value)
                    + '\n\n';
            }
        }
    }
    return string;
}
//# sourceMappingURL=system-onto.js.map