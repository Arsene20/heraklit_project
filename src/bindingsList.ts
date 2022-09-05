import _ from 'lodash';
import Symbol from './Model/symbol.model';

class BindingsList {

    expandBySymbolTable(vars: Symbol, symbolTable: Map<string, Symbol | Symbol[]>) {

        for(const oldMap of this.bindings) {
            if(oldMap.get(vars.name)) {
                continue;
            }
            if(vars._type === 'tuple') {
                for( const [key, subVar] of vars.value.entries()) {
                    const newSubVar = subVar as Symbol;
                    if(oldMap.get(newSubVar.name)) {
                        continue;
                    }
                    const symbolTableValue = symbolTable.get(newSubVar.name) as Symbol;

                    const tupleValue = symbolTableValue.value.get('equals') as Symbol;
                    const functName = tupleValue.value.get('functionName') as Symbol;
                    const param1 = tupleValue.value.get('param1') as Symbol;
                    const param1Value = oldMap.get(param1.name);
                    const funct = symbolTable.get(functName.name) as Symbol;
                    const functResult = funct.value.get(param1Value) as Symbol;
                    oldMap.set(newSubVar.name, functResult.name);
                    this.bindings.push(oldMap);
                }
            }
        }

    }

    public bindings: Map<string, string>[] = [];

    expand(varName: string, valueList: Symbol[], symbolTable: Map<string, Symbol | Symbol[]>) {

        if(this.bindings.length === 0) {
            for(const [key, value] of valueList.entries()) {
                const newMap: Map<string, string> = new Map();
                newMap.set(varName, value.name);
                this.handleTuple({ newMap, symbolVariable: symbolTable.get(varName) as Symbol, symbolValue: value });
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
                    this.handleTuple({ newMap, symbolVariable: symbolTable.get(varName) as Symbol, symbolValue: value });
                    this.bindings.push(newMap);
                }
            }

        }

    }


    handleTuple({ newMap, symbolVariable, symbolValue }: { newMap: Map<string, string>; symbolVariable: Symbol; symbolValue: Symbol; }): void {

        console.log(symbolValue);

        if(symbolValue._type === 'tuple') {
            for(const [key, varSymbol] of symbolVariable.value.entries()) {
                const newVarSymbol = varSymbol as Symbol;
                const value = symbolValue.value.get(key) as Symbol
                newMap.set(newVarSymbol.name, value.name);
            }
        }

    }

}

export default BindingsList;
