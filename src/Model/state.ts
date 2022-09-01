
import Symbol from './symbol.model';

class State {
    symbolTable: Symbol
    certificcate: string;
    transitions: {
        name: string,
        target: State
    }
}

export default State;