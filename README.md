# flextype

[![Build Status](https://img.shields.io/travis/autopaideia/flextype.svg)](https://travis-ci.org/autopaideia/flextype) [![Codecov](https://img.shields.io/codecov/c/github/autopaideia/flextype.svg)](https://codecov.io/github/autopaideia/flextype?branch=master) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Build Status](https://saucelabs.com/browser-matrix/autopaideia.svg)](https://saucelabs.com/beta/builds/88c42e744a9241999efb1a98ebfd440d)

Scale the font size of an element in proportion to its width... *in style*. 😎

[Demo here](https://autopaideia.github.io/flextype/).

## Features

* Simple syntax for scaling at different amounts for different widths
* Define your scaling logic in CSS, allowing you to:
  * easily override within media queries
  * leverage whatever CSS-preprocessor variables you might be using for your site's layout and typography
* No dependencies
* Supports all modern browsers and IE9+<sup>[[see caveat for IE/Edge]](#css-custom-props-caveat)</sup>

## Install

### NPM

```bash
npm install flextype --save
```

### Download

* [Minified](https://unpkg.com/flextype/dist/flextype.min.js)
* [Un-minified](https://unpkg.com/flextype/dist/flextype.js)

### CDN

```html
<!-- Minified: -->
<script src="https://unpkg.com/flextype/dist/flextype.min.js"></script>

<!-- Un-minified: -->
<script src="https://unpkg.com/flextype/dist/flextype.js"></script>
```

## Basic usage

1. Add the class `js-flextype` to the element(s) you want to scale.

    ```html
    <div class="MyElement js-flextype">Hello</div>
    ```

2. In CSS set the percentage of the `.js-flextype` element's width you want the font size to be on the [CSS custom property](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) `--flextype`. For instance, if you want the font size to be `18px` when the element is `500px` wide and to scale up and down from there at a 1:1 ratio, you would use the percentage `3.6%`.

    ```css
    .MyElement {
      width: 30%;
      float: left;
      /* ... */
      --flextype: 3.6%;
    }
    ```

## Advanced usage

The ratio passed to flextype can also be expressed as a key-value pair written in JSON, where the key is an element width (in pixels) and the value is the desired corresponding font size (in pixels).

```css
.MyElement {
  /* Use valid JSON wrapped in single quotes */
  --flextype: '{ "500": 18 }';
}
```

This syntax gives you access to two additional features: "Tweening" and "Locking".

### Tweening

The font size can be made to scale at different ratios for different width-ranges, flextype will adjust the font size depending on which rules the element's width currently fall between.

```css
.MyElement {
  --flextype: '{ "500": 18, "1000": 22 }';
}
```

Given those rules we can expect that, for example, when `250px` wide `.MyElement` will have a font size of `9px` and when `750px` wide `.MyElement` will have a font size of `20px`.

### Locking

You can lock the font size in for particular width-ranges by using `+` and `-` modifiers on the width keys.

```css
.MyElement {
  --flextype: '{ "250-": 10, "500+": 18, "1000": "22" "1500+": 36 }';
}

```

The +/- modifiers will prevent the font size from scaling until the next/previous rule becomes active, respectively.

## API

Flextype also has a javascript API should you ever need it.

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

## Caveats

<a name="css-custom-props-caveat"></a>

### 1. IE/Edge support

CSS custom properties are supported in the latest versions of all the major browsers **[except IE and Edge](http://caniuse.com/#feat=css-variables)**. As a workaround flextype also accepts rules embedded in the `::before` pseudo element's content property.

```css
.MyElement::before {
  content: '3.6%';
  display: none;
}
```

You can (and probably should) use the [flextype PostCSS plugin](https://github.com/autopaideia/postcss-flextype) to convert your `--flextype` declarations into this format for you while Microsoft catches up.

<a name="initialization-caveat"></a>

### 2. Trigger flextype manually after javascript manipulations

The font size of any `.js-flextype` elements will be scaled immediately when flextype.js is loaded and then again whenever the window is resized. However, should you need to insert a new `.js-flextype` element into the DOM after flextype has already initialized or should some script cause your elements ever resize outside of the window resize event, you need to manually trigger the resize. You can do this with:

```javascript
flextype.flex();
```
