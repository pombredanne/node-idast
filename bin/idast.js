#!/usr/bin/env node

var acorn = require("acorn"), fs = require("fs"), idast = require("../idast"), walk = require("acorn/util/walk"), walkall = require("walkall");

if (process.argv.length != 3) {
  console.log("Usage:", process.argv[0], "<input-file>");
  process.exit(1);
}

var file = process.argv[2];
console.error("# AST node IDs in '" + file + "':");
var i = 0;
fs.readFile(file, "utf8", function(err, src) {
  if (err) {
    console.error("error:", err.message);
    process.exit(err.errno);
  }
  var ast = acorn.parse(src);
  walk.simple(ast, walkall.makeVisitors(function(node, st) {
    ++i;
    console.log(st || "/Program", "@", node.start + ":" + node.end, node.type == "Identifier" ? node.name : "");
  }), idast.walkers);
});
console.error("# Printed " + i + " AST node IDs in '" + file + "'");
