// AST walker module (with unique AST node identifiers) for Mozilla Parser API compatible trees.
// Adapted from acorn/util/walk.js.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports, require("acorn/util/walk")); // CommonJS
  if (typeof define == "function" && define.amd)
    return define(["exports", "acorn/util/walk"], mod); // AMD
  mod(self.idast || (self.idast = {}), acorn.walk); // Plain browser env
})(function(exports, walk) {
  "use strict";

  // Walks the AST starting at node, assigning a unique and meaningful ID to each node's "_id"
  // property.
  exports.assignIds = function(node, initialId) {
    walk.simple(node, {
      Node: function(node, st, c) {
        node._id = st;
      },
    }, base, initialId || "");
  };

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(node, st, c) { c(node, st, "Node"); }

  // Node walkers.
  var base = exports.base = {};
  base.Node = function(node, st, c) {};
  base.Program = base.BlockStatement = function(node, st, c) {
    if (!st) st = "";
    st += "/" + node.type;
    c(node, st, "Node");
    for (var i = 0; i < node.body.length; ++i)
      c(node.body[i], st + "/body/" + i.toString(), "Statement");
  };
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.expression, st + "/expression", "Expression");
  };
  base.IfStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.test, st + "/test", "Expression");
    c(node.consequent, st + "/consequent", "Statement");
    if (node.alternate) c(node.alternate, st + "/alternate", "Statement");
  };
  base.LabeledStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.body, st + "/body", "Statement");
  };
  base.BreakStatement = base.ContinueStatement = ignore;
  base.WithStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.object, st + "/object", "Expression");
    c(node.body, st + "/body", "Statement");
  };
  base.SwitchStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.discriminant, st + "/discriminant", "Expression");
    for (var i = 0; i < node.cases.length; ++i) {
      var cs = node.cases[i];
      if (cs.test) c(cs.test, st + "/test/" + i.toString(), "Expression");
      for (var j = 0; j < cs.consequent.length; ++j)
        c(cs.consequent[j], st + "/consequent/" + j.toString(), "Statement");
    }
  };
  base.ReturnStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    if (node.argument) c(node.argument, st + "/argument", "Expression");
  };
  base.ThrowStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.argument, st + "/argument", "Expression");
  };
  base.TryStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.block, st + "/block", "Statement");
    if (node.handler) c(node.handler.body, st + "/handler", "ScopeBody");
    if (node.finalizer) c(node.finalizer, st + "/finalizer", "Statement");
  };
  base.WhileStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.test, st + "/test", "Expression");
    c(node.body, st + "/body", "Statement");
  };
  base.DoWhileStatement = base.WhileStatement;
  base.ForStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    if (node.init) c(node.init, st + "/init", "ForInit");
    if (node.test) c(node.test, st + "/test", "Expression");
    if (node.update) c(node.update, st + "/update", "Expression");
    c(node.body, st + "/body", "Statement");
  };
  base.ForInStatement = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.left, st + "/left", "ForInit");
    c(node.right, st + "/right", "Expression");
    c(node.body, st + "/body", "Statement");
  };
  base.ForInit = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    if (node.type == "VariableDeclaration") c(node, st);
    else c(node, st, "Expression");
  };
  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function(node, st, c) {
    st += "/" + node.type;
    if (node.id) st += ":" + node.id.name;
    c(node, st, "Function");
  };
  base.VariableDeclaration = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    for (var i = 0; i < node.declarations.length; ++i) {
      var decl = node.declarations[i];
      var sd = st + "/declarations/" + i.toString() + (decl.id ? ":" + decl.id.name : "");
      if (decl.id.type == "Identifier") c(decl.id, sd + "/id");
      if (decl.init) {
        c(decl.init, sd + "/init", "Expression");
      }
    }
  };

  base.Function = function(node, st, c) {
    c(node, st, "Node");
    if (node.id) c(node.id, st + "/id");
    for (var i = 0; i < node.params.length; ++i) {
      var param = node.params[i];
      c(param, st + "/params/" + i.toString());
    }
    c(node.body, st + "/body", "ScopeBody");
  };
  base.ScopeBody = function(node, st, c) {
    c(node, st, "Statement");
  };

  base.Expression = skipThrough;
  base.ThisExpression = ignore;
  base.ArrayExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    for (var i = 0; i < node.elements.length; ++i) {
      var elt = node.elements[i];
      if (elt) c(elt, st + "/elements/" + i.toString(), "Expression");
    }
  };
  base.ObjectExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    for (var i = 0; i < node.properties.length; ++i)
      c(node.properties[i].value, st + "/properties/" + i.toString(), "Expression");
  };
  base.FunctionExpression = base.FunctionDeclaration;
  base.SequenceExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    for (var i = 0; i < node.expressions.length; ++i)
      c(node.expressions[i], st + "/expressions/" + i.toString(), "Expression");
  };
  base.UnaryExpression = base.UpdateExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.argument, st + "/argument", "Expression");
  };
  base.BinaryExpression = base.AssignmentExpression = base.LogicalExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.left, st + "/left", "Expression");
    c(node.right, st + "/right", "Expression");
  };
  base.ConditionalExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.test, st + "/test", "Expression");
    c(node.consequent, st + "/consequent", "Expression");
    c(node.alternate, st + "/alternate", "Expression");
  };
  base.NewExpression = base.CallExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.callee, st + "/callee", "Expression");
    if (node.arguments) for (var i = 0; i < node.arguments.length; ++i)
      c(node.arguments[i], st + "/arguments/" + i.toString(), "Expression");
  };
  base.MemberExpression = function(node, st, c) {
    st += "/" + node.type;
    c(node, st, "Node");
    c(node.object, st + "/object", "Expression");
    if (node.computed) c(node.property, st + "/property", "Expression");
  };
  base.Identifier = base.Literal = ignore;
});
