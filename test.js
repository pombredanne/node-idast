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
      Statement: function(node, st, c) {
        ids.unshift(node._id);
      },
      Expression: function(node, st, c) {
        ids.unshift(node._id);
      },
    });
    assert(ids.indexOf("test/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0") !== -1);
    assert.equal("test/Program/body/0", ids[0]);
    assert.equal(27, ids.length);
  });
});

describe("visitor", function() {
  it("passes AST node IDs to visitor", function() {
    var ids = [];
    walk.simple(mkAST(), {
      Statement: function(node, st, c) {
        ids.unshift(st);
      },
      Expression: function(node, st, c) {
        ids.unshift(st);
      },
    }, idast.base, "");
    assert(ids.indexOf("/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0") !== -1);
    assert.equal("/Program/body/0", ids[0]);
    assert.equal(27, ids.length);
  });
});
