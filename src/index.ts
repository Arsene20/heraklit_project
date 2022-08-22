import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();

class Place {
  name: string
  value: any[]
}

class Transition {
  name: string
  inFlows: InFlow[];
  outFlows: OutFlow[];
  equations: Tuple[] = []
}

class InFlow {
  src: Place
  tgt: Transition
  vars: string[]
}

class OutFlow {
  src: Transition
  tgt: Place
  vars: string[]
}

class Function {
  name: string
  rowList: Tuple[] = []
}

class Tuple {
  values: string[] = []
}

class Symbol {
  name: string
  _type: string
  value: Map<string, Symbol> = new Map()
}

const data = fs.readFileSync('src/data/graph.onto', 'utf8');

const lines = data.toString().replace(/\r\n/g, '\n').split('\n');


for (const line of  lines) {

  const words = line.split(' ');
  if(words == undefined || words.length < 3) {
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

for (const line of  lines) {

  const words = line.split(' ');

  if(words.length < 3 || words[1] === "is-a") {
    continue;
  }

  const ownerName = words[0].trim();
  const verb = words[1]; 
  const value = words[2];

  const ownerObject: Symbol = symbolTable.get(ownerName);
  const valueObject = symbolTable.get(value);

  ownerObject.value.set(verb, valueObject);

  console.log(ownerObject);

}

const G = digraph('G', (g) => {

  for(const [key, value] of symbolTable.entries()) {

    if(value._type === 'place') {

      // console.log(JSON.stringify(value, null, 3));
      const labelSymbol = value.value.get("has");
      var labelText = " ";
      if(labelSymbol) {
        if (labelSymbol._type === "tuple") {
          for(const [key, value] of labelSymbol.value.entries()) {
            labelText = labelText + " " + value.name;   
          }
        }
        else {
          labelText = labelSymbol.name;
        }
      }
      g.createNode(value.name, {[attribute.label]: labelText});
      
    }
    else if(value._type === 'transition') {

      // console.log(JSON.stringify(value, null, 3));

      g.createNode(value.name, {[attribute.shape]: "box"});
      
    }
    else if(value._type === 'flow') {

      // console.log(JSON.stringify(value, null, 3));

      const src = value.value.get("src");
      const tgt = value.value.get("tgt");
      g.createEdge([src.name, tgt.name]);
      
    }


  }
});

hpccWasm.graphvizSync().then(graphviz => {
  const svg = graphviz.layout(toDot(G), "svg", "dot")
  fs.writeFileSync('graph.svg', svg)
});


const dot = toDot
(G);
console.log(dot);


