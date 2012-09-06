/*!
 * calendar.js v0.0.1
 * Copyright 2012, Tim Branyen (@tbranyen)
 * calendar.js may be freely distributed under the MIT license.
 */
(function() {

  //
  // Features:
  // ES5 without compatibility bloat
  // Super fast rendering off Document
  // Date convenience methods
  // Custom events
  // 

  //
  // TODO
  // * Better Day text insertion
  // * Implement DOM events
  // * Implement internal events
  // * Allow easier class adding
  // 

  // Store reference to the global scope.
  var window = this;
  var document = this.document;

  // Portable & reusable Events object, not too different from what is found
  // in Backbone.
  //
  // (Credits @visionmedia) & Modified from:
  // https://raw.github.com/component/emitter/master/index.js
  var Events = {
    // Cache all callbacks.
    callbacks: {},

    // Listen on the given `event` with `fn`.
    on: function(event, fn){
      var callback = this.callbacks[event] = this.callbacks[event] || [];
      callback.push(fn);

      return this;
    },

    // Adds an `event` listener that will be invoked a single time then
    // automatically removed.
    once: function(event, fn){
      var self = this;

      function on() {
        self.off(event, on);
        fn.apply(this, arguments);
      }

      fn._off = on;
      this.on(event, on);
      return this;
    },

    // Remove the given callback for `event` or all registered callbacks.
    off: function(event, fn){
      var i;
      var callbacks = this.callbacks[event];

      if (!callbacks) {
        return this;
      }

      // remove all handlers
      if (arguments.length === 1) {
        delete this.callbacks[event];
        return this;
      }

      // remove specific handler
      i = callbacks.indexOf(fn._off || fn);

      if (~i) {
        callbacks.splice(i, 1);
      }

      return this;
    },

    // Emit `event` with the given args.
    emit: function(event){
      var i, len;
      var args = [].slice.call(arguments, 1);
      var callbacks = this.callbacks[event];

      if (callbacks) {
        callbacks = callbacks.slice(0);

        for (i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    },

    // Return array of callbacks for `event`.
    listeners: function(event){
      return this.callbacks[event] || [];
    },

    // Check if this emitter has `event` handlers.
    hasListeners: function(event){
      return Boolean(this.listeners(event).length);
    }
  };

  // Custom extend method.
  var extend = function(target) {
    var i, prop, source;
    var sources = toArray(arguments).slice(1);

    // Iterate over all object sources.
    for (i = 0; i < sources.length; i++) {
      // Shorthand the source.
      source = sources[i];

      // Ensure the source is defined and an object.
      if (typeof source === "object") {
        // Iterate over all properties in the source.
        for (prop in source) {
          // Assign the property to the source.
          target[prop] = source[prop];
        }
      }
    }

    return target;
  };

  var toArray = function(obj) {
    return Array.prototype.slice.call(obj);
  };

  var getFullMonth = function() {
    return [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ][this.getMonth()];
  };

  var getFullWeek = function() {
    return [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
      "Saturday"
    ][this.getDay()];
  };

  // Calendur constructor.
  function Calendar(el, options) {
    // Use the passed element or find it via selector lookup.
    this.el = typeof el === "string" ? document.querySelector(el) : el;

    // Set default options.
    this.options = {
      // The element tagNames to create by default (a table).
      tagName: { month: "table", week: "tr", day: "td" },

      // The classNames to use on respective elements.
      className: { month: "month", week: "week", day: "day", today: "today" }
    };

    // Mix the options passed into the constructor into the options object.
    extend(this.options, options);
    // Give this instance events!
    extend(this, Events);
  }

  Calendar.prototype = {
    // Initial setup and rendering of the calendar control.
    init: function() {
      // Create a new date object for today.
      this.date = new Date();

      // Extend the Date object with some additional convenience methods.
      extend(this.date, {
        getFullMonth: getFullMonth,
        getFullWeek: getFullWeek
      });

      // Reset to today for initial render.
      this.update();

      // Render initial table state.
      this.render();

      return this;
    },

    // Create the internal month matrix.
    update: function() {
      var weekDay, day, weekOffset, firstDay, offset;
      // Internal month matrix array.
      var month = [
        [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]
      ];
      // Create a shadow date to work off, as to not alter the interior date.
      var shadow = new Date(this.date.getTime());
      // Start the day counter off at 1 (first day in the month).
      var dayCounter = 1;
      // Save the current month for future comparisons to find the bounding
      // dates of the month.
      var currentMonth = shadow.getMonth();

      // Start the month.
      shadow.setDate(dayCounter);

      // Fill the month up with the correct dates.  Craft the entire month
      // object here... figure out the current week and then offset everything
      // correctly and then just pad the first and last week accordingly.
      while (true) {
        // Once we've exceeded into the next month, bail out for now.
        if (shadow.getMonth() !== currentMonth) {
          break;
        }
        
        // Find the current day (1-31).
        day = shadow.getDate();
        // Find the weekDay (0-6).
        weekDay = shadow.getDay();
        // Find the week.
        weekOffset = ~~((day+(6-weekDay))/7);

        // First day offset cache.
        if (dayCounter === 1) {
          firstDay = [weekOffset, weekDay];
        }

        // Add this day to the month array.
        month[weekOffset][weekDay] = dayCounter;

        // Progress to tomorrow.
        shadow.setDate(++dayCounter);
      }

      // Craft it based off the current month.
      var previousMonth = new Date(shadow.getTime());
      // Start at the beginning of the month.
      previousMonth.setDate(1);
      // Set to the previous month.
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      // Fill in previous month.
      month.forEach(function(week, weekOffset) {
        // Ensure we're operating only on weeks that exist on or prior to the
        // first day.
        if (weekOffset <= firstDay[0]) {
          // Iterate over all the days.
          week.forEach(function(day, weekDay) {
            // Calculate the offset.
            var dayOffset = (weekOffset * 7) + weekDay;
            var firstDayOffset = (firstDay[0] * 7) + firstDay[1];
            // If the first day of the month does not land on the same week,
            // then use the end of the week to offset.
            var dayNormalized = weekOffset === firstDay[0] ? firstDay[1] : 7;

            // If we are operating within the dead zone (previous month).
            if (weekDay < dayNormalized) {
              // Only calculate the offset once for the first.
              offset = !offset ? -(firstDayOffset - dayOffset) : 1;
              previousMonth.setDate(previousMonth.getDate() + offset);
              week[weekDay] = { type: "prev", val: previousMonth.getDate() };
            }
          }, this);
        }
      }, this);

      // Craft it based off the current month.
      var nextMonth = new Date(shadow.getTime());
      // Start at the end of the month.
      nextMonth.setDate(shadow.getDate()-1);

      // Fill in next month.
      month.forEach(function(week, currentWeekOffset) {

        // Ensure we're operating only on weeks that exist on or after the
        // last day.
        if (currentWeekOffset >= weekOffset) {
          // Iterate over all the days.
          week.forEach(function(day, currentWeekDay) {
            // If we are operating within the dead zone (previous month).
            if (!day) {
              // Only calculate the offset once for the first.
              nextMonth.setDate(nextMonth.getDate() + 1);
              week[currentWeekDay] = { type: "next", val: nextMonth.getDate() };
            }
          }, this);
        }
      }, this);

      // Assign the internal month matrix.
      this._month = month;

      // Emit a change event.
      this.emit("change");

      return this;
    },

    // Create the calendar DOM structure.
    render: function() {
      this.emit("beforeRender");

      // Create a clone of the current element to operate (off the document).
      var shadow = this.el.cloneNode();
      // Create a month element to hold the calendar weeks.
      var monthEl = document.createElement(this.options.tagName.month);
      // Set the className.
      monthEl.className = this.options.className.month;

      // Iterate over all the weeks and add each one.
      this._month.forEach(function(week) {
        // Create a week element to hold the week days.
        var weekEl = document.createElement(this.options.tagName.week);
        // Set the className.
        weekEl.className = this.options.className.week;
        
        // Iterate over all the days and add each one.
        week.forEach(function(day) {
          var dayEl = document.createElement(this.options.tagName.day);
          // Set the className.
          dayEl.className = this.options.className.day;

          // Add a today className.
          if (day === this.date.getDate()) {
            dayEl.className += " " + this.options.className.today;
          } else if (day.type === "prev") {
            dayEl.className += " prev";
          } else if (day.type === "next") {
            dayEl.className += " next";
          }

          // For now just set the text.
          if (typeof day === "object") {
            dayEl.innerHTML = day.val;
          } else {
            dayEl.innerHTML = day || "&nbsp;";
          }

          // Add the day element to the week element.
          weekEl.appendChild(dayEl);
        }, this);

        // Add the week element to the month element.
        monthEl.appendChild(weekEl);
      }, this);

      // Add the month element to the shadow element.
      shadow.appendChild(monthEl);

      // Replace the internal element with the shadow element.
      this.el.parentNode.replaceChild(shadow, this.el);
      this.el = shadow;

      this.emit("afterRender");

      return this;
    }
  };

  // Expose this for public consumption.
  Calendar.Events = Events;

  // Expose to the global scope.
  window.Calendar = Calendar;

})();
