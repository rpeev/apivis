import {
  name as LIB_NAME,
  version as LIB_VERSION
} from '../../package.json';

const {
  hasOwnProperty,
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

  if (val instanceof Error) {
    // name might be a getter that throws
    try {
      let name = val.name;

      if (name && name !== t) {
        t = name;
      }
    } catch (err) {}
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

  return t;
}

function valueStr(val) {
  switch (typeof val) {
  case 'boolean':
  case 'number':
    return `${val}`;
  case 'string':
    return JSON.stringify(val);
  case 'object':
    if (Array.isArray(val) && val !== Array.prototype) {
      return `${val.length}`;
    } else if (val instanceof Date) {
      return JSON.stringify(val);
    } else if (val instanceof Error) {
      // message might be a getter that throws
      try {
        let msg = val.message;

        if (msg) {
          return JSON.stringify(msg);
        }
      } catch (err) {
        return '';
      }
    }
  default:
    return '';
  }
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

  return (d2) ? `${d1} ${d2}` : d1;
}

const _getterTagDummy = {
  __proto__: {
    get [Symbol.toStringTag]() { return 'Getter'; }
  }
};

const _noop = () => {};
const _swallowPromiseRejection = v => (
  (typeof v === 'object' && v !== null &&
    v !== Promise.prototype && typeof v.catch === 'function' &&
      v.catch(_noop)),
  v
);

function memberStr(val, k, leaf = val) {
  let sk = String(k);
  let sd = descStr(val, k);
  let isGetter = sd.includes('g');
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
  let st;
  let v;
  let sv = '';

  // First resolve k in the context of leaf (like it would be normally)
  try {
    if (!skip.includes(k)) {
      v = _swallowPromiseRejection(leaf[k]);
    }
  } catch (err) {
    v = (isGetter) ? _getterTagDummy : err;
  }

  // Then try resolving k in the context of val (reached through
  // following __proto__) to eventually get a shadowed value (some
  // props only make sense when resolved in the context of leaf
  // and an exception will be thrown upon trying to access them through val)
  try {
    if ( !(val === leaf || leafOnly.includes(k) || skip.includes(k)) ) {
      let shadowed = _swallowPromiseRejection(val[k]);

      if (shadowed !== undefined && shadowed !== null) {
        v = shadowed;
      }
    }
  } catch (err) {
    // Leave v as set by trying to resolve k in the context of leaf
  }

  st = typeStr(v, k);
  sv = valueStr(v);

  return `${sk}{${sd}}: ${st}${(sv) ? `:${sv}` : ''}`;
}

const _compare = (a, b) => {
  let sa = String(a);
  let sb = String(b);
  let na;
  let nb;

  if (Number.isNaN(na = Number(sa)) || Number.isNaN(nb = Number(sb))) {
    return (sa < sb) ? -1 : (sa > sb) ? 1 : 0;
  }

  return na - nb;
};

const _keys = (val, kind) =>
  (val === undefined || val === null) ?
    [] :
    Object[`getOwnProperty${kind}`](val).sort(_compare);

const _symbols = val => _keys(val, 'Symbols');
const _names = val => _keys(val, 'Names');

const members = val => _symbols(val).concat(_names(val));

function membersStr(val, indent = '  ', level = 0, leaf = val) {
  return members(val).
    map(k => `${indent.repeat(level)}${memberStr(val, k, leaf)}`).
    join('\n');
}

const _descendableObject = v =>
  typeof v === 'object' && v !== null;
const _descendableFunction = v =>
  typeof v === 'function' &&
  hasOwnProperty.call(v, 'prototype') &&
  v.name && v.name.match(/^[A-Z]/);

const _shouldDescend = (k, v, level) =>
  (_descendableObject(v) || _descendableFunction(v)) && level < 2;

function _inspectStr(val, k, indent = '  ', level = 1) {
  let result = [`${indent.repeat(level)}${memberStr(val, k)}`];
  let _val = _swallowPromiseRejection(val[k]);

  if (_shouldDescend(k, _val, level)) {
    members(_val).forEach(_k => result.push(
      _inspectStr(_val, _k, indent, level + 1)
    ));
  }

  return result.join('\n');
}

function inspectStr(val, indent = '  ') {
  let st = typeStr(val);
  let sv = valueStr(val);
  let result = [`${st}${(sv) ? `:${sv}` : ''}`];

  members(val).forEach(k => result.push(
    _inspectStr(val, k, indent)
  ));

  return result.join('\n');
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
    member(val, k, comment = undefined, opts = undefined) {
      fnOutput(
        memberStr(val, k),
        fnComment(comment, `${String(k)} in ${typeStr(val)}`, 'member'),
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
    inspect(val, comment = undefined, opts = undefined) {
      fnOutput(
        inspectStr(val,
          (opts && typeof opts.indent === 'string') ?
            opts.indent :
            undefined
        ),
        fnComment(comment, typeStr(val), 'inspect'),
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
  memberStr,
  members,
  membersStr,
  inspectStr,
  chain,
  chainStr,
  apiStr,
  peek42
};

export {
  typeStr,
  descStr,
  memberStr,
  members,
  membersStr,
  inspectStr,
  chain,
  chainStr,
  apiStr
};
export default apivis;
