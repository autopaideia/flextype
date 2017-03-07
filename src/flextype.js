const LOCK_UP = 1;
const LOCK_DOWN = 2;

const cache = {};

const getEls = (els) => {
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
const flextype = els => new FlexType(els);

const FlexType = function FlexType(els) {
  this.els = getEls(els);
  this.flex = () => flextype.setElSize(this.els);

  this.flex();
  addEventListener('resize', this.flex);
};

FlexType.prototype.destroy = function destroy(reset = true) {
  removeEventListener('resize', this.flex);
  if (reset) flextype.setElSize(this.els, '');
};

flextype.size = (rules, w, cacheKey) => {
  let parsed;

  if (cacheKey === undefined || cache[cacheKey] === undefined) {
    const percent = parseFloat(rules);
    const r = !isNaN(percent) && isFinite(percent) ? { 100: percent } : rules;

    parsed = Object.keys(r).map(k => ({
      w: parseFloat(k.replace(/\+|-|\s/g, '')),
      s: parseFloat(r[k]),
      l: (k.indexOf('-') + 1 && LOCK_DOWN) + (k.indexOf('+') + 1 && LOCK_UP),
    }));

    if (cacheKey !== undefined) cache[cacheKey] = parsed;
  } else {
    parsed = cache[cacheKey];
  }

  const { start, end } = parsed.reduce((acc, rule) => ({
    start: rule.w <= w && rule.w >= acc.start.w ? rule : acc.start,
    end: rule.w > w && rule.w < acc.end.w ? rule : acc.end,
  }), { start: { w: 0, s: 0, l: 0 }, end: { w: Infinity, s: Infinity, l: 0 } });

  if (w === start.w || [LOCK_UP, LOCK_UP + LOCK_DOWN].indexOf(start.l) >= 0) {
    return start.s;
  } else if ([LOCK_DOWN, LOCK_UP + LOCK_DOWN].indexOf(end.l) >= 0) {
    return end.s;
  } else if (end.w === Infinity) {
    return (w * start.s) / start.w;
  }

  return start.s + (((end.s - start.s) * (w - start.w)) / (end.w - start.w));
};

flextype.setElSize = (elements, size) => {
  const els = getEls(elements);
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i];
    let fontSize = size;
    if (size === undefined) {
      fontSize = flextype.getElSize(el);
    }

    const oldSize = el.style.fontSize;
    el.style.fontSize = fontSize ? `${fontSize}px` : fontSize;

    if (el.style.fontSize !== oldSize) {
      if (typeof CustomEvent === 'function') {
        el.dispatchEvent(new CustomEvent('flextype:changed'));
      } else {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('flextype:changed', true, false, undefined);
        el.dispatchEvent(event);
      }
    }
  }
};

flextype.getElSize = (elements) => {
  const els = getEls(elements);
  const el = els[0];

  if (!el) return '';

  const style = getComputedStyle(el);
  const val = style.getPropertyValue('--flextype') ||
              getComputedStyle(el, '::before').content;

  if (!val || ['\'\'', '""', 'none'].indexOf(val) >= 0) {
    return '';
  }

  const rules = cache[val] === undefined ?
    JSON.parse(val.trim().replace(/^'|^"|\\|%|'$|"$/g, '')) :
    null;

  const { width, borderLeftWidth: bLeft, borderRightWidth: bRight } = style;
  const innerWidth = parseFloat(width) - parseFloat(bLeft) - parseFloat(bRight);

  return flextype.size(rules, innerWidth, val);
};

flextype.flex = flextype(document.getElementsByClassName('js-flextype')).flex;
