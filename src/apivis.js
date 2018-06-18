/*
  ApiVis - JavaScript objects API visualization

  Copyright (c) 2018 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

function argsStr(count, name = 'arg') {
  let args = [];

  for (let i = 0; i < count; i++) {
    args.push(`${name}${i + 1}`);
  }

  return args.join(', ');
}

function typeStr(obj, k) {
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
}

function descStr(obj, k) {
  let desc = Object.getOwnPropertyDescriptor(obj, k);
  let d1 = '';
  let d2 = '';

  if (!desc) { return desc; }

  if (desc.hasOwnProperty('value')) { d1 += 'v'; }
  if (desc.writable) { d1 += 'w'; }
  if (desc.get) { d1 += 'g'; }
  if (desc.set) { d1 += 's'; }
  if (desc.enumerable) { d2 += 'e'; }
  if (desc.configurable) { d2 += 'c'; }

  return (d2) ? `${d1} ${d2}` : d1;
}

function members(obj) {
  return Object.getOwnPropertySymbols(obj).sort((a, b) => {
    let sa = a.toString(), sb = b.toString();

    return (sa < sb) ? -1 :
      (sa > sb) ? 1 :
        0;
  }).concat(Object.getOwnPropertyNames(obj).sort());
}

function membersStr(obj, inst = obj, indent = '  ', level = 0) {
  return members(obj).
    map(k => {
      // Do not attempt to resolve these
      let skip = [
        'arguments',
        'callee',
        'caller'
      ];
      // Only resolve these in the context of inst
      let instOnly = [
        '__proto__'
      ];
      let v;
      let sv = '';

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

      return `${indent.repeat(level)}${k.toString()}{${descStr(obj, k)}}: ${typeStr(v, k)}${sv}`;
    }).
    join('\n');
}

function chain(obj) {
  let objs = [obj];

  for (let proto = Object.getPrototypeOf(obj);
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    objs.push(proto);
  }

  return objs;
}

function chainStr(obj, indent = '  ') {
  return chain(obj).
    reverse().
    map((o, i) => `${indent.repeat(i)}[${typeStr(o)}]`).
    join('\n');
}

function apiStr(inst, filters = [], indent = '  ') {
  let objs = chain(inst);

  if (filters.length > 0) {
    if (typeof filters == 'string') {
      filters = [filters];
    }

    objs = objs.filter(o => filters.some(f => typeStr(o).includes(f)));
  }

  return objs.
    reverse().
    map((o, i) => `${indent.repeat(i)}[${typeStr(o)}]\n${membersStr(o, inst, indent, i + 1)}`).
    join('\n');
}

const apivis = {
  typeStr,
  descStr,
  members,
  membersStr,
  chain,
  chainStr,
  apiStr
};

export {
  typeStr,
  descStr,
  members,
  membersStr,
  chain,
  chainStr,
  apiStr
};
export default apivis;
