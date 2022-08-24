"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
const placeTable = new Map();
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
const data = fs_1.default.readFileSync('src/data/system.onto', 'utf8');
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
setSymbolTableByReadingFile(lines);
function setSymbolTableByReadingFile(lines) {
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
}
setValueOfPlaceInSymboleTable(lines);
function setValueOfPlaceInSymboleTable(lines) {
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
}
function doOneTransition(symbolTable) {
    var inFlowsList = [];
    var outFlowsList = [];
    const bindings = new Map();
    // Search for transition
    for (const [key, value] of symbolTable.entries()) {
        if (value._type === 'transition') {
            console.log('transition : ' + value.name);
            // Find incomming flows
            inFlowsList = findIncommingFlows(symbolTable, value.name);
            // Find outcomming flows
            outFlowsList = findOutCommingFlows(symbolTable, value.name);
            // 
            for (let flow of inFlowsList) {
                bindOneVariable(bindings, flow, 'var', 'src', 'has');
            }
            // for(let flow of outFlowsList) {
            //   bindOneVariable(bindings, flow, 'var', 'tgt', 'has');
            // }
        }
    }
    console.log(bindings);
}
function bindOneVariable(bindings, flow, variable, typeFlow, subject) {
    // const vars: Symbol = flow.value.get('var');
    // const place: Symbol = flow.value.get('src');
    // const object: Symbol = place.value.get('has');
    const vars = flow.value.get(variable);
    const place = flow.value.get(typeFlow);
    const object = place.value.get(subject);
    bindings.set(vars.name, object);
}
function bindMultipleVariable(bindings, flow, variable, typeFlow, subject) {
    // const vars: Symbol = flow.value.get('var');
    // const place: Symbol = flow.value.get('src');
    // const object: Symbol = place.value.get('has');
    const vars = flow.value.get(variable);
    const place = flow.value.get(typeFlow);
    const object = place.value.get(subject);
    bindings.set(vars.name, object);
}
function findIncommingFlows(symbolTable, transitionName) {
    const result = [];
    for (const [key, value] of symbolTable.entries()) {
        if (value._type != 'flow') {
            continue;
        }
        const tgt = value.value.get('tgt');
        if (tgt._type === 'transition' && tgt.name === transitionName) {
            result.push(value);
        }
    }
    return result;
}
function findOutCommingFlows(symbolTable, transitionName) {
    const result = [];
    for (const [key, value] of symbolTable.entries()) {
        if (value._type != 'flow') {
            continue;
        }
        const tgt = value.value.get('src');
        if (tgt._type === 'transition' && tgt.name === transitionName) {
            result.push(value);
        }
    }
    return result;
}
doOneTransition(symbolTable);
// console.log(myStringify(symbolTable));
// function myStringify(symbol: any): string {
//   let string = '';
//   for (const [key, value] of symbol.entries()) {
//     string += "" + key + ': ' + 
//     JSON.stringify(value) 
//     + '\n';
//     if (value.value == undefined || value.value.length == 0 ){
//       continue;
//     }
//     for (const [key2, value2] of value.value.entries()) {
//       if (value2 == undefined){
//         continue;
//       }
//       string += JSON.stringify(key2) + ': ' + 
//       JSON.stringify(value) 
//       + '\n';
//       if (value2.value == undefined || value2.value.length == 0 ){
//         continue;
//       }
//       for (const [key3, value3] of value2.value.entries()) {
//         if (value3 == undefined){
//           continue;
//         }
//         string += JSON.stringify(key3) + ': ' + 
//         JSON.stringify(value) 
//         + '\n\n';
//       }     
//     }
//   }
//   return string;
// }
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    for (const [key, value] of symbolTable.entries()) {
        const intFlow = new InFlow();
        const outFlow = new OutFlow();
        const place = new Place();
        const transition = new Transition();
        if (value._type === 'place') {
            place.name = value.name;
            const labelSymbol = value.value.get("has");
            var labelText = " ";
            if (labelSymbol) {
                if (labelSymbol._type === "tuple") {
                    for (const [key, value] of labelSymbol.value.entries()) {
                        labelText = labelText + " " + value.name;
                        place.value.push(value.name);
                    }
                }
                else {
                    place.value.push(labelSymbol.name);
                    labelText = labelSymbol.name;
                }
                // const words = labelText.split(' ').filter(item => item != '');
                // tuple.values = words;
                // console.log(JSON.stringify(tuple, null, 3));
            }
            // console.log(place);
            g.createNode(value.name, { [ts_graphviz_1.attribute.label]: labelText });
        }
        else if (value._type === 'transition') {
            transition.name = value.name;
            g.createNode(value.name, { [ts_graphviz_1.attribute.shape]: "box" });
        }
        else if (value._type === 'flow') {
            // console.log(value);
            const src = value.value.get("src");
            const tgt = value.value.get("tgt");
            intFlow.src = {
                name: src.name,
                value: []
            };
            intFlow.tgt = {
                name: tgt.name,
                inFlows: [],
                outFlows: [],
                equations: [] = []
            };
            outFlow.src = {
                name: tgt.name,
                inFlows: [],
                outFlows: [],
                equations: [] = []
            };
            outFlow.tgt = {
                name: src.name,
                value: []
            };
            // const transition1: Transition = transition;
            transition.inFlows.push(intFlow);
            transition.outFlows.push(outFlow);
            // console.log(transition);
            g.createEdge([src.name, tgt.name]);
        }
        // console.log(JSON.stringify(outFlow, null, 3));
    }
});
hpccWasm.graphvizSync().then(graphviz => {
    const svg = graphviz.layout((0, ts_graphviz_1.toDot)(G), "svg", "dot");
    fs_1.default.writeFileSync('graph.svg', svg);
});
const dot = (0, ts_graphviz_1.toDot)(G);
// console.log(dot);
//# sourceMappingURL=system.js.map