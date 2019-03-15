
> wtc-controller-viewports@2.0.0 document /home/liam/Projects/packages/wtc-controller-viewports
> jsdoc-render-md src/wtc-controller-viewports.js

## <a id='Viewport'></a>Viewport

The Viewport class is a controller that provides information on
the position of the element within the window. It does this through
a combination of IntersectionObserver and request animation frame.

This class extends the element controller and requires registration
with the Execute controllers system in order to be instanciated as
a component (ie with <element data-controller="Viewport" />)

## <a id='Viewport'></a>Viewport

<details>
<summary>Viewport</summary>

| Param | Type | Description |
| --- | --- | --- |
| `element` | HTMLElement | The element to use |
| `settings` | object | A settings object that allows settings to be passed to the raw class. These settings are:
- `vpprefix`           The prefix for the classnames
- `vpstoptopthreshold` The threshold to stop the execution of at
- `animationCallback`  The function to run on animation. Takes the same three parameters as the runAnimation method |

> Returns <code>void</code>
</details>

The Viewport Class constructor

### <a id='scrollPos'></a>scrollPos

<details>
<summary><b title='number'>scrollPos</b></summary>
</details>

(getter/setter) Scroll position. This updates the scroll position
only if it's changed and then calculated the element's top
position based on that.

### <a id='top'></a>top

<details>
<summary><b title='number'>top</b></summary>
</details>

(getter/setter) Top position. This updates the element's top
position in pixels only if the value has changed and then
calculates the 3 positional percentages - top, middle and 
bottom and then runs the runAnimation method to perform
actions based on these numbers.

### <a id='playing'></a>playing

<details>
<summary><b title='boolean'>playing</b></summary>
</details>

(getter/setter) Playing. This is set in response to a callback 
on the intersection observer and sets up the RaF loop to
calculate the scroll position and run the animation.

### <a id='windowHeight'></a>windowHeight

<details>
<summary><b title='number'>windowHeight</b></summary>
</details>

(getter/setter) The window height. Used to calculate the 
positional percentages.

### <a id='elementHeight'></a>elementHeight

<details>
<summary>elementHeight</summary>
</details>

Element height. Returns The element's height in pixels.

### <a id='isOnScreen'></a>isOnScreen

<details>
<summary><b title='boolean'>isOnScreen</b></summary>
</details>

(getter/setter) Sets whether the element is onscreen. This is
set from the intersection observer callback and updates the
classes of the element for use.

### <a id='classes'></a>classes

<details>
<summary>classes</summary>
</details>

The array of classes to remove from the element on scroll.

Returns The classes to remove each time the animation loop is run.

### <a id='classPrefix'></a>classPrefix

<details>
<summary><b title='string'>classPrefix</b></summary>
</details>

(getter/setter) Sets the prefix for the css classes for the 
element. Setting this will also set the class list.

### <a id='animationCallback'></a>animationCallback

<details>
<summary><b title='function'>animationCallback</b></summary>
</details>

(getter/setter) Sets the animation callback for custom behaviour.
this function will be called each time the runAnimation function
is called. Any provide function will be bound to this instance
and takes three params:
- topPercent; 
- middlePercent; and
- bottomPercent

### <a id='runAnimation'></a>runAnimation()

<details>
<summary><code>runAnimation(<b title='number'>topPercent</b>, <b title='number'>middlePercent</b>, <b title='number'>bottomPercent</b>)</code></summary>

| Param | Type | Description |
| --- | --- | --- |
| `topPercent` | number | The percentage distance between the top of the element and the bottom of the screen. |
| `middlePercent` | number | The percentage distance between the middle of the element and the bottom of the screen. |
| `bottomPercent` | number | The percentage distance between the bottom of the element and the top of the screen. |

> Returns <code>void</code>
</details>

This method is called from the run loop and updates the classes
based on the percentages provided to it. This is a public method
and so can be called programatically, but the use-cases for
doing so are limited.
