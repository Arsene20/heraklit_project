"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const bindingsList_1 = __importDefault(require("./bindingsList"));
const symbol_model_1 = __importDefault(require("./Model/symbol.model"));
const lodash_1 = __importDefault(require("lodash"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
const bindings = [];
const bindingsList = new bindingsList_1.default();
const bindingsVariables = [];
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
        if (valueObject === undefined || ownerObject === undefined) {
            continue;
        }
        const oldValue = ownerObject.value.get(verb);
        if (!oldValue) {
            ownerObject.value.set(verb, valueObject);
        }
        else if (oldValue instanceof Array) {
            oldValue.push(valueObject);
        }
        else {
            const listOfSymbol = [];
            listOfSymbol.push(oldValue, valueObject);
            ownerObject.value.set(verb, listOfSymbol);
        }
    }
}
function doOneTransition(symbolTable, bindings) {
    var inFlowsList = [];
    var outFlowsList = [];
    // Search for transition
    for (const [key, value] of symbolTable.entries()) {
        if (!Array.isArray(value) && value._type === 'transition') {
            console.log('transition : ' + value.name);
            // Find incomming flows
            inFlowsList = findIncommingFlows(symbolTable, value.name);
            // Find outcomming flows
            outFlowsList = findOutCommingFlows(symbolTable, value.name);
            for (let flow of inFlowsList) {
                bindOneInPutVariable(flow);
            }
            for (let flow of outFlowsList) {
                bindOneOutputVariable(symbolTable, flow);
            }
            bindings = bindingsList.bindings;
            console.log(bindings);
            // remove objects from input places
            for (let flow of inFlowsList) {
                // removeObjectFromInputPlace(symbolTable, flow);
            }
            // add objects to the output places
            for (let flow of outFlowsList) {
                addObjectToOutputPlace(symbolTable, bindings, flow);
            }
            // write new systemState
            // draw svg
            // extend reachability graph
        }
    }
    // const binds = bindingsList.bindings;
    // console.log(bindings);
}
function bindOneInPutVariable(flow) {
    const vars = flow.value.get('var');
    const place = flow.value.get('src');
    let objectList = [];
    if (Array.isArray(place.value.get('has'))) {
        objectList = place.value.get('has');
    }
    else {
        objectList.push(place.value.get('has'));
    }
    bindingsList.expand(vars.name, objectList, symbolTable);
}
function bindOneOutputVariable(symbolTable, flow) {
    const vars = flow.value.get('var');
    bindingsList.expandBySymbolTable(vars, symbolTable);
    // if(vars._type === 'tuple') {
    //   const newTuple: Symbol = new Symbol();
    //   newTuple.name = flow.name + 'vt';
    //   newTuple._type = 'tuple';
    // }
}
function removeObjectFromInputPlace(symbolTable, flow) {
    // find the source flows
    const place = flow.value.get('src');
    if (place._type === 'place') {
        //find the object of place
        const symbolTableObject = symbolTable.get(place.name);
        symbolTableObject.value.delete('has');
    }
}
function addObjectToOutputPlace(symbolTable, bindings, flow) {
    let vars = flow.value.get('var');
    let place = flow.value.get('tgt');
    var symbolTableObject = symbolTable.get(place.name);
    var substringContent = vars.name.substring(1, 3);
    let symbolVariables = new symbol_model_1.default();
    symbolVariables.value = new Map();
    symbolVariables = lodash_1.default.cloneDeep(symbolTable.get(substringContent));
    symbolVariables = vars;
    symbolVariables.name = substringContent;
    const symbolVar = symbolVariables.value;
    const symbolTableObj = symbolTableObject.value.get('has');
    symbolTableObj.value = symbolVar;
    setVariablesWithValues(bindings, symbolTable);
    console.log(symbolTableObject);
}
function setVariablesWithValues(bindings, symbolTable) {
    for (const [key, value] of symbolTable.entries()) {
        const valueSymbol = value;
        if (valueSymbol._type === 'place') {
            const labelSymbol = valueSymbol.value.get("has");
            if (labelSymbol) {
                if (labelSymbol._type === "tuple") {
                    for (const [key1, value1] of labelSymbol.value.entries()) {
                        const valueTuple = value1;
                        setValue(bindings, labelSymbol, valueTuple.name, key1);
                    }
                }
                else {
                    setValue(bindings, labelSymbol, labelSymbol.name, key);
                }
            }
        }
    }
}
function setValue(bindings, labelSymbol, variable, key) {
    const labelSymbol1 = labelSymbol;
    if (labelSymbol) {
        if (labelSymbol._type === "tuple") {
            for (const bindingsMap of bindings) {
                const labelSymbolValue = labelSymbol.value.get(key);
                if (labelSymbolValue === undefined) {
                    continue;
                }
                labelSymbolValue.name = bindingsMap.get(variable);
            }
        }
        else {
            for (const bindingsMap of bindings) {
                labelSymbol1.name = bindingsMap.get(variable);
            }
        }
    }
}
function findIncommingFlows(symbolTable, transitionName) {
    const result = [];
    for (const [key, value] of symbolTable.entries()) {
        if (Array.isArray(value)) {
            continue;
        }
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
        if (Array.isArray(value)) {
            continue;
        }
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
doOneTransition(symbolTable, bindings);
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    for (const [key, value] of symbolTable.entries()) {
        if (value._type === 'place') {
            const labelSymbol = value.value.get("has");
            var labelText = " ";
            if (labelSymbol) {
                for (let i = 0; i < labelSymbol.length; i++) {
                    if (labelSymbol[i]._type === "tuple") {
                        for (const [key, value] of labelSymbol[i].value.entries()) {
                            const valueTuple = value;
                            if (bindings.length === 0) {
                                labelText = labelText + " " + valueTuple.name;
                            }
                            else {
                                for (const valueVar of bindings) {
                                    labelText = labelText + " " + valueVar.get(valueTuple.name);
                                }
                            }
                        }
                    }
                    else {
                        if (bindings.length === 0) {
                            labelText = labelText + " " + labelSymbol[i].name;
                        }
                        else {
                            for (const valueVar of bindings) {
                                labelText = labelText + " " + valueVar.get(labelSymbol[i].name);
                            }
                        }
                    }
                }
            }
            g.createNode(value.name, { [ts_graphviz_1.attribute.label]: labelText });
        }
        else if (value._type === 'transition') {
            g.createNode(value.name, { [ts_graphviz_1.attribute.shape]: "box" });
        }
        else if (value._type === 'flow') {
            const src = value.value.get("src");
            const tgt = value.value.get("tgt");
            const varElements = value.value.get("var");
            var label = '';
            if (varElements._type === 'tuple') {
                for (const [key, value] of varElements.value.entries()) {
                    const valueTuple = value;
                    if (label != '') {
                        label += ', ' + valueTuple.name;
                    }
                    else {
                        label += valueTuple.name;
                    }
                }
                g.createEdge([src.name, tgt.name], { [ts_graphviz_1.attribute.label]: '(' + label + ')' });
            }
            else {
                g.createEdge([src.name, tgt.name], { [ts_graphviz_1.attribute.label]: varElements.name });
            }
        }
        // console.log(JSON.stringify(outFlow, null, 3));
    }
});
hpccWasm.graphvizSync().then(graphviz => {
    const svg = graphviz.layout((0, ts_graphviz_1.toDot)(G), "svg", "dot");
    fs_1.default.writeFileSync('system_graph_1.svg', svg);
});
const dot = (0, ts_graphviz_1.toDot)(G);
// console.log(dot);
//# sourceMappingURL=system.js.map