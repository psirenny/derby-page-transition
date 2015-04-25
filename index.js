var _ = require('lodash');

var defaults = {
  class: 'transition',
  delay: 150,
  map: _.constant(null),
  path: '$transition',
  sep: '--'
};

module.exports.css = function (options) {
  var opts = _.merge({}, defaults, options || {});

  return function (transition) {
    if (!transition) return opts.class + opts.sep + 'none';
    var css = opts.class;
    css += ' ' + opts.class + opts.sep + (transition.direction === 'forward' ? 'forward' : 'back');
    css += ' ' + opts.class + opts.sep + (transition.in ? 'in' : 'out');
    if (transition.from) css += ' ' + opts.class + opts.sep + 'from' + opts.sep + transition.from;
    if (transition.to) css += ' ' + opts.class + opts.sep + 'to' + opts.sep + transition.to;
    return css;
  };
};

module.exports.map = function () {
  var map = {};
  return function (path, name) {
    if (!name) return map[path];
    map[path] = name;
  };
};

module.exports.route = function (app, options) {
  var route = function (dir, from, to, opts) {
    var opts = _.merge({}, defaults, options || {}, opts || {});

    return function (page, model, params, next) {
      var $transition = model.at(opts.path);
      from = from || opts.map(params.previous);
      to = to || opts.map(params.url);
      $transition.set('direction', dir);
      $transition.set('in', false);
      $transition.set('from', from);
      $transition.set('to', to);

      app.once('render', function () {
        $transition.set('in', true);
      });

      if (from) return _.delay(next, opts.delay);
      next();
    };
  };

  route.forward = function (from, to, opts) {
    return route('forward', from, to, opts);
  };

  route.back = function (from, to, opts) {
    return route('back', from, to, opts);
  };

  return route;
};
