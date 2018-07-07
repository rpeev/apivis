import {
  name as LIB_NAME,
  version as LIB_VERSION
} from '../../package.json';

const {
  toString
} = Object.prototype;

function _isBasicObject(val) {
  return typeof val === 'object' &&
    val !== null &&
    val.__proto__ === undefined;
}

function _argsStr(count, name = 'arg') {
  let args = [];

  for (let i = 0; i < count; i++) {
    args.push(`${name}${i + 1}`);
  }

  return args.join(', ');
}

function typeStr(obj, k) {
  let t = (_isBasicObject(obj)) ?
    'BasicObject' :
    toString.call(obj).match(/^\[object ([^\]]*)\]$/)[1];

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
    (!k ||
      ['constructor', '__proto__'].includes(k) ||
      k.toString().match(/^[A-Z]/)
    )
  ) {
    t = (obj.name) ?
      obj.name :
      'AnonymousConstructor';
  }

  if (obj instanceof Function) {
    t = `${t}(${_argsStr(obj.length)})`;
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

  return (d2) ?
    `${d1} ${d2}` :
    d1;
}

function members(obj) {
  let names = Object.getOwnPropertyNames(obj).sort();
  let symbols = Object.getOwnPropertySymbols(obj).sort((a, b) => {
    let sa = a.toString();
    let sb = b.toString();

    return (sa < sb) ? -1 :
      (sa > sb) ? 1 :
        0;
  });

  return symbols.concat(names);
}

function membersStr(obj, indent = '  ', level = 0, leaf = obj) {
  return members(obj).
    map(k => {
      // Do not attempt to resolve these
      let skip = [
        'arguments',
        'callee',
        'caller'
      ];
      // Only resolve these in the context of leaf
      let leafOnly = [
        '__proto__'
      ];
      let v;
      let sv = '';
      let smax = 101;

      // First resolve k in the context of leaf (like it would be normally)
      try {
        if (!skip.includes(k)) {
          v = leaf[k];
        }
      } catch (err) {
        v = err; // Make the error visible in the dump
      }

      // Then try resolving k in the context of obj (reached through
      // following __proto__) to eventually get a shadowed value (some
      // props only make sense when resolved in the context of leaf
      // and an exception will be thrown upon trying to access them through obj)
      try {
        if ( !(obj === leaf || leafOnly.includes(k) || skip.includes(k)) ) {
          v = obj[k];
        }
      } catch (err) {
        // Leave v as set by trying to resolve k in the context of leaf
      }

      // Show the values of primitive booleans, numbers and strings
      switch (typeof v) {
      case 'boolean':
      case 'number':
        sv = `(${v})`;

        break;
      case 'string':
        if (v.length > smax) {
          sv = `("${v.substr(0, smax)}...")`;
        } else {
          sv = `("${v}")`;
        }

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

function apiStr(obj, indent = '  ') {
  return chain(obj).
    reverse().
    map((o, i) => `${indent.repeat(i)}[${typeStr(o)}]\n${membersStr(o, indent, i + 1, obj)}`).
    join('\n');
}

// peek42 plugin
function peek42(fnOutput, fnComment) {
  return {
    type(arg, comment) {
      fnOutput(
        typeStr(arg),
        fnComment(comment, arg, 'type')
      );
    },
    desc(arg, k, comment) {
      fnOutput(
        descStr(arg, k),
        fnComment(comment, `${String(k)} in ${typeStr(arg)}`, 'desc')
      );
    },
    members(arg, comment) {
      fnOutput(
        membersStr(arg),
        fnComment(comment, typeStr(arg), 'members')
      );
    },
    chain(arg, comment) {
      fnOutput(
        chainStr(arg),
        fnComment(comment, typeStr(arg), 'chain')
      );
    },
    api(arg, comment) {
      fnOutput(
        apiStr(arg),
        fnComment(comment, typeStr(arg), 'api')
      );
    }
  };
}

const apivis = {
  get [Symbol.toStringTag]() {
    return LIB_NAME;
  },
  version: LIB_VERSION,
  typeStr,
  descStr,
  members,
  membersStr,
  chain,
  chainStr,
  apiStr,
  peek42
};

export default apivis;
