import Symbol from "./symbol.model";

class TypeValue extends Symbol {
    declaration: Map<string, string[]> = new Map();
}
export default TypeValue;