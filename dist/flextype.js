/*!
 * flextype.js v1.0.0
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

var cache = {};

var getEls = function getEls(els) {
  if (els instanceof HTMLElement) {
    return [els];
  } else if (els === null || els.length === undefined) {
    return [];
  } else if (els.length === 0 || els[0] instanceof HTMLElement) {
    return els;
  }

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
  var parsed = void 0;

  if (cacheKey === undefined || cache[cacheKey] === undefined) {
    (function () {
      var percent = parseFloat(rules);
      var r = !isNaN(percent) && isFinite(percent) ? { 100: percent } : rules;

      parsed = Object.keys(r).map(function (k) {
        return {
          w: parseFloat(k.replace(/\+|-|\s/g, '')),
          s: parseFloat(r[k]),
          l: (k.indexOf('-') + 1 && LOCK_DOWN) + (k.indexOf('+') + 1 && LOCK_UP)
        };
      });

      if (cacheKey !== undefined) cache[cacheKey] = parsed;
    })();
  } else {
    parsed = cache[cacheKey];
  }

  var _parsed$reduce = parsed.reduce(function (acc, rule) {
    return {
      start: rule.w <= w && rule.w >= acc.start.w ? rule : acc.start,
      end: rule.w > w && rule.w < acc.end.w ? rule : acc.end
    };
  }, { start: { w: 0, s: 0, l: 0 }, end: { w: Infinity, s: Infinity, l: 0 } }),
      start = _parsed$reduce.start,
      end = _parsed$reduce.end;

  if (w === start.w || [LOCK_UP, LOCK_UP + LOCK_DOWN].indexOf(start.l) >= 0) {
    return start.s;
  } else if ([LOCK_DOWN, LOCK_UP + LOCK_DOWN].indexOf(end.l) >= 0) {
    return end.s;
  } else if (end.w === Infinity) {
    return w * start.s / start.w;
  }

  return start.s + (end.s - start.s) * (w - start.w) / (end.w - start.w);
};

flextype.setElSize = function (elements, size) {
  var els = getEls(elements);
  for (var i = 0; i < els.length; i += 1) {
    var el = els[i];
    var fontSize = size;
    if (size === undefined) {
      fontSize = flextype.getElSize(el);
    }

    var oldSize = el.style.fontSize;
    el.style.fontSize = fontSize ? fontSize + 'px' : fontSize;

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
  var els = getEls(elements);
  var el = els[0];

  if (!el) return '';

  var style = getComputedStyle(el);
  var val = style.getPropertyValue('--flextype') || getComputedStyle(el, '::before').content;

  if (!val || ['\'\'', '""', 'none'].indexOf(val) >= 0) {
    return '';
  }

  var rules = cache[val] === undefined ? JSON.parse(val.trim().replace(/^'|^"|\\|%|'$|"$/g, '')) : null;

  var width = style.width,
      bLeft = style.borderLeftWidth,
      bRight = style.borderRightWidth;

  var innerWidth = parseFloat(width) - parseFloat(bLeft) - parseFloat(bRight);

  return flextype.size(rules, innerWidth, val);
};

flextype.flex = flextype(document.getElementsByClassName('js-flextype')).flex;
return flextype;
}));
