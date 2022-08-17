"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const hpccWasm = require('@hpcc-js/wasm');
const symbolTable = new Map();
const symbolTable1 = new Map();
const symbolTable2 = new Map();
const symbolTable3 = new Map();
const symbolTable4 = new Map();
const symbolTable5 = new Map();
const symbolTable6 = new Map();
const symbolTable7 = new Map();
const typeTable = new Map();
const data = fs_1.default.readFileSync('src/data/graph.onto', 'utf8');
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of lines) {
    const words = line.split(' ');
    if (words[1] === 'is-a') {
        symbolTable.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has') {
        typeTable.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has-client') {
        symbolTable1.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has-item') {
        symbolTable2.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has-vendor') {
        symbolTable3.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has-money') {
        symbolTable4.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'src') {
        symbolTable5.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'tgt') {
        symbolTable6.set(words[0], { _type: words[2] });
    }
    if (words[1] === 'has-receipt') {
        symbolTable7.set(words[0], { _type: words[2] });
    }
}
let transitionNode1;
let transitionNode2;
let transitionNode3;
let src1;
let src2;
let src3;
let tgt1;
let tgt2;
let tgt3;
let tgt4;
let tgt5;
const G = (0, ts_graphviz_1.digraph)('G', (g) => {
    for (const [key, value] of symbolTable.entries()) {
        if (value._type === 'place') {
            if (typeTable.get(key)._type === 'V1') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'vendor') {
                    g.node(typeTable.get(key)._type);
                    src1 = typeTable.get(key)._type;
                }
            }
            if (typeTable.get(key)._type === 'cashier') {
                g.node(typeTable.get(key)._type);
                src3 = typeTable.get(key)._type;
                tgt5 = typeTable.get(key)._type;
            }
            if (typeTable.get(key)._type === 't1') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {
                    let type1;
                    let type2;
                    if (symbolTable1.get(typeTable.get(key)._type)._type === 'Alice') {
                        type1 = symbolTable1.get(typeTable.get(key)._type)._type;
                        console.log(type1);
                    }
                    if (symbolTable2.get(typeTable.get(key)._type)._type === 'shirt') {
                        type2 = symbolTable2.get(typeTable.get(key)._type)._type;
                        console.log(type2);
                    }
                    if (symbolTable.get(type1)._type === 'client' && symbolTable.get(type2)._type === 'item') {
                        g.node(type1 + " " + type2);
                        src2 = type1 + " " + type2;
                    }
                }
            }
            if (typeTable.get(key)._type === 't2') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {
                    let type1;
                    let type2;
                    if (symbolTable3.get(typeTable.get(key)._type)._type === 'V1') {
                        type1 = symbolTable3.get(typeTable.get(key)._type)._type;
                        console.log(type1);
                    }
                    if (symbolTable2.get(typeTable.get(key)._type)._type === 'shirt') {
                        type2 = symbolTable2.get(typeTable.get(key)._type)._type;
                        console.log(type2);
                    }
                    if (symbolTable.get(type1)._type === 'vendor' && symbolTable.get(type2)._type === 'item') {
                        g.node(type1 + " " + type2);
                        tgt1 = type1 + " " + type2;
                    }
                }
            }
            if (typeTable.get(key)._type === 't3') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {
                    let type1;
                    let type2;
                    if (symbolTable1.get(typeTable.get(key)._type)._type === 'Alice') {
                        type1 = symbolTable1.get(typeTable.get(key)._type)._type;
                        console.log(type1);
                    }
                    if (symbolTable4.get(typeTable.get(key)._type)._type === '50-EUR') {
                        type2 = symbolTable4.get(typeTable.get(key)._type)._type;
                        console.log(type2);
                    }
                    if (symbolTable.get(type1)._type === 'client' && symbolTable.get(type2)._type === 'money') {
                        g.node(type1 + " " + type2);
                        tgt2 = type1 + " " + type2;
                    }
                }
            }
            if (typeTable.get(key)._type === 't4') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {
                    let type1;
                    let type2;
                    if (symbolTable1.get(typeTable.get(key)._type)._type === 'Alice') {
                        type1 = symbolTable1.get(typeTable.get(key)._type)._type;
                        console.log(type1);
                    }
                    if (symbolTable7.get(typeTable.get(key)._type)._type === 'receipt') {
                        type2 = symbolTable7.get(typeTable.get(key)._type)._type;
                        console.log(type2);
                    }
                    if (symbolTable.get(type1)._type === 'client' && symbolTable.get(type2)._type === 'pays') {
                        g.node(type1 + " " + type2);
                        tgt3 = type1 + " " + type2;
                    }
                }
            }
            if (typeTable.get(key)._type === 't5') {
                if (symbolTable.get(typeTable.get(key)._type)._type === 'tuple') {
                    let type1;
                    let type2;
                    if (symbolTable3.get(typeTable.get(key)._type)._type === 'V1') {
                        type1 = symbolTable3.get(typeTable.get(key)._type)._type;
                        console.log(type1);
                    }
                    if (symbolTable2.get(typeTable.get(key)._type)._type === 'packed-shirt') {
                        type2 = symbolTable2.get(typeTable.get(key)._type)._type;
                        console.log(type2);
                    }
                    if (symbolTable.get(type1)._type === 'vendor' && symbolTable.get(type2)._type === 'item') {
                        g.node(type1 + " " + type2);
                        tgt4 = type1 + " " + type2;
                    }
                }
            }
        }
        if (value._type === 'transition-1') {
            console.log(key);
            transitionNode1 = g.node(key, { [ts_graphviz_1.attribute.shape]: 'box' });
        }
        if (value._type === 'transition-2') {
            console.log(key);
            transitionNode2 = g.node(key, { [ts_graphviz_1.attribute.shape]: 'box' });
        }
        if (value._type === 'transition-3') {
            console.log(key);
            transitionNode3 = g.node(key, { [ts_graphviz_1.attribute.shape]: 'box' });
        }
        if (value._type === 'flow') {
            if (key === 'f1') {
                if (symbolTable5.get(key)._type === 'vendor-available-1' && symbolTable6.get(key)._type === 'take-home') {
                    g.edge([src1, transitionNode1]);
                }
            }
            if (key === 'f2') {
                if (symbolTable5.get(key)._type === 'take-home' && symbolTable6.get(key)._type === 'client-with-50-EUR-4') {
                    g.edge([transitionNode1, tgt2]);
                }
            }
            if (key === 'f3') {
                if (symbolTable5.get(key)._type === 'client-with-item-2' && symbolTable6.get(key)._type === 'take-home') {
                    g.edge([transitionNode1, tgt1]);
                }
            }
            if (key === 'f4') {
                if (symbolTable5.get(key)._type === 'take-home' && symbolTable6.get(key)._type === 'vendor-with-item-3') {
                    g.edge([src2, transitionNode1]);
                }
            }
            if (key === 'f5') {
                if (symbolTable5.get(key)._type === 'vendor-with-item-3' && symbolTable6.get(key)._type === 'packs-shirt') {
                    g.edge([tgt1, transitionNode2]);
                }
            }
            if (key === 'f6') {
                if (symbolTable5.get(key)._type === 'packs-shirt' && symbolTable6.get(key)._type === 'vendor-with-packed-item-7') {
                    g.edge([transitionNode2, tgt4]);
                }
            }
            if (key === 'f7') {
                if (symbolTable5.get(key)._type === 'client-with-50-EUR-4' && symbolTable6.get(key)._type === 'pays-take-home') {
                    g.edge([tgt2, transitionNode3]);
                }
            }
            if (key === 'f8') {
                if (symbolTable5.get(key)._type === 'pays-take-home' && symbolTable6.get(key)._type === 'cashier-available-5') {
                    g.edge([transitionNode3, tgt5]);
                }
            }
            if (key === 'f9') {
                if (symbolTable5.get(key)._type === 'cashier-available-5' && symbolTable6.get(key)._type === 'pays-take-home') {
                    g.edge([src3, transitionNode3]);
                }
            }
            if (key === 'f10') {
                if (symbolTable5.get(key)._type === 'pays-take-home' && symbolTable6.get(key)._type === 'client-with-receipt-6') {
                    g.edge([transitionNode3, tgt3]);
                }
            }
        }
    }
});
hpccWasm.graphvizSync().then(graphviz => {
    const svg = graphviz.layout((0, ts_graphviz_1.toDot)(G), "svg", "dot");
    fs_1.default.writeFileSync('graph.svg', svg);
});
const dot = (0, ts_graphviz_1.toDot)(G);
console.log(dot);
