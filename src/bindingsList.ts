import _ from 'lodash';

class BindingsList {

    bindings: Map<string, Symbol>[] = [];

    expand(varName: string, valueList: Symbol[]) {

        if(this.bindings.length === 0) {
            for(const [key, value] of valueList.entries()) {
                const newMap: Map<string, Symbol> = new Map();
                newMap.set(varName, value);
                this.bindings.push(newMap);
            }
        }
        else {
            const oldList = this.bindings;
            this.bindings = [];
            for(const oldMap of oldList) {
                for(const value of valueList) {
                    const newMap = _.cloneDeep(oldMap);
                    newMap.set(varName, value);
                    this.bindings.push(newMap);
                }
            }

        }

    }
}

export default BindingsList;
