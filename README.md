calendar.js
===========

A tiny component for creating calendars in modern web browsers with
performance, flexibility, and stability in mind.

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

* [Development](https://raw.github.com/matchbox/calendar.js/master/calendar.js)
* [Production](https://raw.github.com/matchbox/calendar.js/master/dist/calendar.min.js)

Include in your application.

``` html
<script src="/js/calendar.js"></script>
```

### Using with AMD ###

If you are using RequireJS you can include using the shim configuration.

``` javascript
require.config({
  shim: {
    // Include calendar.js and ensure the global is exported correctly.
    "calendar": {
      exports: "Calendar"
    }
  }
});
```

If you are using a different AMD loader, perhaps the
[use.js](https://github.com/tbranyen/use.js) plugin will work for you.

## Usage ##

This will show how to create a new `Calendar` instance, configure, and render
it into the page `Document`.

### Creating a new Calendar instance ###

To create a new Calendar instance to configure:

``` javascript
// Must pass in either a DOMNode or a string selector.
var cal = new Calendar(".calendar");

// Call init once you have finished binding event handlers and changed options.
cal.init();
```

### Change default tag and class names ###

### Binding to custom Calendar events ###

There are several events you can listen to, which can be used to update your UI
accordingly.

* `initialize` is triggered once the calendar is created
* `update` is triggered after the `update` function is called
* `beforeRender` is triggered before rendering starts
* `afterRender` is triggered after rendering ends

An example of when binding to an event can be useful:

``` javascript
// Update a month label with the current calendar month.
cal.on("update", function(cal) {
  $(".month").html(cal.date.getFullMonth());
});
```

You can create and trigger custom events, using `on` and `trigger` functions
respectively.

### Customizing what is shown in specific date cells ###

...

### Changing and updating the calendar date ###

...

### Contributing ###

**Discuss contribution stuff here**

### Building ###

**Discuss Grunt stuff here**

### Author ###

**Tim Branyen**

+ http://twitter.com/tbranyen
+ http://github.com/tbranyen

---

Copyright 2012 Matchbox, Inc.

![Matchbox, Inc.](https://github.com/matchbox/calendar.js/raw/assets/matchbox-logo-240x40.png)
