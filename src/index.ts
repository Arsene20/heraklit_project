import { attribute, digraph, toDot } from 'ts-graphviz';

 const G = digraph('G', (g) => {
  const a = g.node('aa');
  const b = g.node('bb');
  const c = g.node('cc');
  g.edge([a, b, c], {
    [attribute.color]: 'red'
  });
  g.subgraph('A', (A) => {
    const Aa = A.node('Aaa', {
      [attribute.color]: 'pink'
    });

    const Ab = A.node('Abb', {
      [attribute.color]: 'violet'
    });
    const Ac = A.node('Acc');
    A.edge([Aa.port('a'), Ab, Ac, 'E'], {
      [attribute.color]: 'red'
    });
  });
});

const dot = toDot(G);
console.log(dot);


var util = require('util'),
graphviz = require('graphviz');

// Create digraph G
var g = graphviz.digraph("G");

// Add node (ID: Hello)
var n1 = g.addNode( "Hello", {"color" : "blue"} );
n1.set( "style", "filled" );

// Add node (ID: World)
g.addNode( "World" );

// Add edge between the two nodes
var e = g.addEdge( n1, "World" );
e.set( "color", "red" );

// Print the dot script
console.log( g.to_dot() );

// Set GraphViz path (if not in your path)
g.setGraphVizPath( "/usr/local/bin" );
// Generate a PNG output
g.output( "png", "test01.png" );

