"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
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
const functionF = new Function();
functionF.name = "f";
var tuple = new Tuple();
tuple.values.push("shirt", "50Eur");
functionF.rowList.push(tuple);
const data = fs_1.default.readFileSync('src/data/graph.onto', 'utf8');
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
    // console.log(symbolTable);
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
    ownerObject.value.set(verb, valueObject);
    console.log(ownerObject);
}
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    for (const [key, value] of symbolTable.entries()) {
        if (value._type === 'place') {
            // console.log(JSON.stringify(value, null, 3));
            const labelSymbol = value.value.get("has");
            var labelText = " ";
            if (labelSymbol) {
                if (labelSymbol._type === "tuple") {
                    for (const [key, value] of labelSymbol.value.entries()) {
                        labelText = labelText + " " + value.name;
                    }
                }
                else {
                    labelText = labelSymbol.name;
                }
            }
            g.createNode(value.name, { [ts_graphviz_1.attribute.label]: labelText });
        }
        else if (value._type === 'transition') {
            // console.log(JSON.stringify(value, null, 3));
            g.createNode(value.name, { [ts_graphviz_1.attribute.shape]: "box" });
        }
        else if (value._type === 'flow') {
            // console.log(JSON.stringify(value, null, 3));
            const src = value.value.get("src");
            const tgt = value.value.get("tgt");
            g.createEdge([src.name, tgt.name]);
        }
    }
});
hpccWasm.graphvizSync().then(graphviz => {
    const svg = graphviz.layout((0, ts_graphviz_1.toDot)(G), "svg", "dot");
    fs_1.default.writeFileSync('graph.svg', svg);
});
const dot = (0, ts_graphviz_1.toDot)(G);
console.log(dot);
//# sourceMappingURL=index.js.map