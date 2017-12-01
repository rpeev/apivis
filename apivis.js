/*
  ApiVis - Simple JavaScript objects API visualization

  Copyright (c) 2017 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

(function (exports) {

exports.typeStr = function (obj, k = undefined) {
  let t = Object.prototype.toString.call(obj).
    match(/^\[object ([^\]]*)\]$/)[1];

  if (t == 'Object' &&
    obj.constructor &&
    obj.constructor.name != 'Object'
  ) {
    t = (obj.constructor.name) ?
      obj.constructor.name :
      'AnonymousConstructor';
  }

  if (t == 'Function' &&
    obj.hasOwnProperty &&
    obj.hasOwnProperty('prototype') &&
    (!k || ['constructor', '__proto__'].includes(k) || k.toString().match(/^[A-Z]/))
  ) {
    t = (obj.name) ?
      obj.name :
      'AnonymousConstructor';
  }

  if (obj instanceof Function) {
    t = `${t}(${obj.length})`;
  }

  if (obj &&
    obj.hasOwnProperty &&
    obj.hasOwnProperty('constructor') &&
    !t.endsWith('Prototype')
  ) {
    t = `${t}.prototype`;
  }

  if (obj instanceof Error &&
    obj.message
  ) {
    t = `${t}("${obj.message}")`;
  }

  return t;
};

exports.privateMembers = function (obj) {
  let pms = {};

  for (let k in obj) {
    if (k.startsWith('_')) {
      pms[k] = obj[k];
    }
  }

  return pms;
};

exports.props = function (obj) {
  return Object.getOwnPropertySymbols(obj).sort((a, b) => {
    let sa = a.toString(), sb = b.toString();

    return (sa < sb) ? -1 :
      (sa > sb) ? 1 :
        0;
  }).concat(Object.getOwnPropertyNames(obj).sort());
};

exports.propsStr = function (obj, inst = obj, indent = '  ', level = 0) {
  return exports.props(obj).
    map(k => {
      let v = undefined;

      try {
        let o = (['constructor', 'prototype'].includes(k)) ?
          obj :
          inst;

        if (!['arguments', 'callee', 'caller'].includes(k)) {
          v = o[k];
        }
      } catch (err) {
        v = err;
      }

      return `${indent.repeat(level)}${k.toString()}: ${exports.typeStr(v, k)}`;
    }).
    join('\n');
};

exports.protos = function (obj) {
  let chain = [];

  for (let proto = Object.getPrototypeOf(obj);
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    chain.push(proto);
  }

  return chain;
};

exports.protosStr = function (obj, indent = '  ') {
  return exports.protos(obj).
    reverse().
    map((o, i) => `${indent.repeat(i)}[${exports.typeStr(o)}]`).
    join('\n');
};

exports.apiStr = function (inst, filters = [], indent = '  ') {
  let chain = exports.protos(inst);

  chain.unshift(inst);

  if (filters.length > 0) {
    if (typeof filters == 'string') {
      filters = [filters];
    }

    chain = chain.filter(o => filters.some(f => exports.typeStr(o).includes(f)));
  }

  return chain.
    reverse().
    map((o, i) => `${indent.repeat(i)}[${exports.typeStr(o)}]\n${exports.propsStr(o, inst, indent, i + 1)}`).
    join('\n');
};

})((typeof window != 'undefined') ? window.apivis = {} : exports);
