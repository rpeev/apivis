# ApiVis

Simple JavaScript objects API visualization

![Screenshot](./screenshot.png)

## [Demos](https://rpeev.github.io/apivis/)

## Install

### In a html page

Reference **apivis.js**:  

```html
<script src="path/to/apivis.js"></script>
```

### Node.js

```bash
npm install apivis
```

## Use

The following functions are available through the **apivis** (or the returned from `require('apivis')` in **node**) object:

- `typeStr(obj, k = undefined)` - returns type string for `obj` using optional hint for the `obj` key in a bigger structure (based on the `Object.prototype.toString.call(obj)` trick with a few twists)

- `descStr(obj, k)` - returns own property descriptor string for `k` in `obj` in the form `vw ec` or `g c` for example, where each letter shows if the prop is value and writable or getter and setter and if it is enumerable and configurable

- `members(obj)` - returns (sorted) array of all *own* `obj` property names (including symbols)

- `membersStr(obj, inst = obj, indent = '  ', level = 0)` - returns string representation for array of property names including type and own property descriptor information and the values for the primitive booleans, numbers and strings, separated by a newline and indented accordingly. The `inst` parameter is used by higher level functions to pass the actual `obj` instance (not the object reached through following the `__proto__`)

- `chain(obj)` - returns the prototype chain for `obj` (an array, `obj` is first, the root is last)

- `chainStr(obj, indent = '  ')` - returns string representation for `obj` prototype chain

- `apiStr(inst, filters = [], indent = '  ')` - returns string representation of `inst` API tree. Supports prototype name filtering (either a string or an array of strings containing (part of) prototype name)

See **apivis.html** and **apivis.node.js** for browser and node examples respectively.
