/*
  Viewports / ViewportManager
  =======================================
  - *Author*          liamegan
  - *email*           liam@wethecollective.com
  - *Created*         2015-10-07 10:33:20
  - *namespace*       com.wtc.utilities
  - *Requirements*    jquery   ElementController   wethecollective.utilities.Scroller
  - *Description*     These are two classes that are used for inserting and maintinaing viewports. This is useful for running code when the user scrolls a particular viewport into view.
  - *Edited by*       liamegan
  - *Edited*          2017-10-05
  - *Version*         1.0.22
*/
import {
  default as ElementController,
  ExecuteControllers
} from "wtc-controller-element";
import _u from "wtc-utility-helpers";

/**
 * The Viewport class is a controller that provides information on
 * the position of the element within the window. It does this through
 * a combination of IntersectionObserver and request animation frame.
 *
 * This class extends the element controller and requires registration
 * with the Execute controllers system in order to be instanciated as
 * a component (ie with <element data-controller="Viewport" />)
 *
 * @class Viewport
 * @augments ElementController
 * @author Liam Egan <liam@wethecollective.com>
 * @version 2.0.0
 * @created Jan 30, 2019
 */
class Viewport extends ElementController {
  /**
   * The Viewport Class constructor
   *
   * @constructor
   * @param {HTMLElement} element 				The element to use
   * @param {object} settings             A settings object that allows settings to be passed to the raw class. These settings are:
   * - `vpprefix`           The prefix for the classnames
   * - `vpstoptopthreshold` The threshold to stop the execution of at
   * - `animationCallback`  The function to run on animation. Takes the same three parameters as the runAnimation method
   */
  constructor(element, settings = {}) {
    super(element);

    // set up the class prefix either data-vppefix. Defaults to "vp"
    this.classPrefix = settings.vpprefix || "vp";

    // Sets up the stop threshold for the element, if it exists
    this.stopTopThreshold = settings.vpstoptopthreshold;

    // add the animation callback, if provided
    this.animationCallback = settings.animationCallback;

    // Bing all of the callbacks
    this._onObserve = this._onObserve.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onTidy = this._onTidy.bind(this);

    // Check for tidy up every 5 seconds
    this.tidyInterval = setInterval(this._onTidy, 5000);

    // bind the resize handler
    window.addEventListener("resize", this._onResize);
    this._onResize();

    if ("IntersectionObserver" in window) {
      // create the intersection ovserver
      this.observer = new IntersectionObserver(this._onObserve, {
        rootMargin: "0%",
        threshold: [0.1]
      });
      this.observer.observe(this.element);
    } else {
      console.log("%cIntersection Observers not supported", "color: red");
      this.runAnimation(100, 100, 100);
    }

    // debug element
    if (this.element.querySelector(".vp-debug")) {
      this._debugElement = this.element.querySelector(".vp-debug");
    }

    this.element.classList.add(`${this.classPrefix}--initialised`);

    // This manually sets the initial top offset to provide a single, initial call of the animation event.
    window.addEventListener("load", () => {
      // Loop through parent nodes of the element
      // in order to get a top offset which is relative to the document,
      // as opposed to the immediate offset parent:
      let element = this.element;
      let elementOffset = 0;

      while (element !== document.body) {
        elementOffset += element.offsetTop;
        element = element.parentNode;
      }

      this.top = elementOffset - window.scrollY;
    });
  }

  /**
   * Private methods
   */

