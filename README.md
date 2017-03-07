# flextype

Scale the font size of an element in proportion to its width... *in style*. 😎

## Features

* Simple syntax for scaling at different amounts for different widths
* Keeps your scaling logic in CSS, thereby allowing you to:
  * easily override within media queries
  * combine with whatever CSS-preprocessor variables you might be using
* No dependencies
* Supports all modern browsers and IE9+

## Usage

### Basic usage

1. Add flextype.js to the bottom of your page.

    ```html
    <script src="path/to/flextype.min.js"></script>
    ```

2. Add the class `js-flextype` to the element(s) you want to scale.

    ```html
    <div class="MyElement js-flextype">Hello</div>
    ```

3. In CSS set the percentage of the `.js-flextype` element's width you want the font size to be on the CSS variable `--flextype`<sup>[[see caveat]](#css-vars-caveat)</sup>. For instance, if you want the font size to be `18px` when the element is `500px` wide and to scale up and down from there at a 1:1 ratio, you would use the percentage `3.6%`.

    ```css
    .MyElement {
      --flextype: 3.6%;
      width: 30%;
      float: left;
      /* ... */
    }
    ```

### Advanced usage

The ratio passed to flextype can also be expressed as a key-value pair written in JSON, where the key is an element width (in pixels) and the value is the desired corresponding font size (in pixels).

```css
.MyElement {
  /* Use valid JSON wrapped in single quotes */
  --flextype: '{ "500": 18 }';
}
```

This syntax gives you access to two additional features: "Tweening" and "Locking".

#### Tweening

The font size can be made to scale at different ratios for different width-ranges, flextype will adjust the font size depending on which rules the element's width currently fall between.

```css
.MyElement {
  --flextype: '{ "500": 18, "1000": 22 }';
}
```

Given those rules we can expect that, for example, when `250px` wide `.MyElement` will have a font size of `9px` and when `750px` wide `.MyElement` will have a font size of `20px`.

#### Locking

You can lock the font size in for particular width-ranges by using `+` and `-` modifiers on the width keys.

```css
.MyElement {
  --flextype: '{ "250-": 10, "500+": 18, "1000": "22" "1500+": 36 }';
}

```

The +/- modifiers will prevent the font size from scaling until the next/previous rule becomes active, respectively.

## Caveats

<a name="css-vars-caveat"></a>
### 1. CSS variables support

**CSS variables are [not currently supported by either IE or Edge](http://caniuse.com/#feat=css-variables)** and are relatively recent additions to the other major browsers. To get around this flextype also accepts rules embedded in the `::before` pseudo element's content property.

```css
.MyElement::before {
  content: '3.6%';
  display: none;
}
```

<a name="initialization-caveat"></a>
### 2. Trigger flextype manually after javascript manipulations

The font size of any `.js-flextype` elements will be scaled immediately when flextype.js is loaded and then again whenever the window is resized. However, should you need to insert a new `.js-flextype` element into the DOM after flextype has already initialized or should some script cause your elements ever resize outside of the window resize event, you need to manually trigger the resize. You can do this with:

```javascript
flextype.flex();
```

## Javascript API

You mainly interact with flextype through CSS and the `js-flextype` class, but it also has a javascript API should you want to do more advanced/custom things with it.

```javascript
import flextype from 'flextype';

const el = document.getElementsByClassName('MyElement');

// Manually force all .js-flextype elements on the page to scale.
flextype.flex();

// Get a specific element's suggested font size based on its CSS rules and
// current width.
flextype.getElSize(el);

// Set element(s)'s font size based on its CSS rules and current width.
// If there are no rules the font size will be reset.
flextype.setElSize(el);

// Any time flextype changes the font size of an element it will emit a
// 'flextype:changed' event on that element.
el.addEventListener('flextype:changed', () => console.log('changed'));
el.style.fontSize = '999px';
flextype.flex(); // Logs 'changed'.

// Determine font size based on a rules object and a width.
flextype.size({ '500-': 10, 1500: 20 }, 1000); // = 15

// Create a separate instance of flextype with its own resize listener, bound to
// whatever DOM elements you like.
const flexer = flextype(document.getElementsByClassName('MyOtherElement'));

// Manually force the elements associated with your instance to scale (like
// flextype.flex() does for the default .js-flextype elements).
flexer.flex();

// Destroy your instance, removing the associated window resize event listener
// and reseting the font size of the associated elements.
flexer.destroy();
```
