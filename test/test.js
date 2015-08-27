
var assert = require('assert');

var compose = require('..');

it('should support delegating-yielding a promise', function () {
  var stack = []

  stack.push(function* (next) {
    return yield* next
  })

  stack.push(function () {
    return Promise.resolve(true);
  })

  return compose(stack)().then(function (val) {
    assert.equal(val, true);
  })
})

it('should support delegating-yielding a random value', function () {
  var stack = []

  stack.push(function* (next) {
    return yield* next
  })

  stack.push(function () {
    return true;
  })

  return compose(stack)().then(function (val) {
    assert.equal(val, true);
  })
})

it('should support an empty array', function () {
  return compose([])().then(function () {

  })
})

it('should support .catch()', function () {
  return compose([])().catch(function () {

  })
})
