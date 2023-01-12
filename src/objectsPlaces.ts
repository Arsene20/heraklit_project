import Symbol from './Model/symbol.model';

class ObjectsPlaces {

    removeObjectFromInputPlace(symbolTable: Map<string, Symbol | Symbol[]>, currentBinding: Map<string, string>, flow: Symbol) {
        // find the source flows
        const place: Symbol = flow.value.get('src') as Symbol;
        if(place._type === 'place') {
          //find the object of place
          const varName = flow.value.get('var') as Symbol;
          let sourceObjectName = currentBinding.get(varName.name);
          if(typeof sourceObjectName != 'string') {
            const objectSource = sourceObjectName as Symbol;
            sourceObjectName = objectSource.name;
          }
          const placeHasArray = place.value.get('has') as Symbol[];
          var position = 0;
          for(let sourceObejct of placeHasArray) {
            if(sourceObejct.name === sourceObjectName) {
              placeHasArray.splice(position, 1);
              break;
            }
            position++;
          }
        }
    }

    globalObjectCount: number = 1;

    addObjectToOutputPlace(localSymbolTable: Map<string, Symbol | Symbol[]>, currentBinding: Map<string, string>, flow: Symbol) {

        //find the variables of the target flows
        let vars: Symbol = flow.value.get('var') as Symbol;
        //find the target flows
        let place: Symbol = flow.value.get('tgt') as Symbol;
    
        let newSymbol: Symbol = new Symbol();
        // newSymbol.name = "gt" + this.globalObjectCount++;
        newSymbol._type = vars._type;
        let symboleName = "t_";

        if(newSymbol._type === "tuple") {

            for(const [key, value] of vars.value.entries()) {
              const valueSymbole = value as Symbol;
              let newValue: Symbol = new Symbol();
              newValue.name = currentBinding.get(valueSymbole.name);
              const symbolTableValue = localSymbolTable.get(newValue.name) as Symbol;
              if(symbolTableValue == undefined) {
                console.log(symbolTableValue);
              }
              newValue._type = symbolTableValue._type;
              
              symboleName += newValue.name;
              newSymbol.value.set(key, newValue);
            }

            let placeList: Symbol[] = place.value.get("has") as Symbol[];
            if(placeList === undefined) {
              placeList = [];
              place.value.set("has", placeList);
            }

            newSymbol.name = symboleName
            placeList.push(newSymbol);
            console.log(placeList);

        }
    
    }

}
export default ObjectsPlaces;