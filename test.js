var acorn = require("acorn"), idast = require("./idast"), should = require("should"), walk = require("acorn/util/walk"), walkall = require("walkall");

var mkAST = function() {
  return acorn.parse("(function(a) { var q = (a ? 3 : 'h').length*7; var o = {a: 9}; o.q = o['w'] = 2; return o; })(true);");
};

describe("assignIds", function() {
  it("assigns IDs to AST nodes", function() {
    var ast = mkAST();
    idast.assignIds(ast);
    var ids = [];
    walk.simple(ast, walkall.makeVisitors(function(node) {
      ids.push(node._id);
    }), idast.walkers);
    ids.should.include("/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0");
    ids.should.include("/Program");
    ids.length.should.equal(36);
  });
});

describe("visitor", function() {
  it("passes AST node IDs to visitor", function() {
    var ids = [];
    walk.simple(mkAST(), walkall.makeVisitors(function(node, st) {
      ids.push(st || "/Program");
    }), idast.walkers);
    ids.should.include("/Program/body/0/ExpressionStatement/expression/CallExpression/arguments/0");
    ids.should.include("/Program");
    ids.length.should.equal(36);
  });
});
