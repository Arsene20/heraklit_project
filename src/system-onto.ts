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

const data = fs.readFileSync('src/data/system-initial.onto', 'utf8');

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

}

const inFlows: Map<string, InFlow> = new Map();

for (const line of  lines) {

  const words = line.split(' ');

  if(words.length < 3 || words[1] === "is-a" || words[1] === "has") {
    continue;
  }

  const ownerName = words[0].trim();
  const verb = words[1]; 
  const value = words[2];

  const ownerObject: Symbol = symbolTable.get(ownerName);
  const valueObject = symbolTable.get(value);

  if(ownerObject === undefined) {
    continue;
  }

  ownerObject.value.set(verb, valueObject);

}


myStringify(symbolTable);


function myStringify(symbol: any): string {

  let string = '';
  for (const [key, value] of symbol.entries()) {

    string += JSON.stringify(key) + ': ' + 
      
    JSON.stringify(value) 
    
    + '\n';

    if (value.value == undefined || value.value.length == 0 ){
      continue;
    }

    for (const [key2, value2] of value.value.entries()) {

      if (value2 == undefined){
        continue;
      }
  
      string += JSON.stringify(key2) + ': ' + 
        
      JSON.stringify(value) 
      
      + '\n';

      if (value2.value == undefined || value2.value.length == 0 ){
        continue;
      }
  
      for (const [key3, value3] of value2.value.entries()) {
    
        if (value3 == undefined){
          continue;
        }
    
        string += JSON.stringify(key3) + ': ' + 
          
        JSON.stringify(value) 
        
        + '\n\n';
        
      }     
      
    }
    
  }


  return string;

}


