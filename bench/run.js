
var context = {}
var fns = []

fns.push(function* (next) {
  yield next
})

fns.push(function* (next) {
  yield* next
})

fns.push(function* (next) {
  yield Promise.resolve(null)
  yield* next
})

fns.push(function* (next) {
  yield* next

  yield new Promise(function (resolve) {
    setImmediate(resolve)
  })
})

suite('Koa Compose', function () {
  var compose = require('koa-compose')
  var co = require('co')
  var fn = compose(fns)

  set('mintime', 5000)

  bench('middleware', function (next) {
    co.call(context, fn).then(next, next)
  })
})

suite('Composition', function () {
  var compose = require('..')
  var fn = compose(fns)

  set('mintime', 5000)

  bench('middleware', function (next) {
    fn.call(context).then(next, next)
  })
})
