
import RGTransition from './rGTransition';
import Symbol from './symbol.model';

class State {
    symbolTable: Map<string, Symbol> = new Map()
    outGoingTransition: RGTransition
}

export default State;