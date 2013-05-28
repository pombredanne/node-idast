#!/usr/bin/env node

var acorn = require("acorn"), fs = require("fs"), idast = require("../idast"), walk = require("acorn/util/walk");

if (process.argv.length != 3) {
  console.log("Usage:", process.argv[0], "<input-file>");
  process.exit(1);
}

var file = process.argv[2];
console.error("# AST node IDs in '" + file + "':");
var i = 0;
walk.recursive(acorn.parse(fs.readFileSync(file)), "", {
  Node: function(node, st, c) {
    console.log(st, "@", node.start + ":" + node.end);
  },
}, idast.base);
console.error("# Printed " + i + " AST node IDs in '" + file + "'");
