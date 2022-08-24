import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
const placeTable: Map<string, Place> = new Map();

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

setSymbolTableByReadingFile (lines);
function setSymbolTableByReadingFile (lines: any) {
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
}

setValueOfPlaceInSymboleTable (lines);
function setValueOfPlaceInSymboleTable (lines: any) {
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
  
  }
}

function doOneTransition(symbolTable: Map<string, Symbol>) {
  var inFlowsList: Symbol[] = [];
  var outFlowsList: Symbol[] = [];
  const bindings: Map<string, Symbol> = new Map();
  const bindSymboleTable: Map<string, Symbol> = new Map();
  // Search for transition
  for(const [key, value] of symbolTable.entries()) {
      if(value._type === 'transition') {
        console.log('transition : ' + value.name);
        // Find incomming flows
        inFlowsList = findIncommingFlows(symbolTable, value.name);
        // Find outcomming flows
        outFlowsList = findOutCommingFlows(symbolTable, value.name);
        
        for(let flow of inFlowsList) {
          bindOneInPutVariable(bindings, flow);
        }
        for(let flow of outFlowsList) {
          bindOneOutputVariable(symbolTable, bindings, flow);
        }


        // remove objects from input places
        
        // add objects to the output places

        // write new systemState

        // draw svg

        // extend reachability graph
      }
  }
  console.log(bindings);
}

function bindOneInPutVariable(bindings: Map<string, Symbol>, flow: Symbol) {
  const vars: Symbol = flow.value.get('var');
  const place: Symbol = flow.value.get('src');
  const object: Symbol = place.value.get('has');
  bindings.set(vars.name, object);
  if(vars._type === 'tuple') {
    for(const [key, value] of vars.value.entries()) {
      if (object == undefined) {
        continue;
      }
      const tupleObject = object.value.get(key);
      bindings.set(value.name, tupleObject);
    }
  }
  
}

function bindOneOutputVariable(bindSymboleTable: Map<string, Symbol>, bindings: Map<string, Symbol>, flow: Symbol) {
  const vars: Symbol = flow.value.get('var');
  if(bindings.get(vars.name)) {
     return;
  }
  if(vars._type === 'tuple') {
    const newTuple: Symbol = new Symbol();
    newTuple.name = flow.name + 'vt';
    newTuple._type = 'tuple';
    bindings.set(vars.name, newTuple);
    for(const [key, value] of vars.value.entries()) {
      if(bindings.get(value.name)) {
        continue;
      }
      const tupleVars = bindSymboleTable.get(value.name);
      const tupleValue = tupleVars.value.get('equals');
      const functName = tupleValue.value.get('functionName');
      const param1 = tupleValue.value.get('param1');
      const param1Value = bindings.get(param1.name);
      const funct = bindSymboleTable.get(functName.name);
      const functResult = funct.value.get(param1Value.name);

      bindings.set(tupleVars.name, functResult);

      console.log('tuple');

    }

  }
  
}

function bindMultipleVariable(bindings: Map<string, Symbol[]>, flow: Symbol, variable: string, typeFlow: string, subject: string) {

  var varSymbol: Symbol[] = [];


  const vars: Symbol = flow.value.get(variable);
  const place: Symbol = flow.value.get(typeFlow);
  const object: Symbol = place.value.get(subject);
  console.log(vars);
  for(const [key, value] of vars.value.entries()) {
    // if(value._type === 'var') {
      console.log(value.value);
    // }
    varSymbol.push()
  }
  // bindings.set(vars.name, object);
  
}

function findIncommingFlows(symbolTable: Map<string, Symbol>, transitionName: string): Symbol[] {
  const result: Symbol[] = [];
  for(const [key, value] of symbolTable.entries()) {
    if(value._type != 'flow') {
      continue;
    }
    const tgt = value.value.get('tgt');
    if(tgt._type === 'transition' && tgt.name === transitionName) {
      result.push(value);
    }
  }
  return result;
}

function findOutCommingFlows(symbolTable: Map<string, Symbol>, transitionName: string): Symbol[] {
  const result: Symbol[] = [];
  for(const [key, value] of symbolTable.entries()) {
    if(value._type != 'flow') {
      continue;
    }
    const tgt = value.value.get('src');
    if(tgt._type === 'transition' && tgt.name === transitionName) {
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

      // console.log(place);
        
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
// console.log(dot);


