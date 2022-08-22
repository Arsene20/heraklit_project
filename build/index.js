"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
let places = new Map();
class Place {
}
class Transition {
    constructor() {
        this.equations = [];
    }
}
class InFlow {
}
class OutFlow {
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
const data = fs_1.default.readFileSync('src/data/graph.onto', 'utf8');
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of lines) {
    const words = line.split(' ');
    if (words == undefined) {
        continue;
    }
    console.log(JSON.stringify(words, null, 3));
    if (words[1].trim() === 'is-a') {
        console.log(JSON.stringify(words[1], null, 3));
        // symbolTable.set(words[0], {
        //   name: words[0],
        //   _type: words[2],
        //   value: new Map()
        // });
        symbolTable.set("hello", new Symbol());
        console.log(JSON.stringify(symbolTable.get("hello"), null, 3));
    }
}
// console.log(JSON.stringify(symbolTable, null, 3));
// for (const line of  lines) {
//   const words = line.split(' ');
//     const ownerName = words[0].trim();
//     const verb = words[1];
//     const value = words[2];
//     const ownerObject: Symbol = symbolTable.get(ownerName);
//     const valueObject = symbolTable.get(value);
//     ownerObject.value.set(verb, valueObject);
// }
// const G = digraph('G', (g) => {
//   for(const [key, value] of symbolTable.entries()) {
//     if(value._type === 'place') {
//       for(const [key1, value1] of symbolTable.entries()) {
//         if(value._type === 'place') {
//         }
//       }
//     }
//   }
// });
// hpccWasm.graphvizSync().then(graphviz => {
//   const svg = graphviz.layout(toDot(G), "svg", "dot")
//   fs.writeFileSync('graph.svg', svg)
// });
// const dot = toDot
// (G);
// console.log(dot);
