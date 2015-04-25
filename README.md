Derby Page Transition
=====================

Make it easier to add smooth transitions across page renders.

How it works
------------

It takes advantage of transitional routes to add a delay between page routes.  
During this timeout, transition data is added to the page model indicating how it should animate out.
A view function can be used to convert this model data to css classes that can be added to the body of the page.

When the timeout ends, the transitional route modifies the model data to indicate to the subsequent page that it should animate in. It then passes control to the next route handler.

The timeout defaults to 150ms but should be adjusted to match the duration of your animations.

Installation
------------

    npm install derby-page-transition --save

Usage
-----

Require the module:

    var transition = require('derby-page-transition');

Include the css view function in your app:

    app.proto.transitionToCss = transition.css();

Apply this view function to the body of your page:

    <Body:>
      <div class="{{transitionToCss($transition)}}">
        ...
      </div>

Add transitions to the pages you want to animate:

    var route = transition.route();

    app.get({from: '/aboutUs', to: '/contactUs'}, {
      forward: route.forward('basicPage', 'formPage'),
      back: route.back('basicPage', 'formPage')
    });

Or animate all pages on your site:

    var route = transition.route();
    var getName = ...

    function handler(direction) {
      return function (page, model, params, next) {
        var from = getName(params.previous);
        var to = getName(params.url);
        var trans = route(direction, from, to);
        trans(page, model, params, next);
      }
    }

    app.get({from: '*', to: '*'}, {
      forward: handler('forward')
    });

Add some animations to your stylesheet:

    @keyframes page-transition-in
      from
        transform translateX(100%)
      to
        transform translateX(0)

    @keyframes page-transition-out
      from
        transform translateX(0)
      to
        transform translateX(-100%)

    .transition .layout
      animation-duration 0.15s
      animation-fill-mode both

    .transition--back .layout
      animation-direction reverse

    .transition--in .layout
      animation-name page-in

    .transition--out .layout
      animation-name page-out

Mapping pages
-------------

It's not feasible to add transitions between the cross product of all your pages.
Map your pages to types and transition between those types instead.
If a page isn't found, then it won't be animated.

    var transition = require('derby-page-transition');
    var map = app.map = transition.map();

    // map each url to a page type
    app.map('/about', 'basicPage');
    app.get('/about', ...);

    app.map('/terms', 'basicPage');
    app.map('/terms', ...);

    app.map('/home', 'heroPage');
    app.map('/home', ...);

    // no transition from signin page
    app.get('/signin', ...)

    // pass in your map
    var route = transition.route({map: map});

    app.get({from: '*', to: '*'}, {
      forward: route.forward(null, null)
    });

Pass in `null` to the route function for it to refer to the map.

Css options
-----------

**class** - The css class name. Defaults to **transition**.

**separator** The separator between the css class modifiers. Defaults to **--**.

Route function
--------------

transition.route([globalOptions])(direction, from, [to], [options])

options or globalOptions:

**delay** - The delay between page transitions. Defaults to 150ms.

**map** - A mapping between urls and pages. Empty by default.

**path** - The model path to set transition data. Defaults to **$transition**.

You may also call:

transition.route([globalOptions]).forward(from, [to], [options])

transition.route([globalOptions]).back(from, [to], [options])

Notes
-----

To ensure a smooth transition, the ending state of the page animating out should match the starting state of a page animating in.
