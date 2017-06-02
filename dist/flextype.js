/*!
 * flextype.js v1.0.3
 * (c) 2017 Nick Bosman
 * Released under the MIT License.
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.flextype = factory();
  }
}(this, function() {
'use strict';

var LOCK_UP = 1;
var LOCK_DOWN = 2;
var LOCK_BOTH = LOCK_UP + LOCK_DOWN;
var LOCK_REGEX = /\+|-|\s/g;
var PROP_REGEX = /^'|^"|\\|%|'$|"$/g;
var CACHE = {};

var getEls = function getEls(els) {
  if (els instanceof HTMLElement) return [els];
  if (els === null || els.length === undefined) return [];
  if (els.length === 0 || els[0] instanceof HTMLElement) return els;

  throw new TypeError('Flextype: Invalid selector');
};

// eslint-disable-next-line no-use-before-define
var flextype = function flextype(els) {
  return new FlexType(els);
};

var FlexType = function FlexType(els) {
  var _this = this;

  this.els = getEls(els);
  this.flex = function () {
    return flextype.setElSize(_this.els);
  };

  this.flex();
  addEventListener('resize', this.flex);
};

FlexType.prototype.destroy = function destroy() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  removeEventListener('resize', this.flex);
  if (reset) flextype.setElSize(this.els, '');
};

flextype.size = function (rules, w, cacheKey) {
  var parsed = CACHE[cacheKey];

  if (parsed === undefined) {
    var num = parseFloat(rules);
    var ruleSet = !isNaN(num) && isFinite(num) ? { 100: num } : rules;

    // w = width, s = (font-)size, l = lock
    parsed = Object.keys(ruleSet).map(function (k) {
      return {
        w: parseFloat(k.replace(LOCK_REGEX, '')),
        s: parseFloat(ruleSet[k]),
        l: (k.indexOf('-') + 1 && LOCK_DOWN) + (k.indexOf('+') + 1 && LOCK_UP)
      };
    });

    if (cacheKey !== undefined) CACHE[cacheKey] = parsed;
  }

  var _parsed$reduce = parsed.reduce(function (acc, rule) {
    return {
      start: rule.w <= w && rule.w >= acc.start.w ? rule : acc.start,
      end: rule.w > w && rule.w < acc.end.w ? rule : acc.end
    };
  }, { start: { w: 0, s: 0, l: 0 }, end: { w: Infinity, s: Infinity, l: 0 } }),
      start = _parsed$reduce.start,
      end = _parsed$reduce.end;

  if (w === start.w || [LOCK_UP, LOCK_BOTH].indexOf(start.l) !== -1) return start.s;
  if ([LOCK_DOWN, LOCK_BOTH].indexOf(end.l) !== -1) return end.s;
  if (end.w === Infinity) return w * start.s / start.w;
  return start.s + (end.s - start.s) * (w - start.w) / (end.w - start.w);
};

flextype.setElSize = function (elements, size) {
  var els = getEls(elements);
  for (var i = 0; i < els.length; i += 1) {
    var el = els[i];
    var oldSize = el.style.fontSize;
    var newSize = size === undefined ? flextype.getElSize(el) : size;

    el.style.fontSize = newSize ? newSize + 'px' : newSize;

    if (el.style.fontSize !== oldSize) {
      if (typeof CustomEvent === 'function') {
        el.dispatchEvent(new CustomEvent('flextype:changed'));
      } else {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('flextype:changed', true, false, undefined);
        el.dispatchEvent(event);
      }
    }
  }
};

flextype.getElSize = function (elements) {
  var el = getEls(elements)[0];

  if (!el) return '';

  var style = getComputedStyle(el);
  var val = style.getPropertyValue('--flextype') || getComputedStyle(el, '::before').content;

  if (!val || ['\'\'', '""', 'none'].indexOf(val) !== -1) return '';

  var rules = CACHE[val] || JSON.parse(val.trim().replace(PROP_REGEX, ''));
  var width = style.width,
      bLeft = style.borderLeftWidth,
      bRight = style.borderRightWidth;

  var innerWidth = parseFloat(width) - parseFloat(bLeft) - parseFloat(bRight);

  return flextype.size(rules, innerWidth, val);
};

flextype.flex = flextype(document.getElementsByClassName('js-flextype')).flex;
return flextype;
}));
