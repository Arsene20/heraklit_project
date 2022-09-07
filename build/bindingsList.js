"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class BindingsList {
    constructor() {
        this.bindings = [];
    }
    expandBySymbolTable(vars, symbolTable) {
        for (const oldMap of this.bindings) {
            if (oldMap.get(vars.name)) {
                continue;
            }
            if (vars._type === 'tuple') {
                for (const [key, subVar] of vars.value.entries()) {
                    const newSubVar = subVar;
                    if (oldMap.get(newSubVar.name)) {
                        continue;
                    }
                    const symbolTableValue = symbolTable.get(newSubVar.name);
                    const tupleValue = symbolTableValue.value.get('equals');
                    const functName = tupleValue.value.get('functionName');
                    const param1 = tupleValue.value.get('param1');
                    const param1Value = oldMap.get(param1.name);
                    const funct = symbolTable.get(functName.name);
                    const functResult = funct.value.get(param1Value);
                    oldMap.set(newSubVar.name, functResult.name);
                    this.bindings.push(oldMap);
                }
            }
        }
    }
    expand(varName, valueList, symbolTable) {
        if (this.bindings.length === 0) {
            for (const [key, value] of valueList.entries()) {
                const newMap = new Map();
                newMap.set(varName, value.name);
                this.handleTuple({ newMap, symbolVariable: symbolTable.get(varName), symbolValue: value });
                this.bindings.push(newMap);
            }
        }
        else {
            const oldList = this.bindings;
            this.bindings = [];
            for (const oldMap of oldList) {
                for (const value of valueList) {
                    const newMap = lodash_1.default.cloneDeep(oldMap);
                    newMap.set(varName, value);
                    this.handleTuple({ newMap, symbolVariable: symbolTable.get(varName), symbolValue: value });
                    this.bindings.push(newMap);
                }
            }
        }
    }
    handleTuple({ newMap, symbolVariable, symbolValue }) {
        console.log(symbolValue);
        if (symbolValue._type === 'tuple') {
            for (const [key, varSymbol] of symbolVariable.value.entries()) {
                const newVarSymbol = varSymbol;
                const value = symbolValue.value.get(key);
                newMap.set(newVarSymbol.name, value.name);
            }
        }
    }
}
exports.default = BindingsList;
//# sourceMappingURL=bindingsList.js.map