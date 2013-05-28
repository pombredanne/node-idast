var acorn = require("acorn"), assert = require("assert"), idast = require("./idast"), walk = require("acorn/util/walk");

var mkAST = function() {
  return acorn.parse("(function(a) { var q = (a ? 3 : 'h').length*7; var o = {a: 9}; o.q = o['w'] = 2; return o; })(true);");
};

describe("assignIds", function() {
  it("assigns IDs to AST nodes", function() {
    var ast = mkAST();
    idast.assignIds(ast, "test");
    var ids = [];
    walk.simple(ast, {
      Node: function(node, st, c) {
        ids.push(node._id);
      },
    }, idast.base);
    console.log(ids);
    assert(ids.indexOf("test/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0") !== -1);
    assert.equal("test/Program", ids[0]);
    assert.equal(32, ids.length);
  });
});

describe("visitor", function() {
  it("passes AST node IDs to visitor", function() {
    var ids = [];
    walk.simple(mkAST(), {
      Node: function(node, st, c) {
        ids.push(st);
      },
    }, idast.base, "");
    assert(ids.indexOf("/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0") !== -1);
    assert.equal("/Program", ids[0]);
    assert.equal(32, ids.length);
  });
});
