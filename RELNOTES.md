# Release Notes

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
