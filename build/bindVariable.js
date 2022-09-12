"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bindingsList_1 = __importDefault(require("./bindingsList"));
const bindingsList = new bindingsList_1.default();
class BindVariable {
    // bindOneInPutVariable(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol) {
    //     const vars: Symbol = flow.value.get('var') as Symbol;
    //     const place: Symbol = flow.value.get('src') as Symbol;
    //     let objectList: Symbol[] = [];
    //     if (Array.isArray(place.value.get('has')))
    //     {
    //       objectList = place.value.get('has') as Symbol[]
    //     }
    //     else {
    //       objectList.push(place.value.get('has') as Symbol);
    //     }
    //     bindingsList.expand(vars.name, objectList, symbolTable);
    // }
    bindOneOutputVariable(symbolTable, flow) {
        const vars = flow.value.get('var');
        bindingsList.expandBySymbolTable(vars, symbolTable);
    }
}
exports.default = BindVariable;
//# sourceMappingURL=bindVariable.js.map