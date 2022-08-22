import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();

class Place {
  name: string
  value: any[] = []
}

class Transition {
  name: string
  inFlows: InFlow[] = [];
  outFlows: OutFlow[] = [];
  equations: Tuple[] = []
}

class InFlow {
  src: Place
  tgt: Transition
  vars: string[] = []
}

class OutFlow {
  src: Transition
  tgt: Place
  vars: string[] = []
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

const functionF = new Function()
functionF.name = "f"
var tuple = new Tuple()
tuple.values.push("shirt", "50Eur")
functionF.rowList.push(tuple);

const data = fs.readFileSync('src/data/system.onto', 'utf8');

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

  if(valueObject === undefined) {
    continue;
  }

  ownerObject.value.set(verb, valueObject);

  console.log(ownerObject);

}

const G = digraph('G', (g) => {

  for(const [key, value] of symbolTable.entries()) {

    const intFlow = new InFlow();
    const outFlow = new OutFlow();
    const place = new Place();
    const transition = new Transition();

    if(value._type === 'place') {

      place.name = value.name;
      const labelSymbol = value.value.get("has");
      var labelText = " ";
      if(labelSymbol) {
        if (labelSymbol._type === "tuple") {

          for(const [key, value] of labelSymbol.value.entries()) {
            labelText = labelText + " " +value.name;  
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
        
      g.createNode(value.name, {[attribute.label]: labelText});
      
    }
    else if(value._type === 'transition') {
      
      transition.name = value.name;
      g.createNode(value.name, {[attribute.shape]: "box"});
      
    }
    else if(value._type === 'flow') {

      // console.log(value);

      const src = value.value.get("src");
      const tgt = value.value.get("tgt");

      intFlow.src = {
        name: src.name,
        value: []
      }
      intFlow.tgt = {
        name: tgt.name,
        inFlows: [],
        outFlows: [],
        equations: [] = []
      }

      outFlow.src = {
        name: tgt.name,
        inFlows: [],
        outFlows: [],
        equations: [] = []
      }
      outFlow.tgt = {
        name: src.name,
        value: []
      }
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
  const svg = graphviz.layout(toDot(G), "svg", "dot")
  fs.writeFileSync('graph.svg', svg)
});


const dot = toDot
(G);
console.log(dot);


