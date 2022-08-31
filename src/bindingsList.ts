import _ from 'lodash';
import { attribute, digraph, toDot } from 'ts-graphviz';
import fs from 'fs'

const hpccWasm = require('@hpcc-js/wasm');

const symbolTable: Map<string, Symbol> = new Map();
const bindings: Map<string, Symbol> = new Map();

const bindingsVariables: Map<string, string>[] = [];

class Place {
  name: string
  value: any[] = []
}

class Symbol {
  name: string
  _type: string
  value: Map<string, Symbol> = new Map()
}

class BindingsList {

    bindings: Map<string, string>[] = [];

    expand(varName: string, valueList: string[]) {

        if(this.bindings.length === 0) {
            for(const value of valueList) {
                const newMap: Map<string, string> = new Map();
                newMap.set(varName, value);
                this.bindings.push(newMap);
            }
        }
        else {
            const oldList = this.bindings;
            this.bindings = [];
            for(const oldMap of oldList) {
                for(const value of valueList) {
                    const newMap = _.cloneDeep(oldMap);
                    newMap.set(varName, value);
                    this.bindings.push(newMap);
                }
            }

        }

    }
}

export default BindingsList;
