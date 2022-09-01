import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
import BindingsList from './bindingsList';
import Symbol from './Model/symbol.model';

const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
const bindings: Map<string, Symbol> = new Map();
const bindingsList = new BindingsList();

const bindingsVariables: Map<string, string>[] = [];

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

const data = fs.readFileSync('src/data/bindingsList.onto', 'utf8');

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
  
    if(valueObject === undefined || ownerObject === undefined) {
      continue;
    }
  
    ownerObject.value.set(verb, valueObject);
  
  }
}

function doOneTransition(symbolTable: Map<string, Symbol>, bindings: Map<string, Symbol> ) {
  var inFlowsList: Symbol[] = [];
  var outFlowsList: Symbol[] = [];
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
        for(let flow of inFlowsList) {
          removeObjectFromInputPlace(symbolTable, flow);
        }

        // add objects to the output places
        for(let flow of outFlowsList) {
          addObjectToOutputPlace(symbolTable, bindings, flow);
        }

        // write new systemState

        // draw svg

        // extend reachability graph
      }
  }

}

function bindOneInPutVariable(bindings: Map<string, Symbol>, flow: Symbol) {
  const vars: Symbol = flow.value.get('var');
  const place: Symbol = flow.value.get('src');
  const objectList: Symbol[] = place.value.get('has');
  bindingsList.expand(vars.name, objectList);
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

    }

  }

}

function removeObjectFromInputPlace(symbolTable: Map<string, Symbol>, flow: Symbol) {
  // find  the source flows
  const place: Symbol = flow.value.get('src');
  if(place._type === 'place') {
    //find the object of place
    const symbolTableObject: Symbol = symbolTable.get(place.name);
    symbolTableObject.value.delete('has');
  }
}

function addObjectToOutputPlace(symbolTable: Map<string, Symbol>, bindings: Map<string, Symbol>, flow: Symbol) {

  let vars: Symbol = flow.value.get('var');
  let place: Symbol = flow.value.get('tgt');
  var symbolTableObject: Symbol = symbolTable.get(place.name);

  var substringContent = vars.name.substring(1,3);

  var symbolVariables: Symbol = symbolTable.get(substringContent);

  symbolVariables = vars;
  symbolVariables.name = substringContent;
  symbolTableObject.value.get('has').value = symbolVariables.value;

  setVariablesWithValues(bindings, symbolTable);
  console.log(symbolTableObject);

}

function setVariablesWithValues(bindings: Map<string, Symbol>, symbolTable: Map<string, Symbol>) {

  for(const [key, value] of symbolTable.entries()) {

    if(value._type === 'place') {

      const labelSymbol = value.value.get("has");
      if(labelSymbol) {
        if (labelSymbol._type === "tuple") {

          for(const [key1, value1] of labelSymbol.value.entries()) {
            setValue(bindings, labelSymbol, value1.name, key1);
          }

        }
        else {
          setValue(bindings, labelSymbol, labelSymbol.name, key);
        }

      }

    }

  }

}

function setValue(bindings: Map<string, Symbol>, labelSymbol:Symbol, variable: string, key: string) {
  const labelSymbolValue = labelSymbol.value;
  const labelSymbol1 = labelSymbol;
  if(labelSymbol) {
    if (labelSymbol._type === "tuple") {
      labelSymbolValue.get(key).value = bindings.get(variable).value;
    }
    else {
      labelSymbol1.value = bindings.get(variable).value;
    }
  }
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

doOneTransition(symbolTable, bindings);

const G = digraph('G', (g) => {

  for(const [key, value] of symbolTable.entries()) {

    if(value._type === 'place') {

      const labelSymbol = value.value.get("has");
      var labelText = " ";
      if(labelSymbol) {
        if (labelSymbol._type === "tuple") {

          for(const [key, value] of labelSymbol.value.entries()) {
            if(bindings.get(value.name) === undefined) {
              labelText = labelText + " " + value.name;
            }
            else {
              labelText = labelText + " " + bindings.get(value.name).name;
            }
          }

        }
        else {
          if(bindings.get(value.name) === undefined) {
            labelText = labelSymbol.name;
          }
          else {
            labelText = bindings.get(value.name).name;
          }
        }

      }
        
      g.createNode(value.name, {[attribute.label]: labelText});
      
    }
    else if(value._type === 'transition') {
      
      g.createNode(value.name, {[attribute.shape]: "box"});
      
    }
    else if(value._type === 'flow') {

      const src = value.value.get("src");
      const tgt = value.value.get("tgt");
      const varElements = value.value.get("var");
      var label: string = '';
      if(varElements._type === 'tuple') {
        for(const [key, value] of varElements.value.entries()) {
          if (label != '') {
            label += ', ' + value.name
          }
          else {
            label += value.name;
          }
        }
        g.createEdge([src.name, tgt.name], {[attribute.label]: '(' + label + ')'});
      }
      else{
        g.createEdge([src.name, tgt.name], {[attribute.label]: value.value.get("var").name});
      }
            
    }
    // console.log(JSON.stringify(outFlow, null, 3));

  }
});

hpccWasm.graphvizSync().then(graphviz => {
  const svg = graphviz.layout(toDot(G), "svg", "dot")
  fs.writeFileSync('system_graph_1.svg', svg)
});


const dot = toDot
(G);
// console.log(dot);


