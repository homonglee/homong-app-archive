const assert = require('node:assert/strict');
const {
  applySavedOrder,
  mergeVisibleOrder,
  moveBeforeOrAfter,
  moveToEdge,
  safeReadOrder,
  safeWriteOrder,
  safeRemoveOrder,
} = require('../assets/archive-order.js');

const apps = ['a','b','c','d'].map(slug => ({slug}));

assert.deepEqual(applySavedOrder(apps, ['c','a']).map(x=>x.slug), ['b','d','c','a']);
assert.deepEqual(applySavedOrder([{slug:'new'}, ...apps], ['c','a','b','d']).map(x=>x.slug), ['new','c','a','b','d']);
assert.deepEqual(mergeVisibleOrder(apps, [apps[2], apps[0]]).map(x=>x.slug), ['c','b','a','d']);
assert.deepEqual(moveBeforeOrAfter(apps, 'a', 'b').map(x=>x.slug), ['b','a','c','d']);
assert.deepEqual(moveBeforeOrAfter(apps, 'c', 'b').map(x=>x.slug), ['a','c','b','d']);
assert.deepEqual(moveToEdge(apps, 'c', 'first').map(x=>x.slug), ['c','a','b','d']);
assert.deepEqual(moveToEdge(apps, 'b', 'last').map(x=>x.slug), ['a','c','d','b']);

const throwingStorage = {
  getItem(){ throw new DOMException('blocked', 'SecurityError'); },
  setItem(){ throw new DOMException('full', 'QuotaExceededError'); },
  removeItem(){ throw new DOMException('blocked', 'SecurityError'); },
};
assert.deepEqual(safeReadOrder(throwingStorage, 'key'), []);
assert.equal(safeWriteOrder(throwingStorage, 'key', ['a']), false);
assert.equal(safeRemoveOrder(throwingStorage, 'key'), false);

const memory = new Map();
const storage = {
  getItem:key=>memory.get(key) ?? null,
  setItem:(key,value)=>memory.set(key,value),
  removeItem:key=>memory.delete(key),
};
assert.equal(safeWriteOrder(storage, 'key', ['b','a']), true);
assert.deepEqual(safeReadOrder(storage, 'key'), ['b','a']);
assert.equal(safeRemoveOrder(storage, 'key'), true);
assert.deepEqual(safeReadOrder(storage, 'key'), []);

console.log('archive order behavior: ok');
