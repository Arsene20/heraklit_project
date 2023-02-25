import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'
import BindingsList from './bindingsList';
import Symbol from './Model/symbol.model';
import _ from 'lodash';
import FindFlows from './findFlows';
import ObjectsPlaces from './objectsPlaces';
import { ReacheabilityGraph, ReacheableState } from './Model/ReacheabilityGraph';
import RGTransition from './Model/rGTransition';
import { CliRenderer } from "@diagrams-ts/graphviz-cli-renderer";
import Association from './Model/association';
import definition from './Model/definition';

const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
let bindings: Map<string, string>[] = [];
const bindingsList = new BindingsList();
const findFlows = new FindFlows();
const objectsPlaces = new ObjectsPlaces();

const bindingsVariables: Map<string, string>[] = [];

export class Transition extends Symbol {
  inFlows: Flow[] = []
  outFlows: Flow[] = []
  equations: Map<string, definition> = new Map()
  valueAssociation: Map<string, Association> = new Map()
}

class Flow extends Symbol {
  list: string[] = []
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

    if(words == undefined || words.length < 3 || words[1] === "is-a") {
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

    // if(valueObject.value.get('has')) {

    //   if(valueObject.value.get('has') instanceof Array) {
    //     const tupleValue = valueObject.value.get('has') as Symbol[];

    //     for (const value of tupleValue) {
    //       if(value._type === 'tuple') {
    //         console.log(value);
    //       }
    //     }
    //   }

    // }

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

// function doOneTransition(rg: ReacheabilityGraph, todoList:ReacheableState[], state: ReacheableState, bindings: Map<string, string>[] ) {

function doOneTransition(rg: ReacheabilityGraph, todoList:ReacheableState[], state: ReacheableState) {
  var inFlowsList: Symbol[] = [];
  var outFlowsList: Symbol[] = [];

  // Search for transition
  for(const key of state.symbolTable.keys()) {
    const eSymbol = state.symbolTable.get(key) as Symbol
    if(eSymbol._type === 'transition') {
      // if(! Array.isArray(value) && value._type === 'transition') {
        let trans: Transition;
        trans = eSymbol as Transition
      // let bindings = new BindingsList();

      // Find incomming flows
      inFlowsList = findFlows.findIncommingFlows(state.symbolTable, eSymbol.name);
      // Find outcomming flows
      outFlowsList = findFlows.findOutCommingFlows(state.symbolTable, eSymbol.name);

      for(let flow of inFlowsList) {
        // bindOneInPutVariable(flow, bindings);
        // bindOneInPutVariable(flow);
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

      for(let flow of outFlowsList) {
        // bindOneOutputVariable(state.symbolTable, flow);
        // bindOneOutputVariable(state.symbolTable, flow, bindings);
        const vars: Symbol = flow.value.get('var') as Symbol;
        bindingsList.expandBySymbolTable(vars, symbolTable);
      }

      bindings = bindingsList.bindings;


      for(const currentbinding of bindings) {
        // doAllBindings(rg, todoList, state, value.name);
        doAllBindings(rg, todoList, state, currentbinding, eSymbol.name);
      }

    }
  }

}


//1 - prendre un etat.
//2 - parcourt un etat: Ajoute le contenu de l'etat dans la meme liste.
//3 - concatenne tout ce qu'il prend.
//4 - Essaie de mettre tout dans un string.

let i: number = 1;

// function doAllBindings(g: ReacheabilityGraph, todoList:ReacheableState[], state: ReacheableState, transitionName: string) {
  // function doAllBindings(g: ReacheabilityGraph, todoList:ReacheableState[], state: ReacheableState, bindings: Map<string, string>[], transitionName: string) {
    function doAllBindings(g: ReacheabilityGraph, todoList:ReacheableState[], state: ReacheableState, bindings: Map<string, string>, transitionName: string) {

  console.log(state.symbolTable);
  // for(const currentbinding of bindings) {

    let symbolTableClone = _.cloneDeep(state.symbolTable);

     // Find incomming flows
     let inFlowsList = findFlows.findIncommingFlows(symbolTableClone, transitionName);
     // Find outcomming flows
     let outFlowsList = findFlows.findOutCommingFlows(symbolTableClone, transitionName);

     // remove objects from input places
    for(let flow of inFlowsList) {
      objectsPlaces.removeObjectFromInputPlace(symbolTableClone, bindings, flow);
    }

    // add objects to the output places
    for(let flow of outFlowsList) {
      objectsPlaces.addObjectToOutputPlace(symbolTableClone, bindings, flow);
    }

    console.log(symbolTableClone);

    let newkey = generatedHeraklitString(symbolTableClone);
    // let key = generatedHeraklitStringKey(symbolTableClone, transitionName);
    let existingState = g.stateMap.get(newkey);

    let rs:ReacheableState = new ReacheableState();
    rs.name = "svg" + g.stateMap.size
    rs.symbolTable = symbolTableClone;

    if (existingState) {

      let oldState = g.stateMap.get(newkey);

      let newTransition: RGTransition = new RGTransition();
      newTransition.name = transitionName;
      newTransition.target = existingState;
      // newTransition.target = oldState;

      state.outGoingTransition.push(newTransition);
    }
    else {
      // we need to create Object(new reacheable state)
      // add it in the reacheability graph
      // add it to the todolList
      // add a RGtransition
      g.stateMap.set(newkey, rs);
      todoList.push(rs);
      let rgt:RGTransition = new RGTransition ();
      rgt.name = transitionName;
      rgt.target = rs;
      state.outGoingTransition.push(rgt);

      // draw svg
      generatedSvgGraph(symbolTableClone as Map<string, Symbol>, "svg" + i++ +".svg");

    }

    // extend reachability graph

  // }

}

function generatedHeraklitString(state: Map<string, Symbol | Symbol[]>) {
  let predicate:string[]=[];
  for(const [key, value] of state.entries()) {
    const newValue = value as Symbol;
    if(newValue._type === "place"){
      let newLine = `${key} is-a place`;
      predicate.push(newLine);
      for(const [key1, value1] of newValue.value.entries()){
        for(let s of value1 as Symbol[]) {
          newLine = `${s.name} is-a ${s._type}`;
          predicate.push(newLine);
          newLine = `${key} ${key1} ${s.name}`;
          predicate.push(newLine);
        }
      }
    }
    else if(newValue._type === "transition") {

      console.log(newValue);
      let newLine = `${newValue.name} is-a ${newValue._type}\n`;
      predicate.push(newLine);

    }
    else
    if(newValue._type === 'flow') {
      console.log(newValue);
      let newLine = `${newValue.name} is-a ${newValue._type}\n`;
      predicate.push(newLine);
      for(const [key1, value1] of newValue.value.entries()){
        const newValue1 = value1 as Symbol;
        newLine = `${newValue.name} ${key1} ${newValue1.name}\n`;
        predicate.push(newLine);
        if(key1 === 'var') {
          if(newValue1._type === 'tuple') {
            newLine = `${newValue1.name} is-a ${newValue1._type}\n`;
            predicate.push(newLine);
            for(const [key2, value2] of newValue1.value.entries()) {
              const newValue2 = value2 as Symbol;
              newLine = `${newValue1.name} ${key2} ${newValue2.name}\n`;
              predicate.push(newLine);
            }
          }
          else {
            newLine = `${newValue1.name} is-a ${key1}\n`;
            predicate.push(newLine);
          }
        }
      }
    }
  }

  predicate = predicate.sort();
  let fullText;

  fullText = predicate.join('\n');
  console.log(predicate);
  return fullText;
}

function generatedHeraklitKey(state: Map<string, Symbol | Symbol[]>) {

  for(const [key, currentValue] of symbolTable.entries()) {
    if(! Array.isArray(currentValue) && currentValue._type === 'transition') {

      let transitionName = currentValue.name;

      let predicate: string[]=[];
      predicate.push(transitionName + "\n");

      // Find incomming flows
      let inFlowsList = findFlows.findIncommingFlows(symbolTable, transitionName);
      // Find outcomming flows
      let outFlowsList = findFlows.findOutCommingFlows(symbolTable, transitionName);
    
      // Find Object from inPut place
      for(let inFlow of inFlowsList) {
        // find the source flows
        const place: Symbol = inFlow.value.get('src') as Symbol;
        if(place._type === 'place') {
          const placeHasArray = place.value.get('has') as Symbol[];
          for(let sourceObejct of placeHasArray) {
            if(sourceObejct._type != 'tuple') {
              predicate.push(sourceObejct.name);
            }
            if(sourceObejct._type === 'tuple') {
              for(const [key, newSourceObejct] of sourceObejct.value.entries()) {
                const newObject = newSourceObejct as Symbol;
                predicate.push(newObject.name);
                console.log(newSourceObejct);
              }
            }
          }
        }
      }
    
      // Find Object from outPut place
      for(let outFlow of outFlowsList) {
    
        //find the target flows
        let place: Symbol = outFlow.value.get('tgt') as Symbol;
    
        for(const [key, value] of place.value.entries()) {
    
          if(value == undefined) {
            continue;
          }
    
          const valueSymboles = value as Symbol[];
    
          for(let valueSymbole of valueSymboles) {
    
            if(value == undefined) {
              continue;
            }
    
            if(valueSymbole._type == "tuple") {
              for(const [key1, value1] of valueSymbole.value.entries()) {
                const newValue = value1 as Symbol;
                predicate.push(newValue.name);
              }
            }
    
          }
    
        }
    
      }
    
      predicate = predicate.sort();
    
      let fullText;
      fullText = predicate.join('\n');

      console.log(fullText);

      console.log(fullText);
      return fullText;

    }
  }

}

function generatedHeraklitStringKey(symbolTable: Map<string, Symbol | Symbol[]>, transitionName: string) {


  let predicate: string[]=[];
  predicate.push(transitionName + "\n");

  // Find incomming flows
  let inFlowsList = findFlows.findIncommingFlows(symbolTable, transitionName);
  // Find outcomming flows
  let outFlowsList = findFlows.findOutCommingFlows(symbolTable, transitionName);

  // Find Object from inPut place
  for(let inFlow of inFlowsList) {
    // find the source flows
    const place: Symbol = inFlow.value.get('src') as Symbol;
    if(place._type === 'place') {
      const placeHasArray = place.value.get('has') as Symbol[];
      for(let sourceObejct of placeHasArray) {
        if(sourceObejct._type != 'tuple') {
          predicate.push(sourceObejct.name);
          console.log(predicate);
        }
      }
    }
  }

  // Find Object from outPut place
  for(let outFlow of outFlowsList) {

    //find the target flows
    let place: Symbol = outFlow.value.get('tgt') as Symbol;

    for(const [key, value] of place.value.entries()) {

      if(value == undefined) {
        continue;
      }

      const valueSymboles = value as Symbol[];

      for(let valueSymbole of valueSymboles) {

        if(value == undefined) {
          continue;
        }

        if(valueSymbole._type == "tuple") {
          for(const [key1, value1] of valueSymbole.value.entries()) {
            const newValue = value1 as Symbol;
            predicate.push(newValue.name);
          }
        }

      }

    }

  }

  predicate = predicate.sort();

  let fullText;
  fullText = predicate.join('\n');

  return fullText;
}

function bindOneInPutVariable( flow: Symbol) {
  // function bindOneInPutVariable( flow: Symbol, bindings: BindingsList) {
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
  // bindings.expand(vars.name, objectList, symbolTable);

}

function bindOneOutputVariable(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol) {
  // function bindOneOutputVariable(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol, bindings: BindingsList) {
  const vars: Symbol = flow.value.get('var') as Symbol;
  bindingsList.expandBySymbolTable(vars, symbolTable);
  // bindings.expandBySymbolTable(vars, symbolTable);
}


let rg = doAllStates(symbolTable);
generateSvgRg(rg);

// generate svg Rg
function generateSvgRg(rg: ReacheabilityGraph) {

  //show all state in image
  let gr = digraph('RG')
 for(let [key,elt] of rg.stateMap){
    let s = elt as ReacheableState
    gr.createNode(s.name,{
      [attribute.URL]: "./"+s.name+".svg",
    })
    for(let t of s.outGoingTransition){
      let target =  t.target
      gr.createEdge([s.name,target.name],{
        [attribute.label]: t.name
      })
    }
    // generatingGraphState(elt,rg, key,i)
    console.log("test")
 }

 graphToImagePng(gr,'reachabilityGraphe');

}

function doAllStates(startSymbolTable: Map<string, Symbol | Symbol[]>): ReacheabilityGraph {

  //Let Create Reachability graph
  let rg: ReacheabilityGraph = new ReacheabilityGraph();
  let key = generatedHeraklitString(startSymbolTable);

  //Let Add start state to Reachability graph
  let rs: ReacheableState = new ReacheableState();
  rs.name = 'svg' + rg.stateMap.size;
  rs.symbolTable = startSymbolTable;
  rg.stateMap.set(key, rs);

  //Let draw svg
  // generatedSvgGraph(startSymbolTable as Map<string, Symbol>, "svg0.svg");
  generatedSvgGraph(rs.symbolTable as Map<string, Symbol>, "svg0.svg");

  //let add  start reacheable state to todoList
  let todoList: ReacheableState[] = [];
  todoList.push(rs);

  while(todoList.length > 0) {
    console.log(todoList);
    let takeState = todoList[0];
    todoList.splice(0, 1);
    // let takeState = todoList.pop();
    // doOneTransition(rg, todoList, takeState, bindings);
    console.log(takeState);
    console.log(todoList);
    doOneTransition(rg, todoList, takeState);
  }
  console.log(rg);
  return rg;

}

function generatedSvgGraph(symbolTableClone: Map<string, Symbol>, outputsvgfilename: string) {

  const G = digraph('G', (g) => {

    for(const [key, value] of symbolTableClone.entries()) {
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

//convert dot file to png
function graphToImagePng(g: any, imageName: string) {
  const dot = toDot(g);

  const render = CliRenderer({ outputFile: "src\\svg_draw\\" + imageName + ".svg", format: "svg" });
  (async () => {
    try {
      await render(
        dot
      );
    } catch (error) {
      console.log(error);
    }
  })();
}


