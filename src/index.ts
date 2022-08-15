import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm');

const symbolTable = new Map();

const symbolTable1 = new Map();

const symbolTable2 = new Map();

const symbolTable3 = new Map();

const symbolTable4 = new Map();

const symbolTable5 = new Map();

const symbolTable6 = new Map();

const typeTable = new Map();

const data = fs.readFileSync('src/data/graph.onto', 'utf8');

const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of  lines) {
  const words = line.split(' ');

  if (words[1] === 'is-a') {
      symbolTable.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'has') {
      typeTable.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'has-client') {
    symbolTable1.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'has-item') {
    symbolTable2.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'has-vendor') {
    symbolTable3.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'has-money') {
    symbolTable4.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'src') {
    symbolTable5.set(words[0], {_type: words[2]});
  }

  if (words[1] === 'tgt') {
    symbolTable6.set(words[0], {_type: words[2]});
  }

}

let transitionNode;
let transitionNode1;
let transitionNode2;
let transitionNode3;
let transitionNode4;

const G = digraph('G', (g) => {
  for(const [key, value] of symbolTable.entries()) {

    if(value._type === 'place') {

      if(typeTable.get(key)._type === 'V1') {

        if(symbolTable.get(typeTable.get(key)._type)._type === 'vendor') {
          g.node(typeTable.get(key)._type);
          transitionNode1 = typeTable.get(key)._type;
        }

      }

      if(typeTable.get(key)._type === 't1') {

        if(symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {

          let type1;
          let type2;

          if(symbolTable1.get(typeTable.get(key)._type)._type === 'Alice') {
            type1 = symbolTable1.get(typeTable.get(key)._type)._type; 
            console.log(type1);
          }

          if(symbolTable2.get(typeTable.get(key)._type)._type === 'shirt') {
            type2 = symbolTable2.get(typeTable.get(key)._type)._type; 
            console.log(type2);
          }

          if(symbolTable.get(type1)._type === 'client' && symbolTable.get(type2)._type === 'item') {
            g.node(type1 + " " + type2);
            transitionNode2 = type1 + " " + type2;
          }

        }

      }

      if(typeTable.get(key)._type === 't2') {

        if(symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {

          let type1;
          let type2;

          if(symbolTable3.get(typeTable.get(key)._type)._type === 'V1') {
            type1 = symbolTable3.get(typeTable.get(key)._type)._type; 
            console.log(type1);
          }

          if(symbolTable2.get(typeTable.get(key)._type)._type === 'shirt') {
            type2 = symbolTable2.get(typeTable.get(key)._type)._type; 
            console.log(type2);
          }

          if(symbolTable.get(type1)._type === 'vendor' && symbolTable.get(type2)._type === 'item') {
            g.node(type1 + " " + type2);
            transitionNode3 = type1 + " " + type2;
          }

        }

      }

      if(typeTable.get(key)._type === 't3') {

        if(symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {

          let type1;
          let type2;

          if(symbolTable1.get(typeTable.get(key)._type)._type === 'Alice') {
            type1 = symbolTable1.get(typeTable.get(key)._type)._type; 
            console.log(type1);
          }

          if(symbolTable4.get(typeTable.get(key)._type)._type === '50-EUR') {
            type2 = symbolTable4.get(typeTable.get(key)._type)._type; 
            console.log(type2);
          }

          if(symbolTable.get(type1)._type === 'client' && symbolTable.get(type2)._type === 'money') {
            g.node(type1 + " " + type2);
            transitionNode4 = type1 + " " + type2;
          }

        }

      }


    }

    if(value._type === 'transition') {

      console.log(key);

      transitionNode = g.node(key, {[attribute.shape]: 'box'})

    }

    if(value._type === 'flow') {

      if(key === 'f1') {

        if(symbolTable5.get(key)._type === 'vendor-available-1' && symbolTable6.get(key)._type === 'take-home') {
          g.edge([transitionNode1, transitionNode]);
        }

      }

      if(key === 'f2') {

        if(symbolTable5.get(key)._type === 'take-home' && symbolTable6.get(key)._type === 'alice-with-50-EUR-4') {
          g.edge([transitionNode, transitionNode4]);
        }

      }

      if(key === 'f3') {

        if(symbolTable5.get(key)._type === 'client-with-item-2' && symbolTable6.get(key)._type === 'take-home') {
          g.edge([transitionNode, transitionNode3]);
        }

      }

      if(key === 'f4') {

        if(symbolTable5.get(key)._type === 'take-home' && symbolTable6.get(key)._type === 'vendor-with-item-3') {
          g.edge([transitionNode2, transitionNode]);
        }

      }

    }


  }
});

hpccWasm.graphvizSync().then(graphviz => {
  const svg = graphviz.layout(toDot(G), "svg", "dot")
  fs.writeFileSync('graph.svg', svg)
});


const dot = toDot(G);
console.log(dot);


