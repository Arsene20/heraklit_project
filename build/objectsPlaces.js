"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const symbol_model_1 = __importDefault(require("./Model/symbol.model"));
class ObjectsPlaces {
    constructor() {
        this.globalObjectCount = 1;
    }
    removeObjectFromInputPlace(symbolTable, flow) {
        // find the source flows
        const place = flow.value.get('src');
        if (place._type === 'place') {
            //find the object of place
            const symbolTableObject = symbolTable.get(place.name);
            symbolTableObject.value.delete('has');
        }
    }
    addObjectToOutputPlace(symbolTable, currentBinding, flow) {
        //find the variables of the target flows
        let vars = flow.value.get('var');
        //find the target flows
        let place = flow.value.get('tgt');
        let newSymbol = new symbol_model_1.default();
        // newSymbol.name = "gt" + this.globalObjectCount++;
        newSymbol._type = vars._type;
        let symboleName = "t_";
        if (newSymbol._type === "tuple") {
            for (const [key, value] of vars.value.entries()) {
                const valueSymbole = value;
                let newValue = new symbol_model_1.default();
                newValue.name = currentBinding.get(valueSymbole.name);
                const symbolTableValue = symbolTable.get(newValue.name);
                newValue._type = symbolTableValue._type;
                symboleName += newValue._type;
                newSymbol.value.set(key, newValue);
            }
            let placeList = place.value.get("has");
            if (placeList === undefined) {
                placeList = [];
                place.value.set("has", placeList);
            }
            newSymbol.name = symboleName + this.globalObjectCount++;
            placeList.push(newSymbol);
            console.log(placeList);
        }
    }
}
exports.default = ObjectsPlaces;
//# sourceMappingURL=objectsPlaces.js.map