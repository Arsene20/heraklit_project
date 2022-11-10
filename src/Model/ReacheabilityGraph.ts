import Symbol from "./symbol.model";

class RGTransition{
    name!:string;
    target!: ReacheableState;
    }

class ReacheableState{
    name!: string;
    symbolTable : Map<string, Symbol | Symbol[]> = new Map();
    outGoingTransition: RGTransition[] = [];
}

class ReacheabilityGraph{
   stateMap:Map<string,ReacheableState> = new Map();
}
export  { ReacheabilityGraph , ReacheableState , RGTransition}