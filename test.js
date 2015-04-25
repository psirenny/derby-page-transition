var _ = require('lodash');
var lib = require('./index');
var Model = require('racer').Model;
var test = require('tape');

test('lib', function (t) {
  t.plan(1);
  t.equal(typeof lib, 'object');
});

test('css', function (t) {
  t.plan(8);
  t.equal(typeof lib.css, 'function');
  t.equal(typeof lib.css(), 'function');
  t.equal(typeof lib.css()(), 'string');
  t.equal(lib.css()(), 'transition--none');
  t.equal(lib.css({class: 'foo'})(), 'foo--none');
  t.equal(lib.css({sep: '*'})(), 'transition*none');
  t.equal(lib.css({class: 'trans', sep: '*'})({direction: 'forward', in: false, from: 'foo', to: 'bar'}), 'trans trans*forward trans*out trans*from*foo trans*to*bar');
  t.equal(lib.css({class: 'trans', sep: '*'})({direction: 'back', in: true, from: 'foo', to: 'bar'}), 'trans trans*back trans*in trans*from*foo trans*to*bar');
});

test('map', function (t) {
  t.plan(4);
  t.equal(typeof lib.map, 'function');
  t.equal(typeof lib.map(), 'function');
  var map = lib.map();
  t.equal(typeof map('foo'), 'undefined');
  map('foo', 'bar');
  t.equal(map('foo'), 'bar');
});

test('route', function (t) {
  t.plan(25);
  t.equal(typeof lib.route, 'function');
  t.equal(typeof lib.route(), 'function');
  t.equal(typeof lib.route()(), 'function');

  var modelA = new Model();
  lib.route()('forward', 'foo', 'bar')(null, modelA, null, function () {
    t.equal(modelA.get('$transition.in'), true);
  });
  t.equal(modelA.get('$transition.direction'), 'forward');
  t.equal(modelA.get('$transition.in'), false);
  t.equal(modelA.get('$transition.from'), 'foo');
  t.equal(modelA.get('$transition.to'), 'bar');

  var modelB = new Model();
  lib.route({path: '$trans'})('back', 'foo', 'bar')(null, modelB, null, function () {
    t.equal(modelB.get('$trans.in'), true);
  });
  t.equal(modelB.get('$trans.direction'), 'back');
  t.equal(modelB.get('$trans.in'), false);
  t.equal(modelB.get('$trans.from'), 'foo');
  t.equal(modelB.get('$trans.to'), 'bar');

  var modelC = new Model();
  lib.route({path: '$trans'})('back', 'foo', 'bar', {path: '_trans'})(null, modelC, null, function () {
    t.equal(modelC.get('_trans.in'), true);
  });
  t.equal(modelC.get('_trans.direction'), 'back');
  t.equal(modelC.get('_trans.in'), false);
  t.equal(modelC.get('_trans.from'), 'foo');
  t.equal(modelC.get('_trans.to'), 'bar');

  var map = lib.map();
  map('/foo', 'baz');
  map('/bar', 'qux');
  var modelD = new Model();
  lib.route({map: map})('back', null, null)(null, modelD, {previous: '/foo', url: '/bar'}, function () {
    t.equal(modelD.get('$transition.in'), true);
  });
  t.equal(modelD.get('$transition.direction'), 'back');
  t.equal(modelD.get('$transition.in'), false);
  t.equal(modelD.get('$transition.from'), 'baz');
  t.equal(modelD.get('$transition.to'), 'qux');

  var modelE = new Model();
  lib.route({path: '$trans'}).forward('foo', 'bar')(null, modelE, null, _.noop);
  t.equal(modelE.get('$trans.direction'), 'forward');

  var modelF = new Model();
  lib.route({path: '$trans'}).back('foo', 'bar', {path: '_trans'})(null, modelF, null, _.noop);
  t.equal(modelF.get('_trans.direction'), 'back');
});
