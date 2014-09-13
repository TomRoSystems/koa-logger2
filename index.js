/**
 koa-logger2 - index.js
 (c) 2014 Tomasz Rojek (http://tomrosystems.com/)
 MIT licensed
*/

'use strict';

exports = module.exports = function main(format) {
  var frmt = (format) || 'day/month time ip "method url protocol/httpVer" status size "referer" "userAgent" duration ms';
  var r = 'var outStream = process.stdout;\n'
+ 'return {\n'
+ '  gen: function* (next) {' + compile(frmt) + '},\n'
+ '  setStream: function (s) { outStream = s; return this; }\n'
+ '}';

  return new Function(r)();
}

// here we are constructing generator function based on format
function compile(fmt) {
  var res = {
    beg: '', // TODO: consider remembering stream in temporary variable ...
    // here goes yield
    end: '' // ... and use it here
  }

  var tokens = {
    '\\n': function(){ return "'\\n'"; } // actually this one is not used
    ,ip: function(){ return 'this.ip'; }
    ,method: function(){ return 'this.method'; }
    ,url: function(){ return 'this.url'; }
    ,status: function(){ return 'this.status'; }

    ,httpVer: function(){ return 'this.req.httpVersion'; }
    ,protocol: function(){ return 'this.protocol.toUpperCase()'; }

    ,size: function(){ return "(this.length || '-')"; }

    ,referer: function(){ return "(this.header['referer'] || '-')"; }
    ,userAgent: function(){ return "(this.header['user-agent'] || '-')"; }

    // === date formating
    ,day: function(){
      if (!this.markBegin) {
         this.markBegin = true;
         this.beg += 'var startAt = new Date();\n';
      }
      return "( startAt.getDate() < 10 ? '0' : '' ) + startAt.getDate()";
    }
    ,month: function(){
      if (!this.markBegin) {
         this.markBegin = true;
         this.beg += 'var startAt = new Date();\n';
      }
      return 'startAt.toString().slice(4,7)'; // short string representation
    }
    ,year: function(){
      if (!this.markBegin) {
         this.markBegin = true;
         this.beg += 'var startAt = new Date();\n';
      }
      return 'startAt.getFullYear()';
    }
    ,hour: function(r){
      if (!this.markBegin) {
        this.markBegin = true;
        this.beg += 'var startAt = new Date();\n';
      }
      return "( startAt.getHours() < 10 ? '0' : '' ) + startAt.getHours()";
    }
    ,time: function(){
      if (!this.markBegin) {
        this.markBegin = true;
        this.beg += 'var startAt = new Date();\n';
      }
      return "startAt.toTimeString().slice(0, 8)";
    }
    ,zone: function(){ // this one highly depends on v8 extension
      if (!this.markBegin) {
        this.markBegin = true;
        this.beg += 'var startAt = new Date();\n';
      }
      return "startAt.toTimeString().slice(12, 17)";
    }
    // extension
    ,duration: function(r){
      if (!this.markBegin) {
        this.markBegin = true;
        this.beg += 'var startAt = new Date();\n';
      }
      if (!this.markEnd) {
        this.markEnd = true;
        this.end += 'var endAt = new Date();\n';
      }
      return "( endAt.getTime() - startAt.getTime() )";
    }
    // custom one
    ,"custom\\[(\\w+)\\]": function(m, p1, offset, str){
      return "(this." + p1 + " || '-')";
    }
  }

  // build one regular expression from above tokens
  var all = Object.keys(tokens).map(function(it){ return '(?:' + it + ')' }).join('|');
  var reg = new RegExp(all, 'g');

  function which(token){ // maybe there's some better way to do this?
    for(var x in tokens) if (token.match(x)) return x;
    throw 'No pattern found';
  }

  var b = fmt.replace(reg, function(m, p1, offset){
    var t = which(m);
    var r = tokens[t].apply(res, arguments);
    if (r) return "' + " + r + " + '";
    return '';
  });

  res.end += "\noutStream.write('" + b + "\\n');";
  return res.beg + 'yield next;\n' + res.end;
};
