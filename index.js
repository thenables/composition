
var Promise = require('native-or-bluebird');
var co = require('co');

module.exports = compose;

compose.Wrap = Wrap;

function compose(middleware) {
  return function (next) {
    next = next || new Wrap(noop);
    var i = middleware.length;
    while (i--) next = new Wrap(middleware[i], this, next);
    return next
  }
}

/**
 * Wrap a function, then lazily call it,
 * always returning both a promise and a generator.
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @param {Wrap} next
 */

function Wrap(fn, ctx, next) {
  if (typeof fn !== 'function') throw TypeError('Not a function!');
  this._fn = fn;
  this._ctx = ctx;
  this._next = next;
}

/**
 * Lazily call the function.
 * Note that if it's not an async or generator function,
 * throws may mess things up.
 *
 * @returns {Mixed}
 */

Wrap.prototype._getValue = function () {
  return this._fn.call(this._ctx, this._next);
};

/**
 * Lazily create a promise from the return value.
 *
 * @returns {Promise}
 */

Wrap.prototype._getPromise = function () {
  var value = this._getValue();
  return isGenerator(value)
    ? co.call(this._ctx, value)
    : Promise.resolve(value);
}

/**
 * Lazily create a generator from the return value.
 *
 * @returns {Iterator}
 */

Wrap.prototype._getGenerator = function () {
  var value = this._getValue();
  return isGenerator(value)
    ? value
    : promiseToGenerator.call(this._ctx, value);
}

/**
 * In later version of v8,
 * `yield*` works on the `[@@iterator]` method.
 *
 * @returns {Iterator}
 */

if (typeof Symbol !== 'undefined') {
  Wrap.prototype[Symbol.iterator] = function () {
    return this._getGenerator();
  }
}

/**
 * This creates a generator from a promise or a value.
 *
 * TODO: try to avoid using a generator function for this.
 *
 * @returns {Iterator}
 */

var loggedDeprecationMessage = false;
function* promiseToGenerator(promise) {
  if (!loggedDeprecationMessage) {
    console.error('A promise was converted into a generator, which is an anti-pattern. Please avoid using `yield* next`!')
    loggedDeprecationMessage = true;
  }
  return yield Promise.resolve(promise);
}

/**
 * Proxy generator and promise methods.
 */

Wrap.prototype.then = function (resolve, reject) {
  return this._getPromise().then(resolve, reject);
}

Wrap.prototype.catch = function (reject) {
  return this._getPromise().catch(reject);
}

Wrap.prototype.next = function (val) {
  return this._getGenerator().next(val);
}

Wrap.prototype.throw = function (err) {
  return this._getGenerator().throw(err);
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isGenerator(obj) {
  return obj
    && typeof obj.next === 'function'
    && typeof obj.throw === 'function';
}

function noop() {}
