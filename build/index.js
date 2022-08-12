"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    const a = g.node('aa');
    const b = g.node('bb');
    const c = g.node('cc');
    g.edge([a, b, c], {
        [ts_graphviz_1.attribute.color]: 'red'
    });
    g.subgraph('A', (A) => {
        const Aa = A.node('Aaa', {
            [ts_graphviz_1.attribute.color]: 'pink'
        });
        const Ab = A.node('Abb', {
            [ts_graphviz_1.attribute.color]: 'violet'
        });
        const Ac = A.node('Acc');
        A.edge([Aa.port('a'), Ab, Ac, 'E'], {
            [ts_graphviz_1.attribute.color]: 'red'
        });
    });
});
const dot = (0, ts_graphviz_1.toDot)(G);
console.log(dot);
