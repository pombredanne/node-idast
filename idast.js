// AST walker module (with unique AST node identifiers) for Mozilla Parser API compatible trees.
// Adapted from acorn/util/walk.js.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports, require("acorn/util/walk"), require("walkall")); // CommonJS
  if (typeof define == "function" && define.amd)
    return define(["exports", "acorn/util/walk", "walkall"], mod); // AMD
  mod(self.idast || (self.idast = {}), acorn.walk, walkall); // Plain browser env
})(function(exports, walk, walkall) {
  "use strict";

  // Walks the AST starting at node, assigning a unique and meaningful ID to each node's "_id"
  // property.
  exports.assignIds = function(node) {
    walk.simple(node, walkall.makeVisitors(function(node, st) {
      node._id = st || "/Program";
    }), exports.walkers);
  };

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(node, st, c) { c(node, st, "Node"); }

  exports.visitor = function(node, st, c) {
    if (!st) st = "/Program";
    if (node.id && node.id.name) st += ":" + node.id.name;
    traverse(node, st, c);
  };

  function traverse(obj, st, c) {
    var keys = Object.keys(obj).sort();
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      var v = obj[key];
      if (!v) continue;
      if (v instanceof Array) {
        for (var j = 0; j < v.length; ++j) {
          var st_ = st + "/" + key + "/" + j;
          if (v[j].type) c(v[j], st_ + "/" + v[j].type);
          else traverse(v[j], st_, c);
        }
      } else if (typeof v == "object" && !(v instanceof RegExp) && v.type) {
        c(v, st + "/" + key + "/" + v.type);
      }
    }
  }

  // Node walkers.
  exports.walkers = walkall.makeVisitors(exports.visitor);
});
