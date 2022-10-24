import Params from "./params";
import Result from "./result";
import Symbol from "./symbol.model";

class Association extends Symbol {
    params!: Params;
    result!: Result;
}
export default Association;
