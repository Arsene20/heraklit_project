import Symbol from './Model/symbol.model';

class FindFlows {

    findIncommingFlows(symbolTable: Map<string, Symbol | Symbol[]>, transitionName: string): Symbol[] {
        const result: Symbol[] = [];
        for(const [key, value] of symbolTable.entries()) {
          if (Array.isArray(value)) {
            continue
          }
          if(value._type != 'flow') {
            continue;
          }
          const tgt = value.value.get('tgt') as Symbol;
          if(tgt._type === 'transition' && tgt.name === transitionName) {
            result.push(value);
          }
        }
        return result;
    }

    findOutCommingFlows(symbolTable: Map<string, Symbol | Symbol[]>, transitionName: string): Symbol[] {
        const result: Symbol[] = [];
        for(const [key, value] of symbolTable.entries()) {
          if (Array.isArray(value)) {
            continue
          }
          if(value._type != 'flow') {
            continue;
          }
          const tgt = value.value.get('src') as Symbol;
          if(tgt._type === 'transition' && tgt.name === transitionName) {
            result.push(value);
          }
        }
        return result;
    }

}
export default FindFlows;