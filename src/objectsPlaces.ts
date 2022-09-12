import Symbol from './Model/symbol.model';

class ObjectsPlaces {

    removeObjectFromInputPlace(symbolTable: Map<string, Symbol | Symbol[]>, flow: Symbol) {
        // find the source flows
        const place: Symbol = flow.value.get('src') as Symbol;
        if(place._type === 'place') {
          //find the object of place
          const symbolTableObject: Symbol = symbolTable.get(place.name) as Symbol;
          symbolTableObject.value.delete('has');
        }
    }

    globalObjectCount: number = 1;

    addObjectToOutputPlace(symbolTable: Map<string, Symbol | Symbol[]>, currentBinding: Map<string, string>, flow: Symbol) {

        //find the variables of the target flows
        let vars: Symbol = flow.value.get('var') as Symbol;
        //find the target flows
        let place: Symbol = flow.value.get('tgt') as Symbol;
    
        let newSymbol: Symbol = new Symbol();
        newSymbol.name = "gt" + this.globalObjectCount++;
        newSymbol._type = vars._type;
    
        if(newSymbol._type === "tuple") {

            for(const [key, value] of vars.value.entries()) {
              const valueSymbole = value as Symbol;
              let newValue: Symbol = new Symbol();
              newValue.name = currentBinding.get(valueSymbole.name);
              const symbolTableValue = symbolTable.get(newValue.name) as Symbol;
              newValue._type = symbolTableValue._type;
              newSymbol.value.set(key, newValue);
            }

            let placeList: Symbol[] = place.value.get("has") as Symbol[];
            if(placeList === undefined) {
              placeList = [];
              place.value.set("has", placeList);
            }

            placeList.push(newSymbol);
            console.log(placeList);

        }
    
    }

}
export default ObjectsPlaces;