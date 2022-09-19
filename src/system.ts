import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
import BindingsList from './bindingsList';
import Symbol from './Model/symbol.model';
import _ from 'lodash';
import FindFlows from './findFlows';
import ObjectsPlaces from './objectsPlaces';

const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
const bindings: Map<string, string>[] = [];
const bindingsList = new BindingsList();
const findFlows = new FindFlows();
const objectsPlaces = new ObjectsPlaces();

const bindingsVariables: Map<string, string>[] = [];


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
        inFlowsList = findFlows.findIncommingFlows(symbolTable, value.name);
        // Find outcomming flows
        outFlowsList = findFlows.findOutCommingFlows(symbolTable, value.name);

        for(let flow of inFlowsList) {
          bindOneInPutVariable(flow);
        }
        for(let flow of outFlowsList) {
          bindOneOutputVariable(symbolTable, flow);
        }

        bindings = bindingsList.bindings;

        console.log(bindings);

        doAllBindings(symbolTable, bindings, value.name);

      }
  }

}

let i: number = 1;
function doAllBindings(symbolTable: Map<string, Symbol | Symbol[]>, bindings: Map<string, string>[], transitionName: string) {

  for(const currentbinding of bindings) {

    const symbolTableClone = _.cloneDeep(symbolTable);

     // Find incomming flows
     let inFlowsList = findFlows.findIncommingFlows(symbolTable, transitionName);
     // Find outcomming flows
     let outFlowsList = findFlows.findOutCommingFlows(symbolTable, transitionName);

     // remove objects from input places
    for(let flow of inFlowsList) {
      // objectsPlaces.removeObjectFromInputPlace(symbolTable, flow);
    }

    // add objects to the output places
    for(let flow of outFlowsList) {
      objectsPlaces.addObjectToOutputPlace(symbolTableClone, currentbinding, flow);
    }

    // write new systemState

    // draw svg
    generatedSvgGraph("svg" + i++ +".svg");

    // extend reachability graph

  }

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
}

doOneTransition(symbolTable, bindings);

function generatedSvgGraph(outputsvgfilename: string) {

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
                labelText = labelText + " " + valueTuple.name;
              }
  
            }
            else {
              labelText = labelText + " " + labelSymbol[i].name;
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
    fs.writeFileSync('src/svg_draw/' + outputsvgfilename, svg);
  });
  
  
  const dot = toDot
  (G);

}

// console.log(dot);


