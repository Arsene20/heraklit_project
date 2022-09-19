"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FindFlows {
    findIncommingFlows(symbolTable, transitionName) {
        const result = [];
        for (const [key, value] of symbolTable.entries()) {
            if (Array.isArray(value)) {
                continue;
            }
            if (value._type != 'flow') {
                continue;
            }
            const tgt = value.value.get('tgt');
            if (tgt._type === 'transition' && tgt.name === transitionName) {
                result.push(value);
            }
        }
        return result;
    }
    findOutCommingFlows(symbolTable, transitionName) {
        const result = [];
        for (const [key, value] of symbolTable.entries()) {
            if (Array.isArray(value)) {
                continue;
            }
            if (value._type != 'flow') {
                continue;
            }
            const tgt = value.value.get('src');
            if (tgt._type === 'transition' && tgt.name === transitionName) {
                result.push(value);
            }
        }
        return result;
    }
}
exports.default = FindFlows;
//# sourceMappingURL=findFlows.js.map