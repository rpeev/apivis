/*
  ApiVis - Simple JavaScript objects API visualization

  Copyright (c) 2017 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

(function (exports) {

function argsStr(count, name = 'arg') {
  let args = [];

  for (let i = 0; i < count; i++) {
    args.push(`${name}${i + 1}`);
  }

  return args.join(', ');
}

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
    t = `${t}(${argsStr(obj.length)})`;
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

exports.descStr = function (obj, k) {
  let desc = Object.getOwnPropertyDescriptor(obj, k),
    d1 = '', d2 = '';

  if (!desc) { return desc; }

  if (desc.hasOwnProperty('value')) { d1 += 'v'; }
  if (desc.writable) { d1 += 'w'; }
  if (desc.get) { d1 += 'g'; }
  if (desc.set) { d1 += 's'; }
  if (desc.enumerable) { d2 += 'e'; }
  if (desc.configurable) { d2 += 'c'; }

  return (d2) ? `${d1} ${d2}` : d1;
};

exports.members = function (obj) {
  return Object.getOwnPropertySymbols(obj).sort((a, b) => {
    let sa = a.toString(), sb = b.toString();

    return (sa < sb) ? -1 :
      (sa > sb) ? 1 :
        0;
  }).concat(Object.getOwnPropertyNames(obj).sort());
};

exports.membersStr = function (obj, inst = obj, indent = '  ', level = 0) {
  return exports.members(obj).
    map(k => {
      let skip = [ // Do not attempt to resolve these
          'arguments',
          'callee',
          'caller'
        ],
        instOnly = [ // Only resolve these in the context of inst
          '__proto__'
        ],
        v = undefined,
        sv = '';

      // First resolve k in the context of inst (like it would be normally)
      try {
        if (!skip.includes(k)) {
          v = inst[k];
        }
      } catch (err) {
        v = err; // Make the error visible in the dump
      }

      // Then try resolving k in the context of obj (reached through
      // following __proto__) to eventually get a shadowed value (some
      // props only make sense when resolved in the context of inst
      // and an exception will be thrown upon trying to access them through obj)
      try {
        if ( !(obj === inst || instOnly.includes(k) || skip.includes(k)) ) {
          v = obj[k];
        }
      } catch (err) {
        // Leave v as set by trying to resolve k in the context of inst
      }

      // Show the values of primitive booleans, numbers and strings
      switch (typeof v) {
      case 'boolean':
      case 'number':
        sv = `(${v})`;
        break;
      case 'string':
        sv = `("${v}")`;
        break;
      }

      return `${indent.repeat(level)}${k.toString()}{${exports.descStr(obj, k)}}: ${exports.typeStr(v, k)}${sv}`;
    }).
    join('\n');
};

exports.chain = function (obj) {
  let chain = [obj];

  for (let proto = Object.getPrototypeOf(obj);
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    chain.push(proto);
  }

  return chain;
};

exports.chainStr = function (obj, indent = '  ') {
  return exports.chain(obj).
    reverse().
    map((o, i) => `${indent.repeat(i)}[${exports.typeStr(o)}]`).
    join('\n');
};

exports.apiStr = function (inst, filters = [], indent = '  ') {
  let chain = exports.chain(inst);

  if (filters.length > 0) {
    if (typeof filters == 'string') {
      filters = [filters];
    }

    chain = chain.filter(o => filters.some(f => exports.typeStr(o).includes(f)));
  }

  return chain.
    reverse().
    map((o, i) => `${indent.repeat(i)}[${exports.typeStr(o)}]\n${exports.membersStr(o, inst, indent, i + 1)}`).
    join('\n');
};

})((typeof window != 'undefined') ? window.apivis = {} : exports);
