var Ctx = require('./context');

function BrowserCtx() {};

var CtxProto = BorwserCtx.prototype = new Ctx();

module.exports = BrowserCtx;

