
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

it('should support return another wrap', function (done) {
  var i = 0
  var stack = [
    function (next) {
      i++;
      return next
    },
    function (next) {
      i++;
      return next
    }
  ]

  return compose(stack)().then(function () {
    assert.equal(i, 2)
    done()
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
