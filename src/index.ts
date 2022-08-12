import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm')

const symbolTable = new Map();

const data = fs.readFileSync('data/graph.onto', 'utf8')

const lines = data.toString().replace(/\r\n/g,'\n').split('\n');
for (const line of lines) {
  const words = line.split(' ');

  if (words[1] === 'is-a') {
    // this is a declaration
      symbolTable.set(words[0], {_type: words[2]})
  }
}

// console.log(symbolTable)

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

