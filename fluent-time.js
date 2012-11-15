
(function () {

  'use strict';

  // ### extends
  // a simple prototype *extender*
  var __extends = function(parent, child) {
    for(var key in parent.prototype) {
      child.prototype[key] = parent.prototype[key];
    }
  };

  // Fluent Time
  // ------------
  // our main object that exposes the starting points
  // of the fluent api.

  var FluentTime = {
    every: function(leap) {
      return new FluentTime.Interval(leap);
    },

    after: function(leap) {
      return new FluentTime.TimeOut(leap);
    }
  };

  // TimeLeap
  // --------
  // the timeleap contains the logic of calculating minutes, hours etc.
  // to milliseconds.

  FluentTime.TimeLeap = function(leap) {
    this.leap = leap;
    this.ms = 0;
  };

  // ### days
  // adds the previously provided leap amount as days.
  FluentTime.TimeLeap.prototype.days = function(fn) {
    this.ms += this.leap * 86400000;
    this.leap = 0;
    this.finalizeIfCallback(fn);
    return this;
  };

  // ### hours
  // adds the previously provided leap amount as hours.
  FluentTime.TimeLeap.prototype.hours = function(fn) {
    this.ms += this.leap * 3600000;
    this.leap = 0;
    this.finalizeIfCallback(fn);
    return this;
  };

  // ### minutes
  // adds the previously provided leap amount as minutes.
  FluentTime.TimeLeap.prototype.minutes = function(fn) {
    this.ms += this.leap * 60000;
    this.leap = 0;
    this.finalizeIfCallback(fn);
    return this;
  };

  // ### seconds
  // adds the previously provided leap amount as seconds.
  FluentTime.TimeLeap.prototype.seconds = function(fn) {
    this.ms += this.leap * 1000;
    this.leap = 0;
    this.finalizeIfCallback(fn);
    return this;
  };

  // ### milliseconds
  // adds the previously provided leap amount as milliseconds.
  FluentTime.TimeLeap.prototype.milliseconds = function(fn) {
    this.ms += this.leap;
    this.leap = 0;
    this.finalizeIfCallback(fn);
    return this;
  };

  // ### and
  // adds a new leap.
  FluentTime.TimeLeap.prototype.and = function(leap) {
    this.leap = leap;
    return this;
  };

  // ### finalizeIfCallback
  FluentTime.TimeLeap.prototype.finalizeIfCallback = function(fn) {
    if (fn && typeof(fn) === 'function') {
      this.schedule(fn);
    }
  };

  // ### occurs
  // returns a `Date` object representing when the current leap
  // will occur
  FluentTime.TimeLeap.prototype.occurs = function() {
    return new Date(Date.now() + this.ms);
  };

  // ### schedule
  // this is an empty schedule function that will be overriden in
  // replaced in `TimeOut` and `Interval`.
  FluentTime.TimeLeap.prototype.schedule = function(fn) {};

  // TimeOut
  // -------

  FluentTime.TimeOut = function(leap){
    FluentTime.TimeLeap.apply(this, arguments);
  };

  __extends(FluentTime.TimeLeap, FluentTime.TimeOut);

  FluentTime.TimeOut.prototype.schedule = function(fn) {
    var _this = this;
    this.timeout = setTimeout(function() {
      fn(_this);
    }, this.ms);
  };

  FluentTime.TimeOut.prototype.cancel = function() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  // Interval
  // --------

  FluentTime.Interval = function(val) {
    FluentTime.TimeOut.apply(this, arguments);
    this.times = 0;
    this.skippingNext = 0;
  };

  __extends(FluentTime.TimeOut, FluentTime.Interval);

  // ### schedule
  FluentTime.Interval.prototype.schedule = function(fn) {
    var _this = this;
    this.timeout = setTimeout(function() {
      _this.times++;
      // schedule next execution.
      _this.schedule(fn);
      // only run the code
      // when not supposed to skip.
      if (!_this.skippingNext) {
        fn(_this);
      }

      // decrease the skip amount
      else {
        _this.skippingNext--;
      }
    }, this.ms);
  };

  // ### skip
  FluentTime.Interval.prototype.skip = function(number) {
    if (typeof(number) !== 'number' || number < 1) {
      throw new Error('You must provide a non negative number');
    }

    this.skippingNext += number;
    return this;
  };

  if (module && module.exports) {
    module.exports = FluentTime;
  }

  else {
    window.FluentTime = FluentTime;
  }

}());
