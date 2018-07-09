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
  let names = [];

  for (let i = 0; i < count; i++) {
    names.push(`${name}${i + 1}`);
  }

  return names.join(', ');
}

function typeStr(val, k = undefined) {
  let t = (_isBasicObject(val)) ?
    'BasicObject' :
    toString.call(val).match(/^\[object ([^\]]*)\]$/)[1];

  if (t === 'Object') {
    if (val.constructor && (
      (val.constructor.name && val.constructor.name !== t)
    )) {
      t = val.constructor.name;
    }
  }

  if (val instanceof Function) {
    if (val.name && val.name !== t && (
      val.name.match(/^[A-Z]/) ||
      (k &&
        ['__apivis__chain_link',
          'constructor',
          'prototype',
          '__proto__'
        ].includes(k)
      )
    )) {
      t = val.name;
    }

    t = `${t}(${_argsStr(val.length)})`;
  }

  if (val && (
    (val.hasOwnProperty && val.hasOwnProperty('constructor'))
  )) {
    if (!t.endsWith('Prototype') && (
      (t !== 'Object' || val === Object.prototype)
    )) {
      t = `${t}.prototype`;
    }
  }

  if (val instanceof Error) {
    if (val.message) {
      t = `${t}("${val.message}")`;
    }
  }

  return t;
}

function descStr(val, k) {
  if (val === undefined || val === null) {
    return 'n/a';
  }

  let desc = Object.getOwnPropertyDescriptor(val, k);
  let d1 = '';
  let d2 = '';

  if (desc === undefined) {
    return 'n/a';
  }

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

function members(val) {
  let symbols = Object.getOwnPropertySymbols(val).sort((a, b) => {
    let sa = String(a);
    let sb = String(b);

    return (sa < sb) ? -1 :
      (sa > sb) ? 1 :
        0;
  });
  let names = Object.getOwnPropertyNames(val).sort();

  return symbols.concat(names);
}

function membersStr(val, indent = '  ', level = 0, leaf = val) {
  return members(val).
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

      // Then try resolving k in the context of val (reached through
      // following __proto__) to eventually get a shadowed value (some
      // props only make sense when resolved in the context of leaf
      // and an exception will be thrown upon trying to access them through val)
      try {
        if ( !(val === leaf || leafOnly.includes(k) || skip.includes(k)) ) {
          v = val[k];
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

      return `${indent.repeat(level)}${String(k)}{${descStr(val, k)}}: ${typeStr(v, k)}${sv}`;
    }).
    join('\n');
}

function chain(val) {
  let links = [val];

  for (let link = Object.getPrototypeOf(val);
    link;
    link = Object.getPrototypeOf(link)
  ) {
    links.push(link);
  }

  return links;
}

function chainStr(val, indent = '  ') {
  return chain(val).
    reverse().
    map((v, i) => `${indent.repeat(i)}[${typeStr(v, '__apivis__chain_link')}]`).
    join('\n');
}

function apiStr(val, indent = '  ') {
  return chain(val).
    reverse().
    map((v, i) => `${indent.repeat(i)}[${typeStr(v, '__apivis__chain_link')}]\n${membersStr(v, indent, i + 1, val)}`).
    join('\n');
}

// peek42 plugin
function peek42(fnOutput, fnComment) {
  return {
    type(val, comment = undefined, opts = undefined) {
      fnOutput(
        typeStr(val),
        fnComment(comment, val, 'type'),
        opts
      );
    },
    desc(val, k, comment = undefined, opts = undefined) {
      fnOutput(
        descStr(val, k),
        fnComment(comment, `${String(k)} in ${typeStr(val)}`, 'desc'),
        opts
      );
    },
    members(val, comment = undefined, opts = undefined) {
      fnOutput(
        membersStr(val,
          (opts && typeof opts.indent === 'string') ?
            opts.indent :
            undefined,
          (opts && typeof opts.indentLevel === 'number') ?
            opts.indentLevel :
            undefined
        ),
        fnComment(comment, typeStr(val), 'members'),
        opts
      );
    },
    chain(val, comment = undefined, opts = undefined) {
      fnOutput(
        chainStr(val,
          (opts && typeof opts.indent === 'string') ?
            opts.indent :
            undefined
        ),
        fnComment(comment, typeStr(val), 'chain'),
        opts
      );
    },
    api(val, comment = undefined, opts = undefined) {
      fnOutput(
        apiStr(val,
          (opts && typeof opts.indent === 'string') ?
            opts.indent :
            undefined
        ),
        fnComment(comment, typeStr(val), 'api'),
        opts
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

export {typeStr, descStr, members, membersStr, chain, chainStr, apiStr};
export default apivis;
