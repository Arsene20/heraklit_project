import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
import BindingsList from './bindingsList';
import Symbol from './Model/symbol.model';

const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
const bindings: Map<string, string>[] = [];
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
  
    if(valueObject === undefined || ownerObject === undefined) {
      continue;
    }

    const oldValue = ownerObject.value.get(verb);

    if(!oldValue) {
      ownerObject.value.set(verb, valueObject);
    }
    else if(oldValue instanceof Array) {
      oldValue.push(valueObject);
    }
    else {
      const listOfSymbol: Symbol[] = [];
      listOfSymbol.push(oldValue, valueObject);

      ownerObject.value.set(verb, listOfSymbol);
    }

  }
}

function doOneTransition(symbolTable: Map<string, Symbol | Symbol[]>, bindings: Map<string, string>[] ) {
  var inFlowsList: Symbol[] = [];
  var outFlowsList: Symbol[] = [];
  // Search for transition
  for(const [key, value] of symbolTable.entries()) {
      if(! Array.isArray(value) && value._type === 'transition') {

        console.log('transition : ' + value.name);
        // Find incomming flows
        inFlowsList = findIncommingFlows(symbolTable, value.name);
        // Find outcomming flows
        outFlowsList = findOutCommingFlows(symbolTable, value.name);
        
        for(let flow of inFlowsList) {
          bindOneInPutVariable(flow);
        }
        for(let flow of outFlowsList) {
          bindOneOutputVariable(symbolTable, flow);
        }

        bindings = bindingsList.bindings;

        console.log(bindings);

        // remove objects from input places
        for(let flow of inFlowsList) {
          // removeObjectFromInputPlace(symbolTable, flow);
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
// const binds = bindingsList.bindings;
  // console.log(bindings);

}

function bindOneInPutVariable( flow: Symbol) {
  const vars: Symbol = flow.value.get('var') as Symbol;
  const place: Symbol = flow.value.get('src') as Symbol;
  let objectList: Symbol[] = [];
  if (Array.isArray(place.value.get('has')))
  {
    objectList = place.value.get('has') as Symbol[]
  }
  else {
    objectList.push(place.value.get('has') as Symbol);
  }
  bindingsList.expand(vars.name, objectList, symbolTable);
}

function bindOneOutputVariable(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol) {
  const vars: Symbol = flow.value.get('var') as Symbol;
  bindingsList.expandBySymbolTable(vars, symbolTable);
  // if(vars._type === 'tuple') {
  //   const newTuple: Symbol = new Symbol();
  //   newTuple.name = flow.name + 'vt';
  //   newTuple._type = 'tuple';
  // }
}

function removeObjectFromInputPlace(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol) {
  // find the source flows
  const place: Symbol = flow.value.get('src') as Symbol;
  if(place._type === 'place') {
    //find the object of place
    const symbolTableObject: Symbol = symbolTable.get(place.name) as Symbol;
    symbolTableObject.value.delete('has');
  }
}

function addObjectToOutputPlace(symbolTable: Map<string, Symbol | Symbol[]>, bindings: Map<string, string>[], flow: Symbol) {

  let vars: Symbol = flow.value.get('var') as Symbol;
  let place: Symbol = flow.value.get('tgt') as Symbol;
  var symbolTableObject: Symbol = symbolTable.get(place.name) as Symbol;

  var substringContent = vars.name.substring(1,3);

  var symbolVariables: Symbol = symbolTable.get(substringContent) as Symbol;

  symbolVariables = vars;
  symbolVariables.name = substringContent;
  const symbolVar = symbolVariables.value;
  const symbolTableObj = symbolTableObject.value.get('has') as Symbol;
  symbolTableObj.value = symbolVar;

  // setVariablesWithValues(bindings, symbolTable);
  console.log(symbolTableObject);

}

function setVariablesWithValues(bindings: Map<string, string>[], symbolTable: Map<string, Symbol | Symbol[]>) {

  for(const [key, value] of symbolTable.entries()) {
      const valueSymbol = value as Symbol;
    if(valueSymbol._type === 'place') {

      const labelSymbol = valueSymbol.value.get("has") as Symbol;
      if(labelSymbol) {
        if (labelSymbol._type === "tuple") {

          for(const [key1, value1] of labelSymbol.value.entries()) {
            const valueTuple = value1 as Symbol
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

function setValue(bindings: Map<string, string>[], labelSymbol:Symbol, variable: string, key: string) {
  const labelSymbol1 = labelSymbol;
  if(labelSymbol) {
    if (labelSymbol._type === "tuple") {
      for(const bindingsMap of bindings) {
        const labelSymbolValue = labelSymbol.value.get(key) as Symbol;
        if(labelSymbolValue === undefined) {
          continue;
        }
        labelSymbolValue.name = bindingsMap.get(variable);
      }
    }
    else {
      for(const bindingsMap of bindings) {
        labelSymbol1.name = bindingsMap.get(variable);
      }
    }
  }
}


function findIncommingFlows(symbolTable: Map<string, Symbol | Symbol[]>, transitionName: string): Symbol[] {
  const result: Symbol[] = [];
  for(const [key, value] of symbolTable.entries()) {
    if (Array.isArray(value)) {
      continue
    }
    if(value._type != 'flow') {
      continue;
    }
    const tgt = value.value.get('tgt') as Symbol;
    if(tgt._type === 'transition' && tgt.name === transitionName) {
      result.push(value);
    }
  }
  return result;
}

function findOutCommingFlows(symbolTable: Map<string, Symbol | Symbol[]>, transitionName: string): Symbol[] {
  const result: Symbol[] = [];
  for(const [key, value] of symbolTable.entries()) {
    if (Array.isArray(value)) {
      continue
    }
    if(value._type != 'flow') {
      continue;
    }
    const tgt = value.value.get('src') as Symbol;
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

      const labelSymbol: Symbol[] = value.value.get("has") as Symbol[];
      var labelText = " ";
      if(labelSymbol) {
        for(let i = 0; i < labelSymbol.length; i++) {

          if (labelSymbol[i]._type === "tuple") {

            for(const [key, value] of labelSymbol[i].value.entries()) {
              const valueTuple = value as Symbol;
              if(bindings.length === 0) {
                labelText = labelText + " " + valueTuple.name;
              }
              else {
                for(const valueVar of bindings) {
                  labelText = labelText + " " + valueVar.get(valueTuple.name);
                }
              }
            }

          }
          else {
            if(bindings.length === 0) {
              labelText = labelText + " " + labelSymbol[i].name;
            }
            else {
              for(const valueVar of bindings) {
                labelText = labelText + " " + valueVar.get(labelSymbol[i].name);
              }
            }
          }

        }

      }
      g.createNode(value.name, {[attribute.label]: labelText});
      
    }
    else if(value._type === 'transition') {

      g.createNode(value.name, {[attribute.shape]: "box"});

    }
    else if(value._type === 'flow') {

      const src = value.value.get("src") as Symbol;
      const tgt = value.value.get("tgt") as Symbol;
      const varElements = value.value.get("var") as Symbol;
      var label: string = '';
      if(varElements._type === 'tuple') {
        for(const [key, value] of varElements.value.entries()) {
          const valueTuple = value as Symbol;
          if (label != '') {
            label += ', ' + valueTuple.name
          }
          else {
            label += valueTuple.name;
          }
        }
        g.createEdge([src.name, tgt.name], {[attribute.label]: '(' + label + ')'});
      }
      else{
        g.createEdge([src.name, tgt.name], {[attribute.label]: varElements.name});
      }

    }
    // console.log(JSON.stringify(outFlow, null, 3));

  }
});

hpccWasm.graphvizSync().then(graphviz => {
  const svg = graphviz.layout(toDot(G), "svg", "dot");
  fs.writeFileSync('system_graph_1.svg', svg);
});


const dot = toDot
(G);
// console.log(dot);


