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
import Scroller from 'wtc-scroller';
import ElementController from 'wtc-controller-element';
import _u from 'wtc-utility-helpers';

let instance = null;

class ViewportManager {
  constructor () {
    if (!instance) {
      instance = this;
    } else {
      return instance;
    }

    this.VPs = [];

    window.addEventListener('resize', (e)=>{
      this.resize(e);
    });

    Scroller.instance().bind('scroll', () => {
      let args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
      this.onScroll.apply(this, args);
    });
  }

  static get instance() {
    if (!instance) {
      instance = new ViewportManager();
    }
    return instance;
  }

  tidy() {
    if (!this.VPs || !this.VPs.length) {
      return;
    }

    let ref = this.VPs;
    for (let i = 0; i < ref.length; i++) {
      let VP = ref[i];
      VP.tidy();
    }
  }

  registerViewport(VP) {
    let exists = false;
    exists = this.VPs.indexOf(VP) >= 0;

    if (!exists) {
      this.VPs.push(VP);
    }

    VP.ID = this.VPs.length - 1;

    return VP.ID;
  }

  unregisterViewport(VP) {
    var f = this.VPs.filter(function(el) {
      return el !== VP;
    });

    this.VPs = f;
  }

  getNextVP(ID) {
    return this.VPs[ID + 1];
  }

  resize(e) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('scroll', true, false);
    window.dispatchEvent(event);

    this.VPs.forEach(function(item, i){
      try {
        return item.resize();
      } catch (e) {

      }
    });
  }

  onScroll(top, middle, bottom) {
    top = window.pageYOffset;
    let win_height = window.innerHeight;
    bottom = win_height + top;
    middle = top + win_height / 2;
    let body = document.body;
    let html = document.documentElement;
    var height = Math.max( body.scrollHeight, body.offsetHeight,
                           html.clientHeight, html.scrollHeight, html.offsetHeight );
    let d = height;
    let per = top / (d - win_height);

    this.VPs.forEach(function(item, i) {
      let isOnScreen = item.isOnScreen({
        top: top,
        bottom: bottom
      });

      if (isOnScreen) {
        let topPercent = 0 - ((item.top - bottom) / win_height * 100);
        let bottomPercent = (bottom - item.bottom) / win_height * 100;
        let middlePercent = middle / item.bottom * 100;

        try {
          item.runAnimation(topPercent, bottomPercent, middlePercent);
        }
        catch (e) {
          console.warn(this.element.getAttribute('id'), e.message);
        }
      }
      else {
        try {
          item.reset(top < item.bottom);
        }
        catch (e) {
          console.warn(e);
        }
      }
    });
  }

  navigateToNext(VP) {
    let nextVP = this.getNextVP(VP.ID);
    let now = window.pageYOffset;
    let point = nextVP.offsetMiddle();
    var duration = (now - point) * 1.5;

    if (duration < 0) {
      duration = duration * -1;
    }

    VP.element.scrollIntoView();
  }
}

class Viewport extends ElementController {
  constructor(element) {
    super(element);

    this.element = element;
    this.top = null;
    this.bottom = null;
    this.height = null;
    this.ID = null;
    this.reverse = (this.element.getAttribute('data-reverse') && this.element.getAttribute('data-reverse') == 'true') ? true : false;

    ViewportManager.instance().registerViewport(this);
  }

