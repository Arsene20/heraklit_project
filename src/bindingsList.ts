import _ from 'lodash';

export class BindingsList {

    bindings: Map<string, string>[] = [];

    expand(varName: string, valueList: string[]) {

        if(this.bindings.length === 0) {
            for(const value of valueList) {
                const newMap: Map<string, string> = new Map();
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
