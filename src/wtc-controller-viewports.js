/*
  Viewports / ViewportManager
  =======================================
  - *Author*          liamegan
  - *email*           liam@wethecollective.com
  - *Created*         2015-10-07 10:33:20
  - *namespace*       com.wtc.utilities
  - *Requirements*    jquery   ElementController   wethecollective.utilities.Scroller
  - *Description*     These are two classes that are used for inserting and maintinaing viewports. This is useful for running code when the user scrolls a particular viewport into view.
  - *Edited by*       Liam Egan
  - *Edited*          2016-06-20 11:52:02
  - *Version*         0.8
*/
;(function() {
  'use strict';
  var _base;

  var __slice = Array.prototype.slice;
  var __indexOf = Array.prototype.indexOf || function(item)
  {
    for (var i = 0, l = this.length; i < l; i++)
    {
      if (this[i] === item) return i;
    }
    return -1;
  };
  var __hasProp = Object.prototype.hasOwnProperty;
  var __extends = function(child, parent)
  {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  window.wtc = window.wtc || {};
  window.wtc.controller = window.wtc.controller || {};

  return (function($, NS)
  {
    var $w;
    $w = $(window);

    NS.ViewportManager = (function()
    {
      var ViewportManagerPrivate, instance, selector, vpSelector;
      function ViewportManager() {}
      instance = null;
      selector = '#viewport-container';
      vpSelector = '.viewport';
      ViewportManagerPrivate = (function()
      {
        function ViewportManagerPrivate($element)
        {
          var op;
          this.$element = $element;
          this.reverse = ($element.attr('data-reverse') && $element.attr('data-reverse') == 'true') ? true : false;
          op = this;
          $w.resize(function(e)
          {
            return op.resize(e);
          }).resize();
          setTimeout(function()
          {
            return $w.resize();
          }, 500);
          window.wtc.utilities.Scroller.bind('scroll', function()
          {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return op.onScroll.apply(op, args);
          });
          this.VPs = [];
        }
        ViewportManagerPrivate.prototype.tidy = function()
        {
          var VP, _i, _len, _ref;
          if (!this.VPs || !this.VPs.length) {
            return;
          }
          _ref = this.VPs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            VP = _ref[_i];
            VP.tidy();
          }
        };
        ViewportManagerPrivate.prototype.registerViewport = function(VP)
        {
          var exists;
          exists = false;
          exists = __indexOf.call(this.VPs, VP) >= 0;
          if (!exists) {
            this.VPs.push(VP);
          }
          VP.ID = this.VPs.length - 1;
          return VP.ID;
        };
        ViewportManagerPrivate.prototype.unregisterViewport = function(VP)
        {
          var f;
          f = this.VPs.filter(function(_vp) {
            return _vp !== VP;
          });
          this.VPs = f;
        };
        ViewportManagerPrivate.prototype.getNextVP = function(ID)
        {
          return this.VPs[ID + 1];
        };
        ViewportManagerPrivate.prototype.resize = function(e)
        {
          $w.trigger('scroll');
          return $(this.VPs).each(function() {
            try {
              return this.resize();
            } catch (e) {

            }
          });
        };
        ViewportManagerPrivate.prototype.onScroll = function(top, middle, bottom)
        {
          var d, per, win_height;
          top = $w.scrollTop();
          win_height = $w.height();
          bottom = win_height + top;
          middle = top + win_height / 2;
          d = $(document).height();
          per = top / (d - win_height);
          return $(this.VPs).each(function()
          {
            var bottomPercent, isOnScreen, middlePercent, topPercent;
            isOnScreen = this.getIsOnScreen({
              top: top,
              bottom: bottom
            });
            if (isOnScreen)
            {
              topPercent = 0 - ((this.top - bottom) / win_height * 100);
              bottomPercent = (bottom - this.bottom) / win_height * 100;
              middlePercent = middle / this.bottom * 100;
              try
              {
                this.runAnimation(topPercent, bottomPercent, middlePercent);
              } catch (e)
              {
                console.warn(this.$element.attr('id'), e.message);
              }
            } else
            {
              try
              {
                this.reset(top < this.bottom);
              } catch (e)
              {
                console.warn(e);
              }
            }
          });
        };
        ViewportManagerPrivate.prototype.navigateToNext = function(VP)
        {
          var duration, nextVP, now, point;
          nextVP = this.getNextVP(VP.ID);
          now = $w.scrollTop();
          point = nextVP.getOffsetMiddle();
          duration = (now - point) * 1.5;
          if (duration < 0) {
            duration = duration * -1;
          }
          return $('body, html').animate({
            scrollTop: point
          }, {
            duration: duration,
            easing: 'easeOutCubic'
          });
        };
        return ViewportManagerPrivate;
      })();
      ViewportManager.get = function(selector)
      {
        if (selector === null) {
          selector = selector;
        }
        return instance !== null ? instance : instance = new ViewportManagerPrivate($(selector));
      };
      ViewportManager.init = function() {};

      return ViewportManager;
    })();

    NS.Viewport = (function()
    {
      __extends(Viewport, wtc.controller.ElementController);
      function Viewport($element)
      {
        var op;
        this.$element = $element;
        Viewport.__super__.constructor.apply(this, arguments);
        this.top = null;
        this.bottom = null;
        this.height = null;
        op = this;
        this.ID = null;
        NS.ViewportManager.get().registerViewport(op);
      }
      Viewport.prototype.elementExistsInDOM = function()
      {
        var element, exists;
        exists = this.$element && this.$element[0];
        if (!exists)
        {
          return false;
        }
        element = this.$element[0];
        while (element)
        {
          if (element === document)
          {
            return true;
          }
          element = element.parentNode;
        }
        return false;
      };
      Viewport.prototype.tidy = function()
      {
        var exists;
        exists = this.elementExistsInDOM();
        if (!exists) {
          return NS.ViewportManager.get().unregisterViewport(this);
        }
      };
      Viewport.prototype.resize = function(set)
      {
        if (set === null) {
          set = false;
        }
        this.top = this.$element.offset().top;
        this.height = this.$element.height();
        this.bottom = this.top + this.height;
      };
      Viewport.prototype.getMiddlePoint = function()
      {
        return ($w.height() / 2) + $w.scrollTop() - this.$element.offset().top;
      };
      Viewport.prototype.getTop = function()
      {
        return this.top;
      };
      Viewport.prototype.getBottom = function()
      {
        return this.bottom;
      };
      Viewport.prototype.getOffsetMiddle = function()
      {
        return this.$element.offset().top + this.$element.height() / 2;
      };
      Viewport.prototype.getIsOnScreen = function(screen)
      {
        var _ref, _ref2;
        if (screen === null)
        {
          screen = {};
        }
        if ((_ref = screen.top) === null)
        {
          screen.top = 0;
        }
        if ((_ref2 = screen.bottom) === null)
        {
          screen.bottom = 500;
        }
        if (!(this.top !== null))
        {
          this.resize();
        }
        if (this.$element.data().debug === true)
        {
          console.warn(' ');
          console.warn(this.$element.attr('id'));
          console.warn('-------------------');
          console.warn("Screen top: " + screen.top);
          console.warn("My top: " + this.top);
          console.warn(this.$element.offset().top);
          console.warn("Screen bottom: " + screen.bottom);
          console.warn("My bottom: " + this.bottom);
          console.warn(screen.top <= this.bottom && screen.bottom >= this.top);
          console.log(this.$element);
        }
        if (screen.top <= this.bottom && screen.bottom >= this.top)
        {
          return true;
        } else
        {
          return false;
        }
      };
      Viewport.prototype.runAnimation = function(topPercent, bottomPercent, middlePercent)
      {
        var classString;
        if (topPercent > 0)
        {
          classString = 'vp-onscreen vp-on-10 vp-on-20 vp-on-30 vp-on-40 vp-on-50 vp-on-60 vp-on-70 vp-on-80 vp-on-90 vp-on-100';
          classString += ' vp-b-10 vp-b-20 vp-b-30 vp-b-40 vp-b-50 vp-b-60 vp-b-70 vp-b-80 vp-b-90 vp-b-100';
          if(this.reverse) {
            this.$element.removeClass(classString);
          }
          this.$element.addClass('vp-onscreen');
          if (topPercent >= 10) {
            this.$element.addClass('vp-on-10 vp-onf-10');
            if (topPercent >= 20) {
              this.$element.addClass('vp-on-20 vp-onf-20');
              if (topPercent >= 30) {
                this.$element.addClass('vp-on-30 vp-onf-30');
                if (topPercent >= 40) {
                  this.$element.addClass('vp-on-40 vp-onf-40');
                  if (topPercent >= 50) {
                    this.$element.addClass('vp-on-50 vp-onf-50');
                    if (topPercent >= 60) {
                      this.$element.addClass('vp-on-60 vp-onf-60');
                      if (topPercent >= 70) {
                        this.$element.addClass('vp-on-70 vp-onf-70');
                        if (topPercent >= 80) {
                          this.$element.addClass('vp-on-80 vp-onf-80');
                          if (topPercent >= 90) {
                            this.$element.addClass('vp-on-90 vp-onf-90');
                            if (topPercent >= 100) {
                              this.$element.addClass('vp-on-100 vp-onf-100');
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (bottomPercent >= 10) {
            this.$element.addClass('vp-b-10 vp-bf-10');
            if (bottomPercent >= 20) {
              this.$element.addClass('vp-b-20 vp-bf-20');
              if (bottomPercent >= 30) {
                this.$element.addClass('vp-b-30 vp-bf-30');
                if (bottomPercent >= 40) {
                  this.$element.addClass('vp-b-40 vp-bf-40');
                  if (bottomPercent >= 50) {
                    this.$element.addClass('vp-b-50 vp-bf-50');
                    if (bottomPercent >= 60) {
                      this.$element.addClass('vp-b-60 vp-bf-60');
                      if (bottomPercent >= 70) {
                        this.$element.addClass('vp-b-70 vp-bf-70');
                        if (bottomPercent >= 80) {
                          this.$element.addClass('vp-b-80 vp-bf-80');
                          if (bottomPercent >= 90) {
                            this.$element.addClass('vp-b-90 vp-bf-90');
                            if (bottomPercent >= 100) {
                              return this.$element.addClass('vp-b-100 vp-bf-100');
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else
        {

        }
      };
      Viewport.prototype.reset = function(fillDirection) {};

      return Viewport;
    })();
  })(jQuery, window.wtc.controller);
})();
