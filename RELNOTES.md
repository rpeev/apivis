# Release Notes

## 6.4.1

- Fixes for problematic property access cases

## 6.4.0

- Add `inspectHtml`, `apiHtml` and `domHtml` functions returning collapsible/expandable DOM representations

## 6.3.0

- Display constructor name when different from string tag
- Tweak the display of null proto objects
- Show the entries of Set and Map instances

## 6.2.0

- Add `inspectStr` method (similar to but much more informative than `JSON.stringify`)
- Tweak property keys sort comparison (preserve the usual string sorting behaviour and use numeric ordering for number keys)
- Tweak the display and the format for displaying values (use type:value without parentheses, `JSON.stringify` strings and dates, show array lengths)
- Display `Getter` for getters that cannot be resolved instead of showing the error caused by the access
- Add guards for some problematic property access cases

## 6.1.2

- Fix opts handling bug in `peek42` plugin code

## 6.1.0

- `typeStr` returns `BasicObject` for objects without `__proto__`
- `descStr` returns `n/a` when key in object is not present or calling it doesn't make sense
- `peek42` plugin functions pass through options to `apivis` and `peek42` functions

## 6.0.0

- Rename build entry points, outputs and examples
- Limit string values display to max length

## 5.1.1

- Add peek42 plugin

## 5.0.0

- Improve build infrastructure and clean source

## 4.0.1

- Add .npmignore file to include rollup output in the npm package ignored due to .gitignore

## 4.0.0

- Use rollup to build node, browser and ES module bundles

## 3.0.0

- Add `apivis.descStr(obj, k)` to show own property descriptor string for `k` (in the form `vw ec` or `g c` for example, where each letter shows if the prop is value and writable or getter and setter and if it is enumerable and configurable)
- Show the prop desc string in `apivis.membersStr` (between `{}` after the prop name)
- Show function arity in `apivis.typeStr` in the form `fn([arg1, ..., argN])` instead of `fn(arity)`
- Show the values of primitive booleans, numbers and strings in `apivis.membersStr`
- Improve `apivis.membersStr` heuristic for resolving props against the instance vs objects higher up the proto chain to show how props are shadowed throughout the API hierarchy in `apivis.apiStr`

## 2.1.0

`apivis.chain(obj)` now includes `obj`

## 2.0.0

API changes

- remove `privateMembers`
- rename `props`, `propsStr`, `protos` and `protosStr` to `members`, `membersStr`, `chain` and `chainStr`

## 1.3.0

- Include symbol keyed properties
- Use brackets around API nodes instead of up arrow symbol before them
- Use undefined instead of null for properties that cannot be meaningfully evaluated

## 1.2.0

Significantly improve typeStr heuristic resulting in much more useful API tree representation

## 1.1.0

Tweak property lookup in propsStr (look up constructor and prototype in the object that owns them)

## 1.0.1

Add readme and release notes

## 1.0.0

Initial release
