import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm')

const symbolTable = new Map();

const data = fs.readFileSync('data/graph.onto', 'utf8')

// first read, just find all objects and their types
const lines = data.toString().replace(/\r\n/g,'\n').split('\n');
for (const line of lines) {
  const words = line.split(' ');

  if (words[1] === 'is-a') {
    // this is a declaration
      symbolTable.set(words[0], {_type: words[2]})
  }
}

// second read, find values
for (const line of lines) {
  const words = line.split(' ');

  if (words[1] === 'has') {
    // this is a declaration
    const ownerName = words[0];
    const value = words[2];
    const ownerObject = symbolTable.get(ownerName);
    ownerObject['has'] = value
    console.log("hello")
  }
}

console.log(symbolTable)

const G = digraph('G', (g) => {
  // console.log(symbolTable)

  for (const [key, value] of symbolTable.entries()) {
    if (value._type === 'place') {
      console.log(value)
      g.node(key);
    }
  }
})

// Print the dot script
const dot = toDot(G);
console.log( dot );

hpccWasm.graphvizSync().then(graphviz => {
  const svg = graphviz.layout(toDot(G), "svg", "dot")
  fs.writeFileSync('graph.svg', svg)
});

// Set GraphViz path (if not in your path)
// g.setGraphVizPath( "/usr/local/bin" );
// Generate a PNG output
// G.output( "png", "test01.png" );

