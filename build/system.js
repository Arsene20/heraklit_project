"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const bindingsList_1 = __importDefault(require("./bindingsList"));
const lodash_1 = __importDefault(require("lodash"));
const findFlows_1 = __importDefault(require("./findFlows"));
const objectsPlaces_1 = __importDefault(require("./objectsPlaces"));
const bindVariable_1 = __importDefault(require("./bindVariable"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
const bindings = [];
const bindingsList = new bindingsList_1.default();
const findFlows = new findFlows_1.default();
const objectsPlaces = new objectsPlaces_1.default();
const bindVariable = new bindVariable_1.default();
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
            inFlowsList = findFlows.findIncommingFlows(symbolTable, value.name);
            // Find outcomming flows
            outFlowsList = findFlows.findOutCommingFlows(symbolTable, value.name);
            for (let flow of inFlowsList) {
                bindOneInPutVariable(flow);
            }
            for (let flow of outFlowsList) {
                bindVariable.bindOneOutputVariable(symbolTable, flow);
            }
            bindings = bindingsList.bindings;
            console.log(bindings);
            doAllBindings(symbolTable, bindings, value.name);
        }
    }
    // const binds = bindingsList.bindings;
    // console.log(bindings);
}
function doAllBindings(symbolTable, bindings, transitionName) {
    for (const currentbinding of bindings) {
        const symbolTableClone = lodash_1.default.cloneDeep(symbolTable);
        // Find incomming flows
        let inFlowsList = findFlows.findIncommingFlows(symbolTable, transitionName);
        // Find outcomming flows
        let outFlowsList = findFlows.findOutCommingFlows(symbolTable, transitionName);
        // remove objects from input places
        for (let flow of inFlowsList) {
            objectsPlaces.removeObjectFromInputPlace(symbolTable, flow);
        }
        // add objects to the output places
        for (let flow of outFlowsList) {
            objectsPlaces.addObjectToOutputPlace(symbolTableClone, currentbinding, flow);
        }
        // write new systemState
        // draw svg
        // extend reachability graph
    }
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
                            labelText = labelText + " " + valueTuple.name;
                        }
                    }
                    else {
                        labelText = labelText + " " + labelSymbol[i].name;
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