  /**
   * Listener for the intersection observer callback
   *
   * @private
   * @param  {object} entries   the object that contains all of the elements being calculated by this observer
   * @param  {object} observer  the observer instance itself
   * @return void
   */
  _onObserve(entries, observer) {
    // Loop through the entries and set up the playing state based on whether the element is onscreen or not.
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        this.playing = true;
        this.isOnScreen = true;
      } else {
        this.playing = false;
        this.isOnScreen = false;
      }
    });
  }

  /**
   * Listener for the request animation frame loop. This just sets
   * the scroll position of the window.
   *
   * @private
   * @param  {delta} number   the number of ms that has passed since the RaF started
   * @return void
   */
  _onPlay(delta) {
    if (this.playing === true) {
      requestAnimationFrame(this._onPlay);
    }
    this.scrollPos = window.scrollY || window.pageYOffset;
  }

  /**
   * Listener for the window resize event. Updates the window height
   * for the percentile calculations.
   *
   * @private
   * @param  {object} e   the event object from the resize event
   * @return void
   */
  _onResize(e) {
    this.windowHeight = window.innerHeight;
  }

  /**
   * Listener for the tidy timeout loop. This checks whether the
   * element exists in the dom and removes all of the necessary
   * traces of it if it doesn't
   *
   * @private
   * @return void
   */
  _onTidy() {
    let exists = this.elementExistsInDOM();
    if (!exists) {
      this.tidy();
    }
  }

  /**
   * Getters and setters
   */

  /**
   * (getter/setter) Scroll position. This updates the scroll position
   * only if it's changed and then calculated the element's top
   * position based on that.
   *
   * @type {number}
   * @default -1
   */
  set scrollPos(value) {
    if (!isNaN(value) && value != this.scrollPos) {
      this._scrollPos = value;
      this.top = this.offsetTop - value;
    }
  }
  get scrollPos() {
    return this._scrollPos || -1;
  }

  /**
   * (getter) Find the offsetTop to the document top. Loop through the
   * offset parents of this element and add their tops to the
   * larger value.
   *
   * @type {number}
   * @readonly
   * @default 0
   */
  get offsetTop() {
    let el = this.element;
    let offsetTop = 0;
    while (el.offsetParent) {
      offsetTop += el.offsetTop;
      el = el.offsetParent;
    }
    return offsetTop;
  }

  /**
   * (getter/setter) Top position. This updates the element's top
   * position in pixels only if the value has changed and then
   * calculates the 3 positional percentages - top, middle and
   * bottom and then runs the runAnimation method to perform
   * actions based on these numbers.
   *
   * @type {number}
   * @default 0
   */
  set top(value) {
    if (!isNaN(value) && value != this.top) {
      this._top = value;
      // The percentage of the position of the top of the element from the bottom of the screen
      this._top_percentage = (this.windowHeight - value) / this.windowHeight;
      // The percentage of the position of the bottom of the element from the top of the sceen.
      this._bottom_percentage =
        (value + this.elementHeight) / this.windowHeight;
      // The percentage of the position of the middle of the element from the bottom of the sceeen
      this._middle_percentage =
        (this.windowHeight - (value + this.elementHeight * 0.5)) /
        this.windowHeight;

      // Run the animation with these calculated values
      this.runAnimation(
        this._top_percentage,
        this._middle_percentage,
        this._bottom_percentage
      );
    }
  }
  get top() {
    return this._top || 0;
  }

  /**
   * (getter/setter) Playing. This is set in response to a callback
   * on the intersection observer and sets up the RaF loop to
   * calculate the scroll position and run the animation.
   *
   * @type {boolean}
   * @default false
   */
  set playing(value) {
    if (this.playing === false && value === true) {
      requestAnimationFrame(this._onPlay);
      this._playing = true;
    } else if (value !== true) {
      this._playing = false;
    }
  }
  get playing() {
    return this._playing === true;
  }

  /**
   * (getter/setter) The window height. Used to calculate the
   * positional percentages.
   *
   * @type {number}
   * @default 0
   */
  set windowHeight(value) {
    if (!isNaN(value)) {
      this._windowHeight = value;
    }
  }
  get windowHeight() {
    return this._windowHeight || 0;
  }

  /**
   * Element height.
   *
   * @readonly
   * @return {number}  The element's height in pixels
   */
  get elementHeight() {
    return this.element.offsetHeight || 0;
  }

  /**
   * (getter/setter) Sets whether the element is onscreen. This is
   * set from the intersection observer callback and updates the
   * classes of the element for use.
   *
   * @type {boolean}
   * @default false
   */
  set isOnScreen(value) {
    this._isOnScreen = value === true;
    if (value === true) {
      this.element.classList.add(`${this.classPrefix}--onscreen`);
    } else {
      this.element.classList.remove(`${this.classPrefix}--onscreen`);
    }
  }
  get isOnScreen() {
    return this._isOnScreen === true;
  }

  set stopTopThreshold(value) {
    if (!isNaN(value)) {
      this._stopTopThreshold = Number(value);
    }
  }
  get stopTopThreshold() {
    return this._stopTopThreshold || null;
  }

  /**
   * The array of classes to remove from the element on scroll.
   *
   * @readonly
   * @return {array}  The classes to remove each time the animation loop is run.
   */
  get classes() {
    return this._classList || [];
  }

  /**
   * (getter/setter) Sets the prefix for the css classes for the
   * element. Setting this will also set the class list.
   *
   * @type {string}
   * @default 'vp'
   */
  set classPrefix(value) {
    if (typeof value === "string") this._classPrefix = value;

    this._classList = [
      `${this.classPrefix}--on-10`,
      `${this.classPrefix}--on-20`,
      `${this.classPrefix}--on-30`,
      `${this.classPrefix}--on-40`,
      `${this.classPrefix}--on-50`,
      `${this.classPrefix}--on-60`,
      `${this.classPrefix}--on-70`,
      `${this.classPrefix}--on-80`,
      `${this.classPrefix}--on-90`,
      `${this.classPrefix}--on-100`,
      `${this.classPrefix}--b-10`,
      `${this.classPrefix}--b-20`,
      `${this.classPrefix}--b-30`,
      `${this.classPrefix}--b-40`,
      `${this.classPrefix}--b-50`,
      `${this.classPrefix}--b-60`,
      `${this.classPrefix}--b-70`,
      `${this.classPrefix}--b-80`,
      `${this.classPrefix}--b-90`,
      `${this.classPrefix}--b-100`
    ];
  }
  get classPrefix() {
    return this._classPrefix || "vp";
  }

  /**
   * (getter/setter) Sets the animation callback for custom behaviour.
   * this function will be called each time the runAnimation function
   * is called. Any provide function will be bound to this instance
   * and takes three params:
   * - topPercent;
   * - middlePercent; and
   * - bottomPercent
   *
   * @type {function}
   * @default null
   */
  set animationCallback(value) {
    if (typeof value == "function") {
      this._animationCallback = value.bind(this);
    }
  }
  get animationCallback() {
    return this._animationCallback || null;
  }

  /**
   * Public methods
   */

  /**
   * This method is called from the run loop and updates the classes
   * based on the percentages provided to it. This is a public method
   * and so can be called programatically, but the use-cases for
   * doing so are limited.
   *
   * @param  {number} topPercent      The percentage distance between the top of the element and the bottom of the screen.
   * @param  {number} middlePercent   The percentage distance between the middle of the element and the bottom of the screen.
   * @param  {number} bottomPercent   The percentage distance between the bottom of the element and the top of the screen.
   */
  runAnimation(topPercent, middlePercent, bottomPercent) {
    _u.removeClass(this.classes.join(" "), this.element);
    for (let i = 0; i <= 1; i += 0.1) {
      const perString = Math.round(i * 100);
      if (topPercent >= i) {
        _u.addClass(
          `${this.classPrefix}--on-${perString} ${this.classPrefix}--onf-${perString}`,
          this.element
        );
      }
      if (bottomPercent >= i) {
        _u.addClass(
          `${this.classPrefix}--b-${perString} ${this.classPrefix}--bf-${perString}`,
          this.element
        );
      }
    }

    // If we have an animation callback then call it here.
    if (this.animationCallback) {
      this.animationCallback(topPercent, middlePercent, bottomPercent);
    }

    // If we have stop threshold(s), and we've suprassed them, tidy up
    if (this.stopTopThreshold && topPercent >= this.stopTopThreshold) {
      this.tidy();
      this.element.classList.add(`${this.classPrefix}--thresholdReached`);
    }

    if (this._debugElement) {
      this._debugElement.innerHTML = topPercent;
    }
  }

  tidy() {
    this.playing = false;
    clearInterval(this.tidyInterval);
    window.removeEventListener("resize", this.onResize);
    this.element.data = null;
    this.observer.disconnect();
  }
}

// Register
ExecuteControllers.registerController(Viewport, "Viewport");

export default Viewport;
