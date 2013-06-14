// AST walker module (with unique AST node identifiers) for Mozilla Parser API compatible trees.
// Adapted from acorn/util/walk.js.

var walk = require("acorn/util/walk"), walkall = require("walkall");

// Walks the AST starting at node, assigning a unique and meaningful ID to each node's "_id"
// property.
exports.assignIds = function(node) {
  walk.simple(node, walkall.makeVisitors(function(node, st) {
    node._id = st || "/Program";
  }), exports.walkers);
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
        if (v[j].type) c(v[j], st_ + "/" + v[j].type + objName(v[j]));
        else if (typeof v[j] == 'object') traverse(v[j], st_ + objName(v[j]), c);
      }
    } else if (typeof v == "object" && !(v instanceof RegExp) && v.type) {
      c(v, st + "/" + key + "/" + v.type + objName(v));
    }
  }
}

// objName takes a node or node-like object (e.g., an ObjectExpression property element) and
// attempts to construct a name for it. If no name can be constructed, the empty string is returned.
var objName = exports.objName = function(obj) {
  var o = obj.id || obj.key;
  if (o && (o.name || o.value)) return ":" + jsonEscape(o.name || o.value);
  else return "";
}

// jsonEscape returns the JSON representation of str without the surrounding quotes.
function jsonEscape(str) {
  var esc = JSON.stringify(str);
  return esc.slice(1, esc.length - 1);
}

// Node walkers.
exports.walkers = walkall.makeVisitors(function(node, st, c) {
  if (!st) st = "/Program";
  traverse(node, st, c);
});
