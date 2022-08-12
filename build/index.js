"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
const data = fs_1.default.readFileSync('data/graph.onto', 'utf8');
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of lines) {
    const words = line.split(' ');
    if (words[1] === 'is-a') {
        // this is a declaration
        symbolTable.set(words[0], { _type: words[2] });
    }
}
// console.log(symbolTable)
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    // console.log(symbolTable)
    for (const [key, value] of symbolTable.entries()) {
        if (value._type === 'place') {
            console.log(value);
            g.node(key);
        }
    }
});
// Print the dot script
const dot = (0, ts_graphviz_1.toDot)(G);
console.log(dot);
hpccWasm.graphvizSync().then(graphviz => {
    const svg = graphviz.layout((0, ts_graphviz_1.toDot)(G), "svg", "dot");
    fs_1.default.writeFileSync('graph.svg', svg);
});
// Set GraphViz path (if not in your path)
// g.setGraphVizPath( "/usr/local/bin" );
// Generate a PNG output
// G.output( "png", "test01.png" );