  elementExistsInDOM() {
    let exists = this.element && this.element[0];
    if (!exists) {
      return false;
    }

    let element = this.element[0];
    while (element) {
      if (element === document) {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  }

  tidy() {
    let exists = this.elementExistsInDOM();
    if (!exists) {
      return ViewportManager.instance().unregisterViewport(this);
    }
  }

  resize(set = false) {
    this.top = this.element.getBoundingClientRect().top;
    this.height = this.element.offsetHeight;
    this.bottom = this.top + this.height;
  }

  static get middlePoint() {
    return (window.innerHeight / 2) + window.pageYOffset - this.element.getBoundingClientRect().top;
  }

  static get top() {
    return this.top;
  }

  static get bottom() {
    return this.bottom;
  }

  static get offsetMiddle() {
    return this.element.offset().top + this.element.height() / 2;
  }

  isOnScreen(screen = {top: 0, bottom: 500}) {
    if (!this.top) {
      this.resize();
    }

    if (this.element.data.debug === true) {
      console.warn(' ');
      console.warn(this.element.getAttribute('id'));
      console.warn('-------------------');
      console.warn("Screen top: " + screen.top);
      console.warn("My top: " + this.top);
      console.warn(this.element.getBoundingClientRect().top);
      console.warn("Screen bottom: " + screen.bottom);
      console.warn("My bottom: " + this.bottom);
      console.warn(screen.top <= this.bottom && screen.bottom >= this.top);
      console.log(this.element);
    }

    if (screen.top <= this.bottom && screen.bottom >= this.top) {
      return true;
    }
    else {
      return false;
    }
  }

  runAnimation(topPercent, bottomPercent, middlePercent)
  {
    var classString;
    if (topPercent > 0) {
      classString = 'vp-onscreen vp-on-10 vp-on-20 vp-on-30 vp-on-40 vp-on-50 vp-on-60 vp-on-70 vp-on-80 vp-on-90 vp-on-100';
      classString += ' vp-b-10 vp-b-20 vp-b-30 vp-b-40 vp-b-50 vp-b-60 vp-b-70 vp-b-80 vp-b-90 vp-b-100';

      if(this.reverse) {
        _u.removeClass(this.element, classString);
      }

      _u.addClass(this.element, 'vp-onscreen');

      if (topPercent >= 10) {
        _u.addClass(this.element, 'vp-on-10 vp-onf-10');
        if (topPercent >= 20) {
          _u.addClass(this.element, 'vp-on-20 vp-onf-20');
          if (topPercent >= 30) {
            _u.addClass(this.element, 'vp-on-30 vp-onf-30');
            if (topPercent >= 40) {
              _u.addClass(this.element, 'vp-on-40 vp-onf-40');
              if (topPercent >= 50) {
                _u.addClass(this.element, 'vp-on-50 vp-onf-50');
                if (topPercent >= 60) {
                  _u.addClass(this.element, 'vp-on-60 vp-onf-60');
                  if (topPercent >= 70) {
                    _u.addClass(this.element, 'vp-on-70 vp-onf-70');
                    if (topPercent >= 80) {
                      _u.addClass(this.element, 'vp-on-80 vp-onf-80');
                      if (topPercent >= 90) {
                        _u.addClass(this.element, 'vp-on-90 vp-onf-90');
                        if (topPercent >= 100) {
                          _u.addClass(this.element, 'vp-on-100 vp-onf-100');
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
        _u.addClass(this.element, 'vp-b-10 vp-bf-10');
        if (bottomPercent >= 20) {
          _u.addClass(this.element, 'vp-b-20 vp-bf-20');
          if (bottomPercent >= 30) {
            _u.addClass(this.element, 'vp-b-30 vp-bf-30');
            if (bottomPercent >= 40) {
              _u.addClass(this.element, 'vp-b-40 vp-bf-40');
              if (bottomPercent >= 50) {
                _u.addClass(this.element, 'vp-b-50 vp-bf-50');
                if (bottomPercent >= 60) {
                  _u.addClass(this.element, 'vp-b-60 vp-bf-60');
                  if (bottomPercent >= 70) {
                    _u.addClass(this.element, 'vp-b-70 vp-bf-70');
                    if (bottomPercent >= 80) {
                      _u.addClass(this.element, 'vp-b-80 vp-bf-80');
                      if (bottomPercent >= 90) {
                        _u.addClass(this.element, 'vp-b-90 vp-bf-90');
                        if (bottomPercent >= 100) {
                          return _u.addClass(this.element, 'vp-b-100 vp-bf-100');
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
    }
  }

  reset(fillDirection) {

  }
}

export {ViewportManager as default, Viewport};
